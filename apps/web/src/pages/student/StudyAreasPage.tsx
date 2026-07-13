/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState, InlineNotice } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import { createStudyArea, listStudyAreas, StudyArea } from "../../lib/apiClient.js";

/**
 * Página de criação e listagem de áreas de estudo.
 *
 * @returns Gestão simples de áreas pessoais.
 */
export function StudyAreasPage() {
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useHashSidePanel("#criar-area", setCreateOpen);

    /**
     * Recarrega áreas da API.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refresh(): Promise<void> {
        setAreas(await listStudyAreas());
    }

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setError(null);
        refresh()
            .catch((caught: unknown) => {
                if (active) {
                    setError(caught instanceof Error ? caught.message : "Não foi possível carregar as áreas.");
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    /**
     * Cria uma nova área.
     *
     * @param input Dados editáveis da área.
     * @returns Verdadeiro quando a criação conclui.
     */
    async function handleSubmit(input: {
        name: string;
        description: string;
    }): Promise<boolean> {
        setError(null);
        try {
            await createStudyArea(input);
            await refresh();
            setCreateOpen(false);
            return true;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar.");
            return false;
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Nova área</button>}
                description="Organiza materiais, ferramentas e configurações de IA por contexto de estudo."
                title="Áreas de estudo"
            />
            {isLoading ? <InlineNotice>A carregar áreas de estudo...</InlineNotice> : null}
            {!isLoading && error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!isLoading && !error && areas.length === 0 ? (
                <EmptyState
                    action={<button className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Criar área</button>}
                    description="Cria uma área para reunir materiais e ferramentas de estudo."
                    icon="folder"
                    title="Ainda não há áreas de estudo"
                />
            ) : !isLoading && !error ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {areas.map((area) => (
                        <a className="sf-list-card block" href={`/app/areas/${area._id}`} key={area._id}>
                            <h2 className="text-lg font-semibold">{area.name}</h2>
                            {area.description ? <p className="mt-2 text-sm leading-6 text-studyflow-text/65">{area.description}</p> : null}
                        </a>
                    ))}
                </div>
            ) : null}
            <SidePanel
                closeDisabled={isSaving}
                description="Define o nome e a descrição da nova área pessoal."
                onClose={() => setCreateOpen(false)}
                open={createOpen}
                title="Criar área"
            >
                <StudyAreaForm
                    error={error}
                    formId="criar-area"
                    onSavingChange={setIsSaving}
                    onSubmit={handleSubmit}
                    submitLabel="Criar área"
                />
            </SidePanel>
        </section>
    );
}
