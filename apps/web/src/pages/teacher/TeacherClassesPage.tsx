// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";
import {
    FieldErrors,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    PerformanceBudgetResult,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";

const TEACHER_CLASSES_MEASURE = "teacher-classes-page";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Gestão de turmas com validação por campo e medição de performance.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [classFieldErrors, setClassFieldErrors] = useState<FieldErrors<TeacherClassField>>({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<Record<string, FieldErrors<StudentEmailField>>>({});
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
    const [performanceResult, setPerformanceResult] =
        useState<PerformanceBudgetResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega as turmas visíveis para o professor autenticado.
     */
    async function refresh(): Promise<void> {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        let active = true;

        startPerformanceBudget(TEACHER_CLASSES_MEASURE);

        async function loadClasses(): Promise<void> {
            try {
                const nextClasses = await listTeacherClasses();
                if (!active) return;
                // A API filtra turmas por professor; a UI apenas apresenta o resultado autorizado.
                setClasses(nextClasses);
                setError(null);
            } catch (caught: unknown) {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
            } finally {
                if (!active) return;
                setPerformanceResult(finishPerformanceBudget(TEACHER_CLASSES_MEASURE));
                setLoading(false);
            }
        }

        void loadClasses();

        return () => {
            active = false;
        };
    }, []);

    /**
     * Cria turma depois de validar campos obrigatórios no browser.
     *
     * @param event Evento do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = requireFields<TeacherClassField>([
            { name: "name", label: "Nome", value: name },
            { name: "code", label: "Código", value: code },
            { name: "schoolYear", label: "Ano letivo", value: schoolYear },
        ]);
        setClassFieldErrors(nextErrors);

        if (hasFieldErrors(nextErrors)) {
            return;
        }

        setCreating(true);
        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            setSchoolYear("2025/2026");
            await refresh();
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setCreating(false);
        }
    }

    /**
     * Adiciona aluno a uma turma depois de validar o email escrito.
     *
     * @param classId Identificador da turma autorizada pelo backend.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: emails[classId] ?? "" },
        ]);
        setStudentFieldErrors((current) => ({ ...current, [classId]: nextErrors }));

        if (hasFieldErrors(nextErrors)) {
            return;
        }

        setAddingStudentId(classId);
        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar turmas...</p>;
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>

                {performanceResult?.exceeded ? (
                    <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                        {formatPerformanceBudgetMessage(performanceResult)}
                    </p>
                ) : null}

                {error ? <p className="sf-error" role="alert">{error}</p> : null}

                <FormField id="teacher-class-name" label="Nome" error={classFieldErrors.name}>
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </FormField>

                <FormField id="teacher-class-code" label="Código" error={classFieldErrors.code}>
                    <input value={code} onChange={(event) => setCode(event.target.value)} />
                </FormField>

                <FormField id="teacher-class-year" label="Ano letivo" error={classFieldErrors.schoolYear}>
                    <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} />
                </FormField>

                <button className="sf-button-primary" disabled={creating}>
                    {creating ? "A criar..." : "Criar turma"}
                </button>
            </form>

            <div className="grid gap-3">
                {classes.length === 0 ? (
                    <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
                ) : null}

                {classes.map((schoolClass) => {
                    const studentErrors = studentFieldErrors[schoolClass._id] ?? {};
                    const isAdding = addingStudentId === schoolClass._id;

                    return (
                        <article className="sf-panel space-y-3" key={schoolClass._id}>
                            <div>
                                <h2 className="font-semibold">{schoolClass.name}</h2>
                                <p className="text-sm text-slate-600">
                                    {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <FormField
                                    id={`student-email-${schoolClass._id}`}
                                    label="Email do aluno"
                                    error={studentErrors.studentEmail}
                                >
                                    <input
                                        value={emails[schoolClass._id] ?? ""}
                                        onChange={(event) =>
                                            setEmails((current) => ({
                                                ...current,
                                                [schoolClass._id]: event.target.value,
                                            }))
                                        }
                                    />
                                </FormField>

                                <button
                                    className="sf-button-secondary self-end"
                                    disabled={isAdding}
                                    onClick={() => void handleAddStudent(schoolClass._id)}
                                    type="button"
                                >
                                    {isAdding ? "A adicionar..." : "Adicionar aluno"}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}>Disciplinas</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/publicacoes`}>Publicações</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/salas-guiadas`}>Salas guiadas</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/projectos`}>Projectos</a>
                                <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>Progresso</a>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}