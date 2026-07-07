/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    AdaptiveExplanation,
    getLearningProfile,
    LearningProfile,
    askAdaptiveExplanation,
    updateLearningProfile,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type AdaptiveLearningPageProps = {
    studyAreaId: string;
};

/**
 * Página de aprendizagem adaptativa por área de estudo.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function AdaptiveLearningPage({ studyAreaId }: AdaptiveLearningPageProps) {
    const [profile, setProfile] = useState<LearningProfile | null>(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AdaptiveExplanation | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Carrega student no formato necessário ao próximo passo do fluxo.
         *
         * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
         */
        async function load(): Promise<void> {
            try {
                setProfile(await getLearningProfile(studyAreaId));
            } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Erro ao carregar.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [studyAreaId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleProfileSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!profile) return;
        setSaving(true);
        setError(null);
        try {
            setProfile(await updateLearningProfile(studyAreaId, profile));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar.");
        } finally {
            setSaving(false);
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleQuestionSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            setAnswer(await askAdaptiveExplanation(studyAreaId, question));
            setQuestion("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao gerar.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="text-sm text-slate-600">A carregar perfil...</p>;

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleProfileSubmit(event)}>
                <h1 className="text-xl font-bold">Aprendizagem adaptativa</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">
                    Ritmo
                    <select
                        value={profile?.pace ?? "BALANCED"}
                        onChange={(event) =>
                            setProfile((current) =>
                                current ? { ...current, pace: event.target.value as LearningProfile["pace"] } : current,
                            )
                        }
                    >
                        <option value="SLOW">Mais gradual</option>
                        <option value="BALANCED">Equilibrado</option>
                        <option value="FAST">Direto</option>
                    </select>
                </label>
                <label className="block">
                    Nível
                    <select
                        value={profile?.level ?? "INTERMEDIATE"}
                        onChange={(event) =>
                            setProfile((current) =>
                                current ? { ...current, level: event.target.value as LearningProfile["level"] } : current,
                            )
                        }
                    >
                        <option value="BEGINNER">Inicial</option>
                        <option value="INTERMEDIATE">Intermédio</option>
                        <option value="ADVANCED">Avançado</option>
                    </select>
                </label>
                <label className="block">
                    Dificuldades
                    <textarea
                        rows={5}
                        value={profile?.difficulties.join("\n") ?? ""}
                        onChange={(event) =>
                            setProfile((current) =>
                                current
                                    ? {
                                          ...current,
                                          difficulties: event.target.value
                                              .split(/\r?\n/)
                                              .map((difficulty) => difficulty.trim())
                                              .filter((difficulty) => difficulty.length > 0),
                                      }
                                    : current,
                            )
                        }
                    />
                </label>
                <label className="block">
                    Estilo preferido
                    <input
                        value={profile?.preferredExplanationStyle ?? ""}
                        onChange={(event) =>
                            setProfile((current) =>
                                current
                                    ? {
                                          ...current,
                                          preferredExplanationStyle: event.target.value,
                                      }
                                    : current,
                            )
                        }
                    />
                </label>
                <button className="sf-button-primary" disabled={saving}>
                    Guardar perfil
                </button>
            </form>
            <div className="space-y-4">
                <form className="sf-panel space-y-4" onSubmit={(event) => void handleQuestionSubmit(event)}>
                    <h2 className="text-lg font-semibold">Pedir explicação</h2>
                    <textarea
                        rows={4}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Escreve a tua dúvida..."
                    />
                    <button className="sf-button-primary" disabled={saving || question.trim().length < 4}>
                        Gerar explicação
                    </button>
                </form>
                {answer ? (
                    <article className="sf-panel space-y-3">
                        <h2 className="text-lg font-semibold">Resposta adaptada</h2>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{answer.answer}</p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                            {answer.suggestedNextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    </article>
                ) : (
                    <p className="sf-panel text-sm text-slate-600">Ainda não há explicação nesta sessão.</p>
                )}
            </div>
        </section>
    );
}
