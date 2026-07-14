/**
 * Prova em Mongo replica set que uma publicação não pode ficar confirmada sem
 * o respetivo evento durável da outbox.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
    Types,
    createConnection,
    type ClientSession,
    type Connection,
    type Model,
} from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventSchema,
    type NotificationOutboxEventDocument,
} from "../context-notifications/schemas/notification-outbox-event.schema.js";
import { ClassPostsService } from "./class-posts.service.js";
import {
    ClassPost,
    ClassPostSchema,
    type ClassPostDocument,
} from "./schemas/class-post.schema.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "professor@example.test",
    role: "TEACHER",
};
const classId = "507f1f77bcf86cd799439014";

describe("ClassPostsService atomicidade Mongo/outbox", () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    let postModel: Model<ClassPostDocument>;
    let outboxModel: Model<NotificationOutboxEventDocument>;

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: "wiredTiger" },
        });
        connection = await createConnection(
            mongo.getUri("studyflow_class_posts_atomicity"),
        ).asPromise();
        postModel = connection.model(
            ClassPost.name,
            ClassPostSchema,
        ) as unknown as Model<ClassPostDocument>;
        outboxModel = connection.model(
            NotificationOutboxEvent.name,
            NotificationOutboxEventSchema,
        ) as unknown as Model<NotificationOutboxEventDocument>;
        await Promise.all([postModel.init(), outboxModel.init()]);
    }, 60_000);

    afterAll(async () => {
        await connection.close();
        await mongo.stop();
    });

    it("faz rollback da publicação e do evento quando o enqueue falha", async () => {
        const notificationsService = {
            enqueueClassEvent: jest.fn(
                async (
                    actor: AuthenticatedUser,
                    input: {
                        idempotencyKey: string;
                        type: string;
                        title: string;
                        body: string;
                        targetPath?: string;
                    },
                    session?: ClientSession,
                ) => {
                    if (!session) throw new Error("sessão transacional em falta");
                    await outboxModel.create(
                        [
                            {
                                idempotencyKey: input.idempotencyKey,
                                actorId: new Types.ObjectId(actor.id),
                                contextType: "CLASS",
                                contextId: new Types.ObjectId(classId),
                                type: input.type,
                                title: input.title,
                                body: input.body,
                                targetPath: input.targetPath,
                                recipientIdsSnapshot: [],
                                preferenceContext: "LEARNING_CONTENT",
                                status: "PENDING",
                                attempts: 0,
                                availableAt: new Date(),
                            },
                        ],
                        { session },
                    );
                    throw new Error("falha forçada depois de escrever a outbox");
                },
            ),
        };
        const service = new ClassPostsService(
            postModel,
            {
                findOwnedActiveClass: jest.fn().mockResolvedValue({ _id: classId }),
                reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
            } as never,
            notificationsService as never,
            connection,
        );

        await expect(
            service.createPost(teacher, classId, {
                type: "NOTICE",
                title: "Avaliação",
                body: "A avaliação realiza-se amanhã.",
            }),
        ).rejects.toThrow("falha forçada");

        await expect(postModel.countDocuments()).resolves.toBe(0);
        await expect(outboxModel.countDocuments()).resolves.toBe(0);
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledTimes(1);
    });
});
