/**
 * Implementa quotas e consumo mensal de IA.
 */
import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
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
    /**
     * Recebe as dependências injetadas de AiQuotasService para manter quotas de IA testável e separado de detalhes externos.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param policyModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param usageModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(AiQuotaPolicy.name)
        private readonly policyModel: Model<AiQuotaPolicyDocument>,
        @InjectModel(AiQuotaUsage.name)
        private readonly usageModel: Model<AiQuotaUsageDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Obtém list policies no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    async listPolicies(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        return this.policyModel.find({}).sort({ updatedAt: -1 }).lean();
    }

    /**
     * Obtém list usage no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    async listUsage(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        return this.usageModel.find({}).sort({ updatedAt: -1 }).limit(200).lean();
    }

    /**
     * Atualiza upsert policy no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
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
        if (!policy) {
            throw new ServiceUnavailableException({
                code: "AI_QUOTA_POLICY_NOT_CONFIGURED",
                message: "Esta finalidade de IA ainda não tem quota administrativa.",
            });
        }
        const limit = policy.monthlyLimitUnits;
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

    /**
     * Valida a regra de quotas de IA e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    /**
     * Executa current period no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private currentPeriod(): string {
        return new Date().toISOString().slice(0, 7);
    }

    /**
     * Executa quota exceeded no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private quotaExceeded(): HttpException {
        return new HttpException({
            code: "AI_QUOTA_EXCEEDED",
            message: "A quota mensal de IA foi excedida.",
        }, HttpStatus.TOO_MANY_REQUESTS);
    }
}
