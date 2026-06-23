/**
 * Cliente frontend dos endpoints MF4, sempre com cookies HttpOnly.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AdminUser = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    authProvider: string;
};

export type AuditEvent = {
    id: string;
    actorId: string;
    domain: string;
    action: string;
    resourceType: string;
    result: string;
    createdAt?: string;
};

export type ContextNotification = {
    id: string;
    contextType: "CLASS" | "GROUP";
    contextId: string;
    type: string;
    title: string;
    body: string;
    recipientIds: string[];
    suppressedRecipientIds: string[];
};

export type FollowUpRule = {
    id: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
};

export type DataExportRequest = {
    id: string;
    status: string;
    expiresAt: string;
    createdAt?: string;
};

export type AiConsent = {
    id: string;
    purpose: string;
    status: "GRANTED" | "REVOKED";
    policyVersion: string;
};

export type NotificationPolicy = {
    channel: "IN_APP" | "EMAIL" | "PUSH";
    enabled: boolean;
    maxPerUserPerDay: number;
    maxPerContextPerHour: number;
};

export type AiModelPolicy = {
    purpose: string;
    enabled: boolean;
    provider: string;
    model: string;
    timeoutMs: number;
    maxSourceCount: number;
    maxPromptChars: number;
};

export type AiQuotaPolicy = {
    _id?: string;
    scope: "USER" | "CLASS" | "GROUP";
    targetId: string;
    purpose: string;
    monthlyLimitUnits: number;
};

export type AiUsageRow = {
    _id?: string;
    scope: string;
    targetId: string;
    purpose: string;
    period: string;
    usedUnits: number;
};

/**
 * @returns Utilizadores geridos por admin.
 */
export function listAdminUsers(): Promise<AdminUser[]> {
    return requestMf3Json("/api/admin/users");
}

/**
 * @param userId Utilizador alvo.
 * @param role Novo papel.
 * @returns Utilizador atualizado.
 */
export function changeUserRole(userId: string, role: AdminUser["role"]) {
    return requestMf3Json(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({
            role,
            reason: "Atualização administrativa feita no painel MF4.",
        }),
    });
}

/**
 * @returns Eventos recentes de auditoria.
 */
export function listAuditEvents(): Promise<AuditEvent[]> {
    return requestMf3Json("/api/admin/audit-events");
}

/**
 * @returns Políticas de notificação.
 */
export function listNotificationPolicies(): Promise<NotificationPolicy[]> {
    return requestMf3Json("/api/admin/notification-policies");
}

/**
 * @returns Políticas de modelos IA.
 */
export function listAiModelPolicies(): Promise<AiModelPolicy[]> {
    return requestMf3Json("/api/admin/ai-model-policies");
}

/**
 * @returns Políticas de quotas IA.
 */
export function listAiQuotas(): Promise<AiQuotaPolicy[]> {
    return requestMf3Json("/api/admin/ai-quotas");
}

/**
 * @returns Consumo IA.
 */
export function listAiUsage(): Promise<AiUsageRow[]> {
    return requestMf3Json("/api/admin/ai-usage");
}

/**
 * @param channel Canal de notificação.
 * @param input Política editada.
 * @returns Política persistida.
 */
export function saveNotificationPolicy(
    channel: NotificationPolicy["channel"],
    input: Omit<NotificationPolicy, "channel">,
): Promise<NotificationPolicy> {
    return requestMf3Json(`/api/admin/notification-policies/${channel}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

/**
 * @param purpose Finalidade IA.
 * @param input Política de modelo.
 * @returns Política persistida.
 */
export function saveAiModelPolicy(
    purpose: string,
    input: Omit<AiModelPolicy, "purpose">,
): Promise<AiModelPolicy> {
    return requestMf3Json(`/api/admin/ai-model-policies/${purpose}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

/**
 * @param input Política de quota.
 * @returns Política persistida.
 */
export function saveAiQuotaPolicy(input: AiQuotaPolicy): Promise<AiQuotaPolicy> {
    return requestMf3Json("/api/admin/ai-quotas", {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

/**
 * @param input Notificação a criar.
 * @returns Notificação persistida.
 */
export function createContextNotification(input: {
    contextType: "CLASS" | "GROUP";
    contextId: string;
    type: "NEW_MATERIAL" | "FEEDBACK" | "TASK" | "FOLLOW_UP";
    title: string;
    body: string;
}): Promise<ContextNotification> {
    return requestMf3Json("/api/context-notifications", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * @returns Notificações visíveis.
 */
export function listContextNotifications(): Promise<ContextNotification[]> {
    return requestMf3Json("/api/context-notifications");
}

/**
 * @returns Regras docentes.
 */
export function listFollowUpRules(): Promise<FollowUpRule[]> {
    return requestMf3Json("/api/follow-up-alerts");
}

/**
 * @param input Regra docente.
 * @returns Regra criada.
 */
export function createFollowUpRule(input: {
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
}): Promise<FollowUpRule> {
    return requestMf3Json("/api/follow-up-alerts", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * @param ruleId Regra a executar.
 * @returns Resultado da execução.
 */
export function runFollowUpRule(ruleId: string) {
    return requestMf3Json(`/api/follow-up-alerts/${ruleId}/run`, { method: "POST" });
}

/**
 * @returns Pedidos próprios de exportação.
 */
export function listDataExports(): Promise<DataExportRequest[]> {
    return requestMf3Json("/api/privacy/data-exports");
}

/**
 * @returns Pedido criado.
 */
export function requestDataExport(): Promise<DataExportRequest> {
    return requestMf3Json("/api/privacy/data-exports", {
        method: "POST",
        body: JSON.stringify({}),
    });
}

/**
 * @param requestId Pedido a descarregar.
 * @returns Bundle JSON minimizado.
 */
export function downloadDataExport(requestId: string): Promise<Record<string, unknown>> {
    return requestMf3Json(`/api/privacy/data-exports/${requestId}/download`);
}

/**
 * @param confirmation Frase obrigatória.
 * @returns Resultado de eliminação.
 */
export function deleteAccount(confirmation: string) {
    return requestMf3Json("/api/privacy/account-deletion", {
        method: "POST",
        body: JSON.stringify({ confirmation }),
    });
}

/**
 * @returns Consentimentos IA próprios.
 */
export function listAiConsents(): Promise<AiConsent[]> {
    return requestMf3Json("/api/ai-consents");
}

/**
 * @param purpose Finalidade IA.
 * @returns Consentimento concedido.
 */
export function grantAiConsent(purpose: string): Promise<AiConsent> {
    return requestMf3Json(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({}),
    });
}

/**
 * @param purpose Finalidade IA.
 * @returns Consentimento revogado.
 */
export function revokeAiConsent(purpose: string): Promise<AiConsent> {
    return requestMf3Json(`/api/ai-consents/${purpose}`, { method: "DELETE" });
}
