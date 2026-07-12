/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { AiAreaProfilePanel } from "../../components/ai/AiAreaProfilePanel.js";
import { PageHeader } from "../../components/PageHeader.js";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import { StudyAreaVoiceForm } from "../../components/study/StudyAreaVoiceForm.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, Toolbar } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
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
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getStudyArea(studyAreaId)
            .then((nextArea) => {
                if (active) setArea(nextArea);
            })
            .catch((caught: unknown) => {
                if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar a área.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [studyAreaId]);

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
        if (!window.confirm("Arquivar esta área de estudo?")) return;
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
            <PageHeader
                action={area ? <div className="flex flex-wrap gap-2"><a className="sf-button-primary" href={`/app/areas/${area._id}/materiais`}>Abrir materiais</a><button aria-expanded={isEditing} className="sf-button-secondary" onClick={() => setIsEditing(true)} type="button">Editar área</button></div> : undefined}
                description={area?.description || "Organiza materiais, ferramentas e preferências de IA neste contexto privado."}
                title={area?.name || "Área de estudo"}
            />
            <AsyncStateBlock error={error && !area ? error : undefined} isEmpty={!area} isLoading={loading} emptyMessage="Área de estudo indisponível">
                {area ? <>
                {error && !isEditing ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                <Toolbar ariaLabel="Ferramentas da área de estudo" className="sm:grid-cols-2 lg:grid-cols-5">
                    <a className="sf-button-secondary" href={`/app/areas/${area._id}/ferramentas`}>IA e ferramentas</a>
                    <a className="sf-button-secondary" href={`/app/areas/${area._id}/ia-privada`}>IA privada</a>
                    <a className="sf-button-secondary" href={`/app/areas/${area._id}/adaptativo`}>Adaptativo</a>
                    <a className="sf-button-secondary" href={`/app/areas/${area._id}/contextos-materiais`}>Contextos</a>
                    <button className="sf-button-secondary" onClick={() => void handleArchive()} type="button">Arquivar área</button>
                </Toolbar>
                <div className="grid gap-6 lg:grid-cols-2">
                    <StudyAreaVoiceForm area={area} onSaved={setArea} />
                    <AiAreaProfilePanel studyAreaId={area._id} />
                </div>
                <SidePanel closeDisabled={isSaving} description="Atualiza o nome e a descrição desta área privada." onClose={() => { setError(null); setIsEditing(false); }} open={isEditing} title="Editar área">
                    <StudyAreaForm
                        area={area}
                        error={error}
                        onSavingChange={setIsSaving}
                        onCancel={() => {
                            setError(null);
                            setIsEditing(false);
                        }}
                        onSubmit={handleUpdate}
                        submitLabel="Guardar área"
                    />
                </SidePanel>
                </> : null}
            </AsyncStateBlock>
        </section>
    );
}
