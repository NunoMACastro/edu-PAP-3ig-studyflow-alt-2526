/**
 * Prova, num replica set real, que um acompanhamento manual nunca atravessa o
 * arquivo concorrente da turma e que envelope, entrega, auditoria e lifecycle
 * fence abortam como uma única unidade.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
    createConnection,
    Types,
    type Connection,
    type Model,
} from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "../classes/schemas/class-membership.schema.js";
import {
    SchoolClass,
    SchoolClassSchema,
} from "../classes/schemas/school-class.schema.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import {
    ContextNotification,
    ContextNotificationSchema,
} from "./schemas/context-notification.schema.js";
import {
    ContextNotificationRecipient,
    ContextNotificationRecipientSchema,
} from "./schemas/context-notification-recipient.schema.js";

jest.setTimeout(90_000);

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor.follow-up@example.test",
    role: "TEACHER",
};
const studentId = "507f1f77bcf86cd799439012";

describe("ContextNotificationsService FOLLOW_UP — transação real", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let classModel: Model<SchoolClass>;
    let membershipModel: Model<ClassMembership>;
    let notificationModel: Model<ContextNotification>;
    let recipientModel: Model<ContextNotificationRecipient>;
    let classesService: ClassesService;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-follow-up-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_follow_up_transaction"),
        ).asPromise();
        classModel = connection.model(SchoolClass.name, SchoolClassSchema);
        membershipModel = connection.model(
            ClassMembership.name,
            ClassMembershipSchema,
        );
        notificationModel = connection.model(
            ContextNotification.name,
            ContextNotificationSchema,
        );
        recipientModel = connection.model(
            ContextNotificationRecipient.name,
            ContextNotificationRecipientSchema,
        );
        await Promise.all([
            classModel.createIndexes(),
            membershipModel.createIndexes(),
            notificationModel.createIndexes(),
            recipientModel.createIndexes(),
        ]);
        classesService = new ClassesService(
            classModel as never,
            {} as never,
            membershipModel as never,
            undefined,
            undefined,
            undefined,
            connection,
        );
    });

    beforeEach(async () => {
        await Promise.all([
            classModel.deleteMany({}),
            membershipModel.deleteMany({}),
            notificationModel.deleteMany({}),
            recipientModel.deleteMany({}),
        ]);
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    it("não entrega FOLLOW_UP quando o archive vence depois do precheck", async () => {
        const schoolClass = await createActiveClass();
        const fixture = makeNotificationsService();
        let releasePrecheck!: () => void;
        let signalPrecheck!: () => void;
        const precheckReached = new Promise<void>((resolve) => {
            signalPrecheck = resolve;
        });
        const precheckReleased = new Promise<void>((resolve) => {
            releasePrecheck = resolve;
        });
        const originalFind =
            classesService.findOwnedActiveClass.bind(classesService);
        const precheck = jest
            .spyOn(classesService, "findOwnedActiveClass")
            .mockImplementationOnce(async (teacherId, classId) => {
                const result = await originalFind(teacherId, classId);
                signalPrecheck();
                await precheckReleased;
                return result;
            });

        try {
            const delivery = fixture.service.createForRecipients(
                teacher,
                followUpInput(String(schoolClass._id)),
                [studentId],
            );
            await precheckReached;
            await connection.transaction(async (session) => {
                const archive = await classModel.updateOne(
                    { _id: schoolClass._id, status: "ACTIVE" },
                    {
                        $set: {
                            status: "ARCHIVED",
                            archivedAt: new Date(),
                            archivedBy: new Types.ObjectId(teacher.id),
                        },
                        $inc: { lifecycleFenceVersion: 1 },
                    },
                    { session },
                );
                expect(archive.modifiedCount).toBe(1);
            });
            releasePrecheck();

            await expect(delivery).rejects.toMatchObject({
                response: expect.objectContaining({ code: "CLASS_NOT_ACTIVE" }),
            });
            await expect(notificationModel.countDocuments()).resolves.toBe(0);
            await expect(recipientModel.countDocuments()).resolves.toBe(0);
            expect(fixture.auditLogService.record).not.toHaveBeenCalled();
        } finally {
            releasePrecheck();
            precheck.mockRestore();
        }
    });

    it("reverte fence e envelope quando a materialização do destinatário falha", async () => {
        const schoolClass = await createActiveClass();
        const fixture = makeNotificationsService();
        const recipientWrite = jest
            .spyOn(recipientModel, "bulkWrite")
            .mockRejectedValueOnce(new Error("RECIPIENT_WRITE_FAILED"));

        try {
            await expect(
                fixture.service.createForRecipients(
                    teacher,
                    followUpInput(String(schoolClass._id)),
                    [studentId],
                ),
            ).rejects.toThrow("RECIPIENT_WRITE_FAILED");
        } finally {
            recipientWrite.mockRestore();
        }

        const persistedClass = await classModel.findById(schoolClass._id).lean();
        expect(persistedClass?.status).toBe("ACTIVE");
        expect(persistedClass?.lifecycleFenceVersion).toBe(0);
        await expect(notificationModel.countDocuments()).resolves.toBe(0);
        await expect(recipientModel.countDocuments()).resolves.toBe(0);
        expect(fixture.auditLogService.record).not.toHaveBeenCalled();
    });

    async function createActiveClass() {
        const schoolClass = await classModel.create({
            teacherId: new Types.ObjectId(teacher.id),
            name: "12.º Follow-up",
            code: `FOLLOW-${new Types.ObjectId().toHexString().slice(-6)}`,
            schoolYear: "2025/2026",
            studentIds: [new Types.ObjectId(studentId)],
            status: "ACTIVE",
            lifecycleFenceVersion: 0,
        });
        await membershipModel.create({
            classId: schoolClass._id,
            studentId: new Types.ObjectId(studentId),
            status: "ACTIVE",
            joinedAt: new Date("2026-07-01T10:00:00.000Z"),
            joinedBy: new Types.ObjectId(teacher.id),
            joinedAtEstimated: false,
        });
        return schoolClass;
    }

    function makeNotificationsService() {
        const auditLogService = {
            record: jest.fn().mockResolvedValue(undefined),
        };
        return {
            auditLogService,
            service: new ContextNotificationsService(
                notificationModel as never,
                classesService,
                { ensureMember: jest.fn() } as never,
                { isInAppEnabled: jest.fn().mockResolvedValue(true) } as never,
                {
                    assertWithinQuota: jest.fn().mockResolvedValue(undefined),
                    assertChannelEnabled: jest.fn().mockResolvedValue(undefined),
                } as never,
                auditLogService as never,
                recipientModel as never,
                undefined,
                connection,
            ),
        };
    }
});

function followUpInput(classId: string) {
    return {
        contextType: "CLASS" as const,
        contextId: classId,
        type: "FOLLOW_UP" as const,
        title: "Acompanhamento",
        body: "Retoma o teu plano de estudo.",
    };
}
