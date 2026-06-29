/**
 * Implementa políticas administrativas de modelos IA.
 */
import {
    ForbiddenException,
    Injectable,
    PayloadTooLargeException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";
import { UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";
import { AiModelPolicy, AiModelPolicyDocument } from "./schemas/ai-model-policy.schema.js";
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
} from "../ai-model-policies/ai-model-policies.service.js";

export const DEFAULT_AI_MAX_SOURCE_COUNT = 10;
export const DEFAULT_AI_MAX_PROMPT_CHARS = 12000;

export type ResolvedAiModelPolicy = {
    purpose: AiConsentPurpose;
    enabled: boolean;
    provider: string;
    model: string;
    timeoutMs: number;
    maxSourceCount: number;
    maxPromptChars: number;
};

/**
 * Bloqueia prompts acima do limite administrativo antes de qualquer chamada externa.
 *// apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts
import { PayloadTooLargeException } from "@nestjs/common";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";

export const DEFAULT_AI_MAX_PROMPT_CHARS = 12000;

export type ResolvedAiModelPolicy = {
    purpose: AiConsentPurpose;
    enabled: boolean;
    provider: string;
    model: string;
    timeoutMs: number;
    maxSourceCount: number;
    maxPromptChars: number;
};

/**
 * Garante que o prompt final respeita o limite definido para a finalidade IA.
 *
 * @param prompt Prompt final que seria enviado ao provider.
 * @param policy Política efetiva resolvida para a finalidade IA.
 * @throws PayloadTooLargeException quando o prompt excede o limite permitido.
 */
export function assertPromptWithinLimit(
    prompt: string,
    policy: Partial<Pick<ResolvedAiModelPolicy, "maxPromptChars">>,
): void {
    const maxPromptChars =
        typeof policy.maxPromptChars === "number" &&
        Number.isFinite(policy.maxPromptChars) &&
        policy.maxPromptChars > 0
            ? policy.maxPromptChars
            : DEFAULT_AI_MAX_PROMPT_CHARS;

    if (prompt.length <= maxPromptChars) return;

    // O bloqueio acontece antes da chamada externa para preservar custo, privacidade e regra docente.
    throw new PayloadTooLargeException({
        code: "AI_PROMPT_TOO_LARGE",
        message: "O contexto selecionado excede o limite administrativo de IA.",
    });
}

@Injectable()
export class AiModelPoliciesService {
    constructor(
        @InjectModel(AiModelPolicy.name)
        private readonly policyModel: Model<AiModelPolicyDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async list(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        const policies = await this.policyModel.find({}).sort({ purpose: 1 }).lean();
        return policies.map((policy) => this.toResolvedPolicy(policy));
    }

    async upsert(actor: AuthenticatedUser, purpose: AiConsentPurpose, input: UpsertAiModelPolicyDto) {
        this.assertAdmin(actor);
        const policy = await this.policyModel
            .findOneAndUpdate(
                { purpose },
                { $set: input, $setOnInsert: { purpose } },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "AI_MODEL_POLICY_UPDATED",
            resourceType: "AiModelPolicy",
            resourceId: purpose,
            result: "SUCCESS",
            metadata: { ...input },
        });
        return this.toResolvedPolicy(policy);
    }

    /**
     * Resolve política efetiva antes de chamar o provider.
     *
     * @param purpose Finalidade IA.
     * @returns Política ou defaults seguros.
     */
    async resolveForUse(purpose: AiConsentPurpose): Promise<ResolvedAiModelPolicy> {
        const policy =
            (await this.policyModel.findOne({ purpose }).lean()) ??
            {
                purpose,
                enabled: true,
                provider: "openai",
                model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
                timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS ?? 8000),
                maxSourceCount: DEFAULT_AI_MAX_SOURCE_COUNT,
                maxPromptChars: DEFAULT_AI_MAX_PROMPT_CHARS,
            };
        const resolved = this.toResolvedPolicy(policy);
        if (!resolved.enabled) {
            throw new ServiceUnavailableException({
                code: "AI_MODEL_POLICY_DISABLED",
                message: "Esta funcionalidade de IA está temporariamente desativada.",
            });
        }
        return resolved;
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    private toResolvedPolicy(policy: Partial<ResolvedAiModelPolicy>): ResolvedAiModelPolicy {
        return {
            purpose: policy.purpose!,
            enabled: policy.enabled ?? true,
            provider: policy.provider ?? "openai",
            model: policy.model ?? process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
            timeoutMs: this.resolvePositiveNumber(policy.timeoutMs, 8000),
            maxSourceCount: this.resolvePositiveNumber(
                policy.maxSourceCount,
                DEFAULT_AI_MAX_SOURCE_COUNT,
            ),
            maxPromptChars: this.resolvePositiveNumber(
                policy.maxPromptChars,
                DEFAULT_AI_MAX_PROMPT_CHARS,
            ),
        };
    }

    private resolvePositiveNumber(value: unknown, fallback: number): number {
        return typeof value === "number" && Number.isFinite(value) && value > 0
            ? value
            : fallback;
    }
}
