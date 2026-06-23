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
     * @param event Evento da interface que dispara a acao.
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
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Pesquisa</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Pesquisa
                    <input value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label className="block">
                    Jobs
                    <input value={jobIds} onChange={(event) => setJobIds(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || query.trim().length < 2}>
                    {loading ? "A pesquisar..." : "Pesquisar"}
                </button>
            </form>
            {response && response.results.length === 0 ? (
                <p className="text-sm text-slate-600">Sem resultados.</p>
            ) : null}
            <div className="grid gap-2">
                {response?.results.map((result) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={`${result.jobId}-${result.locator}`}>
                        <strong>{result.sourceLabel}</strong>
                        <p className="text-slate-600">{result.locator}</p>
                        <p className="text-slate-700">{result.excerpt}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
