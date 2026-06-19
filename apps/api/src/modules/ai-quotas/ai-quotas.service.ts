// apps/api/src/modules/ai-quotas/ai-quotas.service.ts
import { ForbiddenException, Injectable, TooManyRequestsException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";
import { ReserveAiUsageDto } from "./dto/reserve-ai-usage.dto.js";
import { AiQuotaPolicy, AiQuotaPolicyDocument } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageDocument } from "./schemas/ai-quota-usage.schema.js";

export type AiQuotaUsageView = { period: string; usedUnits: number; monthlyLimit: number };

/**
 * Serviço de quotas IA com reserva atómica.
 */
@Injectable()
export class AiQuotasService {
    constructor(
        @InjectModel(AiQuotaPolicy.name) private readonly policyModel: Model<AiQuotaPolicyDocument>,
        @InjectModel(AiQuotaUsage.name) private readonly usageModel: Model<AiQuotaUsageDocument>,
    ) {}

    async upsertPolicy(actor: AuthenticatedUser, input: UpsertAiQuotaPolicyDto) {
        this.assertAdmin(actor);
        return this.policyModel
            .findOneAndUpdate(
                this.policyKey(input),
                { $set: { ...input, scopeId: input.scopeId ? new Types.ObjectId(input.scopeId) : undefined } },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
    }

    async reserveUsage(input: ReserveAiUsageDto): Promise<AiQuotaUsageView> {
        const period = this.currentPeriod();
        const policy = await this.policyModel.findOne(this.policyKey(input)).lean();
        if (!policy) {
            throw new ForbiddenException({ code: "AI_QUOTA_POLICY_MISSING", message: "Não existe quota de IA para este contexto." });
        }

        const remainingFilter = {
            ...this.policyKey(input),
            period,
            usedUnits: { $lte: policy.monthlyLimit - input.units },
        };
        const usage = await this.usageModel
            .findOneAndUpdate(
                remainingFilter,
                {
                    $inc: { usedUnits: input.units },
                    $setOnInsert: { ...this.policyKey(input), period },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();

        if (!usage) {
            throw new TooManyRequestsException({ code: "AI_QUOTA_EXCEEDED", message: "A quota mensal de IA foi excedida." });
        }
        return { period, usedUnits: usage.usedUnits, monthlyLimit: policy.monthlyLimit };
    }

    private policyKey(input: Pick<UpsertAiQuotaPolicyDto, "scopeType" | "scopeId" | "purpose">) {
        return {
            scopeType: input.scopeType,
            scopeId: input.scopeId ? new Types.ObjectId(input.scopeId) : undefined,
            purpose: input.purpose,
        };
    }

    private currentPeriod(): string {
        return new Date().toISOString().slice(0, 7);
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem configurar quotas." });
        }
    }
}