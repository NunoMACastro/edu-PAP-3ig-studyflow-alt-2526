/** Gestão docente do lifecycle rascunho → publicação de projetos de turma. */
import { type FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import {
    type ClassProject,
    createClassProject,
    listSubjects,
    listTeacherClassProjects,
    publishClassProject,
    type Subject,
    updateClassProject,
} from "../../lib/apiClient.js";

export function TeacherClassProjectsPage({ classId }: { classId: string }) {
    const [projects, setProjects] = useState<ClassProject[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [editing, setEditing] = useState<ClassProject | null>(null);
    const [title, setTitle] = useState("");
    const [brief, setBrief] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const action = useAsyncAction();
    const [panelOpen, setPanelOpen] = useState(false);
    useHashSidePanel("#criar-projecto", setPanelOpen);

    async function refresh(): Promise<void> {
        const [nextProjects, nextSubjects] = await Promise.all([
            listTeacherClassProjects(classId),
            listSubjects(classId),
        ]);
        setProjects(nextProjects);
        setSubjects(nextSubjects.filter((subject) => subject.status === "ACTIVE"));
    }

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        Promise.all([listTeacherClassProjects(classId), listSubjects(classId)])
            .then(([nextProjects, nextSubjects]) => {
                if (!active) return;
                setProjects(nextProjects);
                setSubjects(nextSubjects.filter((subject) => subject.status === "ACTIVE"));
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar projectos.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId]);

    function openCreate(): void {
        setEditing(null);
        setTitle("");
        setBrief("");
        setSubjectId("");
        setDueDate("");
        setPanelOpen(true);
    }

    function openEdit(project: ClassProject): void {
        setEditing(project);
        setTitle(project.title);
        setBrief(project.brief);
        setSubjectId(project.subjectId ?? "");
        setDueDate(project.dueDate?.slice(0, 10) ?? "");
        setPanelOpen(true);
    }

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        await action.run(editing ? `edit-${editing._id}` : "create-project", async () => {
            if (editing) {
                await updateClassProject(classId, editing._id, {
                    title: title.trim(),
                    brief: brief.trim(),
                    subjectId: subjectId || null,
                    dueDate: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null,
                });
            } else {
                await createClassProject(classId, {
                    title: title.trim(),
                    brief: brief.trim(),
                    subjectId: subjectId || undefined,
                    dueDate: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : undefined,
                });
            }
            await refresh();
            setPanelOpen(false);
        }, editing ? "Erro ao editar projecto." : "Erro ao criar projecto.");
    }

    async function publish(project: ClassProject): Promise<void> {
        await action.run(`publish-${project._id}`, async () => {
            await publishClassProject(classId, project._id);
            await refresh();
        }, "Não foi possível publicar o projecto.");
    }

    return (
        <section className="space-y-6">
            <PageHeader action={<button aria-expanded={panelOpen} className="sf-button-primary" onClick={openCreate} type="button">Novo projecto</button>} description="Prepara rascunhos e publica-os quando estiverem prontos para os alunos." title="Projectos da turma" />
            {action.error ? <p className="sf-error" role="alert">{action.error}</p> : null}
            <AsyncStateBlock error={error ?? undefined} isEmpty={projects.length === 0} isLoading={loading} emptyMessage="Ainda não existem projectos">
                <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((project) => (
                        <article className="sf-list-card space-y-3" key={project._id}>
                            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{project.title}</h2><StatusBadge tone={project.status === "PUBLISHED" ? "brand" : "neutral"}>{project.status === "DRAFT" ? "Rascunho" : "Publicado"}</StatusBadge></div>
                            <p className="text-sm text-studyflow-text/75">{project.brief}</p>
                            {project.subjectName ?? project.subjectNameSnapshot ? <p className="text-sm">Disciplina: {project.subjectName ?? project.subjectNameSnapshot}</p> : null}
                            {project.dueDate ? <p className="text-sm">Prazo: {new Date(project.dueDate).toLocaleDateString("pt-PT")}</p> : null}
                            {project.status === "DRAFT" ? <div className="flex gap-2"><button className="sf-button-secondary" onClick={() => openEdit(project)} type="button">Editar</button><button className="sf-button-primary" disabled={action.isPending} onClick={() => void publish(project)} type="button">{action.pendingKey === `publish-${project._id}` ? "A publicar..." : "Publicar"}</button></div> : null}
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
            <SidePanel closeDisabled={action.isPending} description={editing ? "Apenas rascunhos podem ser alterados." : "Os novos projetos começam sempre como rascunho."} onClose={() => setPanelOpen(false)} open={panelOpen} title={editing ? "Editar projecto" : "Criar projecto"}>
                <form className="space-y-4" id="criar-projecto" onSubmit={(event) => void handleSubmit(event)}>
                    <label className="block">Título<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                    <label className="block">Enunciado<textarea value={brief} onChange={(event) => setBrief(event.target.value)} /></label>
                    <label className="block">Disciplina oficial (opcional)<select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">Sem disciplina específica</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label>
                    <label className="block">Prazo (opcional)<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
                    <button className="sf-button-primary" disabled={action.isPending || title.trim().length < 3 || brief.trim().length < 20}>{action.isPending ? "A guardar..." : editing ? "Guardar alterações" : "Criar rascunho"}</button>
                </form>
            </SidePanel>
        </section>
    );
}
