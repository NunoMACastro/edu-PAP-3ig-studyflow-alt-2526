/**
 * Constrói prompts de private área ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../../ai/providers/ai-provider.js";
import { formatUntrustedAiSources } from "../../ai/prompts/untrusted-sources.prompt.js";

/**
 * Constrói prompt restrito aos materiais privados do aluno.
 *
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
export function buildPrivateAreaAiPrompt(input: {
    areaName: string;
    question: string;
    sources: AiSource[];
    conversationHistory?: string;
}): string {
    return [
        "És um assistente privado da área de estudo do aluno.",
        "Usa apenas as fontes listadas. Se não estiver nas fontes, diz que não tens base suficiente.",
        "Responde em JSON com: answer: string e sourceMaterialIds: string[].",
        `Área: ${input.areaName}`,
        input.conversationHistory || "",
        `Pergunta: ${input.question}`,
        formatUntrustedAiSources(
            input.sources.map((source) => ({
                id: source.materialId,
                title: source.title,
                contentText: source.contentText,
            })),
        ),
    ].join("\n\n");
}
