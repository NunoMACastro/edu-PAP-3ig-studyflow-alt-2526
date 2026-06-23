/**
 * Implementa quotas e consumo mensal de IA.
 */
import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ReserveAiUsageDto } from "./dto/reserve-ai-usage.dto.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";
import { AiQuotaPolicy, AiQuotaPolicyDocument } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageDocument } from "./schemas/ai-quota-usage.schema.js";

/**
 * Service de quotas e uso IA.
 */
@Injectable()
export class AiQuotasService {
    constructor(
        @InjectModel(AiQuotaPolicy.name)
        private readonly policyModel: Model<AiQuotaPolicyDocument>,
        @InjectModel(AiQuotaUsage.name)
        private readonly usageModel: Model<AiQuotaUsageDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async listPolicies(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        return this.policyModel.find({}).sort({ updatedAt: -1 }).lean();
    }

    async listUsage(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        return this.usageModel.find({}).sort({ updatedAt: -1 }).limit(200).lean();
    }

    async upsertPolicy(actor: AuthenticatedUser, input: UpsertAiQuotaPolicyDto) {
        this.assertAdmin(actor);
        const policy = await this.policyModel
            .findOneAndUpdate(
                {
                    scope: input.scope,
                    targetId: new Types.ObjectId(input.targetId),
                    purpose: input.purpose,
                },
                {
                    $set: {
                        monthlyLimitUnits: input.monthlyLimitUnits,
                    },
                    $setOnInsert: {
                        scope: input.scope,
                        targetId: new Types.ObjectId(input.targetId),
                        purpose: input.purpose,
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "AI_QUOTA_POLICY_UPDATED",
            resourceType: "AiQuotaPolicy",
            resourceId: String(policy._id),
            result: "SUCCESS",
            metadata: {
                scope: input.scope,
                purpose: input.purpose,
                monthlyLimitUnits: input.monthlyLimitUnits,
            },
        });
        return policy;
    }

    /**
     * Reserva unidades antes da chamada IA.
     *
     * @param input Reserva desejada.
     * @returns Uso atualizado.
     */
    async reserveUsage(input: ReserveAiUsageDto) {
        const targetId = new Types.ObjectId(input.targetId);
        const period = this.currentPeriod();
        const policy = await this.policyModel
            .findOne({ scope: input.scope, targetId, purpose: input.purpose })
            .lean();
        const limit = policy?.monthlyLimitUnits ?? 100;
        if (input.units > limit) {
            throw this.quotaExceeded();
        }
        const usageKey = { scope: input.scope, targetId, purpose: input.purpose, period };
        await this.usageModel.updateOne(
            usageKey,
            { $setOnInsert: { ...usageKey, usedUnits: 0 } },
            { upsert: true, runValidators: true },
        );
        const usage = await this.usageModel
            .findOneAndUpdate(
                { ...usageKey, usedUnits: { $lte: limit - input.units } },
                {
                    $inc: { usedUnits: input.units },
                },
                { new: true, runValidators: true },
            )
            .lean();
        if (!usage) throw this.quotaExceeded();
        return usage;
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    private currentPeriod(): string {
        return new Date().toISOString().slice(0, 7);
    }

    private quotaExceeded(): HttpException {
        return new HttpException({
            code: "AI_QUOTA_EXCEEDED",
            message: "A quota mensal de IA foi excedida.",
        }, HttpStatus.TOO_MANY_REQUESTS);
    }
}
