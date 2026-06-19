// apps/api/src/modules/ai-quotas/ai-quotas.service.spec.ts
import { TooManyRequestsException } from "@nestjs/common";
import { AiQuotasService } from "./ai-quotas.service.js";
import { AiModelPurpose } from "../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "./dto/upsert-ai-quota-policy.dto.js";

describe("AiQuotasService", () => {
    it("bloqueia reserva acima da quota mensal", async () => {
        const policyModel = { findOne: jest.fn(() => ({ lean: async () => ({ monthlyLimit: 10 }) })) };
        const usageModel = { findOneAndUpdate: jest.fn(() => ({ lean: async () => null })) };
        const service = new AiQuotasService(policyModel as never, usageModel as never);

        await expect(
            service.reserveUsage({ scopeType: AiQuotaScopeType.USER, scopeId: "507f1f77bcf86cd799439010", purpose: AiModelPurpose.PRIVATE_AREA_AI, units: 3 }),
        ).rejects.toBeInstanceOf(TooManyRequestsException);
    });
});