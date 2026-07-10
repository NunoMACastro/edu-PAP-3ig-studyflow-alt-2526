/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { ClassProject, listStudentClassProjects } from "../../lib/apiClient.js";

/**
 * Página do aluno para projectos publicados da turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassProjectsPage({ classId }: { classId: string }) {
    const [projects, setProjects] = useState<ClassProject[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudentClassProjects(classId)
            .then(setProjects)
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar projectos."),
            );
    }, [classId]);

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Projectos da turma</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="grid gap-3">
                {projects.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Ainda não existem projectos publicados.</p> : null}
                {projects.map((project) => (
                    <article className="sf-panel space-y-2" key={project._id}>
                        <h2 className="font-semibold">{project.title}</h2>
                        <p className="text-sm text-studyflow-text">{project.brief}</p>
                        <a className="sf-button-secondary inline-flex" href={`/app/projectos/${project._id}/plano-ia`}>
                            Criar plano IA
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}
