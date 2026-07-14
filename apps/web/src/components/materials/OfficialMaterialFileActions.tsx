/** Ações binárias comuns a catálogos oficiais e salas guiadas. */
import { IconTooltip, ShellIcon } from "../layout/shell-icons.js";
import type { OfficialMaterial, StudentOfficialMaterial } from "../../lib/apiClient.js";

type FileMaterial = Pick<
    OfficialMaterial | StudentOfficialMaterial,
    "_id" | "type"
>;

/**
 * Renderiza apenas as ações de ficheiro autorizáveis pelo endpoint protegido.
 *
 * @param props Material oficial e variante visual adequada ao contexto.
 * @returns Links textuais ou compactos para abrir e descarregar o ficheiro.
 */
export function OfficialMaterialFileActions({
    material,
    variant = "buttons",
}: {
    material: FileMaterial;
    variant?: "buttons" | "icons";
}) {
    if (!["PDF", "DOCX", "MARKDOWN"].includes(material.type)) return null;
    if (variant === "icons") {
        return (
            <>
                {material.type === "PDF" ? (
                    <a
                        aria-label="Abrir PDF"
                        className="sf-icon-button group relative min-h-11 min-w-11 shrink-0"
                        href={`/api/official-materials/${material._id}/content`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <ShellIcon className="h-5 w-5" name="externalLink" />
                        <IconTooltip align="right" side="top">Abrir PDF</IconTooltip>
                    </a>
                ) : null}
                <a
                    aria-label="Descarregar"
                    className="sf-icon-button group relative min-h-11 min-w-11 shrink-0"
                    href={`/api/official-materials/${material._id}/download`}
                >
                    <ShellIcon className="h-5 w-5" name="download" />
                    <IconTooltip align="right" side="top">Descarregar</IconTooltip>
                </a>
            </>
        );
    }
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
