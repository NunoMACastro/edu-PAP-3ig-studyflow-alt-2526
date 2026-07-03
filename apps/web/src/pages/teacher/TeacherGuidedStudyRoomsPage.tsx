/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    createGuidedStudyRoom,
    GuidedStudyRoom,
    listSubjects,
    listTeacherGuidedStudyRooms,
    Subject,
} from "../../lib/apiClient.js";

/**
 * Página docente de salas de estudo guiado.
 */
export function TeacherGuidedStudyRoomsPage({ classId }: { classId: string }) {
    const [rooms, setRooms] = useState<GuidedStudyRoom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        const [nextRooms, nextSubjects] = await Promise.all([
            listTeacherGuidedStudyRooms(classId),
            listSubjects(classId),
        ]);
        setRooms(nextRooms);
        setSubjects(nextSubjects);
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar salas guiadas."),
        );
    }, [classId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createGuidedStudyRoom(classId, {
                title,
                description,
                ...(subjectId ? { subjectId } : {}),
            });
            setTitle("");
            setDescription("");
            setSubjectId("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar sala guiada.");
        }
    }

    const subjectsById = new Map(subjects.map((subject) => [subject._id, subject]));

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Salas guiadas</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">
                    Título
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Descrição
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <label className="block">
                    Disciplina
                    <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                        <option value="">Sem disciplina específica</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button className="sf-button-primary" disabled={title.trim().length < 3 || description.trim().length < 5}>
                    Criar sala
                </button>
            </form>
            <div className="grid gap-3">
                {rooms.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não existem salas guiadas.</p> : null}
                {rooms.map((room) => (
                    <article className="sf-panel" key={room._id}>
                        <h2 className="font-semibold">{room.title}</h2>
                        <p className="text-sm text-slate-600">{room.description}</p>
                        <p className="mt-2 text-sm text-slate-600">
                            {room.subjectId
                                ? `Disciplina: ${subjectsById.get(room.subjectId)?.name ?? "Disciplina"}`
                                : "Sem disciplina específica"}
                        </p>
                        <p className="text-xs uppercase text-slate-500">
                            Voz: {room.subjectId ? "disciplina" : "turma"}
                        </p>
                        <p className="mt-2 text-xs uppercase text-slate-500">{room.status}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
