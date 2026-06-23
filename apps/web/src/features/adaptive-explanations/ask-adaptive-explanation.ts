/**
 * Implementa a funcionalidade frontend de adaptive explanations e o respetivo contrato com a API.
 */
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Pede explicação adaptada ao perfil do aluno.
 *
 * @param input Área e pergunta.
 * @returns Explicação adaptada.
 */
export function askMf3AdaptiveExplanation(input: {
    studyAreaId: string;
    question: string;
}): Promise<AdaptiveExplanation> {
    return requestMf3Json<AdaptiveExplanation>("/api/ai/adaptive-explanations", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
