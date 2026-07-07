/**
 * Implementa a funcionalidade frontend de preferências de notificação e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de preferências de notificação que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type NotificationContext =
    | "STUDY_ROUTINE"
    | "STUDY_GOAL"
    | "GROUP_SESSION";

/**
 * Contrato de preferências de notificação que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type NotificationPreference = {
    _id?: string;
    context: NotificationContext;
    email: boolean;
    push: boolean;
    inApp: boolean;
    updatedAt?: string;
};

/**
 * Lista preferências efetivas.
 *
 * @returns Preferências por contexto.
 */
export function listNotificationPreferences(): Promise<NotificationPreference[]> {
    return requestMf3Json<NotificationPreference[]>("/api/notification-preferences");
}

/**
 * Atualiza preferência de notificação.
 *
 * @param input Contexto e canais.
 * @returns Preferência persistida.
 */
export function updateNotificationPreferences(
    input: NotificationPreference,
): Promise<NotificationPreference> {
    return requestMf3Json<NotificationPreference>("/api/notification-preferences", {
        method: "PUT",
        body: JSON.stringify(input),
    });
}
