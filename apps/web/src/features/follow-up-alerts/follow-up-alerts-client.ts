// apps/web/src/features/follow-up-alerts/follow-up-alerts-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type FollowUpAlertRule = {
    id: string;
    classId: string;
    inactivityDays: number;
    title: string;
    message: string;
    enabled: boolean;
};

export function loadFollowUpAlerts() {
    return requestMf3Json<FollowUpAlertRule[]>("/api/follow-up-alerts");
}

/**
 * Executa uma regra e devolve a notificação criada por BK-MF4-01.
 */
export function runFollowUpAlert(id: string) {
    return requestMf3Json(`/api/follow-up-alerts/${id}/run`, { method: "POST" });
}