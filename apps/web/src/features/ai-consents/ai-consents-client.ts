// apps/web/src/features/ai-consents/ai-consents-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiConsentPurpose = "PRIVATE_AREA_AI" | "STUDY_GROUP_AI" | "CLASS_AI" | "PROJECT_AI";
export type AiConsent = { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: string };
export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

export function loadAiConsents() {
    return requestMf3Json<AiConsent[]>("/api/ai-consents");
}

export function grantAiConsent(purpose: AiConsentPurpose) {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({ purpose, policyVersion: CURRENT_AI_CONSENT_VERSION }),
    });
}

export function revokeAiConsent(purpose: AiConsentPurpose) {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, { method: "DELETE" });
}