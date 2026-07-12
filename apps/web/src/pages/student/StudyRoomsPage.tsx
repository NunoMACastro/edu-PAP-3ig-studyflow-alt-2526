/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useRef, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState, InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import { createStudyRoom, listStudyRooms, StudyRoom } from "../../lib/apiClient.js";

/**
 * Página de salas de estudo do aluno.
 *
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [type, setType] = useState<"FREE" | "SUBJECT">("FREE");
    const [name, setName] = useState("");
    const [disciplineName, setDisciplineName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useHashSidePanel("#criar-sala", setCreateOpen);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setRooms(await listStudyRooms());
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar salas."),
        ).finally(() => setLoading(false));
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
        setIsSaving(true);
        try {
            await createStudyRoom({
                name,
                type,
                disciplineName: type === "SUBJECT" ? disciplineName : undefined,
                description,
            });
            setName("");
            setDisciplineName("");
            setDescription("");
            await refresh();
            setCreateOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Nova sala</button>}
                description="Espaços autónomos criados por alunos. Não estão ligados às turmas, disciplinas ou regras IA dos professores."
                title="Salas de estudo"
            />
            {loading ? <p className="sf-notice">A carregar salas...</p> : null}
            {!loading && error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error && rooms.length === 0 ? (
                <EmptyState action={<button className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Criar sala</button>} icon="users" title="Ainda não tens salas" />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                    <article className="sf-list-card space-y-4" key={room._id}>
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-lg font-semibold">{room.name}</h2>
                                <StatusBadge>{room.memberIds.length} membros</StatusBadge>
                            </div>
                            <p className="mt-2 text-sm text-studyflow-text/65">{room.type === "SUBJECT" ? `Disciplina personalizada: ${room.disciplineName}` : "Sala livre"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-secondary" href={`/app/salas/${room._id}`}>Partilhas</a>
                            <a className="sf-button-secondary" href={`/app/salas/${room._id}/ia`}>IA da sala</a>
                        </div>
                    </article>
                ))}
            </div>
            <SidePanel
                closeDisabled={isSaving}
                description="Escolhe o contexto e identifica a nova sala de estudo."
                initialFocusRef={nameInputRef}
                onClose={() => setCreateOpen(false)}
                open={createOpen}
                title="Criar sala"
            >
            <form className="space-y-4" id="criar-sala" onSubmit={(event) => void handleSubmit(event)}>
                {error ? <p className="sf-error" role="alert">{error}</p> : null}
                <FormField id="study-room-name" label="Nome">
                    <input ref={nameInputRef} value={name} onChange={(event) => setName(event.target.value)} />
                </FormField>
                <FormField id="study-room-type" label="Tipo">
                    <select value={type} onChange={(event) => setType(event.target.value as "FREE" | "SUBJECT")}>
                        <option value="FREE">Livre</option>
                        <option value="SUBJECT">Disciplina personalizada</option>
                    </select>
                </FormField>
                {type === "SUBJECT" ? (
                    <FormField id="study-room-discipline" label="Disciplina personalizada" helpText="É apenas uma etiqueta desta sala; não fica ligada a uma disciplina oficial.">
                        <input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} />
                    </FormField>
                ) : null}
                <FormField id="study-room-description" label="Descrição">
                    <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
                </FormField>
                <button className="sf-button-primary" disabled={name.trim().length < 2 || isSaving}>
                    {isSaving ? "A criar..." : "Criar sala"}
                </button>
            </form>
            </SidePanel>
        </section>
    );
}
