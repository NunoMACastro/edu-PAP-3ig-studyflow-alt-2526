/**
 * Implementa um componente React reutilizavel para ai.
 */
import { useState } from "react";
import { SectionHeader } from "../ui/CalmUi.js";
import { Surface } from "../ui/Surface.js";
import { prepareAiProfile } from "../../lib/apiClient.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type AiAreaProfilePanelProps = {
    studyAreaId: string;
};

/**
 * Painel que prepara o perfil IA de uma área.
 *
 * @param props Identificador da área.
 * @returns Botão e resultado do perfil IA.
 */
export function AiAreaProfilePanel({ studyAreaId }: AiAreaProfilePanelProps) {
    const [profile, setProfile] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [preparing, setPreparing] = useState(false);

    /**
     * Chama o backend para recalcular o perfil IA.
     *
     * @returns Promise resolvida depois de preparar.
     */
    async function handlePrepare(): Promise<void> {
        if (preparing) return;
        setError(null);
        setPreparing(true);
        try {
            setProfile(await prepareAiProfile(studyAreaId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível preparar.");
        } finally {
            setPreparing(false);
        }
    }

    const status = (profile as { status?: string } | null)?.status;

    return (
        <Surface className="space-y-3">
            <SectionHeader description="Prepara o contexto pedagógico usado pelas ferramentas da área." title="Perfil IA" />
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {status ? <p className="text-sm text-studyflow-text">Estado: {status}</p> : null}
            <button className="sf-button-primary" disabled={preparing} onClick={() => void handlePrepare()}>
                {preparing ? "A preparar..." : "Preparar perfil"}
            </button>
        </Surface>
    );
}
