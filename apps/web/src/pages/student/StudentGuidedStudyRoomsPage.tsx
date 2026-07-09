/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import {
    GuidedStudyRoom,
    listStudentGuidedStudyRooms,
    listStudentSubjects,
    Subject,
} from "../../lib/apiClient.js";

/**
 * Página do aluno para consultar salas guiadas da turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentGuidedStudyRoomsPage({ classId }: { classId: string }) {
    const [rooms, setRooms] = useState<GuidedStudyRoom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            listStudentGuidedStudyRooms(classId),
            listStudentSubjects(classId),
        ])
            .then(([nextRooms, nextSubjects]) => {
                setRooms(nextRooms);
                setSubjects(nextSubjects);
            })
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar salas guiadas."),
            );
    }, [classId]);

    const subjectsById = new Map(subjects.map((subject) => [subject._id, subject]));

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Salas guiadas</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="grid gap-3">
                {rooms.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Não há salas guiadas abertas.</p> : null}
                {rooms.map((room) => (
                    <article className="sf-panel" key={room._id}>
                        <h2 className="font-semibold">{room.title}</h2>
                        <p className="text-sm text-studyflow-text">{room.description}</p>
                        {room.subjectId ? (
                            <p className="mt-2 text-sm text-studyflow-text">
                                Disciplina: {subjectsById.get(room.subjectId)?.name ?? "Disciplina"}
                            </p>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
