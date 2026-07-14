/**
 * Implementa um componente React reutilizavel para ai.
 */
import { AiArtifact } from "../../lib/apiClient.js";
import { ArtifactSources } from "./ArtifactSources.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type SummaryPanelProps = {
    artifact: AiArtifact | null;
};

/**
 * Mostra o último resumo gerado.
 *
 * @param props Artefacto de resumo.
 * @returns Painel de resumo.
 */
export function SummaryPanel({ artifact }: SummaryPanelProps) {
    if (!artifact) return null;
    const content = artifact.contentJson as {
        title?: string;
        bullets?: string[];
        sourceMaterialIds?: string[];
    };

    return (
        <article className="sf-list-card space-y-3">
            <h2 className="text-lg font-bold">{content.title ?? "Resumo"}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-studyflow-text">
                {(content.bullets ?? []).map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                ))}
            </ul>
            <ArtifactSources
                sourceMaterialIds={content.sourceMaterialIds}
                sources={artifact.sourcesJson}
            />
        </article>
    );
}
