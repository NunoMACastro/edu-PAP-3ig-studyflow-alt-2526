/**
 * Constrói prompts de private área ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../../ai/providers/ai-provider.js";

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
}): string {
    return [
        "És um assistente privado da área de estudo do aluno.",
        "Usa apenas as fontes listadas. Se não estiver nas fontes, diz que não tens base suficiente.",
        "Responde em JSON com: answer: string e sourceMaterialIds: string[].",
        `Área: ${input.areaName}`,
        `Pergunta: ${input.question}`,
        ...input.sources.map(
            (source, index) =>
                `Material ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        ),
    ].join("\n\n");
}
