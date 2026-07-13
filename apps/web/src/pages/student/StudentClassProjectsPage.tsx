/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { IconTooltip, ShellIcon } from "../../components/layout/shell-icons.js";
import { ClassWorkspaceHeader } from "../../components/student/ClassWorkspaceHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { listStudentClassProjects, updateStudentClassProjectProgress, type StudentClassProject } from "../../lib/apiClient.js";

const projectActionClass = "sf-icon-button group relative min-h-12 min-w-12 shrink-0";

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
    const [savingId, setSavingId] = useState<string | null>(null);

    async function updateProgress(project: StudentClassProject, status: StudentClassProject["myProgress"]): Promise<void> {
        setSavingId(project._id);
        setError(null);
        try {
            const updated = await updateStudentClassProjectProgress(project._id, status);
            setProjects((current) => current.map((item) => item._id === updated._id ? updated : item));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível atualizar o progresso.");
        } finally {
            setSavingId(null);
        }
    }

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
            <ClassWorkspaceHeader active="projects" classId={classId} />
            <AsyncStateBlock error={error ?? undefined} isEmpty={projects.length === 0} isLoading={loading} emptyMessage="Ainda não existem projectos publicados" onRetry={() => setReloadToken((value) => value + 1)}>
                <div aria-label="Projectos da turma" className="grid gap-3">
                {projects.map((project) => (
                    <article className="sf-list-card flex min-w-0 flex-col gap-2" key={project._id}>
                        <h2 className="font-semibold">{project.title}</h2>
                        <p className="text-sm text-studyflow-text">{project.brief}</p>
                        {project.subjectName ?? project.subjectNameSnapshot ? <p className="text-sm text-studyflow-text/70">Disciplina: {project.subjectName ?? project.subjectNameSnapshot}</p> : null}
                        {project.dueDate ? <p className="text-sm text-studyflow-text/70">Prazo: {new Date(project.dueDate).toLocaleDateString("pt-PT")}</p> : null}
                        <p className="text-sm font-medium">{project.myProgress === "COMPLETED" ? "Concluído" : project.myProgress === "IN_PROGRESS" ? "Em curso" : "Por iniciar"}</p>
                        {!project.readOnly ? (
                            <div aria-label={`Ações de ${project.title}`} className="mt-2 flex items-center justify-start gap-2 border-t border-studyflow-border/10 pt-3" role="group">
                                {project.myProgress === "NOT_STARTED" ? (
                                    <button aria-label="Marcar em curso" className={`${projectActionClass} disabled:cursor-wait disabled:opacity-50`} disabled={savingId === project._id} onClick={() => void updateProgress(project, "IN_PROGRESS")} type="button">
                                        <ShellIcon className="h-6 w-6" name="play" />
                                        <IconTooltip align="right" side="top">Marcar em curso</IconTooltip>
                                    </button>
                                ) : null}
                                {project.myProgress !== "COMPLETED" ? (
                                    <button aria-label="Concluir" className={`${projectActionClass} disabled:cursor-wait disabled:opacity-50`} disabled={savingId === project._id} onClick={() => void updateProgress(project, "COMPLETED")} type="button">
                                        <ShellIcon className="h-6 w-6" name="check" />
                                        <IconTooltip align="right" side="top">Concluir</IconTooltip>
                                    </button>
                                ) : (
                                    <button aria-label="Reabrir" className={`${projectActionClass} disabled:cursor-wait disabled:opacity-50`} disabled={savingId === project._id} onClick={() => void updateProgress(project, "IN_PROGRESS")} type="button">
                                        <ShellIcon className="h-6 w-6" name="history" />
                                        <IconTooltip align="right" side="top">Reabrir</IconTooltip>
                                    </button>
                                )}
                                <a aria-label="Criar plano IA" className={projectActionClass} href={`/app/projectos/${project._id}/plano-ia`}>
                                    <ShellIcon className="h-6 w-6" name="spark" />
                                    <IconTooltip align="right" side="top">Criar plano IA</IconTooltip>
                                </a>
                            </div>
                        ) : <p className="text-sm text-studyflow-text/65">Projeto disponível apenas para consulta histórica.</p>}
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
