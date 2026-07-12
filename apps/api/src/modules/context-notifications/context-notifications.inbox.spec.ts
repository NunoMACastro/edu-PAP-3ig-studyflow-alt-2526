/**
 * Verifica inbox minimizada, leitura individual e outbox idempotente sem abrir
 * sockets nem depender de Mongo real.
 */
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const classId = "507f1f77bcf86cd799439011";
const notificationId = "507f1f77bcf86cd799439099";
const recipientRowId = "507f1f77bcf86cd799439098";

describe("ContextNotificationsService inbox/outbox", () => {
    it("devolve apenas o contrato do destinatário e conta não lidas", async () => {
        const fixture = makeFixture();
        const page = await fixture.service.listInbox(student);

        expect(page).toEqual({
            items: [
                expect.objectContaining({
                    id: notificationId,
                    title: "Acompanhamento",
                    readAt: null,
                }),
            ],
            unreadCount: 1,
            nextCursor: null,
        });
        expect(page.items[0]).not.toHaveProperty("recipientCount");
        expect(page.items[0]).not.toHaveProperty("recipientIds");
    });

    it("marca apenas a linha pertencente ao aluno autenticado", async () => {
        const fixture = makeFixture();
        const item = await fixture.service.markRead(student, notificationId);

        expect(fixture.recipientModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                notificationId: expect.any(Types.ObjectId),
                recipientId: expect.any(Types.ObjectId),
                status: "DELIVERED",
            }),
            expect.objectContaining({ $set: { readAt: expect.any(Date) } }),
            { new: true },
        );
        expect(item.readAt).toBeInstanceOf(Date);
    });

    it("regista uma única entrada outbox para a mesma alteração docente", async () => {
        const fixture = makeFixture();
        const result = await fixture.service.enqueueClassEvent(teacher, {
            classId,
            idempotencyKey: "project:published:507f1f77bcf86cd799439020:v1",
            type: "CLASS_PROJECT_PUBLISHED",
            title: "Novo projeto",
            body: "Consulta o enunciado.",
            targetPath: `/app/turmas/${classId}/projectos`,
        });

        expect(fixture.outboxModel.findOneAndUpdate).toHaveBeenCalledWith(
            { idempotencyKey: "project:published:507f1f77bcf86cd799439020:v1" },
            expect.objectContaining({
                $setOnInsert: expect.objectContaining({
                    type: "CLASS_PROJECT_PUBLISHED",
                    recipientIdsSnapshot: [expect.any(Types.ObjectId)],
                }),
            }),
            expect.objectContaining({ upsert: true }),
        );
        expect(result).toMatchObject({ state: "PENDING" });
    });
});

function makeFixture() {
    const notification = {
        _id: new Types.ObjectId(notificationId),
        contextType: "CLASS",
        contextId: new Types.ObjectId(classId),
        actorId: new Types.ObjectId(teacher.id),
        type: "FOLLOW_UP",
        title: "Acompanhamento",
        body: "Volta ao estudo.",
        recipientIds: [new Types.ObjectId(student.id)],
        suppressedRecipientIds: [],
        createdAt: new Date("2026-07-11T10:00:00.000Z"),
    };
    const row = {
        _id: new Types.ObjectId(recipientRowId),
        notificationId: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(student.id),
        status: "DELIVERED",
        deliveredAt: new Date("2026-07-11T10:00:00.000Z"),
    };
    const notificationModel = {
        find: jest.fn().mockReturnValue(chain([notification])),
        findById: jest.fn().mockReturnValue(chain(notification)),
        findOne: jest.fn().mockReturnValue(chain(null)),
        create: jest.fn(),
    };
    const recipientModel = {
        find: jest.fn().mockReturnValue(chain([row])),
        countDocuments: jest.fn().mockResolvedValue(1),
        findOneAndUpdate: jest.fn().mockReturnValue(
            chain({ ...row, readAt: new Date("2026-07-11T10:05:00.000Z") }),
        ),
        updateMany: jest.fn(),
        bulkWrite: jest.fn(),
    };
    const outboxModel = {
        findOneAndUpdate: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId("507f1f77bcf86cd799439097"),
            status: "PENDING",
        }),
    };
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
    const service = new ContextNotificationsService(
        notificationModel as never,
        classesService as never,
        { ensureMember: jest.fn() } as never,
        { isInAppEnabled: jest.fn().mockResolvedValue(true) } as never,
        {
            assertWithinQuota: jest.fn(),
            assertChannelEnabled: jest.fn(),
        } as never,
        { record: jest.fn() } as never,
        recipientModel as never,
        outboxModel as never,
    );
    return { service, recipientModel, outboxModel };
}

function chain<T>(value: T) {
    const query = {
        sort: jest.fn(),
        limit: jest.fn(),
        lean: jest.fn().mockResolvedValue(value),
    };
    query.sort.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    return query;
}
