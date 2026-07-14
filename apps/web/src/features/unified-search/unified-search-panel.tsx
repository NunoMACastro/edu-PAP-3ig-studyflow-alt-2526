/**
 * Implementa a funcionalidade frontend de pesquisa unificada e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import {
    runUnifiedSearch,
    UnifiedSearchResponse,
} from "./run-unified-search.js";

/**
 * Painel de pesquisa unificada.
 *
 * @returns Formulário e resultados.
 */
export function UnifiedSearchPanel() {
    const [query, setQuery] = useState("");
    const [jobIds, setJobIds] = useState("");
    const [response, setResponse] = useState<UnifiedSearchResponse | null>(null);
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
                await runUnifiedSearch({
                    query,
                    jobIds: jobIds.split(",").map((jobId) => jobId.trim()).filter(Boolean),
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao pesquisar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-surface space-y-4">
            <h2 className="text-lg font-semibold">Pesquisa</h2>
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block" htmlFor="unified-search-query">
                    Pesquisa
                    <input id="unified-search-query" value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label className="block" htmlFor="unified-search-job-ids">
                    Jobs
                    <input id="unified-search-job-ids" value={jobIds} onChange={(event) => setJobIds(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || query.trim().length < 2}>
                    {loading ? "A pesquisar..." : "Pesquisar"}
                </button>
            </form>
            {response && response.results.length === 0 ? (
                <p className="text-sm text-studyflow-text">Sem resultados.</p>
            ) : null}
            <div className="grid gap-2">
                {response?.results.map((result) => (
                    <article className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3 text-sm" key={`${result.jobId}-${result.locator}`}>
                        <strong>{result.sourceLabel}</strong>
                        <p className="text-studyflow-text">{result.locator}</p>
                        <p className="text-studyflow-text">{result.excerpt}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
