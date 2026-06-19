// apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts
import { ForbiddenException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";
import { AiModelPurpose, UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";
import { AiModelPolicy, AiModelPolicyDocument } from "./schemas/ai-model-policy.schema.js";

export type AiModelPolicyView = UpsertAiModelPolicyDto & { updatedAt?: Date };

/**
 * Serviço central de políticas de modelos IA.
 */
@Injectable()
export class AiModelPoliciesService {
    constructor(
        @InjectModel(AiModelPolicy.name)
        private readonly policyModel: Model<AiModelPolicyDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async list(actor: AuthenticatedUser): Promise<AiModelPolicyView[]> {
        this.assertAdmin(actor);
        const rows = await this.policyModel.find().sort({ purpose: 1 }).lean();
        return rows.map((row) => this.toView(row));
    }

    async upsert(actor: AuthenticatedUser, input: UpsertAiModelPolicyDto): Promise<AiModelPolicyView> {
        this.assertAdmin(actor);
        const saved = await this.policyModel
            .findOneAndUpdate({ purpose: input.purpose }, { $set: input }, { new: true, upsert: true, runValidators: true })
            .lean();
        await this.auditLogService.record({
            actorId: actor.id,
            domain: AuditDomain.AI,
            action: "AI_MODEL_POLICY_UPDATED",
            resourceType: "AiModelPolicy",
            resourceId: input.purpose,
            result: AuditResult.SUCCESS,
            metadata: { model: input.model, enabled: input.enabled },
        });
        return this.toView(saved);
    }

    async resolveForUse(purpose: AiModelPurpose): Promise<AiModelPolicyView> {
        const policy = await this.policyModel.findOne({ purpose }).lean();
        if (!policy) {
            throw new ServiceUnavailableException({ code: "AI_MODEL_POLICY_MISSING", message: "A política de IA ainda não está configurada." });
        }
        if (!policy.enabled) {
            throw new ServiceUnavailableException({ code: "AI_MODEL_POLICY_DISABLED", message: "Esta funcionalidade de IA está temporariamente desativada." });
        }
        return this.toView(policy);
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem configurar IA." });
        }
    }

    private toView(row: {
        purpose: AiModelPurpose;
        provider: UpsertAiModelPolicyDto["provider"];
        model: string;
        maxPromptChars: number;
        timeoutMs: number;
        enabled: boolean;
        updatedAt?: Date;
    }): AiModelPolicyView {
        return {
            purpose: row.purpose,
            provider: row.provider,
            model: row.model,
            maxPromptChars: row.maxPromptChars,
            timeoutMs: row.timeoutMs,
            enabled: row.enabled,
            updatedAt: row.updatedAt,
        };
    }
}