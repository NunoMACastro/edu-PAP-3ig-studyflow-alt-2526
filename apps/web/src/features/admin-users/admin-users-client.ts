// apps/web/src/features/admin-users/admin-users-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AdminUser = { id: string; email: string; role: "STUDENT" | "TEACHER" | "ADMIN" };

export function loadAdminUsers() {
    return requestMf3Json<AdminUser[]>("/api/admin/users");
}

export function changeUserRole(id: string, nextRole: AdminUser["role"], reason: string) {
    return requestMf3Json<AdminUser>(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ nextRole, reason }),
    });
}