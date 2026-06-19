// apps/web/src/features/ai-model-policies/ai-model-policies-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiModelPolicy = {
    purpose: "PRIVATE_AREA_AI" | "STUDY_GROUP_AI" | "CLASS_AI" | "PROJECT_AI" | "SUMMARY" | "STUDY_TOOL";
    provider: "OPENAI";
    model: string;
    maxPromptChars: number;
    timeoutMs: number;
    enabled: boolean;
};

export function loadAiModelPolicies() {
    return requestMf3Json<AiModelPolicy[]>("/api/admin/ai-model-policies");
}

export function saveAiModelPolicy(input: AiModelPolicy) {
    return requestMf3Json<AiModelPolicy>("/api/admin/ai-model-policies", { method: "PUT", body: JSON.stringify(input) });
}