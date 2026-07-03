// apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de IA com fontes obrigatórias que documenta a resposta esperada.
 */
export type SourceGroundedAnswer = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: {
        sourceJobId: string;
        materialId: string;
        sourceLabel: string;
        locator: string;
        excerpt: string;
    }[];
    createdAt?: string;
};

/**
 * Pede resposta fundamentada em fontes indexadas.
 *
 * @param input Jobs autorizados e pergunta.
 * @returns Resposta com citações.
 */
export function askSourceGroundedAi(input: {
    sourceJobIds: string[];
    question: string;
}): Promise<SourceGroundedAnswer> {
    // requestMf3Json usa credentials include, por isso a sessão fica em cookie HttpOnly.
    return requestMf3Json<SourceGroundedAnswer>(
        "/api/ai/source-grounded-answers",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}