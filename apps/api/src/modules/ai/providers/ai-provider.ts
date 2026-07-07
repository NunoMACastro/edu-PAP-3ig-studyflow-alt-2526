/**
 * Define a integração de providers usada por ai.
 */
import {
    BadGatewayException,
    GatewayTimeoutException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import OpenAI from "openai";
import { StudyToolType } from "../dto/create-study-tool.dto.js";

/**
 * Fonte autorizada de artefactos de IA, usada para explicar de onde vem a resposta apresentada.
 */
export type AiSource = {
    materialId: string;
    title: string;
    contentText: string;
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type SummaryResult = {
    title: string;
    bullets: string[];
    sourceMaterialIds: string[];
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type AdaptiveExplanationResult = {
    answer: string;
    suggestedNextSteps: string[];
    sourceMaterialIds: string[];
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type RoomAiResult = {
    answer: string;
    sourceShareIds: string[];
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type ClassAiResult = {
    answer: string;
    sourceMaterialIds: string[];
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type ProjectAiPlanResult = {
    steps: string[];
    rationale: string;
};

/**
 * Resultado calculado em artefactos de IA depois de validação do backend.
 */
export type PrivateAreaAiResult = {
    answer: string;
    sourceMaterialIds: string[];
};

/**
 * Opções técnicas resolvidas pela governança MF4 antes da chamada externa.
 */
export type AiProviderOptions = {
    model?: string;
    timeoutMs?: number;
};

export type AiPromptInput = {
    prompt: string;
    options?: AiProviderOptions;
};

export const AI_PROVIDER = Symbol("AI_PROVIDER");
export const DEFAULT_OPENAI_TIMEOUT_MS = 4000;

/**
 * Contrato isolado do provider de IA.
 *
 * Os services de domínio conhecem este contrato, não o SDK da OpenAI. Assim, em
 * testes ou fases futuras, o provider pode ser substituído sem alterar regras
 * de ownership, fontes ou validação.
 */
export interface AiProvider {
    generateSummary(input: AiPromptInput): Promise<SummaryResult>;
    generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
        options?: AiProviderOptions;
    }): Promise<Record<string, unknown>>;
    generateAdaptiveExplanation(input: AiPromptInput): Promise<AdaptiveExplanationResult>;
    generateRoomAnswer(input: AiPromptInput): Promise<RoomAiResult>;
    generateClassAnswer(input: AiPromptInput): Promise<ClassAiResult>;
    generateProjectPlan(input: AiPromptInput): Promise<ProjectAiPlanResult>;
    generatePrivateAreaAnswer(input: AiPromptInput): Promise<PrivateAreaAiResult>;
}

/**
 * Provider OpenAI usado quando `OPENAI_API_KEY` e `OPENAI_MODEL` existem.
 */
@Injectable()
export class OpenAiProvider implements AiProvider {
    /**
     * Gera resumo em JSON.
     *
     * @param input Prompt final já construído pelo service.
     * @returns Resumo parseado.
     */
    async generateSummary(input: AiPromptInput): Promise<SummaryResult> {
        return this.createJsonResponse<SummaryResult>(input.prompt, input.options);
    }

    /**
     * Gera ferramenta de estudo em JSON.
     *
     * @param input Prompt final e tipo pedido.
     * @returns JSON parseado com a estrutura solicitada.
     */
    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
        options?: AiProviderOptions;
    }): Promise<Record<string, unknown>> {
        return this.createJsonResponse<Record<string, unknown>>(input.prompt, input.options);
    }

    /**
     * Gera uma explicação adaptada ao perfil de aprendizagem do aluno.
     *
     * @param input Prompt final construído pelo domínio.
     * @returns Explicação adaptativa em JSON.
     */
    async generateAdaptiveExplanation(input: AiPromptInput): Promise<AdaptiveExplanationResult> {
        return this.createJsonResponse<AdaptiveExplanationResult>(input.prompt, input.options);
    }

    /**
     * Gera uma resposta IA para sala de estudo.
     *
     * @param input Prompt com fontes partilhadas autorizadas.
     * @returns Resposta e IDs de partilhas usadas.
     */
    async generateRoomAnswer(input: AiPromptInput): Promise<RoomAiResult> {
        return this.createJsonResponse<RoomAiResult>(input.prompt, input.options);
    }

    /**
     * Gera uma resposta IA limitada ao contexto de disciplina/turma.
     *
     * @param input Prompt com materiais oficiais autorizados.
     * @returns Resposta e IDs de materiais oficiais usados.
     */
    async generateClassAnswer(input: AiPromptInput): Promise<ClassAiResult> {
        return this.createJsonResponse<ClassAiResult>(input.prompt, input.options);
    }

    /**
     * Gera plano gradual de projecto.
     *
     * @param input Prompt com enunciado oficial e objectivo do aluno.
     * @returns Plano validável pelo domínio.
     */
    async generateProjectPlan(input: {
        prompt: string;
        options?: AiProviderOptions;
    }): Promise<ProjectAiPlanResult> {
        return this.createJsonResponse<ProjectAiPlanResult>(input.prompt, input.options);
    }

    /**
     * Gera resposta para IA privada de área de estudo.
     *
     * @param input Prompt com fontes privadas autorizadas.
     * @returns Resposta e IDs dos materiais usados.
     */
    async generatePrivateAreaAnswer(input: AiPromptInput): Promise<PrivateAreaAiResult> {
        return this.createJsonResponse<PrivateAreaAiResult>(input.prompt, input.options);
    }

    /**
     * Chama a Responses API e valida que a resposta é JSON.
     *
     * @param prompt Prompt final.
     * @param options Opções técnicas resolvidas por política administrativa.
     * @returns JSON parseado no tipo pedido pelo chamador.
     */
    private async createJsonResponse<T>(prompt: string, options: AiProviderOptions = {}): Promise<T> {
        const apiKey = process.env.OPENAI_API_KEY;
        const model = options.model ?? process.env.OPENAI_MODEL;

        if (!apiKey || !model) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const client = new OpenAI({
            apiKey,
            maxRetries: 0,
            timeout: this.getTimeoutMs(options.timeoutMs),
        });
        const response = await this.createResponse(client, model, prompt);

        try {
            return JSON.parse(response.output_text ?? "{}") as T;
        } catch {
            throw new BadGatewayException({
                code: "AI_PROVIDER_INVALID_JSON",
                message: "A IA devolveu uma resposta inválida.",
            });
        }
    }

    /**
     * Executa o pedido ao provider e mapeia timeouts para erro público.
     *
     * @param client Cliente OpenAI configurado.
     * @param model Modelo configurado por ambiente.
     * @param prompt Prompt final.
     * @returns Resposta da Responses API.
     */
    private async createResponse(
        client: OpenAI,
        model: string,
        prompt: string,
    ) {
        try {
            return await client.responses.create({
                model,
                input: prompt,
            });
        } catch (error) {
            if (this.isTimeoutError(error)) {
                throw new GatewayTimeoutException({
                    code: "AI_PROVIDER_TIMEOUT",
                    message: "A IA demorou demasiado tempo a responder.",
                });
            }
            throw error;
        }
    }

    /**
     * Obtém o timeout configurado para a chamada IA.
     *
     * @param overrideMs Timeout definido por política administrativa.
     * @returns Timeout em milissegundos.
     */
    private getTimeoutMs(overrideMs?: number): number {
        if (typeof overrideMs === "number" && Number.isFinite(overrideMs) && overrideMs > 0) {
            return overrideMs;
        }
        const parsed = Number.parseInt(process.env.OPENAI_TIMEOUT_MS ?? "", 10);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
        return DEFAULT_OPENAI_TIMEOUT_MS;
    }

    /**
     * Deteta timeouts vindos do SDK/fetch sem depender de uma classe específica.
     *
     * @param error Erro desconhecido lançado pelo provider.
     * @returns Verdadeiro quando representa timeout/cancelamento.
     */
    private isTimeoutError(error: unknown): boolean {
        if (!(error instanceof Error)) {
            return false;
        }
        return (
            error.name === "TimeoutError" ||
            error.name === "AbortError" ||
            /timeout|timed out|aborted/i.test(error.message)
        );
    }
}

/**
 * Provider deterministico usado apenas em smoke E2E local/CI.
 *
 * A ativacao passa por `STUDYFLOW_E2E_FAKE_AI=true` e e bloqueada em producao.
 * Isto permite validar sessoes reais, autorizacao e persistencia sem depender
 * de uma chave OpenAI externa durante o smoke.
 */
export class E2eFakeAiProvider implements AiProvider {
    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        return {
            title: "Resumo E2E",
            bullets: ["Resumo deterministico usado pelo smoke E2E."],
            sourceMaterialIds: this.extractSourceMaterialIds(input.prompt),
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>> {
        const sourceMaterialIds = this.extractSourceMaterialIds(input.prompt);

        if (input.type === "EXPLANATION") {
            return {
                title: "Explicacao E2E",
                sections: [
                    {
                        heading: "Ponto principal",
                        body: "Explicacao deterministica usada pelo smoke E2E.",
                        sourceMaterialIds,
                    },
                ],
            };
        }

        if (input.type === "FLASHCARDS") {
            return {
                cards: [
                    {
                        front: "Pergunta deterministica E2E",
                        back: "Resposta deterministica usada pelo smoke E2E.",
                        sourceMaterialIds,
                    },
                ],
            };
        }

        return {
            questions: [
                {
                    question: "Qual e a ideia principal indicada pela fonte?",
                    options: [
                        "A resposta correta vem da fonte.",
                        "Uma opcao alternativa sem suporte.",
                        "Outra opcao alternativa.",
                        "Uma opcao final incorreta.",
                    ],
                    correctOptionIndex: 0,
                    explanation: "A opcao correta usa apenas a fonte do smoke E2E.",
                    sourceMaterialIds,
                },
            ],
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult> {
        return {
            answer: "Explicacao deterministica do smoke E2E.",
            suggestedNextSteps: ["Rever a fonte usada no teste."],
            sourceMaterialIds: this.extractSourceMaterialIds(input.prompt),
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async generateRoomAnswer(input: { prompt: string }): Promise<RoomAiResult> {
        const sourceShareId = this.extractFirstId(input.prompt, /^Fonte \d+ \(([^)]+)\)/m);
        return {
            answer: "Resposta deterministica da IA da sala para smoke E2E.",
            sourceShareIds: sourceShareId ? [sourceShareId] : [],
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async generateClassAnswer(input: { prompt: string }): Promise<ClassAiResult> {
        const sourceMaterialId = this.extractFirstId(input.prompt, /^Material \d+ \(([^)]+)\)/m);
        return {
            answer: "Resposta deterministica da IA da disciplina para smoke E2E.",
            sourceMaterialIds: sourceMaterialId ? [sourceMaterialId] : [],
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    async generateProjectPlan(): Promise<ProjectAiPlanResult> {
        return {
            steps: [
                "Ler o enunciado oficial.",
                "Dividir o trabalho em tarefas pequenas.",
                "Rever o resultado antes de entregar.",
            ],
            rationale: "Plano deterministico usado pelo smoke E2E.",
        };
    }

    /**
     * Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async generatePrivateAreaAnswer(input: {
        prompt: string;
    }): Promise<PrivateAreaAiResult> {
        const sourceMaterialId = this.extractFirstId(input.prompt, /^Material \d+ \(([^)]+)\)/m);
        return {
            answer: "Resposta deterministica da IA privada para smoke E2E.",
            sourceMaterialIds: sourceMaterialId ? [sourceMaterialId] : [],
        };
    }

    /**
     * Executa a operação extract first id no domínio de artefactos de IA com contrato explícito.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param prompt Valor de prompt usado pela função para executar extract first id com dados explícitos.
     * @param pattern Valor de pattern usado pela função para executar extract first id com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private extractFirstId(prompt: string, pattern: RegExp): string | null {
        return prompt.match(pattern)?.[1] ?? null;
    }

    /**
     * Extrai fontes privadas dos prompts atuais e mantém compatibilidade com prompts antigos de smoke.
     *
     * @param prompt Texto final enviado ao provider fake.
     * @returns Identificadores de materiais citáveis pelo artefacto E2E.
     */
    private extractSourceMaterialIds(prompt: string): string[] {
        const fonteIds = this.extractIds(prompt, /^Fonte \d+ \(([^)]+)\)/gm);
        if (fonteIds.length > 0) return fonteIds;
        return this.extractIds(prompt, /^Material \d+ \(([^)]+)\)/gm);
    }

    /**
     * Executa a operação extract ids no domínio de artefactos de IA com contrato explícito.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param prompt Valor de prompt usado pela função para executar extract ids com dados explícitos.
     * @param pattern Valor de pattern usado pela função para executar extract ids com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private extractIds(prompt: string, pattern: RegExp): string[] {
        return Array.from(prompt.matchAll(pattern), (match) => match[1]);
    }
}

/**
 * Escolhe o provider IA adequado ao ambiente atual.
 *
 * @returns Provider real por defeito ou provider fake quando o smoke E2E o pede.
 */
export function createAiProvider(): AiProvider {
    if (process.env.STUDYFLOW_E2E_FAKE_AI === "true") {
        if (process.env.NODE_ENV === "production") {
            throw new Error("STUDYFLOW_E2E_FAKE_AI nao pode ser usado em producao.");
        }
        return new E2eFakeAiProvider();
    }

    return new OpenAiProvider();
}
