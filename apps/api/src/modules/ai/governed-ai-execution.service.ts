/**
 * Centraliza todas as chamadas a providers de IA atrás de consentimento,
 * política administrativa, limites de contexto, quota e budget temporal.
 */
import {
    BadGatewayException,
    BadRequestException,
    ForbiddenException,
    HttpException,
    Inject,
    Injectable,
} from "@nestjs/common";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";
import {
    AiModelPoliciesService,
    ResolvedAiModelPolicy,
    assertPromptWithinLimit,
} from "../ai-model-policies/ai-model-policies.service.js";
import { AiQuotasService } from "../ai-quotas/ai-quotas.service.js";
import { AiQuotaScope } from "../ai-quotas/schemas/ai-quota-policy.schema.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { evaluateAiSafetyInput } from "../ai-safety/ai-safety-policy.js";
import {
    AI_PROVIDER,
    AiProvider,
    AiProviderOptions,
} from "./providers/ai-provider.js";
import {
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "./utils/with-ai-response-budget.js";

/**
 * Pedido completo de execução governada. O domínio fornece fontes já
 * autorizadas; a fachada aplica o limite administrativo antes de construir o
 * prompt e é a única classe autorizada a receber o provider.
 */
export type GovernedAiExecutionInput<TSource, TResult> = {
    userId: string;
    purpose: AiConsentPurpose;
    quota: GovernedAiQuotaInput;
    sources: readonly TSource[];
    guardrailText: string;
    buildPrompt: (limitedSources: readonly TSource[]) => string;
    invoke: GovernedAiProviderInvocation<TResult>;
    validateResult: (result: TResult, limitedSources: readonly TSource[]) => void;
};

export type GovernedAiQuotaInput = {
    scope: AiQuotaScope;
    targetId: string;
    units?: number | ((prompt: string) => number);
};

export type GovernedAiProviderInvocation<TResult> = (input: {
    provider: AiProvider;
    prompt: string;
    options: AiProviderOptions;
}) => Promise<TResult>;

/**
 * Prova efémera de que consentimento e política foram resolvidos pela fachada.
 * A instância é aceite apenas pelo mesmo service que a emitiu.
 */
export type GovernedAiAuthorization = Readonly<{
    userId: string;
    purpose: AiConsentPurpose;
    policy: ResolvedAiModelPolicy;
}>;

export type AuthorizedAiExecutionInput<TSource, TResult> = {
    quota: GovernedAiQuotaInput;
    sources: readonly TSource[];
    guardrailText: string;
    buildPrompt: (limitedSources: readonly TSource[]) => string;
    invoke: GovernedAiProviderInvocation<TResult>;
    validateResult: (result: TResult, limitedSources: readonly TSource[]) => void;
};

/**
 * Resultado com as fontes efetivamente enviadas e a política usada, para que
 * persistência e audit log reflitam a execução real.
 */
export type GovernedAiExecutionResult<TSource, TResult> = {
    result: TResult;
    sources: readonly TSource[];
    policy: ResolvedAiModelPolicy;
};

/**
 * Única fronteira autorizada entre serviços de domínio e o provider de IA.
 */
@Injectable()
export class GovernedAiExecutionService {
    private readonly issuedAuthorizations = new WeakSet<object>();

    /**
     * Recebe todas as dependências de governança e o provider externo.
     *
     * @param provider Integração externa, privada a esta fachada.
     * @param consentsService Validação de consentimento ativo por finalidade.
     * @param policiesService Resolução de modelo e limites administrativos.
     * @param quotasService Reserva atómica de consumo antes da chamada externa.
     */
    constructor(
        @Inject(AI_PROVIDER) private readonly provider: AiProvider,
        private readonly consentsService: AiConsentsService,
        private readonly policiesService: AiModelPoliciesService,
        private readonly quotasService: AiQuotasService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Executa uma operação IA somente depois de todos os gates obrigatórios.
     *
     * @param input Fontes autorizadas, finalidade, quota e callback tipado do domínio.
     * @returns Resposta do provider, fontes limitadas e política efetiva.
     */
    async execute<TSource, TResult>(
        input: GovernedAiExecutionInput<TSource, TResult>,
    ): Promise<GovernedAiExecutionResult<TSource, TResult>> {
        const authorization = await this.authorize(input.userId, input.purpose);
        return this.executeAuthorized(authorization, input);
    }

    /**
     * Resolve antecipadamente os gates que não dependem do prompt. Permite aos
     * domínios bloquear uma finalidade desativada antes de carregar contexto.
     *
     * @param userId Utilizador autenticado que concedeu consentimento.
     * @param purpose Finalidade funcional exata da chamada.
     * @returns Autorização efémera aceite apenas por esta instância.
     */
    async authorize(
        userId: string,
        purpose: AiConsentPurpose,
    ): Promise<GovernedAiAuthorization> {
        let policy: ResolvedAiModelPolicy;
        try {
            await this.consentsService.assertGranted(userId, purpose);
            policy = await this.policiesService.resolveForUse(purpose);
        } catch (error) {
            await this.auditLogService.record({
                actorId: userId,
                domain: "AI",
                action: "AI_EXECUTION_AUTHORIZATION_DENIED",
                resourceType: "AiPurpose",
                resourceId: purpose,
                result: "DENIED",
                metadata: { purpose, errorCode: this.errorCode(error) },
            });
            throw error;
        }
        const authorization: GovernedAiAuthorization = Object.freeze({
            userId,
            purpose,
            policy: Object.freeze({ ...policy }),
        });
        this.issuedAuthorizations.add(authorization);
        return authorization;
    }

    /**
     * Completa uma autorização emitida por `authorize`, aplicando limites,
     * quota, timeout e a chamada exclusiva ao provider.
     *
     * @param authorization Prova efémera emitida por esta fachada.
     * @param input Fontes, prompt e quota da operação de domínio.
     * @returns Resultado, fontes efetivas e política usada.
     */
    async executeAuthorized<TSource, TResult>(
        authorization: GovernedAiAuthorization,
        input: AuthorizedAiExecutionInput<TSource, TResult>,
    ): Promise<GovernedAiExecutionResult<TSource, TResult>> {
        if (!this.issuedAuthorizations.has(authorization)) {
            throw new TypeError("Autorização de IA inválida ou externa à fachada.");
        }
        this.issuedAuthorizations.delete(authorization);

        const { policy } = authorization;
        const sources = input.sources.slice(0, policy.maxSourceCount);
        const prompt = input.buildPrompt(sources);
        assertPromptWithinLimit(prompt, policy);

        const guardrail = evaluateAiSafetyInput(input.guardrailText);
        if (!guardrail.allowed) {
            await this.auditLogService.record({
                actorId: authorization.userId,
                domain: "AI",
                action: "AI_EXECUTION_GUARDRAIL_DENIED",
                resourceType: "AiPurpose",
                resourceId: authorization.purpose,
                result: "DENIED",
                metadata: {
                    purpose: authorization.purpose,
                    reasonCode: guardrail.reasonCode,
                },
            });
            throw new ForbiddenException({
                code: "AI_GUARDRAIL_DENIED",
                message: guardrail.reason,
            });
        }

        const units =
            typeof input.quota.units === "function"
                ? input.quota.units(prompt)
                : input.quota.units ?? Math.max(1, Math.ceil(prompt.length / 1000));
        if (!Number.isInteger(units) || units < 1 || units > 1000) {
            throw new BadRequestException({
                code: "AI_USAGE_UNITS_INVALID",
                message: "A estimativa de consumo de IA não é válida.",
            });
        }
        let auditAttempted = false;
        try {
            await this.quotasService.reserveUsage({
                scope: input.quota.scope,
                targetId: input.quota.targetId,
                purpose: authorization.purpose,
                units,
            });

            const budgetMs = resolveAiBudgetMs(policy.timeoutMs);
            const result = await withAiResponseBudget(
                input.invoke({
                    provider: this.provider,
                    prompt,
                    options: { model: policy.model, timeoutMs: budgetMs },
                }),
                budgetMs,
            );
            this.assertSafeProviderResult(result);
            input.validateResult(result, sources);

            auditAttempted = true;
            await this.auditLogService.record({
                actorId: authorization.userId,
                domain: "AI",
                action: "AI_EXECUTION_COMPLETED",
                resourceType: "AiPurpose",
                resourceId: authorization.purpose,
                result: "SUCCESS",
                metadata: {
                    purpose: authorization.purpose,
                    model: policy.model,
                    sourceCount: sources.length,
                    units,
                },
            });
            return { result, sources, policy };
        } catch (error) {
            if (!auditAttempted) {
                await this.auditLogService.record({
                    actorId: authorization.userId,
                    domain: "AI",
                    action: "AI_EXECUTION_FAILED",
                    resourceType: "AiPurpose",
                    resourceId: authorization.purpose,
                    result: error instanceof HttpException && error.getStatus() < 500
                        ? "DENIED"
                        : "FAILED",
                    metadata: {
                        purpose: authorization.purpose,
                        errorCode: this.errorCode(error),
                    },
                });
            }
            throw error;
        }
    }

    /** Rejeita resultados nulos, não-JSON ou excessivos antes da persistência. */
    private assertSafeProviderResult(result: unknown): void {
        if (result === null || typeof result !== "object" || Array.isArray(result)) {
            throw this.invalidProviderOutput();
        }
        try {
            const serialized = JSON.stringify(result);
            if (!serialized || Buffer.byteLength(serialized, "utf8") > 1_000_000) {
                throw this.invalidProviderOutput();
            }
        } catch (error) {
            if (error instanceof BadGatewayException) throw error;
            throw this.invalidProviderOutput();
        }
    }

    private invalidProviderOutput(): BadGatewayException {
        return new BadGatewayException({
            code: "AI_PROVIDER_OUTPUT_INVALID",
            message: "A IA devolveu uma resposta inválida.",
        });
    }

    private errorCode(error: unknown): string {
        if (error instanceof HttpException) {
            const response = error.getResponse();
            if (
                typeof response === "object" &&
                response !== null &&
                "code" in response &&
                typeof response.code === "string"
            ) {
                return response.code.slice(0, 80);
            }
        }
        return "AI_EXECUTION_ERROR";
    }
}
