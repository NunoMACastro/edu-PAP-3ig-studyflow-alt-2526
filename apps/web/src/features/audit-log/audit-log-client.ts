// apps/web/src/features/audit-log/audit-log-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AuditEvent = {
    _id: string;
    actorId: string;
    domain: "MATERIAL" | "AI" | "ROLE";
    action: string;
    resourceType: string;
    resourceId?: string;
    result: "SUCCESS" | "DENIED" | "FAILED";
};

export function loadAuditEvents(domain?: AuditEvent["domain"]) {
    const suffix = domain ? `?domain=${domain}` : "";
    return requestMf3Json<AuditEvent[]>(`/api/admin/audit-events${suffix}`);
}