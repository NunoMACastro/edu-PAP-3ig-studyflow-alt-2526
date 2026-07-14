/** Testes focados da fonte canónica de atividade pedagógica por turma. */
import { Types } from "mongoose";
import { ClassLearningActivityService } from "./class-learning-activity.service.js";

const classId = "507f1f77bcf86cd799439011";
const otherClassId = "507f1f77bcf86cd799439012";
const studentId = "507f1f77bcf86cd799439013";
const recentStudentId = "507f1f77bcf86cd799439014";

describe("ClassLearningActivityService", () => {
    it("persiste eventos idempotentes e incrementa a projeção apenas na primeira escrita", async () => {
        const { activityModel, stateModel, service } = makeService();
        activityModel.updateOne
            .mockResolvedValueOnce({ upsertedCount: 1 })
            .mockResolvedValueOnce({ upsertedCount: 0 });
        const occurredAt = new Date("2026-07-01T10:00:00.000Z");
        const input = {
            classId,
            studentId,
            type: "OFFICIAL_TEST_ATTEMPT" as const,
            sourceEventKey: "official-test-attempt:attempt-1",
            occurredAt,
        };

        await expect(service.record(input)).resolves.toBe(true);
        await expect(service.record(input)).resolves.toBe(false);

        expect(activityModel.updateOne).toHaveBeenCalledTimes(2);
        expect(stateModel.updateOne).toHaveBeenCalledTimes(2);
        const firstPipeline = stateModel.updateOne.mock.calls[0][1] as Array<{
            $set: { activityCount: { $max: [number, { $add: [unknown, number] }] } };
        }>;
        const retryPipeline = stateModel.updateOne.mock.calls[1][1] as typeof firstPipeline;
        expect(firstPipeline[0].$set.activityCount.$max[1].$add[1]).toBe(1);
        expect(retryPipeline[0].$set.activityCount.$max[1].$add[1]).toBe(0);
    });

    it("calcula inatividade pela membership e última atividade da mesma turma", async () => {
        const now = new Date("2026-07-11T12:00:00.000Z");
        const oldJoinedAt = new Date("2026-06-01T12:00:00.000Z");
        const recentJoinedAt = new Date("2026-07-10T12:00:00.000Z");
        const recentActivityAt = new Date("2026-07-09T12:00:00.000Z");
        const { membershipModel, stateModel, service } = makeService({
            memberships: [
                { studentId: new Types.ObjectId(studentId), joinedAt: oldJoinedAt },
                {
                    studentId: new Types.ObjectId(recentStudentId),
                    joinedAt: recentJoinedAt,
                },
            ],
            states: [
                {
                    studentId: new Types.ObjectId(recentStudentId),
                    lastActivityAt: recentActivityAt,
                },
            ],
        });

        await expect(
            service.findInactiveStudentIds({
                classId,
                studentIds: [studentId, recentStudentId],
                inactiveDays: 7,
                now,
            }),
        ).resolves.toEqual([studentId]);

        expect(membershipModel.find).toHaveBeenCalledWith({
            classId: new Types.ObjectId(classId),
            studentId: {
                $in: [
                    new Types.ObjectId(studentId),
                    new Types.ObjectId(recentStudentId),
                ],
            },
            status: "ACTIVE",
        });
        expect(stateModel.find).toHaveBeenCalledWith({
            classId: new Types.ObjectId(classId),
            studentId: expect.any(Object),
        });
        expect(stateModel.find).not.toHaveBeenCalledWith(
            expect.objectContaining({ classId: new Types.ObjectId(otherClassId) }),
        );
    });

    it("não cria falsos positivos quando uma membership legacy ainda não foi migrada", async () => {
        const { service } = makeService({ memberships: [], states: [] });

        await expect(
            service.findInactiveStudentIds({
                classId,
                studentIds: [studentId],
                inactiveDays: 7,
                now: new Date("2026-07-11T12:00:00.000Z"),
            }),
        ).resolves.toEqual([]);
    });

    it("não quebra o fluxo principal quando a escrita best-effort falha", async () => {
        const { activityModel, service } = makeService();
        activityModel.updateOne.mockRejectedValueOnce(new Error("persistence down"));

        await expect(
            service.recordBestEffort({
                classId,
                studentId,
                type: "CLASS_AI_INTERACTION",
                sourceEventKey: "class-ai:interaction-1",
            }),
        ).resolves.toBe(false);
    });
});

type MakeServiceInput = {
    memberships?: Array<{ studentId: Types.ObjectId; joinedAt: Date }>;
    states?: Array<{ studentId: Types.ObjectId; lastActivityAt: Date }>;
};

/** Constrói os modelos mínimos necessários aos testes unitários. */
function makeService(input: MakeServiceInput = {}) {
    const activityModel = {
        updateOne: jest.fn().mockResolvedValue({ upsertedCount: 1 }),
    };
    const stateFind = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(input.states ?? []),
        }),
    });
    const stateModel = {
        updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
        find: stateFind,
    };
    const membershipModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(input.memberships ?? []),
            }),
        }),
    };
    return {
        activityModel,
        membershipModel,
        stateModel,
        service: new ClassLearningActivityService(
            activityModel as never,
            stateModel as never,
            membershipModel as never,
        ),
    };
}
