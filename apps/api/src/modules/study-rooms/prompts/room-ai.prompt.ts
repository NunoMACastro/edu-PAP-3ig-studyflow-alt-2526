/**
 * Constrói prompts de salas de estudo mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { RoomShareSource } from "../room-shares.service.js";

/**
 * Constrói prompt para a IA da sala com fontes já autorizadas.
 *
 * @param input Pergunta e fontes validadas por membership.
 * @returns Prompt com contrato JSON.
 */
export function buildRoomAiPrompt(input: {
    question: string;
    sources: RoomShareSource[];
}): string {
    const sources = input.sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.shareId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    return [
        "És a IA partilhada de uma sala de estudo da StudyFlow.",
        "Responde em português de Portugal apenas com base nas fontes da sala.",
        "Não uses materiais privados nem conhecimento externo.",
        `Pergunta: ${input.question}`,
        "Fontes autorizadas:",
        sources,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","sourceShareIds":["id"]}`,
    ].join("\n\n");
}
