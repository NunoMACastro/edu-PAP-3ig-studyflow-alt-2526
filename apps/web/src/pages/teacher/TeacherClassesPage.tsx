// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Formulário acessível para criar turmas e adicionar alunos.
 */
export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
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
     * Cria turma oficial usando a API autenticada.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            // A API continua a validar professor autenticado, payload e unicidade do código.
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        }
    }

    /**
     * Adiciona aluno a uma turma gerida pelo professor autenticado.
     *
     * @param classId Identificador da turma oficial.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        try {
            await addClassStudent(classId, emails[classId] ?? "");
            setEmails((current) => ({ ...current, [classId]: "" }));
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Turmas</h1>
                {error ? (
                    <p className="sf-error" role="alert">
                        {error}
                    </p>
                ) : null}
                <FormField id="teacherClassName" label="Nome" helpText="Nome visível da turma.">
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </FormField>
                <FormField id="teacherClassCode" label="Código" helpText="Código curto usado para identificar a turma.">
                    <input value={code} onChange={(event) => setCode(event.target.value)} />
                </FormField>
                <FormField id="teacherClassSchoolYear" label="Ano letivo" helpText="Formato esperado: 2025/2026.">
                    <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} />
                </FormField>
                <button className="sf-button-primary" disabled={name.trim().length < 2 || code.trim().length < 2}>
                    Criar turma
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
                            >
                                <input
                                    type="email"
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
                                onClick={() => void handleAddStudent(schoolClass._id)}
                                type="button"
                            >
                                Adicionar aluno
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
                                Projectos
                            </a>
                            <a className="sf-button-secondary" href={`/app/professor/turmas/${schoolClass._id}/progresso`}>
                                Progresso
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}