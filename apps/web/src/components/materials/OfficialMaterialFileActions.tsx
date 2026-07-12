/** Ações binárias comuns a catálogos oficiais e salas guiadas. */
import type { OfficialMaterial, StudentOfficialMaterial } from "../../lib/apiClient.js";

type FileMaterial = Pick<
    OfficialMaterial | StudentOfficialMaterial,
    "_id" | "type"
>;

/** Renderiza apenas as ações autorizáveis pelo endpoint protegido. */
export function OfficialMaterialFileActions({
    material,
}: {
    material: FileMaterial;
}) {
    if (material.type !== "PDF" && material.type !== "DOCX") return null;
    return (
        <div className="flex flex-wrap gap-2">
            {material.type === "PDF" ? (
                <a
                    className="sf-button-secondary"
                    href={`/api/official-materials/${material._id}/content`}
                    rel="noreferrer"
                    target="_blank"
                >
                    Abrir PDF
                </a>
            ) : null}
            <a
                className="sf-button-secondary"
                href={`/api/official-materials/${material._id}/download`}
            >
                Descarregar
            </a>
        </div>
    );
}

/** Formata bytes sem usar unidades ambíguas ou casas decimais excessivas. */
export function formatMaterialSize(sizeBytes?: number): string | undefined {
    if (!Number.isFinite(sizeBytes) || Number(sizeBytes) < 0) return undefined;
    if (Number(sizeBytes) < 1024) return `${sizeBytes} B`;
    const kib = Number(sizeBytes) / 1024;
    if (kib < 1024) return `${kib.toFixed(kib >= 10 ? 0 : 1)} KiB`;
    const mib = kib / 1024;
    return `${mib.toFixed(mib >= 10 ? 0 : 1)} MiB`;
}
