// apps/web/src/features/ai-guardrails/check-ai-guardrails.ts
/**
 * Implementa a funcionalidade frontend de guardrails IA e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Tipos permitidos de contexto; estes valores têm de coincidir com o DTO backend.
 */
export type AiGuardrailContextType = "SOLO" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Códigos estáveis devolvidos pelo backend para a UI e para a evidence.
 */
export type AiGuardrailReasonCode =
    | "BIAS_RISK"
    | "CONTEXT_ALLOWED"
    | "CONTEXT_FORBIDDEN"
    | "CONTEXT_NOT_AVAILABLE"
    | "NON_PEDAGOGICAL"
    | "STUDENT_ROLE_REQUIRED"
    | "UNSAFE_REQUEST";

/**
 * Payload enviado para validar se um pedido de IA pode avançar.
 */
export type CheckAiGuardrailsInput = {
    contextType: AiGuardrailContextType;
    resourceId: string;
    prompt: string;
};

/**
 * Contrato de guardrails de IA usado pelos componentes React.
 */
export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: AiGuardrailReasonCode;
    reason: string;
    checkedAt?: string;
};

/**
 * Valida guardrails IA por contexto.
 *
 * @param input Contexto, recurso e prompt introduzidos pelo aluno.
 * @returns Decisão calculada pelo backend.
 */
export function checkAiGuardrails(
    input: CheckAiGuardrailsInput,
): Promise<AiGuardrailDecision> {
    // O helper comum já envia cookies HttpOnly com credentials: "include".
    return requestMf3Json<AiGuardrailDecision>("/api/ai/guardrails/check", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Indica se a decisão corresponde a um bloqueio ético da IA.
 *
 * @param decision Decisão devolvida pelo backend.
 * @returns Verdadeiro quando o bloqueio vem da policy de segurança ética.
 */
export function isAiSafetyBlock(decision: AiGuardrailDecision): boolean {
    return (
        decision.reasonCode === "BIAS_RISK" ||
        decision.reasonCode === "NON_PEDAGOGICAL" ||
        decision.reasonCode === "UNSAFE_REQUEST"
    );
}