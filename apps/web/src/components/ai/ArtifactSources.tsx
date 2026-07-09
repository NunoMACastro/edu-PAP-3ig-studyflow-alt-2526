/**
 * Implementa um componente React reutilizavel para ai.
 */
import { AiArtifactSource } from "../../lib/apiClient.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type ArtifactSourcesProps = {
    sources: AiArtifactSource[];
    sourceMaterialIds?: string[];
};

/**
 * Mostra as fontes materiais associadas a um artefacto IA.
 *
 * @param props Fontes persistidas no artefacto e filtro opcional.
 * @returns Lista curta de fontes.
 */
export function ArtifactSources({
    sources,
    sourceMaterialIds,
}: ArtifactSourcesProps) {
    const visibleSources =
        sourceMaterialIds && sourceMaterialIds.length > 0
            ? sources.filter((source) =>
                  source.materialId
                      ? sourceMaterialIds.includes(source.materialId)
                      : false,
              )
            : sources;

    if (visibleSources.length === 0) return null;

    return (
        <div className="border-t border-studyflow-border pt-2 text-xs text-studyflow-text">
            <p className="font-semibold text-studyflow-text">Fontes</p>
            <ul className="mt-1 flex flex-wrap gap-2">
                {visibleSources.map((source, index) => (
                    <li
                        className="rounded border border-studyflow-border px-2 py-1"
                        key={source.materialId ?? index}
                    >
                        {source.title ?? source.materialId ?? "Fonte"}
                    </li>
                ))}
            </ul>
        </div>
    );
}
