/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { AiAreaProfilePanel } from "../../components/ai/AiAreaProfilePanel.js";
import { PageHeader } from "../../components/PageHeader.js";
import { Breadcrumbs, PrimaryActionCard, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import { StudyAreaVoiceForm } from "../../components/study/StudyAreaVoiceForm.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    archiveStudyArea,
    getStudyArea,
    rememberStudentContext,
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
export function StudyAreaDetailPage({ studyAreaId, settings = false }: StudyAreaDetailPageProps & { settings?: boolean }) {
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
                if (active) {
                    setArea(nextArea);
                    void rememberStudentContext({ kind: "STUDY_AREA", contextId: studyAreaId }).catch(() => undefined);
                }
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
            <AsyncStateBlock error={error && !area ? error : undefined} isEmpty={!area} isLoading={loading} emptyMessage="Área de estudo indisponível">
                {area ? <>
                <Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, { label: area.name }]} />
                <PageHeader description={area.description || "Contexto privado de estudo."} title={area.name} />
                <WorkspaceTabs items={[{ label: "Visão geral", href: `/app/areas/${area._id}`, active: !settings }, { label: "Materiais", href: `/app/areas/${area._id}/materiais`, active: false }, { label: "Praticar", href: `/app/areas/${area._id}/ferramentas`, active: false }, { label: "Definições", href: `/app/areas/${area._id}/definicoes`, active: settings }]} />
                {error && !isEditing ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                {!settings ? <div className="grid gap-4 lg:grid-cols-2"><PrimaryActionCard actionLabel="Estudar material" description="Consulta ou adiciona materiais deste contexto." href={`/app/areas/${area._id}/materiais`} icon="file" title="Materiais" /><PrimaryActionCard actionLabel="Praticar" description="Cria resumos, explicações, flashcards e quizzes." href={`/app/areas/${area._id}/ferramentas`} icon="spark" title="Atividade recente" /></div> : <><SectionHeader action={<button className="sf-button-secondary" onClick={() => setIsEditing(true)} type="button">Editar nome e descrição</button>} title="Definições da área" /><div className="grid gap-6 lg:grid-cols-2"><StudyAreaVoiceForm area={area} onSaved={setArea} /><AiAreaProfilePanel studyAreaId={area._id} /></div><div className="rounded-2xl border border-studyflow-border/10 p-5"><h2 className="font-semibold">Fontes e contextos</h2><p className="mt-2 text-sm text-studyflow-text/65">Consulta os contextos construídos a partir dos materiais desta área.</p><a className="sf-button-secondary mt-4 inline-flex" href={`/app/areas/${area._id}/contextos-materiais`}>Ver fontes</a></div><div className="rounded-2xl border border-red-400/20 p-5"><h2 className="font-semibold">Arquivo</h2><p className="mt-2 text-sm text-studyflow-text/65">Retira a área dos contextos ativos sem apagar o histórico.</p><button className="sf-button-secondary mt-4" onClick={() => void handleArchive()} type="button">Arquivar área</button></div></>}
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
