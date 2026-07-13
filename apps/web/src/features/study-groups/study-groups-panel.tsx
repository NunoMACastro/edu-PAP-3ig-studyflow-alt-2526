/**
 * Implementa a funcionalidade frontend de grupos de estudo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { Surface } from "../../components/ui/Surface.js";
import { createStudyGroup, listStudyGroups, StudyGroup } from "./create-study-group.js";

/**
 * Painel de criação e listagem de grupos de estudo.
 *
 * @returns UI de grupos.
 */
export function StudyGroupsPanel() {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [title, setTitle] = useState("");
    const [disciplineName, setDisciplineName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setGroups(await listStudyGroups());
    }

    useEffect(() => {
        refresh()
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar."),
            )
            .finally(() => setLoading(false));
    }, []);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSaving(true);
        try {
            await createStudyGroup({
                title,
                disciplineName: disciplineName || undefined,
                description,
            });
            setTitle("");
            setDisciplineName("");
            setDescription("");
            await refresh();
            setCreateOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar grupo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Surface as="section" className="space-y-4">
            <SectionHeader action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => { setError(null); setCreateOpen(true); }} type="button">Criar grupo</button>} description="Escolhe um grupo para abrir mensagens, sessões e IA coletiva." title="Grupos de estudo" />
            {error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar grupos...</InlineNotice> : null}
            {!loading && !error && groups.length === 0 ? <EmptyState description="Cria um grupo para começar a colaborar com outros alunos." icon="users" title="Ainda não tens grupos" /> : null}
            <div className="grid gap-2">
                {groups.map((group) => (
                    <a className="sf-list-card block text-sm" href={`/app/comunidade?grupo=${encodeURIComponent(group._id)}`} key={group._id}>
                        <strong className="break-words">{group.title}</strong>
                        <span className="block text-studyflow-text/70">{group.memberIds.length} membros</span>
                    </a>
                ))}
            </div>
            <SidePanel closeDisabled={saving} description="Define o nome e o contexto do novo grupo de estudo." onClose={() => setCreateOpen(false)} open={createOpen} title="Criar grupo">
                <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    {error ? <p className="sf-error" role="alert">{error}</p> : null}
                    <FormField id="study-group-title" label="Nome">
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </FormField>
                    <FormField id="study-group-discipline" label="Disciplina">
                        <input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} />
                    </FormField>
                    <FormField id="study-group-description" label="Descrição">
                        <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
                    </FormField>
                    <button className="sf-button-primary" disabled={saving || title.trim().length < 3}>
                        {saving ? "A criar..." : "Criar grupo"}
                    </button>
                </form>
            </SidePanel>
        </Surface>
    );
}
