/**
 * Implementa a funcionalidade frontend de grupos de estudo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
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
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar grupo.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Grupos de estudo</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Nome
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Disciplina
                    <input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} />
                </label>
                <label className="block">
                    Descrição
                    <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={title.trim().length < 3}>
                    Criar grupo
                </button>
            </form>
            {loading ? <p className="text-sm text-studyflow-text">A carregar grupos...</p> : null}
            {!loading && groups.length === 0 ? (
                <p className="text-sm text-studyflow-text">Ainda não tens grupos.</p>
            ) : null}
            <div className="grid gap-2">
                {groups.map((group) => (
                    <a className="rounded-md border border-studyflow-border p-3 text-sm" href={`/app/comunidade?grupo=${encodeURIComponent(group._id)}`} key={group._id}>
                        <strong>{group.title}</strong>
                        <span className="block text-studyflow-text">{group.memberIds.length} membros</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
