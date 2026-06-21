// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Gestão responsiva de turmas, alunos e atalhos docentes.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    /**
     * Recarrega as turmas do professor autenticado.
     *
     * @returns Promise resolvida depois de atualizar a lista.
     */
    async function refresh(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            // A API só devolve turmas que o professor autenticado pode gerir.
            setClasses(await listTeacherClasses());
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    /**
     * Cria uma turma oficial para o professor autenticado.
     *
     * @param event Evento de submissão do formulário.
     * @returns Promise resolvida depois de criar e recarregar.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setIsCreating(true);
        try {
            // O backend valida o professor e impede criar turmas em nome de outro utilizador.
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setIsCreating(false);
        }
    }

    /**
     * Adiciona um aluno a uma turma do professor autenticado.
     *
     * @param classId Identificador da turma oficial.
     * @returns Promise resolvida depois de associar o aluno e recarregar.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        try {
            const email = emails[classId]?.trim() ?? "";
            if (email.length < 3) {
                throw new Error("Indica o email do aluno.");
            }

            await addClassStudent(classId, email);
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        }
    }

    const createClassForm = (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
            <h2 className="text-lg font-bold">Nova turma</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <label className="block" htmlFor="className">
                Nome
                <input id="className" value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <label className="block" htmlFor="classCode">
                Código
                <input id="classCode" value={code} onChange={(event) => setCode(event.target.value)} />
            </label>

            <label className="block" htmlFor="classSchoolYear">
                Ano letivo
                <input
                    id="classSchoolYear"
                    value={schoolYear}
                    onChange={(event) => setSchoolYear(event.target.value)}
                />
            </label>

            <button
                className="sf-button-primary"
                disabled={isCreating || name.trim().length < 2 || code.trim().length < 2}
                type="submit"
            >
                {isCreating ? "A criar..." : "Criar turma"}
            </button>
        </form>
    );

    const classesList = (
        <section className="min-w-0 space-y-3">
            {isLoading ? <p className="sf-panel text-sm text-slate-600">A carregar turmas...</p> : null}
            {!isLoading && classes.length === 0 ? (
                <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
            ) : null}

            {classes.map((schoolClass) => (
                <article className="sf-panel min-w-0 space-y-3" key={schoolClass._id}>
                    <div>
                        <h2 className="break-words font-semibold">{schoolClass.name}</h2>
                        <p className="text-sm text-slate-600">
                            {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                        </p>
                    </div>

                    <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                            aria-label={`Email do aluno para ${schoolClass.name}`}
                            value={emails[schoolClass._id] ?? ""}
                            onChange={(event) =>
                                setEmails((current) => ({
                                    ...current,
                                    [schoolClass._id]: event.target.value,
                                }))
                            }
                            placeholder="email do aluno"
                        />
                        <button
                            className="sf-button-secondary"
                            onClick={() => void handleAddStudent(schoolClass._id)}
                            type="button"
                        >
                            Adicionar aluno
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-wrap gap-2">
                        {/* Estes links mantêm a navegação docente existente sem criar novas regras de permissão. */}
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}>
                            Disciplinas
                        </a>
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/publicacoes`}>
                            Publicações
                        </a>
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/salas-guiadas`}>
                            Salas guiadas
                        </a>
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/projectos`}>
                            Projectos
                        </a>
                        <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                            Progresso
                        </a>
                    </div>
                </article>
            ))}
        </section>
    );

    return (
        <section className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Cria turmas, associa alunos e entra nos módulos docentes sem perder contexto."
            />

            <ResponsivePageFrame
                aside={createClassForm}
                asideLabel="Criar turma"
                main={classesList}
            />
        </section>
    );
}