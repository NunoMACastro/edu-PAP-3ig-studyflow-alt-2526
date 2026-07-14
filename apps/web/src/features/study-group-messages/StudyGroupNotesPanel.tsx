/** Painel REST exclusivo para notas persistentes do grupo de estudo. */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    createStudyGroupMessage,
    listStudyGroupMessages,
    type StudyGroupMessage,
} from "./create-study-group-message.js";

/** Cria e lista apenas `NOTE`; não instancia qualquer socket. */
export function StudyGroupNotesPanel({ groupId }: { groupId: string }) {
    const [text, setText] = useState("");
    const [notes, setNotes] = useState<StudyGroupMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            setNotes(await listStudyGroupMessages(groupId, "NOTE"));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar notas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void refresh(); }, [groupId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const cleanText = text.trim();
        if (!cleanText || saving) return;
        setSaving(true);
        setError(null);
        try {
            await createStudyGroupMessage(groupId, { kind: "NOTE", text: cleanText });
            setText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar a nota.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Surface as="section" className="space-y-4">
            <SectionHeader description="Notas persistentes do grupo, separadas da conversa em tempo real." title="Notas" />
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <FormField id={`study-group-note-${groupId}`} label="Nova nota">
                    <textarea maxLength={4000} onChange={(event) => setText(event.target.value)} rows={4} value={text} />
                </FormField>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-studyflow-text">{text.length}/4000</span>
                    <button className="sf-button-primary" disabled={saving || !text.trim()}>{saving ? "A guardar..." : "Guardar nota"}</button>
                </div>
            </form>
            {loading ? <InlineNotice>A carregar notas...</InlineNotice> : null}
            {!loading && notes.length === 0 ? <EmptyState description="As notas criadas pelo grupo aparecerão aqui." icon="message" title="Ainda não há notas" /> : null}
            <div className="grid gap-3">
                {notes.map((note) => (
                    <article className="sf-surface-subtle text-sm" key={note._id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong>{note.tombstoned ? "Conta removida" : note.authorDisplayName ?? "Aluno"}</strong>
                            {note.createdAt ? <time className="text-xs text-studyflow-text">{new Date(note.createdAt).toLocaleString("pt-PT")}</time> : null}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-studyflow-text">{note.tombstoned ? "Conteúdo removido." : note.text}</p>
                    </article>
                ))}
            </div>
        </Surface>
    );
}
