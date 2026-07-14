/**
 * Implementa um componente React reutilizavel para ai.
 */
import { AiArtifact } from "../../lib/apiClient.js";
import { ArtifactSources } from "./ArtifactSources.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type ExplanationPanelProps = {
    artifact: AiArtifact | null;
};

/**
 * Mostra uma explicação gerada pela IA.
 *
 * @param props Artefacto de explicação.
 * @returns Painel de secções.
 */
export function ExplanationPanel({ artifact }: ExplanationPanelProps) {
    if (!artifact) return null;
    const content = artifact.contentJson as {
        title?: string;
        sections?: Array<{
            heading: string;
            body: string;
            sourceMaterialIds?: string[];
        }>;
    };

    return (
        <article className="sf-list-card space-y-3">
            <h2 className="text-lg font-bold">{content.title ?? "Explicação"}</h2>
            {(content.sections ?? []).map((section, index) => (
                <section className="space-y-1" key={index}>
                    <h3 className="font-semibold">{section.heading}</h3>
                    <p className="text-sm text-studyflow-text">{section.body}</p>
                    <ArtifactSources
                        sourceMaterialIds={section.sourceMaterialIds}
                        sources={artifact.sourcesJson}
                    />
                </section>
            ))}
        </article>
    );
}
