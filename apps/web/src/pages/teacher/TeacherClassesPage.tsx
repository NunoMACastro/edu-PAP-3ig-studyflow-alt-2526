/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import {
    type FieldErrors,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [classFieldErrors, setClassFieldErrors] = useState<
        FieldErrors<TeacherClassField>
    >({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<
        Record<string, FieldErrors<StudentEmailField>>
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

    /**
     * Carrega as turmas iniciais respeitando unmounts durante a chamada assíncrona.
     *
     * @param active Função que indica se o componente ainda pode receber estado.
     * @returns Promise resolvida depois de carregar ou falhar de forma controlada.
     */
    async function loadInitialClasses(active: () => boolean): Promise<void> {
        const measurement = startPerformanceBudget("teacher-classes-dashboard");
        setIsLoading(true);
        setError(null);
        setPerformanceWarning(null);
        try {
            const nextClasses = await listTeacherClasses();
            if (active()) setClasses(nextClasses);
        } catch (caught) {
            if (active()) {
                setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
            }
        } finally {
            if (active()) {
                const result = finishPerformanceBudget(measurement);
                setPerformanceWarning(
                    result.exceeded
                        ? formatPerformanceBudgetMessage(result)
                        : null,
                );
                setIsLoading(false);
            }
        }
    }

    /**
     * Recarrega dados depois de mutações, sem duplicar mensagens de sucesso.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refreshAfterMutation(): Promise<void> {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        let active = true;
        void loadInitialClasses(() => active);
        return () => {
            active = false;
        };
    }, []);

    /**
     * Remove uma mensagem de validação quando o professor começa a corrigir o campo.
     *
     * @param field Campo do formulário de criação de turma.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearClassFieldError(field: TeacherClassField): void {
        setClassFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Remove o erro do email de aluno dentro da turma indicada.
     *
     * @param classId Turma onde o professor está a escrever.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearStudentFieldError(classId: string): void {
        setStudentFieldErrors((current) => ({
            ...current,
            [classId]: {},
        }));
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     * @returns Promise resolvida depois de criar ou reportar erro.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const nextErrors = requireFields<TeacherClassField>([
            { name: "name", label: "Nome", value: name },
            { name: "code", label: "Código", value: code },
            { name: "schoolYear", label: "Ano letivo", value: schoolYear },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // A API continua a ser a barreira de segurança; este return evita um pedido vazio.
            setClassFieldErrors(nextErrors);
            return;
        }

        setClassFieldErrors({});
        setIsCreating(true);
        try {
            // O backend valida o professor autenticado; a UI nao envia teacherId.
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refreshAfterMutation();
            setSuccessMessage("Turma criada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setIsCreating(false);
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param classId Identificador usado para limitar a operação a turma.
     * @returns Promise resolvida depois de associar aluno ou reportar erro.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        setSuccessMessage(null);
        const email = emails[classId] ?? "";

        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: email },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // Evita a chamada vazia; ownership e permissões continuam no backend.
            setStudentFieldErrors((current) => ({
                ...current,
                [classId]: nextErrors,
            }));
            return;
        }

        setStudentFieldErrors((current) => ({ ...current, [classId]: {} }));
        setAddingStudentId(classId);
        try {
            await addClassStudent(classId, email.trim());
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refreshAfterMutation();
            setSuccessMessage("Aluno adicionado à turma.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    const createClassForm = (
        <form
            className="sf-panel space-y-4"
            noValidate
            onSubmit={(event) => void handleCreate(event)}
        >
            <h2 className="text-lg font-bold">Criar turma</h2>
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {successMessage ? (
                <p className="sf-success" role="status">{successMessage}</p>
            ) : null}

            <FormField
                helpText="Nome visivel da turma para alunos e professor."
                id="teacherClassName"
                label="Nome"
                error={classFieldErrors.name}
            >
                <input
                    disabled={isCreating}
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        clearClassFieldError("name");
                    }}
                />
            </FormField>

            <FormField
                helpText="Codigo curto usado para identificar a turma."
                id="teacherClassCode"
                label="Código"
                error={classFieldErrors.code}
            >
                <input
                    disabled={isCreating}
                    value={code}
                    onChange={(event) => {
                        setCode(event.target.value);
                        clearClassFieldError("code");
                    }}
                />
            </FormField>

            <FormField
                helpText="Formato esperado: 2025/2026."
                id="teacherClassSchoolYear"
                label="Ano letivo"
                error={classFieldErrors.schoolYear}
            >
                <input
                    disabled={isCreating}
                    value={schoolYear}
                    onChange={(event) => {
                        setSchoolYear(event.target.value);
                        clearClassFieldError("schoolYear");
                    }}
                />
            </FormField>

            <button
                className="sf-button-primary"
                disabled={isCreating}
                type="submit"
            >
                {isCreating ? "A criar..." : "Criar turma"}
            </button>
        </form>
    );

    const classesList = (
        <section className="min-w-0 space-y-3">
            {isLoading ? (
                <p className="sf-panel text-sm text-studyflow-text">A carregar turmas...</p>
            ) : null}
            {performanceWarning ? (
                <p className="sf-panel text-sm text-studyflow-alert" role="status">
                    {performanceWarning}
                </p>
            ) : null}
            {!isLoading && classes.length === 0 ? (
                <p className="sf-panel text-sm text-studyflow-text">Ainda não tens turmas.</p>
            ) : null}

            {classes.map((schoolClass) => (
                <article className="sf-panel min-w-0 space-y-3" key={schoolClass._id}>
                    <div>
                        <h2 className="break-words font-semibold">{schoolClass.name}</h2>
                        <p className="text-sm text-studyflow-text">
                            {schoolClass.code} · {schoolClass.schoolYear} ·{" "}
                            {schoolClass.studentIds.length} alunos
                        </p>
                    </div>
                    <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
                        <FormField
                            helpText="Usa o email da conta StudyFlow do aluno."
                            id={`studentEmail-${schoolClass._id}`}
                            label={`Email do aluno para ${schoolClass.name}`}
                            error={studentFieldErrors[schoolClass._id]?.studentEmail}
                        >
                            <input
                                type="email"
                                value={emails[schoolClass._id] ?? ""}
                                onChange={(event) => {
                                    setEmails((current) => ({
                                        ...current,
                                        [schoolClass._id]: event.target.value,
                                    }));
                                    clearStudentFieldError(schoolClass._id);
                                }}
                            />
                        </FormField>
                        <button
                            className="sf-button-secondary self-end"
                            disabled={addingStudentId === schoolClass._id}
                            onClick={() => void handleAddStudent(schoolClass._id)}
                            type="button"
                        >
                            {addingStudentId === schoolClass._id
                                ? "A adicionar..."
                                : "Adicionar aluno"}
                        </button>
                    </div>
                    <div className="flex min-w-0 flex-wrap gap-2">
                        {/* A navegacao usa rotas existentes; permissoes continuam nos endpoints. */}
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}
                        >
                            Disciplinas
                        </a>
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/voz`}
                        >
                            Voz IA
                        </a>
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/publicacoes`}
                        >
                            Publicações
                        </a>
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/salas-guiadas`}
                        >
                            Salas guiadas
                        </a>
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/projectos`}
                        >
                            Projectos
                        </a>
                        <a
                            className="sf-button-secondary"
                            href={`/app/professor/turmas/${schoolClass._id}/progresso`}
                        >
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
                description="Gestão docente de turmas, alunos inscritos e atalhos para disciplinas, publicações e progresso."
            />

            <ResponsivePageFrame
                aside={createClassForm}
                asideLabel="Criar turma"
                main={classesList}
            />
        </section>
    );
}
