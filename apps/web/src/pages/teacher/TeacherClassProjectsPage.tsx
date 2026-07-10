/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    ClassProject,
    createClassProject,
    listTeacherClassProjects,
} from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

/**
 * Página docente de projectos da turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherClassProjectsPage({ classId }: { classId: string }) {
    const [projects, setProjects] = useState<ClassProject[]>([]);
    const [title, setTitle] = useState("");
    const [brief, setBrief] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [error, setError] = useState<string | null>(null);
    const createAction = useAsyncAction();

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setProjects(await listTeacherClassProjects(classId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar projectos."),
        );
    }, [classId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        await createAction.run("create-project", async () => {
            await createClassProject(classId, { title, brief, status });
            setTitle("");
            setBrief("");
            await refresh();
        }, "Erro ao criar projecto.");
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form className="sf-panel space-y-4" id="criar-projecto" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Projectos da turma</h1>
                {error || createAction.error ? <p className="sf-error" role="alert">{createAction.error ?? error}</p> : null}
                <label className="block">
                    Título
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Enunciado
                    <textarea value={brief} onChange={(event) => setBrief(event.target.value)} />
                </label>
                <label className="block">
                    Estado
                    <select value={status} onChange={(event) => setStatus(event.target.value as "DRAFT" | "PUBLISHED")}>
                        <option value="DRAFT">Rascunho</option>
                        <option value="PUBLISHED">Publicado</option>
                    </select>
                </label>
                <button className="sf-button-primary" disabled={createAction.isPending || title.trim().length < 3 || brief.trim().length < 20}>
                    {createAction.isPending ? "A criar..." : "Criar projecto"}
                </button>
            </form>
            <div className="grid gap-3">
                {projects.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Ainda não existem projectos.</p> : null}
                {projects.map((project) => (
                    <article className="sf-panel" key={project._id}>
                        <h2 className="font-semibold">{project.title}</h2>
                        <p className="text-sm text-studyflow-text">{project.brief}</p>
                        <p className="mt-2 text-xs uppercase text-studyflow-text">{project.status === "DRAFT" ? "Rascunho" : "Publicado"}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
