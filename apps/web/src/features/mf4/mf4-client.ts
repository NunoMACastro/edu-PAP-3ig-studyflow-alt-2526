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
 * Obtém list admin users para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAdminUsers(): Promise<AdminUser[]> {
    return requestMf3Json("/api/admin/users");
}

/**
 * Executa change user role para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param userId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
 * @param role Papel funcional que define permissões e comportamento autorizado dentro da aplicação.
 * @returns Resultado da operação no formato esperado pelo chamador.
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
 * Obtém list audit events para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAuditEvents(): Promise<AuditEvent[]> {
    return requestMf3Json("/api/admin/audit-events");
}

/**
 * Obtém list notification policies para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listNotificationPolicies(): Promise<NotificationPolicy[]> {
    return requestMf3Json("/api/admin/notification-policies");
}

/**
 * Obtém list ai model policies para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAiModelPolicies(): Promise<AiModelPolicy[]> {
    return requestMf3Json("/api/admin/ai-model-policies");
}

/**
 * Obtém list ai quotas para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAiQuotas(): Promise<AiQuotaPolicy[]> {
    return requestMf3Json("/api/admin/ai-quotas");
}

/**
 * Obtém list ai usage para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAiUsage(): Promise<AiUsageRow[]> {
    return requestMf3Json("/api/admin/ai-usage");
}

/**
 * Atualiza save notification policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param channel Valor de channel usado pela função para executar save notification policy com dados explícitos.
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
 * Atualiza save ai model policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
 * Atualiza save ai quota policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
export function saveAiQuotaPolicy(input: AiQuotaPolicy): Promise<AiQuotaPolicy> {
    return requestMf3Json("/api/admin/ai-quotas", {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

/**
 * Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
 *
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
 * Obtém list context notifications para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listContextNotifications(): Promise<ContextNotification[]> {
    return requestMf3Json("/api/context-notifications");
}

/**
 * Obtém list follow up rules para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listFollowUpRules(): Promise<FollowUpRule[]> {
    return requestMf3Json("/api/follow-up-alerts");
}

/**
 * Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
 *
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
 * Executa run follow up rule para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param ruleId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
export function runFollowUpRule(ruleId: string) {
    return requestMf3Json(`/api/follow-up-alerts/${ruleId}/run`, { method: "POST" });
}

/**
 * Obtém list data exports para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listDataExports(): Promise<DataExportRequest[]> {
    return requestMf3Json("/api/privacy/data-exports");
}

/**
 * Executa request data export para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
export function requestDataExport(): Promise<DataExportRequest> {
    return requestMf3Json("/api/privacy/data-exports", {
        method: "POST",
        body: JSON.stringify({}),
    });
}

/**
 * Descarrega download data export para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param requestId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
export function downloadDataExport(requestId: string): Promise<Record<string, unknown>> {
    return requestMf3Json(`/api/privacy/data-exports/${requestId}/download`);
}

/**
 * Remove delete account para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param confirmation Valor de confirmation usado pela função para executar delete account com dados explícitos.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
export function deleteAccount(confirmation: string) {
    return requestMf3Json("/api/privacy/account-deletion", {
        method: "POST",
        body: JSON.stringify({ confirmation }),
    });
}

/**
 * Obtém list ai consents para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
 */
export function listAiConsents(): Promise<AiConsent[]> {
    return requestMf3Json("/api/ai-consents");
}

/**
 * Regista grant ai consent para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
export function grantAiConsent(purpose: string): Promise<AiConsent> {
    return requestMf3Json(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({}),
    });
}

/**
 * Remove revoke ai consent para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
 *
 * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
export function revokeAiConsent(purpose: string): Promise<AiConsent> {
    return requestMf3Json(`/api/ai-consents/${purpose}`, { method: "DELETE" });
}
