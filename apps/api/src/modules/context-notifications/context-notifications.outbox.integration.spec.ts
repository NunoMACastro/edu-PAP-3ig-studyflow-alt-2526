/**
 * Prova a cadeia real outbox -> envelope -> estado do destinatário sobre Mongo.
 *
 * Os testes usam replica set para garantir que o evento continua transacional e
 * não substituem Models Mongoose por mocks, porque a compatibilidade das queries
 * de lease, retry e inbox faz parte do contrato que se pretende validar.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createConnection, type Connection, type Model } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import {
    ContextNotification,
    ContextNotificationSchema,
    type ContextNotificationDocument,
} from "./schemas/context-notification.schema.js";
import {
    ContextNotificationRecipient,
    ContextNotificationRecipientSchema,
    type ContextNotificationRecipientDocument,
} from "./schemas/context-notification-recipient.schema.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventSchema,
    type NotificationOutboxEventDocument,
} from "./schemas/notification-outbox-event.schema.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const classId = "507f1f77bcf86cd799439011";

describe("ContextNotificationsService outbox Mongo", () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    let notificationModel: Model<ContextNotificationDocument>;
    let recipientModel: Model<ContextNotificationRecipientDocument>;
    let outboxModel: Model<NotificationOutboxEventDocument>;

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: "wiredTiger" },
        });
        connection = await createConnection(mongo.getUri("studyflow_outbox_test")).asPromise();
        notificationModel = connection.model(
            ContextNotification.name,
            ContextNotificationSchema,
        ) as unknown as Model<ContextNotificationDocument>;
        recipientModel = connection.model(
            ContextNotificationRecipient.name,
            ContextNotificationRecipientSchema,
        ) as unknown as Model<ContextNotificationRecipientDocument>;
        outboxModel = connection.model(
            NotificationOutboxEvent.name,
            NotificationOutboxEventSchema,
        ) as unknown as Model<NotificationOutboxEventDocument>;
        await Promise.all([
            notificationModel.init(),
            recipientModel.init(),
            outboxModel.init(),
        ]);
    }, 60_000);

    afterEach(async () => {
        await Promise.all([
            notificationModel.deleteMany({}),
            recipientModel.deleteMany({}),
            outboxModel.deleteMany({}),
        ]);
    });

    afterAll(async () => {
        await connection.close();
        await mongo.stop();
    });

    it("materializa uma entrega transacional na inbox uma única vez", async () => {
        const fixture = makeService();

        const queued = await connection.transaction((session) =>
            fixture.service.enqueueClassEvent(
                teacher,
                {
                    classId,
                    idempotencyKey: "guided-room:room-id:opened",
                    type: "GUIDED_ROOM_OPENED",
                    title: "Sala guiada: Energia",
                    body: "Está disponível uma nova sala guiada.",
                    targetPath: `/app/turmas/${classId}/salas-guiadas/room-id`,
                    preferenceContext: NotificationContext.GUIDED_ROOM,
                },
                session,
            ),
        );

        expect(queued).toMatchObject({ state: "PENDING" });
        await expect(fixture.service.processOutboxBatch()).resolves.toBe(1);

        const inbox = await fixture.service.listInbox(student);
        expect(inbox).toMatchObject({
            unreadCount: 1,
            items: [
                expect.objectContaining({
                    title: "Sala guiada: Energia",
                    readAt: null,
                }),
            ],
        });
        await expect(fixture.service.processOutboxBatch()).resolves.toBe(0);
        await expect(notificationModel.countDocuments()).resolves.toBe(1);
        await expect(recipientModel.countDocuments()).resolves.toBe(1);
        await expect(
            outboxModel.countDocuments({ status: "DELIVERED", attempts: 1 }),
        ).resolves.toBe(1);
    });

    it("liberta o lease após falha e volta a tentar sem duplicar", async () => {
        const deliveryGate = jest
            .fn<Promise<void>, []>()
            .mockRejectedValueOnce(new Error("falha transitória"))
            .mockResolvedValue(undefined);
        const fixture = makeService({ channelGate: deliveryGate });
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "project:project-id:published",
            type: "CLASS_PROJECT_PUBLISHED",
            title: "Novo projeto",
            body: "Consulta o enunciado.",
            targetPath: `/app/turmas/${classId}/projectos`,
        });

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(0);
        const failedAttempt = await outboxModel.findOne().lean();
        expect(failedAttempt).toMatchObject({
            status: "PENDING",
            attempts: 1,
            lastErrorCode: "Error",
        });
        expect(failedAttempt).not.toHaveProperty("leaseToken");

        await outboxModel.updateOne(
            { _id: failedAttempt!._id },
            { $set: { availableAt: new Date(0) } },
        );
        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);
        await expect(notificationModel.countDocuments()).resolves.toBe(1);
        await expect(recipientModel.countDocuments()).resolves.toBe(1);
        await expect(
            outboxModel.countDocuments({ status: "DELIVERED", attempts: 2 }),
        ).resolves.toBe(1);
    });

    it("exclui no delivery quem perdeu a membership depois do snapshot", async () => {
        const fixture = makeService();
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "subject:subject-id:available:membership-race",
            type: "SUBJECT_AVAILABLE",
            title: "Nova disciplina",
            body: "A disciplina está disponível.",
        });
        fixture.classesService.findOwnedClass.mockResolvedValue({
            _id: classId,
            studentIds: [],
        });

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);

        await expect(recipientModel.countDocuments()).resolves.toBe(0);
        await expect(notificationModel.findOne().lean()).resolves.toMatchObject({
            recipientIds: [],
            suppressedRecipientIds: [],
        });
    });

    it("entrega a explicação de remoção ao destinatário já removido", async () => {
        const fixture = makeService();
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "class-membership:student-id:removed",
            type: "CLASS_MEMBERSHIP_REMOVED",
            title: "Inscrição terminada",
            body: "O acesso aos recursos oficiais foi removido.",
        });
        fixture.classesService.findOwnedClass.mockResolvedValue({
            _id: classId,
            studentIds: [],
        });

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);

        const inbox = await fixture.service.listInbox(student);
        expect(inbox).toMatchObject({
            unreadCount: 1,
            items: [
                expect.objectContaining({ type: "CLASS_MEMBERSHIP_REMOVED" }),
            ],
        });
        expect(fixture.classesService.findOwnedClass).toHaveBeenCalledTimes(2);
    });

    it("ignora uma remoção atrasada quando o aluno já foi reinscrito", async () => {
        const fixture = makeService();
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "class-membership:student-id:removed:delayed",
            type: "CLASS_MEMBERSHIP_REMOVED",
            title: "Inscrição terminada",
            body: "O acesso aos recursos oficiais foi removido.",
        });
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "class-membership:student-id:added:latest",
            type: "CLASS_MEMBERSHIP_ADDED",
            title: "Inscrição na turma",
            body: "O acesso aos recursos oficiais foi reposto.",
        });
        await outboxModel.updateOne(
            { idempotencyKey: "class-membership:student-id:removed:delayed" },
            { $set: { availableAt: new Date("2099-01-01T00:00:00.000Z") } },
        );

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);
        await outboxModel.updateOne(
            { idempotencyKey: "class-membership:student-id:removed:delayed" },
            { $set: { availableAt: new Date(0) } },
        );
        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);

        const inbox = await fixture.service.listInbox(student);
        expect(inbox.items.map((item) => item.type)).toEqual([
            "CLASS_MEMBERSHIP_ADDED",
        ]);
        await expect(notificationModel.countDocuments()).resolves.toBe(2);
        await expect(recipientModel.countDocuments()).resolves.toBe(1);
    });

    it("não aplica quotas anti-spam a eventos automáticos da outbox", async () => {
        const quotaGate = jest
            .fn<Promise<void>, [string[], string]>()
            .mockRejectedValue(new Error("quota manual excedida"));
        const fixture = makeService({ quotaGate });
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "subject:subject-id:available:quota-proof",
            type: "SUBJECT_AVAILABLE",
            title: "Nova disciplina",
            body: "A disciplina está disponível.",
        });

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);

        expect(quotaGate).not.toHaveBeenCalled();
        expect(fixture.policiesService.assertChannelEnabled).toHaveBeenCalledTimes(1);
        await expect(recipientModel.countDocuments()).resolves.toBe(1);
    });

    it("revalida a audiência ao retomar uma entrega parcialmente falhada", async () => {
        const fixture = makeService();
        await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "subject:subject-id:available:partial-retry",
            type: "SUBJECT_AVAILABLE",
            title: "Nova disciplina",
            body: "A disciplina está disponível.",
        });
        const recipientWrite = jest
            .spyOn(recipientModel, "bulkWrite")
            .mockRejectedValueOnce(new Error("falha parcial simulada"));

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(0);
        await expect(notificationModel.countDocuments()).resolves.toBe(1);
        fixture.classesService.findOwnedClass.mockResolvedValue({
            _id: classId,
            studentIds: [],
        });
        const failedAttempt = await outboxModel.findOne().lean();
        await outboxModel.updateOne(
            { _id: failedAttempt!._id },
            { $set: { availableAt: new Date(0) } },
        );

        await expect(fixture.service.processOutboxBatch(1)).resolves.toBe(1);

        recipientWrite.mockRestore();
        await expect(recipientModel.countDocuments()).resolves.toBe(0);
        await expect(notificationModel.findOne().lean()).resolves.toMatchObject({
            recipientIds: [],
            suppressedRecipientIds: [],
        });
    });

    /** Cria o service com Models reais e apenas fronteiras externas controladas. */
    function makeService(
        options: {
            channelGate?: jest.Mock<Promise<void>, []>;
            quotaGate?: jest.Mock<Promise<void>, [string[], string]>;
        } = {},
    ) {
        const auditLogService = { record: jest.fn().mockResolvedValue(undefined) };
        const classesService = {
            findOwnedClass: jest.fn().mockResolvedValue({
                _id: classId,
                studentIds: [student.id],
            }),
            findOwnedActiveClass: jest.fn().mockResolvedValue({
                _id: classId,
                studentIds: [student.id],
            }),
        };
        const policiesService = {
            assertWithinQuota:
                options.quotaGate ?? jest.fn().mockResolvedValue(undefined),
            assertChannelEnabled:
                options.channelGate ?? jest.fn().mockResolvedValue(undefined),
        };
        const service = new ContextNotificationsService(
            notificationModel,
            classesService as never,
            { ensureMember: jest.fn() } as never,
            { isInAppEnabled: jest.fn().mockResolvedValue(true) } as never,
            policiesService as never,
            auditLogService as never,
            recipientModel,
            outboxModel,
        );
        return { auditLogService, classesService, policiesService, service };
    }
});
