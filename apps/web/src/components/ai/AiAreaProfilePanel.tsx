/**
 * Implementa um componente React reutilizavel para ai.
 */
import { useState } from "react";
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

    /**
     * Chama o backend para recalcular o perfil IA.
     *
     * @returns Promise resolvida depois de preparar.
     */
    async function handlePrepare(): Promise<void> {
        setError(null);
        try {
            setProfile(await prepareAiProfile(studyAreaId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível preparar.");
        }
    }

    const status = (profile as { status?: string } | null)?.status;

    return (
        <div className="sf-panel space-y-3">
            <h2 className="text-lg font-bold">Perfil IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            {status ? <p className="text-sm text-slate-700">Estado: {status}</p> : null}
            <button className="sf-button-primary" onClick={() => void handlePrepare()}>
                Preparar perfil
            </button>
        </div>
    );
}
