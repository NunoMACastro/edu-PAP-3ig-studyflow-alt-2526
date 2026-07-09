/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { createSubject, listSubjects, Subject } from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherSubjectsPageProps = {
    classId: string;
};

/**
 * Página de disciplinas de uma turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherSubjectsPage({ classId }: TeacherSubjectsPageProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setSubjects(await listSubjects(classId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar disciplinas."),
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
        setError(null);
        try {
            await createSubject(classId, { name, code, description });
            setName("");
            setCode("");
            setDescription("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar disciplina.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Disciplinas</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" />
                <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código" />
                <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />
                <button className="sf-button-primary" disabled={name.trim().length < 2 || code.trim().length < 2}>Criar disciplina</button>
            </form>
            <div className="grid gap-3">
                {subjects.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Ainda não há disciplinas.</p> : null}
                {subjects.map((subject) => (
                    <article className="sf-panel space-y-2" key={subject._id}>
                        <h2 className="font-semibold">{subject.name}</h2>
                        <p className="text-sm text-studyflow-text">{subject.code}</p>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-secondary" href={`/app/professor/disciplinas/${subject._id}/materiais`}>Materiais</a>
                            <a className="sf-button-secondary" href={`/app/professor/disciplinas/${subject._id}/voz`}>Override voz IA</a>
                            <a className="sf-button-secondary" href={`/app/professor/disciplinas/${subject._id}/testes`}>Testes</a>
                            <a className="sf-button-secondary" href={`/app/professor/disciplinas/${subject._id}/revisoes-ia`}>Revisões IA</a>
                            <a className="sf-button-secondary" href={`/app/professor/disciplinas/${subject._id}/contextos-materiais`}>Contexts</a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
