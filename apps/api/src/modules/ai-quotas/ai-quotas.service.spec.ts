/**
 * Testa quotas IA MF4.
 */
import { HttpException } from "@nestjs/common";
import { AiQuotasService } from "./ai-quotas.service.js";

const targetId = "507f1f77bcf86cd799439012";

describe("AiQuotasService", () => {
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
    const usageFindOneAndUpdateLean = jest.fn().mockResolvedValue({ usedUnits: 5 });
    const policyModel = {
        findOne: jest.fn().mockReturnValue({
            lean: policyFindOneLean,
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
        usageModel as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        policyFindOneLean,
        policyModel,
        service,
        usageFindOneAndUpdateLean,
        usageModel,
    };
}
