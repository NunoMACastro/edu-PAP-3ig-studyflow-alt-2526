/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { createOfficialTest, listOfficialTests, OfficialTest } from "../../lib/apiClient.js";

const defaultQuestion = {
    statement: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
};

/**
 * Página docente de mini-testes oficiais.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherOfficialTestsPage({ subjectId }: { subjectId: string }) {
    const [tests, setTests] = useState<OfficialTest[]>([]);
    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");
    const [optionsText, setOptionsText] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setTests(await listOfficialTests(subjectId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar testes."),
        );
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        const options = optionsText.split("\n").map((option) => option.trim()).filter(Boolean);
        try {
            await createOfficialTest(subjectId, {
                title,
                status: "DRAFT",
                questions: [{ ...defaultQuestion, statement, options }],
            });
            setTitle("");
            setStatement("");
            setOptionsText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar teste.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Testes oficiais</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">Título<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                <label className="block">Pergunta<textarea value={statement} onChange={(event) => setStatement(event.target.value)} /></label>
                <label className="block">Opções<textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} placeholder={"Uma opção por linha\nA primeira é a correcta"} /></label>
                <button className="sf-button-primary" disabled={title.trim().length < 3 || statement.trim().length < 5}>
                    Criar rascunho
                </button>
            </form>
            <div className="grid gap-3">
                {tests.map((test) => (
                    <article className="sf-panel space-y-3" key={test._id}>
                        <h2 className="font-semibold">{test.title}</h2>
                        <p className="text-sm text-studyflow-text">{test.questions.length} perguntas · {test.status}</p>
                        <a
                            className="sf-button-secondary inline-flex w-fit"
                            href={`/app/professor/disciplinas/${subjectId}/testes/${test._id}/ranking`}
                        >
                            Ver ranking
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}
