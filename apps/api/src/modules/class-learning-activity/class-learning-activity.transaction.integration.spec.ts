/**
 * Prova num MongoDB replica set que o evento de atividade e a projeção usada
 * pelo Centro de acompanhamento confirmam ou abortam como uma única unidade.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createConnection, type Connection, type Model } from "mongoose";
import {
    ClassMembership,
    ClassMembershipSchema,
    type ClassMembershipDocument,
} from "../classes/schemas/class-membership.schema.js";
import { ClassLearningActivityService } from "./class-learning-activity.service.js";
import {
    ClassLearningActivity,
    ClassLearningActivitySchema,
    type ClassLearningActivityDocument,
} from "./schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateSchema,
    type StudentClassActivityStateDocument,
} from "./schemas/student-class-activity-state.schema.js";

const classId = "507f1f77bcf86cd799439011";
const studentId = "507f1f77bcf86cd799439012";

describe("ClassLearningActivityService — transação real", () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    let activityModel: Model<ClassLearningActivityDocument>;
    let stateModel: Model<StudentClassActivityStateDocument>;
    let membershipModel: Model<ClassMembershipDocument>;

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: "wiredTiger" },
        });
        connection = await createConnection(
            mongo.getUri("studyflow_class_activity_atomicity"),
        ).asPromise();
        activityModel = connection.model(
            ClassLearningActivity.name,
            ClassLearningActivitySchema,
        ) as unknown as Model<ClassLearningActivityDocument>;
        stateModel = connection.model(
            StudentClassActivityState.name,
            StudentClassActivityStateSchema,
        ) as unknown as Model<StudentClassActivityStateDocument>;
        membershipModel = connection.model(
            ClassMembership.name,
            ClassMembershipSchema,
        ) as unknown as Model<ClassMembershipDocument>;
        await Promise.all([
            activityModel.init(),
            stateModel.init(),
            membershipModel.init(),
        ]);
    }, 60_000);

    afterEach(async () => {
        jest.restoreAllMocks();
        await Promise.all([
            activityModel.deleteMany({}),
            stateModel.deleteMany({}),
            membershipModel.deleteMany({}),
        ]);
    });

    afterAll(async () => {
        await connection.close();
        await mongo.stop();
    });

    it("confirma evento e projeção uma única vez em retries", async () => {
        const service = makeService();
        const input = {
            classId,
            studentId,
            type: "OFFICIAL_TEST_ATTEMPT" as const,
            sourceEventKey: "official-test-attempt:atomic-1",
            occurredAt: new Date("2026-07-11T10:00:00.000Z"),
        };

        await expect(service.record(input)).resolves.toBe(true);
        await expect(service.record(input)).resolves.toBe(false);

        await expect(activityModel.countDocuments()).resolves.toBe(1);
        await expect(stateModel.findOne().lean()).resolves.toMatchObject({
            activityCount: 1,
            lastActivityType: "OFFICIAL_TEST_ATTEMPT",
        });
    });

    it("remove o evento quando a projeção falha antes do commit", async () => {
        const service = makeService();
        jest.spyOn(stateModel, "updateOne").mockRejectedValueOnce(
            new Error("STATE_PROJECTION_FAILED"),
        );

        await expect(
            service.record({
                classId,
                studentId,
                type: "GUIDED_ROOM_VIEWED",
                sourceEventKey: "guided-room-viewed:atomic-rollback",
            }),
        ).rejects.toThrow("STATE_PROJECTION_FAILED");

        await expect(activityModel.countDocuments()).resolves.toBe(0);
        await expect(stateModel.countDocuments()).resolves.toBe(0);
    });

    function makeService() {
        return new ClassLearningActivityService(
            activityModel,
            stateModel,
            membershipModel,
            connection,
        );
    }
});
