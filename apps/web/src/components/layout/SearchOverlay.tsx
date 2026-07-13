/** Pesquisa contextual sem campos de IDs técnicos. */
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { searchStudentStudies, type StudentSearchResult } from "../../lib/apiClient.js";
import { EmptyState, InlineNotice } from "../ui/CalmUi.js";

export function SearchOverlay({ open, onClose, scope }: { open: boolean; onClose: () => void; scope: { type: "SUBJECT" | "STUDY_AREA"; id: string } | { type: "ALL_STUDIES" } }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<StudentSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose, open]);
    if (!open) return null;
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (query.trim().length < 2) return;
        setLoading(true);
        setHasSearched(false);
        setError(null);
        try {
            const response = await searchStudentStudies({ query, scope });
            setResults(response.results);
            setHasSearched(true);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível pesquisar.");
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div aria-label="Pesquisar nos meus estudos" aria-modal="true" className="fixed inset-0 z-[70] bg-studyflow-page/80 p-3 backdrop-blur-md sm:p-8" role="dialog">
            <div className="mx-auto max-h-full max-w-3xl overflow-y-auto rounded-2xl border border-studyflow-border/10 bg-studyflow-card p-4 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Pesquisar</h2><p className="mt-1 text-sm text-studyflow-text/60">{scope.type === "SUBJECT" ? "Nesta disciplina" : scope.type === "STUDY_AREA" ? "Nesta área pessoal" : "Em todos os meus estudos"}</p></div><button aria-label="Fechar pesquisa" className="sf-button-secondary" onClick={onClose} type="button">Fechar</button></div>
                <form className="mt-5 flex gap-2" onSubmit={(event) => void submit(event)}><input ref={inputRef} aria-label="O que procuras?" className="min-h-11 flex-1" onChange={(event) => { setQuery(event.target.value); setHasSearched(false); setResults([]); }} placeholder="Conceito, tema ou material" value={query} /><button className="sf-button-primary" disabled={loading || query.trim().length < 2} type="submit">{loading ? "A pesquisar..." : "Pesquisar"}</button></form>
                {error ? <div className="mt-4"><InlineNotice tone="danger">{error}</InlineNotice></div> : null}
                {!loading && hasSearched && results.length === 0 ? <div className="mt-5"><EmptyState icon="info" title="Sem resultados" description="Experimenta outras palavras ou abre o contexto de estudo para pesquisar apenas aí." /></div> : null}
                {results.length ? <ul className="mt-5 grid gap-2">{results.map((result, index) => <li key={`${result.materialId}:${result.locator}:${index}`}><Link className="sf-list-card block" onClick={onClose} to={result.targetPath}><span className="text-xs font-semibold uppercase tracking-wide text-studyflow-brandText">{result.context} · {result.sourceLabel}</span><p className="mt-2 text-sm leading-6 text-studyflow-text/75">{result.excerpt}</p></Link></li>)}</ul> : null}
            </div>
        </div>
    );
}
