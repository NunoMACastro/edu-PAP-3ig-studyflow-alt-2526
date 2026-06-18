// apps/web/src/features/ai-consents/ai-consents-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Finalidades de IA expostas ao frontend.
 */
export type AiConsentPurpose =
    | "PRIVATE_AREA_AI"
    | "STUDY_GROUP_AI"
    | "CLASS_AI"
    | "PROJECT_AI";

/**
 * Decisão pública de consentimento recebida da API.
 */
export type AiConsent = {
    purpose: AiConsentPurpose;
    policyVersion: string;
    status: string;
    decidedAt: string;
};

export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

/**
 * Carrega o histórico de consentimentos do utilizador autenticado.
 */
export function loadAiConsents(): Promise<AiConsent[]> {
    return requestMf3Json<AiConsent[]>("/api/ai-consents");
}

/**
 * Concede consentimento para uma finalidade IA.
 */
export function grantAiConsent(purpose: AiConsentPurpose): Promise<AiConsent> {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({
            purpose,
            policyVersion: CURRENT_AI_CONSENT_VERSION,
        }),
    });
}

/**
 * Revoga consentimento para uma finalidade IA.
 */
export function revokeAiConsent(purpose: AiConsentPurpose): Promise<AiConsent> {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "DELETE",
    });
}