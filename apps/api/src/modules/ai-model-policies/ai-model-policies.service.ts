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
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @param prompt Valor de prompt usado pela função para executar assert prompt within limit com dados explícitos.
 * @param policy Política editada ou avaliada antes de persistir regras administrativas.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
    throw new PayloadTooLargeException({
        code: "AI_PROMPT_TOO_LARGE",
        message: "O contexto selecionado excede o limite administrativo de IA.",
    });
}

@Injectable()
export class AiModelPoliciesService {
    /**
     * Recebe as dependências injetadas de AiModelPoliciesService para manter políticas de modelos de IA testável e separado de detalhes externos.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param policyModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(AiModelPolicy.name)
        private readonly policyModel: Model<AiModelPolicyDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Obtém list no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    async list(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        const policies = await this.policyModel.find({}).sort({ purpose: 1 }).lean();
        return policies.map((policy) => this.toResolvedPolicy(policy));
    }

    /**
     * Atualiza upsert no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
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

    /**
     * Valida a regra de políticas de modelos de IA e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
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
     * Transforma o documento interno de políticas de modelos de IA num contrato público, removendo detalhes de persistência antes de responder à UI.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param policy Política editada ou avaliada antes de persistir regras administrativas.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
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

    /**
     * Resolve resolve positive number no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @param fallback Valor de fallback usado pela função para executar resolve positive number com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private resolvePositiveNumber(value: unknown, fallback: number): number {
        return typeof value === "number" && Number.isFinite(value) && value > 0
            ? value
            : fallback;
    }
}
