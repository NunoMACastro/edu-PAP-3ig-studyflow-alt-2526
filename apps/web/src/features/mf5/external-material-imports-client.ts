/**
 * Cliente RF61 para importar links externos mantendo cookies HttpOnly.
 */
import type { OfficialMaterial, StudyMaterial } from "../../lib/apiClient.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Providers externos aceites pela importacao unidirecional.
 */
export type ExternalMaterialProvider = "GOOGLE_DRIVE" | "ONE_DRIVE";

/**
 * Destinos StudyFlow suportados pelo endpoint RF61.
 */
export type ExternalMaterialTargetType =
    | "PRIVATE_STUDY_AREA"
    | "OFFICIAL_SUBJECT";

/**
 * Payload enviado ao backend; ownership e permissoes continuam fora do body.
 */
export type ImportExternalMaterialInput = {
    provider: ExternalMaterialProvider;
    targetType: ExternalMaterialTargetType;
    targetId: string;
    title: string;
    sourceUrl: string;
};

/**
 * Material publico criado pelo service privado ou oficial.
 */
export type ImportedExternalMaterial = StudyMaterial | OfficialMaterial;

/**
 * Importa um link Google Drive ou OneDrive para o destino autorizado.
 *
 * @param input Dados visuais recolhidos pela UI; o backend usa a sessao real.
 * @returns Material criado no contrato publico do destino.
 */
export function importExternalMaterial(
    input: ImportExternalMaterialInput,
): Promise<ImportedExternalMaterial> {
    return requestMf3Json<ImportedExternalMaterial>(
        "/api/external-material-imports",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
