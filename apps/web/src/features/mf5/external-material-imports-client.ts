// web/src/features/mf5/external-material-imports-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/** Provider externo aceite pelo RF61. */
export type ExternalMaterialProvider = "GOOGLE_DRIVE" | "ONE_DRIVE";

/** Destino interno aceite pelo endpoint de importação externa. */
export type ExternalMaterialTargetType = "PRIVATE_STUDY_AREA" | "OFFICIAL_SUBJECT";

/** Pedido enviado pelo painel MF5 para criar o material por URL. */
export type ImportExternalMaterialInput = {
    provider: ExternalMaterialProvider;
    targetType: ExternalMaterialTargetType;
    targetId: string;
    title: string;
    sourceUrl: string;
};

/** Material devolvido pela API depois da criação. */
export type ImportedExternalMaterial = {
    _id: string;
    title: string;
    type: "URL";
    status: string;
    url?: string;
    sourceUrl?: string;
};

/**
 * Cria um material StudyFlow a partir de um link externo.
 *
 * @param input Dados preenchidos pelo aluno ou professor.
 * @returns Material criado pelo backend autenticado.
 */
export function importExternalMaterial(
    input: ImportExternalMaterialInput,
): Promise<ImportedExternalMaterial> {
    return requestMf3Json<ImportedExternalMaterial>("/api/external-material-imports", {
        method: "POST",
        // O cliente envia apenas o contrato funcional; sessão e ownership seguem nos cookies HttpOnly.
        body: JSON.stringify(input),
    });
}