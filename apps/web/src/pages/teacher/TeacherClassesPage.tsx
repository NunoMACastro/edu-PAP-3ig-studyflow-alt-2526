// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    type SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de gestão de turmas oficiais do professor.
 *
 * @returns Interface para criar turmas, associar alunos e abrir áreas da turma.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Recarrega as turmas visíveis para o professor autenticado.
     */
    async function refreshClasses(): Promise<void> {
        const nextClasses = await listTeacherClasses();
        setClasses(nextClasses);
    }

    useEffect(() => {
        let isMounted = true;

        /**
         * Carrega dados iniciais sem guardar permissões no browser.
         */
        async function loadClasses(): Promise<void> {
            try {
                const nextClasses = await listTeacherClasses();

                if (isMounted) {
                    setClasses(nextClasses);
                    setError(null);
                }
            } catch (caught) {
                if (isMounted) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // A API decide se o utilizador é professor; a página apenas apresenta o resultado.
        void loadClasses();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Cria uma turma usando o contrato existente da API.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            setSuccessMessage("Turma criada com sucesso.");
            await refreshClasses();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        }
    }

    /**
     * Associa um aluno à turma indicada usando email.
     *
     * @param classId Identificador da turma escolhida pelo professor.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        setSuccessMessage(null);

        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            setSuccessMessage("Aluno associado à turma.");
            await refreshClasses();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao associar aluno.");
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Cria turmas, associa alunos e abre rapidamente disciplinas, publicações, salas guiadas, projetos e progresso."
                action={
                    <a className="sf-button-primary" href="#nova-turma">
                        Nova turma
                    </a>
                }
            />

            {error ? <p className="sf-error">{error}</p> : null}
            {successMessage ? <p className="sf-success">{successMessage}</p> : null}

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <form
                    id="nova-turma"
                    className="sf-panel space-y-4"
                    onSubmit={(event) => void handleCreate(event)}
                >
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Criar turma</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Usa um nome claro e um código curto para a turma.
                        </p>
                    </div>

                    <label className="block space-y-2">
                        <span>Nome</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            minLength={2}
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Código</span>
                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            required
                            minLength={2}
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Ano letivo</span>
                        <input
                            value={schoolYear}
                            onChange={(event) => setSchoolYear(event.target.value)}
                            required
                        />
                    </label>

                    {/* A validação visual ajuda o professor, mas a validação final continua no backend. */}
                    <button
                        className="sf-button-primary w-full"
                        disabled={name.trim().length < 2 || code.trim().length < 2}
                        type="submit"
                    >
                        Criar turma
                    </button>
                </form>

                <div className="space-y-3">
                    {loading ? <p className="sf-panel text-sm text-slate-600">A carregar turmas...</p> : null}

                    {!loading && classes.length === 0 ? (
                        <p className="sf-panel text-sm text-slate-600">
                            Ainda não tens turmas. Cria a primeira turma para associares alunos e disciplinas.
                        </p>
                    ) : null}

                    {classes.map((schoolClass) => (
                        <article className="sf-panel space-y-4" key={schoolClass._id}>
                            <div>
                                <h2 className="font-semibold text-slate-950">{schoolClass.name}</h2>
                                <p className="text-sm text-slate-600">
                                    {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <label className="block space-y-2">
                                    <span>Email do aluno</span>
                                    <input
                                        value={emails[schoolClass._id] ?? ""}
                                        onChange={(event) =>
                                            setEmails((current) => ({
                                                ...current,
                                                [schoolClass._id]: event.target.value,
                                            }))
                                        }
                                        placeholder="aluno@example.test"
                                        type="email"
                                    />
                                </label>
                                {/* O classId identifica a turma pedida; o backend confirma se o professor pode alterá-la. */}
                                <button
                                    className="sf-button-secondary self-end"
                                    onClick={() => void handleAddStudent(schoolClass._id)}
                                    type="button"
                                >
                                    Associar aluno
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
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
                                    Projetos
                                </a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                                    Progresso
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}