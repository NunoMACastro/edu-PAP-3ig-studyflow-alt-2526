// apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts
import { ServiceUnavailableException } from "@nestjs/common";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { AiModelPurpose, AiProviderName } from "./dto/upsert-ai-model-policy.dto.js";

describe("AiModelPoliciesService", () => {
    it("bloqueia finalidade IA desativada", async () => {
        const policyModel = {
            findOne: jest.fn(() => ({ lean: async () => ({ purpose: AiModelPurpose.PRIVATE_AREA_AI, provider: AiProviderName.OPENAI, model: "gpt-test", maxPromptChars: 1000, timeoutMs: 4000, enabled: false }) })),
        };
        const service = new AiModelPoliciesService(policyModel as never, {} as never);

        await expect(service.resolveForUse(AiModelPurpose.PRIVATE_AREA_AI)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});