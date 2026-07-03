/**
 * Testa políticas administrativas de modelos IA.
 */
import {
    ForbiddenException,
    PayloadTooLargeException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
} from "./ai-model-policies.service.js";

const admin: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "admin@example.test",
    role: "ADMIN",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439011",
    email: "teacher@example.test",
    role: "TEACHER",
};

describe("AiModelPoliciesService", () => {
    it("bloqueia gestão por utilizadores não admin", async () => {
        const { service } = makeService();

        await expect(service.list(teacher)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia finalidade desativada antes do provider", async () => {
        const { policyFindOneLean, service } = makeService();
        policyFindOneLean.mockResolvedValueOnce({
            purpose: "PRIVATE_AREA_AI",
            enabled: false,
            provider: "openai",
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 3,
            maxPromptChars: 1000,
        });

        await expect(service.resolveForUse("PRIVATE_AREA_AI")).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it("audita alterações administrativas de política IA", async () => {
        const { auditLogService, policyFindOneAndUpdateLean, service } = makeService();
        policyFindOneAndUpdateLean.mockResolvedValueOnce({
            purpose: "PRIVATE_AREA_AI",
            enabled: true,
            provider: "openai",
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 5,
            maxPromptChars: 9000,
        });

        await service.upsert(admin, "PRIVATE_AREA_AI", {
            enabled: true,
            provider: "openai",
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 5,
            maxPromptChars: 9000,
        });

        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: admin.id,
                domain: "AI",
                action: "AI_MODEL_POLICY_UPDATED",
                result: "SUCCESS",
            }),
        );
    });

    it("bloqueia prompts maiores do que a política permite", () => {
        expect(() =>
            assertPromptWithinLimit("x".repeat(1001), {
                maxPromptChars: 1000,
            }),
        ).toThrow(PayloadTooLargeException);
    });

    it("aceita prompts no limite configurado", () => {
        expect(() =>
            assertPromptWithinLimit("x".repeat(1000), {
                maxPromptChars: 1000,
            }),
        ).not.toThrow();
    });

    it("usa limite seguro por defeito quando a política traz valor inválido", () => {
        expect(() =>
            assertPromptWithinLimit("x".repeat(12001), {
                maxPromptChars: Number.NaN,
            }),
        ).toThrow(PayloadTooLargeException);
    });
});

function makeService() {
    const policyFindOneLean = jest.fn();
    const policyFindOneAndUpdateLean = jest.fn();
    const policyModel = {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: policyFindOneLean,
        }),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: policyFindOneAndUpdateLean,
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        auditLogService,
        policyFindOneAndUpdateLean,
        policyFindOneLean,
        service: new AiModelPoliciesService(policyModel as never, auditLogService as never),
    };
}
