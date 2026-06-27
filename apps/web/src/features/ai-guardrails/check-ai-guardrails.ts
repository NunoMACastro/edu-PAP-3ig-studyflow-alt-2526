/**
 * Implementa a funcionalidade frontend de ai guardrails e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Tipos permitidos de guardrails de IA; direcionam validação e renderização.
 */
export type AiGuardrailContextType = "SOLO" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Contrato de guardrails de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: string;
    reason: string;
    checkedAt?: string;
};

/**
 * Valida guardrails IA por contexto.
 *
 * @param input Contexto, recurso e prompt.
 * @returns Decisão do backend.
 */
export function checkAiGuardrails(input: {
    contextType: AiGuardrailContextType;
    resourceId: string;
    prompt: string;
}): Promise<AiGuardrailDecision> {
    return requestMf3Json<AiGuardrailDecision>("/api/ai/guardrails/check", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
