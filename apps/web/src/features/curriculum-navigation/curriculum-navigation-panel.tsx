/**
 * Implementa a funcionalidade frontend de navegação curricular e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import {
    CurriculumNavigationResponse,
    loadCurriculumNavigation,
} from "./load-curriculum-navigation.js";

/**
 * Painel de navegação curricular.
 *
 * @returns Formulário e tópicos.
 */
export function CurriculumNavigationPanel() {
    const [jobIds, setJobIds] = useState("");
    const [response, setResponse] = useState<CurriculumNavigationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setResponse(
                await loadCurriculumNavigation({
                    jobIds: jobIds.split(",").map((jobId) => jobId.trim()).filter(Boolean),
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Currículo</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Jobs
                    <input value={jobIds} onChange={(event) => setJobIds(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || jobIds.trim().length === 0}>
                    {loading ? "A carregar..." : "Carregar"}
                </button>
            </form>
            <div className="grid gap-2">
                {response?.topics.map((topic) => (
                    <article className="rounded-md border border-studyflow-border p-3 text-sm" key={topic.materialId}>
                        <strong>{topic.title}</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-studyflow-text">
                            {topic.sections.map((section) => (
                                <li key={`${topic.materialId}-${section.locator}`}>
                                    {section.title} · {section.locator}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </section>
    );
}
