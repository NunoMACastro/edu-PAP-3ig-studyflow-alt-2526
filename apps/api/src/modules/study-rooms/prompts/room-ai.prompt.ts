/**
 * Constrói prompts de salas de estudo mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { RoomShareSource } from "../room-shares.service.js";
import { RoomAiPedagogicalContext } from "../room-ai-pedagogy.js";
import { formatUntrustedAiSources } from "../../ai/prompts/untrusted-sources.prompt.js";

/**
 * Constrói prompt para a IA da sala com fontes já autorizadas.
 *
 * @param input Pergunta, fontes validadas por membership e contexto pedagogico do aluno que pergunta.
 * @returns Prompt com contrato JSON.
 */
export function buildRoomAiPrompt(input: {
    question: string;
    sources: RoomShareSource[];
    askerPedagogicalContext: RoomAiPedagogicalContext;
    conversationHistory?: string;
}): string {
    const sources = formatUntrustedAiSources(
        input.sources.map((source) => ({
            id: source.shareId,
            title: source.title,
            contentText: source.contentText,
        })),
    );
    const pedagogy = input.askerPedagogicalContext;

    return [
        "És a IA partilhada de uma sala de estudo da StudyFlow.",
        "Responde em português de Portugal apenas com base nas fontes da sala.",
        "Não uses materiais privados nem conhecimento externo.",
        "Adapta a forma da explicação ao ano escolar do aluno que fez a pergunta, mas não alteres factos, fontes ou permissões.",
        "Não reveles o ano escolar normalizado, não menciones idade e não digas frases como 'como tens X anos'.",
        `Contexto pedagógico interno: ${pedagogy.promptLabel}`,
        `Orientação pedagógica: ${pedagogy.promptGuidance}`,
        input.conversationHistory || "",
        `Pergunta: ${input.question}`,
        "Fontes autorizadas:",
        sources,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","sourceShareIds":["id"]}`,
    ].join("\n\n");
}
