// apps/web/src/features/account-deletion/account-deletion-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export const ACCOUNT_DELETION_CONFIRMATION = "ELIMINAR A MINHA CONTA";

export function deleteOwnAccount(confirmation: string, reason?: string) {
    return requestMf3Json("/api/privacy/account-deletion", {
        method: "POST",
        body: JSON.stringify({ confirmation, reason }),
    });
}