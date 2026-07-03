// apps/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts
/**
 * Cliente frontend para pedir explicações adaptadas.
 */
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Payload permitido pelo endpoint público de explicações adaptadas.
 */
export type AskMf3AdaptiveExplanationInput = {
    studyAreaId: string;
    question: string;
};

/**
 * Pede uma explicação adaptada ao perfil pedagógico da área.
 *
 * @param input Área privada e pergunta do aluno.
 * @returns Explicação adaptada devolvida pelo backend.
 */
export function askMf3AdaptiveExplanation(
    input: AskMf3AdaptiveExplanationInput,
): Promise<AdaptiveExplanation> {
    return requestMf3Json<AdaptiveExplanation>("/api/ai/adaptive-explanations", {
        method: "POST",
        // O frontend envia apenas a área e a pergunta; o perfil vem do backend.
        body: JSON.stringify(input),
    });
}