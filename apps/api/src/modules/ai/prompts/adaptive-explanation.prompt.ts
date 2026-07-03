// apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts
/**
 * Constrói prompts de IA mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../providers/ai-provider.js";
import {
    LearningLevel,
    LearningPace,
} from "../schemas/learning-profile.schema.js";

/**
 * Dados validados que entram no prompt adaptativo.
 */
type BuildAdaptiveExplanationPromptInput = {
    areaName: string;
    question: string;
    pace: LearningPace;
    level: LearningLevel;
    difficulties: string[];
    preferredExplanationStyle?: string;
    sources: AiSource[];
};

/**
 * Constrói o prompt para uma explicação adaptada ao perfil do aluno.
 *
 * @param input Contexto validado pelo backend.
 * @returns Prompt com contrato JSON explícito para o provider.
 */
export function buildAdaptiveExplanationPrompt(
    input: BuildAdaptiveExplanationPromptInput,
): string {
    const sources = input.sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    // O prompt recebe apenas fontes autorizadas; o provider não pode procurar dados fora deste contexto.
    return [
        "És um assistente pedagógico da StudyFlow em português de Portugal.",
        "Responde apenas com base nas fontes autorizadas abaixo.",
        "Adapta a explicação ao perfil do aluno, sem inventar factos fora das fontes.",
        `Área de estudo: ${input.areaName}`,
        `Ritmo: ${input.pace}`,
        `Nível: ${input.level}`,
        `Dificuldades declaradas: ${input.difficulties.length > 0 ? input.difficulties.join(", ") : "Não indicadas"}`,
        `Estilo preferido de explicação: ${input.preferredExplanationStyle?.trim() || "Não indicado"}`,
        `Pergunta do aluno: ${input.question}`,
        "Fontes autorizadas:",
        sources,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","suggestedNextSteps":["passo 1"],"sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}