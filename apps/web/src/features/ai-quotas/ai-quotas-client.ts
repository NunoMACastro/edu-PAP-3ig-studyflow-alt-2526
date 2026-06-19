// apps/web/src/features/ai-quotas/ai-quotas-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiQuotaPolicyInput = {
    scopeType: "USER" | "CLASS" | "GROUP";
    scopeId?: string;
    purpose: "PRIVATE_AREA_AI" | "STUDY_GROUP_AI" | "CLASS_AI" | "PROJECT_AI" | "SUMMARY" | "STUDY_TOOL";
    monthlyLimit: number;
};

export function saveAiQuotaPolicy(input: AiQuotaPolicyInput) {
    return requestMf3Json("/api/admin/ai-quotas", { method: "PUT", body: JSON.stringify(input) });
}