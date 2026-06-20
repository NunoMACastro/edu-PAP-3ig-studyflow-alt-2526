/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    addClassStudent,
    createTeacherClass,
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";

/**
 * Página de turmas oficiais do professor.
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
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createTeacherClass({ name, code, schoolYear });
            setName("");
            setCode("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param classId Identificador usado para limitar a operação a turma.
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
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">
                    Nome
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="block">
                    Código
                    <input value={code} onChange={(event) => setCode(event.target.value)} />
                </label>
                <label className="block">
                    Ano letivo
                    <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={name.trim().length < 2 || code.trim().length < 2}>
                    Criar turma
                </button>
            </form>
            <div className="grid gap-3">
                {classes.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não tens turmas.</p> : null}
                {classes.map((schoolClass) => (
                    <article className="sf-panel space-y-3" key={schoolClass._id}>
                        <div>
                            <h2 className="font-semibold">{schoolClass.name}</h2>
                            <p className="text-sm text-slate-600">{schoolClass.code} · {schoolClass.schoolYear} · {schoolClass.studentIds.length} alunos</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <input
                                value={emails[schoolClass._id] ?? ""}
                                onChange={(event) =>
                                    setEmails((current) => ({ ...current, [schoolClass._id]: event.target.value }))
                                }
                                placeholder="email do aluno"
                            />
                            <button className="sf-button-secondary" onClick={() => void handleAddStudent(schoolClass._id)}>
                                Adicionar aluno
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
