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

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Formulários com validação frontend antes dos pedidos HTTP.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [classFieldErrors, setClassFieldErrors] = useState<FieldErrors<TeacherClassField>>({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<Record<string, FieldErrors<StudentEmailField>>>({});
    const [creating, setCreating] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas."),
        );
    }, []);

    /**
     * Remove o erro de um campo quando o professor começa a corrigir esse valor.
     *
     * @param field Campo de criação de turma que mudou.
     */
    function clearClassFieldError(field: TeacherClassField): void {
        setClassFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Remove o erro do email dentro de uma turma específica.
     *
     * @param classId Turma onde o professor está a escrever.
     */
    function clearStudentFieldError(classId: string): void {
        setStudentFieldErrors((current) => ({
            ...current,
            [classId]: {},
        }));
    }

    /**
     * Valida e cria uma turma oficial.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = requireFields<TeacherClassField>([
            { name: "name", label: "Nome", value: name },
            { name: "code", label: "Código", value: code },
            { name: "schoolYear", label: "Ano letivo", value: schoolYear },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // Este return é a barreira de UX: sem campos válidos, não há pedido HTTP.
            setClassFieldErrors(nextErrors);
            return;
        }

        setClassFieldErrors({});
        setCreating(true);
        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setCreating(false);
        }
    }

    /**
     * Valida e adiciona um aluno a uma turma oficial.
     *
     * @param classId Identificador da turma gerida pelo professor autenticado.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        const email = emails[classId] ?? "";

        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: email },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // A API continua a validar permissões; aqui só evitamos uma submissão vazia.
            setStudentFieldErrors((current) => ({ ...current, [classId]: nextErrors }));
            return;
        }

        setStudentFieldErrors((current) => ({ ...current, [classId]: {} }));
        setAddingStudentId(classId);
        try {
            await addClassStudent(classId, email);
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>
                {error ? <p className="sf-error">{error}</p> : null}

                <FormField
                    id="teacherClassName"
                    label="Nome"
                    helpText="Nome visível da turma para alunos e professores."
                    error={classFieldErrors.name}
                >
                    <input value={name} onChange={(event) => {
                        setName(event.target.value);
                        clearClassFieldError("name");
                    }} />
                </FormField>

                <FormField
                    id="teacherClassCode"
                    label="Código"
                    helpText="Código curto usado para identificar a turma."
                    error={classFieldErrors.code}
                >
                    <input value={code} onChange={(event) => {
                        setCode(event.target.value);
                        clearClassFieldError("code");
                    }} />
                </FormField>

                <FormField
                    id="teacherClassSchoolYear"
                    label="Ano letivo"
                    helpText="Formato recomendado: 2025/2026."
                    error={classFieldErrors.schoolYear}
                >
                    <input value={schoolYear} onChange={(event) => {
                        setSchoolYear(event.target.value);
                        clearClassFieldError("schoolYear");
                    }} />
                </FormField>

                <button className="sf-button-primary" disabled={creating} type="submit">
                    {creating ? "A criar..." : "Criar turma"}
                </button>
            </form>

            <div className="grid gap-3">
                {classes.length === 0 ? (
                    <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p>
                ) : null}
                {classes.map((schoolClass) => (
                    <article className="sf-panel space-y-3" key={schoolClass._id}>
                        <div>
                            <h2 className="font-semibold">{schoolClass.name}</h2>
                            <p className="text-sm text-slate-600">
                                {schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos
                            </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <FormField
                                id={`studentEmail-${schoolClass._id}`}
                                label={`Email do aluno para ${schoolClass.name}`}
                                helpText="Usa o email da conta StudyFlow do aluno."
                                error={studentFieldErrors[schoolClass._id]?.studentEmail}
                            >
                                <input
                                    type="email"
                                    value={emails[schoolClass._id] ?? ""}
                                    onChange={(event) => {
                                        setEmails((current) => ({ ...current, [schoolClass._id]: event.target.value }));
                                        clearStudentFieldError(schoolClass._id);
                                    }}
                                />
                            </FormField>
                            <button
                                className="sf-button-secondary"
                                disabled={addingStudentId === schoolClass._id}
                                onClick={() => void handleAddStudent(schoolClass._id)}
                                type="button"
                            >
                                {addingStudentId === schoolClass._id ? "A adicionar..." : "Adicionar aluno"}
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
                ))}
            </div>
        </section>
    );
}