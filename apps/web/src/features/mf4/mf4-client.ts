/**
 * Cliente frontend dos endpoints MF4, sempre com cookies HttpOnly.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";
import { ApiError, type ContractParser } from "../../lib/apiClient.js";

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
    contextType: "CLASS" | "GROUP" | "PRIVATE_AREA" | "STUDY_ROOM";
    contextId: string;
    type: string;
    title: string;
    body: string;
    readAt?: string | null;
    archivedAt?: string | null;
    recipientCount?: number;
    suppressedRecipientCount?: number;
    createdAt?: string;
    targetPath?: string;
};

export type NotificationInbox = {
    items: ContextNotification[];
    unreadCount: number;
    nextCursor: string | null;
};

export type FollowUpRule = {
    id: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
};

export type FollowUpSummaryStudent = {
    studentId: string;
    displayName: string;
    email?: string;
};

export type FollowUpSummaryRule = {
    id: string;
    classId: string;
    className: string;
    inactiveDays: number;
    title: string;
    message: string;
    inactiveStudentsCount: number;
    inactiveStudents: FollowUpSummaryStudent[];
};

export type FollowUpAlertsSummary = {
    rules: FollowUpSummaryRule[];
};

export type FollowUpRunResult = {
    rule: FollowUpRule;
    inactiveStudentIds: string[];
    notification: ContextNotification | null;
};

export type FollowUpOfficialTest = {
    testId: string;
    subjectId: string;
    subjectName: string;
    title: string;
    status: "PUBLISHED" | "CLOSED";
    bestAttempt: null | {
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        attemptCount: number;
        answeredAt: string;
    };
};

export type FollowUpStudentOverview = {
    class: { id: string; name: string; schoolYear: string };
    student: { id: string; displayName: string; email?: string };
    activity: {
        joinedAt: string | null;
        firstActivityAt: string | null;
        lastActivityAt: string | null;
        lastActivityType: string | null;
        activityCount: number;
        current30DaysCount: number;
        previous30DaysCount: number;
        trend: "MORE" | "STABLE" | "LESS" | "NO_BASELINE";
        byType: Record<string, number>;
        recent: Array<{
            id: string;
            type: string;
            subjectId?: string;
            occurredAt: string;
        }>;
    };
    guidedRooms: {
        totalRooms: number;
        viewedRooms: number;
        completedRooms: number;
        completionPercent: number;
        lastViewedAt: string | null;
    };
    officialTests: {
        items: FollowUpOfficialTest[];
        totalTests: number;
        attemptedTests: number;
        averageBestPercentage: number | null;
    };
    approvedAiQuizzes: {
        attemptCount: number;
        quizCount: number;
        averageScorePercent: number | null;
        bestScorePercent: number | null;
        lastAnsweredAt: string | null;
    };
    factualSignals: Array<{ code: string; label: string; evidence: string }>;
};

function parseFollowUpStudentOverview(value: unknown): FollowUpStudentOverview {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TypeError("Detalhe de acompanhamento inválido.");
    }
    const item = value as Record<string, unknown>;
    if (
        typeof item.class !== "object" ||
        item.class === null ||
        typeof item.student !== "object" ||
        item.student === null ||
        typeof item.activity !== "object" ||
        item.activity === null ||
        typeof item.guidedRooms !== "object" ||
        item.guidedRooms === null ||
        typeof item.officialTests !== "object" ||
        item.officialTests === null ||
        typeof item.approvedAiQuizzes !== "object" ||
        item.approvedAiQuizzes === null ||
        !Array.isArray(item.factualSignals)
    ) {
        throw new TypeError("Detalhe de acompanhamento incompleto.");
    }
    const officialTests = item.officialTests as Record<string, unknown>;
    if (!Array.isArray(officialTests.items)) {
        throw new TypeError("Mini-testes de acompanhamento inválidos.");
    }
    return item as FollowUpStudentOverview;
}

export type DataExportRequest = {
    id: string;
    status: "READY" | "EXPIRED";
    expiresAt: string;
    createdAt?: string;
};

export type AiConsent = {
    id: string;
    purpose: string;
    status: "GRANTED" | "REVOKED";
    policyVersion: string;
};

export type AiConsentCapability = {
    purpose: string;
    requiredVersion: string;
    state: "CURRENT" | "OUTDATED" | "MISSING" | "REVOKED";
    canUse: boolean;
    lastDecision?: {
        status: AiConsent["status"];
        policyVersion: string;
        decidedAt?: string;
    } | null;
};

function parseContextNotification(value: unknown): ContextNotification {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TypeError("Notificação inválida.");
    }
    const item = value as Record<string, unknown>;
    for (const field of ["id", "contextType", "contextId", "type", "title", "body"] as const) {
        if (typeof item[field] !== "string") throw new TypeError(`Notificação sem ${field}.`);
    }
    return item as ContextNotification;
}

function parseNotificationInbox(value: unknown): NotificationInbox {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TypeError("Inbox inválida.");
    }
    const page = value as Record<string, unknown>;
    if (!Array.isArray(page.items) || typeof page.unreadCount !== "number") {
        throw new TypeError("Inbox incompleta.");
    }
    if (page.nextCursor !== null && typeof page.nextCursor !== "string") {
        throw new TypeError("Cursor da inbox inválido.");
    }
    return {
        items: page.items.map(parseContextNotification),
        unreadCount: page.unreadCount,
        nextCursor: page.nextCursor,
    };
}

function parseAiConsentCapabilities(value: unknown): AiConsentCapability[] {
    if (!Array.isArray(value)) throw new TypeError("Capacidades IA inválidas.");
    return value.map((entry) => {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
            throw new TypeError("Capacidade IA inválida.");
        }
        const item = entry as Record<string, unknown>;
        if (
            typeof item.purpose !== "string" ||
            typeof item.requiredVersion !== "string" ||
            typeof item.canUse !== "boolean" ||
            !["CURRENT", "OUTDATED", "MISSING", "REVOKED"].includes(String(item.state))
        ) {
            throw new TypeError("Capacidade IA incompleta.");
        }
        return item as AiConsentCapability;
    });
}

async function requestMf4Contract<T>(
    path: string,
    parser: ContractParser<T>,
    options: RequestInit = {},
): Promise<T> {
    const payload = await requestMf3Json<unknown>(path, options);
    try {
        return parser(payload);
    } catch (error) {
        throw new ApiError(
            "O servidor devolveu dados incompatíveis com esta versão da aplicação.",
            502,
            "API_RESPONSE_INVALID",
            error,
        );
    }
}

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
    return requestMf3Json("/api/context-notifications/sent");
}

/** Obtém a inbox minimizada do utilizador autenticado. */
export function getNotificationInbox(input: {
    cursor?: string;
    limit?: number;
    unreadOnly?: boolean;
} = {}): Promise<NotificationInbox> {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    if (input.unreadOnly) query.set("unreadOnly", "true");
    const suffix = query.size ? `?${query.toString()}` : "";
    return requestMf4Contract(
        `/api/context-notifications/inbox${suffix}`,
        parseNotificationInbox,
    );
}

/** Marca uma notificação como lida para o destinatário atual. */
export function markContextNotificationRead(id: string): Promise<ContextNotification> {
    return requestMf4Contract(
        `/api/context-notifications/${id}/read`,
        parseContextNotification,
        { method: "PATCH" },
    );
}

/** Arquiva uma notificação apenas na inbox do destinatário atual. */
export function archiveContextNotification(id: string): Promise<ContextNotification> {
    return requestMf4Contract(
        `/api/context-notifications/${id}/archive`,
        parseContextNotification,
        { method: "PATCH" },
    );
}

/** Marca todas as notificações correntes como lidas. */
export function markAllContextNotificationsRead(): Promise<{ updatedCount: number }> {
    return requestMf3Json("/api/context-notifications/read-all", { method: "POST" });
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
 * Obtém o resumo de acompanhamento, incluindo preview seguro de alunos inativos.
 *
 * @returns Regras enriquecidas para a área docente de acompanhamento.
 */
export function getFollowUpAlertsSummary(): Promise<FollowUpAlertsSummary> {
    return requestMf3Json("/api/follow-up-alerts/summary");
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
export function runFollowUpRule(ruleId: string): Promise<FollowUpRunResult> {
    return requestMf3Json(`/api/follow-up-alerts/${ruleId}/run`, { method: "POST" });
}

/**
 * Obtém mini-testes oficiais minimizados de um aluno da turma do professor.
 *
 * @param classId Turma selecionada e autorizada pelo backend.
 * @param studentId Aluno cujo detalhe foi aberto.
 * @returns Testes publicados/encerrados com BEST_ATTEMPT ou ausência de tentativa.
 */
export function listFollowUpStudentOfficialTests(
    classId: string,
    studentId: string,
): Promise<FollowUpOfficialTest[]> {
    return requestMf3Json(
        `/api/follow-up-alerts/classes/${classId}/students/${studentId}/official-tests`,
    );
}

/** Obtém a visão factual consolidada de um aluno dentro de uma turma ativa. */
export function getFollowUpStudentOverview(
    classId: string,
    studentId: string,
): Promise<FollowUpStudentOverview> {
    return requestMf4Contract(
        `/api/follow-up-centre/classes/${classId}/students/${studentId}`,
        parseFollowUpStudentOverview,
    );
}

/**
 * Envia acompanhamento interno apenas ao aluno selecionado.
 *
 * @param classId Turma selecionada.
 * @param studentId Aluno destinatário.
 * @param input Título e mensagem escritos pelo professor.
 * @returns Notificação com contagens efetivas e suprimidas.
 */
export function notifyFollowUpStudent(
    classId: string,
    studentId: string,
    input: { title: string; message: string },
): Promise<ContextNotification> {
    return requestMf3Json(
        `/api/follow-up-alerts/classes/${classId}/students/${studentId}/notify`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
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

/** Resolve versões e estado efetivo de cada capacidade IA no backend. */
export function listAiConsentCapabilities(): Promise<AiConsentCapability[]> {
    return requestMf4Contract(
        "/api/ai-consents/capabilities",
        parseAiConsentCapabilities,
    );
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
