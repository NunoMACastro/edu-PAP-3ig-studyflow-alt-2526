// apps/web/src/features/context-notifications/context-notifications-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type ContextNotification = {
    id: string;
    targetType: "CLASS" | "GROUP";
    eventType: string;
    title: string;
    body: string;
    recipientIds: string[];
    suppressedRecipientIds: string[];
};

export type CreateContextNotificationInput = {
    targetType: "CLASS" | "GROUP";
    targetId: string;
    eventType: "MATERIAL_CREATED" | "FEEDBACK_POSTED" | "TASK_ASSIGNED";
    title: string;
    body: string;
    sourceId?: string;
};

/**
 * Lê notificações do utilizador autenticado com cookies seguros.
 */
export function loadContextNotifications() {
    return requestMf3Json<ContextNotification[]>("/api/context-notifications");
}

/**
 * Cria uma notificação interna sem expor destinatários ao frontend.
 */
export function createContextNotification(input: CreateContextNotificationInput) {
    return requestMf3Json<ContextNotification>("/api/context-notifications", {
        method: "POST",
        body: JSON.stringify(input),
    });
}