/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { listStudentClasses, SchoolClass } from "../../lib/apiClient.js";

/**
 * Página de turmas onde o aluno está inscrito.
 */
export function StudentClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudentClasses()
            .then(setClasses)
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas."),
            );
    }, []);

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-bold">As minhas turmas</h1>
                {error ? <p className="sf-error mt-3">{error}</p> : null}
            </div>
            <div className="grid gap-3">
                {classes.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não estás inscrito em turmas.</p> : null}
                {classes.map((schoolClass) => (
                    <article className="sf-panel space-y-2" key={schoolClass._id}>
                        <h2 className="font-semibold">{schoolClass.name}</h2>
                        <p className="text-sm text-slate-600">{schoolClass.code} · {schoolClass.schoolYear}</p>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/disciplinas`}>Ver disciplinas</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/publicacoes`}>Ver publicações</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/salas-guiadas`}>Salas guiadas</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/projectos`}>Projectos</a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
