// apps/web/src/features/notification-policies/notification-policies-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type NotificationPolicy = {
    channel: "IN_APP" | "EMAIL" | "PUSH";
    enabled: boolean;
    maxPerUserPerDay: number;
    maxPerTargetPerHour: number;
};

export function loadNotificationPolicies() {
    return requestMf3Json<NotificationPolicy[]>("/api/admin/notification-policies");
}

/**
 * Persiste uma política administrativa com cookies HttpOnly.
 */
export function saveNotificationPolicy(input: NotificationPolicy) {
    return requestMf3Json<NotificationPolicy>("/api/admin/notification-policies", {
        method: "PUT",
        body: JSON.stringify(input),
    });
}