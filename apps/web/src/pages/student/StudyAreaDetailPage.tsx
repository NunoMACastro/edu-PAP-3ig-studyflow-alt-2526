/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { AiAreaProfilePanel } from "../../components/ai/AiAreaProfilePanel.js";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import { StudyAreaVoiceForm } from "../../components/study/StudyAreaVoiceForm.js";
import {
    archiveStudyArea,
    getStudyArea,
    StudyArea,
    updateStudyArea,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudyAreaDetailPageProps = {
    studyAreaId: string;
};

/**
 * Página de detalhe de uma área.
 *
 * @param props Identificador da área.
 * @returns Detalhe, atalhos, voz e perfil IA.
 */
export function StudyAreaDetailPage({ studyAreaId }: StudyAreaDetailPageProps) {
    const [area, setArea] = useState<StudyArea | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void getStudyArea(studyAreaId).then(setArea);
    }, [studyAreaId]);

    if (!area) return <p className="text-sm text-studyflow-text">A carregar área...</p>;

    /**
     * Atualiza nome e descrição da área.
     *
     * @param input Campos editáveis do formulário.
     * @returns Verdadeiro quando a gravação conclui.
     */
    async function handleUpdate(input: {
        name: string;
        description: string;
    }): Promise<boolean> {
        setError(null);
        try {
            const updated = await updateStudyArea(studyAreaId, input);
            setArea(updated);
            setIsEditing(false);
            return true;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
            return false;
        }
    }

    /**
     * Arquiva a área atual e regressa à listagem.
     *
     * @returns Promise resolvida depois do arquivo.
     */
    async function handleArchive(): Promise<void> {
        setError(null);
        try {
            await archiveStudyArea(studyAreaId);
            window.location.assign("/app/areas");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível arquivar.");
        }
    }

    return (
        <section className="space-y-6">
            <div className="sf-panel">
                {isEditing ? (
                    <StudyAreaForm
                        area={area}
                        error={error}
                        onCancel={() => {
                            setError(null);
                            setIsEditing(false);
                        }}
                        onSubmit={handleUpdate}
                        submitLabel="Guardar área"
                    />
                ) : (
                    <>
                        {error ? <p className="sf-error mb-4">{error}</p> : null}
                        <h1 className="text-2xl font-bold">{area.name}</h1>
                        {area.description ? <p className="mt-2 text-studyflow-text">{area.description}</p> : null}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <a className="sf-button-primary" href={`/app/areas/${area._id}/materiais`}>Materiais</a>
                            <a className="sf-button-secondary" href={`/app/areas/${area._id}/ferramentas`}>IA</a>
                            <a className="sf-button-secondary" href={`/app/areas/${area._id}/ia-privada`}>IA privada</a>
                            <a className="sf-button-secondary" href={`/app/areas/${area._id}/adaptativo`}>Adaptativo</a>
                            <a className="sf-button-secondary" href={`/app/areas/${area._id}/contextos-materiais`}>Contextos</a>
                            <button
                                className="sf-button-secondary"
                                onClick={() => setIsEditing(true)}
                                type="button"
                            >
                                Editar
                            </button>
                            <button
                                className="sf-button-secondary"
                                onClick={() => void handleArchive()}
                                type="button"
                            >
                                Arquivar
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <StudyAreaVoiceForm area={area} onSaved={setArea} />
                <AiAreaProfilePanel studyAreaId={area._id} />
            </div>
        </section>
    );
}
