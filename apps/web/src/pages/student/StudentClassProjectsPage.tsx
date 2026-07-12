/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { listStudentClassProjects, StudentClassProject } from "../../lib/apiClient.js";

/**
 * Página do aluno para projectos publicados da turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassProjectsPage({ classId }: { classId: string }) {
    const [projects, setProjects] = useState<StudentClassProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentClassProjects(classId)
            .then((nextProjects) => {
                if (active) setProjects(nextProjects);
            })
            .catch((caught: unknown) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar projectos.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, reloadToken]);

    return (
        <section className="space-y-6">
            <PageHeader description="Projetos publicados pelo professor e disponíveis para preparação com IA." title="Projectos da turma" />
            <AsyncStateBlock error={error ?? undefined} isEmpty={projects.length === 0} isLoading={loading} emptyMessage="Ainda não existem projectos publicados" onRetry={() => setReloadToken((value) => value + 1)}>
                <div aria-label="Projectos da turma" className="grid gap-3">
                {projects.map((project) => (
                    <article className="sf-list-card space-y-2" key={project._id}>
                        <h2 className="font-semibold">{project.title}</h2>
                        <p className="text-sm text-studyflow-text">{project.brief}</p>
                        {project.subjectName ?? project.subjectNameSnapshot ? <p className="text-sm text-studyflow-text/70">Disciplina: {project.subjectName ?? project.subjectNameSnapshot}</p> : null}
                        {project.dueDate ? <p className="text-sm text-studyflow-text/70">Prazo: {new Date(project.dueDate).toLocaleDateString("pt-PT")}</p> : null}
                        {!project.readOnly ? <a className="sf-button-secondary inline-flex" href={`/app/projectos/${project._id}/plano-ia`}>
                            Criar plano IA
                        </a> : <p className="text-sm text-studyflow-text/65">Projeto disponível apenas para consulta histórica.</p>}
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
