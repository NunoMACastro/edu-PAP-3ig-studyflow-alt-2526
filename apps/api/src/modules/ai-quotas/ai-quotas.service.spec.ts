/**
 * Testa quotas IA MF4.
 */
import { HttpException } from "@nestjs/common";
import { AiQuotasService } from "./ai-quotas.service.js";

const targetId = "507f1f77bcf86cd799439012";

describe("AiQuotasService", () => {
    it("falha fechada quando não existe quota administrativa", async () => {
        const { defaultPolicyFindOneLean, policyFindOneLean, service, usageModel } =
            makeService();
        policyFindOneLean.mockResolvedValueOnce(null);
        defaultPolicyFindOneLean.mockResolvedValueOnce(null);

        await expect(
            service.reserveUsage({
                scope: "USER",
                targetId,
                purpose: "PRIVATE_AREA_AI",
                units: 1,
            }),
        ).rejects.toMatchObject({
            response: { code: "AI_QUOTA_POLICY_NOT_CONFIGURED" },
        });
        expect(usageModel.updateOne).not.toHaveBeenCalled();
    });

    it("usa o default quando o alvo ainda não tem política específica", async () => {
        const {
            defaultPolicyFindOneLean,
            policyFindOneLean,
            service,
            usageFindOneAndUpdateLean,
            usageModel,
        } = makeService();
        policyFindOneLean.mockResolvedValueOnce(null);
        defaultPolicyFindOneLean.mockResolvedValueOnce({
            monthlyLimitUnits: 5000,
        });
        usageFindOneAndUpdateLean.mockResolvedValueOnce({ usedUnits: 3 });

        await expect(
            service.reserveUsage({
                scope: "CLASS",
                targetId,
                purpose: "CLASS_AI",
                units: 3,
            }),
        ).resolves.toMatchObject({ usedUnits: 3 });

        expect(usageModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "CLASS",
                targetId: expect.objectContaining({}),
                purpose: "CLASS_AI",
                usedUnits: { $lte: 4997 },
            }),
            expect.anything(),
            expect.anything(),
        );
    });

    it("prefere a política específica e não consulta o default", async () => {
        const {
            defaultPolicyModel,
            policyFindOneLean,
            service,
            usageFindOneAndUpdateLean,
        } = makeService();
        policyFindOneLean.mockResolvedValueOnce({ monthlyLimitUnits: 7 });
        usageFindOneAndUpdateLean.mockResolvedValueOnce({ usedUnits: 7 });

        await service.reserveUsage({
            scope: "USER",
            targetId,
            purpose: "SUMMARY",
            units: 7,
        });

        expect(defaultPolicyModel.findOne).not.toHaveBeenCalled();
    });

    it("aplica o limite default e devolve o erro de quota excedida", async () => {
        const {
            defaultPolicyFindOneLean,
            policyFindOneLean,
            service,
            usageFindOneAndUpdateLean,
        } = makeService();
        policyFindOneLean.mockResolvedValueOnce(null);
        defaultPolicyFindOneLean.mockResolvedValueOnce({
            monthlyLimitUnits: 5000,
        });
        usageFindOneAndUpdateLean.mockResolvedValueOnce(null);

        await expect(
            service.reserveUsage({
                scope: "GROUP",
                targetId,
                purpose: "ROOM_AI",
                units: 1,
            }),
        ).rejects.toMatchObject({
            response: { code: "AI_QUOTA_EXCEEDED" },
        });
    });

    it("contabiliza o mesmo default separadamente no alvo real", async () => {
        const {
            defaultPolicyFindOneLean,
            policyFindOneLean,
            service,
            usageFindOneAndUpdateLean,
            usageModel,
        } = makeService();
        policyFindOneLean.mockResolvedValue(null);
        defaultPolicyFindOneLean.mockResolvedValue({ monthlyLimitUnits: 5000 });
        usageFindOneAndUpdateLean.mockResolvedValue({ usedUnits: 1 });
        const otherTargetId = "507f1f77bcf86cd799439013";

        await service.reserveUsage({
            scope: "GROUP",
            targetId,
            purpose: "GROUP_AI",
            units: 1,
        });
        await service.reserveUsage({
            scope: "GROUP",
            targetId: otherTargetId,
            purpose: "GROUP_AI",
            units: 1,
        });

        const firstUsageKey = usageModel.updateOne.mock.calls[0]?.[0];
        const secondUsageKey = usageModel.updateOne.mock.calls[1]?.[0];
        expect(String(firstUsageKey.targetId)).toBe(targetId);
        expect(String(secondUsageKey.targetId)).toBe(otherTargetId);
        expect(firstUsageKey.targetId).not.toEqual(secondUsageKey.targetId);
    });

    it("bloqueia reserva acima do limite mensal", async () => {
        const { policyFindOneLean, service, usageFindOneAndUpdateLean, usageModel } =
            makeService();
        policyFindOneLean.mockResolvedValueOnce({ monthlyLimitUnits: 2 });
        usageFindOneAndUpdateLean.mockResolvedValueOnce(null);

        await expect(
            service.reserveUsage({
                scope: "USER",
                targetId,
                purpose: "PRIVATE_AREA_AI",
                units: 1,
            }),
        ).rejects.toBeInstanceOf(HttpException);
        expect(usageModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "USER",
                purpose: "PRIVATE_AREA_AI",
                usedUnits: { $lte: 1 },
            }),
            expect.objectContaining({
                $inc: { usedUnits: 1 },
            }),
            expect.objectContaining({ new: true }),
        );
    });

    it("reserva consumo quando ainda existe quota", async () => {
        const { policyFindOneLean, service, usageFindOneAndUpdateLean, usageModel } =
            makeService();
        policyFindOneLean.mockResolvedValueOnce({ monthlyLimitUnits: 10 });
        usageFindOneAndUpdateLean.mockResolvedValueOnce({ usedUnits: 5 });

        await expect(
            service.reserveUsage({
                scope: "USER",
                targetId,
                purpose: "PRIVATE_AREA_AI",
                units: 2,
            }),
        ).resolves.toMatchObject({ usedUnits: 5 });

        expect(usageModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "USER",
                purpose: "PRIVATE_AREA_AI",
                period: expect.stringMatching(/^\d{4}-\d{2}$/),
            }),
            expect.objectContaining({
                $setOnInsert: expect.objectContaining({ usedUnits: 0 }),
            }),
            expect.objectContaining({ upsert: true }),
        );
        expect(usageModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "USER",
                purpose: "PRIVATE_AREA_AI",
                period: expect.stringMatching(/^\d{4}-\d{2}$/),
                usedUnits: { $lte: 8 },
            }),
            expect.objectContaining({
                $inc: { usedUnits: 2 },
            }),
            expect.objectContaining({ new: true }),
        );
    });
});

/**
 * Cria fixture de quotas IA sem base de dados real.
 *
 * @returns Serviço e mocks relacionados.
 */
function makeService() {
    const policyFindOneLean = jest.fn();
    const defaultPolicyFindOneLean = jest.fn();
    const usageFindOneAndUpdateLean = jest.fn().mockResolvedValue({ usedUnits: 5 });
    const policyModel = {
        findOne: jest.fn().mockReturnValue({
            lean: policyFindOneLean,
        }),
    };
    const defaultPolicyModel = {
        findOne: jest.fn().mockReturnValue({
            lean: defaultPolicyFindOneLean,
        }),
    };
    const usageModel = {
        updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: usageFindOneAndUpdateLean,
        }),
    };
    const auditLogService = {
        record: jest.fn(),
    };
    const service = new AiQuotasService(
        policyModel as never,
        defaultPolicyModel as never,
        usageModel as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        defaultPolicyFindOneLean,
        defaultPolicyModel,
        policyFindOneLean,
        policyModel,
        service,
        usageFindOneAndUpdateLean,
        usageModel,
    };
}
