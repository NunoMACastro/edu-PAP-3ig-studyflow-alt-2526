// apps/web/src/features/privacy-data-exports/privacy-data-exports-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type DataExportRequest = { id: string; status: string; requestedAt: string; expiresAt: string };

export function loadDataExports() {
    return requestMf3Json<DataExportRequest[]>("/api/privacy/data-exports");
}

export function requestDataExport(reason?: string) {
    return requestMf3Json<DataExportRequest>("/api/privacy/data-exports", {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

/**
 * Obtém o bundle JSON do próprio utilizador.
 */
export function downloadDataExport(id: string) {
    return requestMf3Json<unknown>(`/api/privacy/data-exports/${id}/download`);
}