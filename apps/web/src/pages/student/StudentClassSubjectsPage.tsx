/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { listStudentSubjects, Subject } from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudentClassSubjectsPageProps = {
    classId: string;
};

/**
 * Página de disciplinas disponíveis para o aluno numa turma onde está inscrito.
 */
export function StudentClassSubjectsPage({ classId }: StudentClassSubjectsPageProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudentSubjects(classId)
            .then(setSubjects)
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar disciplinas."),
            );
    }, [classId]);

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-bold">Disciplinas da turma</h1>
                {error ? <p className="sf-error mt-3">{error}</p> : null}
            </div>
            <div className="grid gap-3">
                {subjects.length === 0 ? <p className="sf-panel text-sm text-slate-600">Esta turma ainda não tem disciplinas.</p> : null}
                {subjects.map((subject) => (
                    <article className="sf-panel space-y-2" key={subject._id}>
                        <h2 className="font-semibold">{subject.name}</h2>
                        <p className="text-sm text-slate-600">{subject.code}</p>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/ia`}>Abrir IA da disciplina</a>
                            <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/contextos-materiais`}>Contexts</a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
