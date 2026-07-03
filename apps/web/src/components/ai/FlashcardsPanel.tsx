/**
 * Implementa um componente React reutilizavel para ai.
 */
import { AiArtifact } from "../../lib/apiClient.js";
import { ArtifactSources } from "./ArtifactSources.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type FlashcardsPanelProps = {
    artifact: AiArtifact | null;
};

/**
 * Mostra flashcards gerados.
 *
 * @param props Artefacto de flashcards.
 * @returns Grelha de cartões.
 */
export function FlashcardsPanel({ artifact }: FlashcardsPanelProps) {
    if (!artifact) return null;
    const content = artifact.contentJson as {
        cards?: Array<{
            front: string;
            back: string;
            sourceMaterialIds?: string[];
        }>;
    };

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {(content.cards ?? []).map((card, index) => (
                <article className="sf-panel" key={index}>
                    <p className="font-semibold">{card.front}</p>
                    <p className="mt-2 text-sm text-slate-700">{card.back}</p>
                    <div className="mt-3">
                        <ArtifactSources
                            sourceMaterialIds={card.sourceMaterialIds}
                            sources={artifact.sourcesJson}
                        />
                    </div>
                </article>
            ))}
        </div>
    );
}
