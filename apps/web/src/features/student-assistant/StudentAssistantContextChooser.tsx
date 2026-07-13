/** Seletor por labels seguras, sem campos de IDs técnicos. */
import { useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice } from "../../components/ui/CalmUi.js";
import {
    listStudentAssistantContexts,
    type StudentAssistantContext,
} from "../../lib/apiClient.js";

export function StudentAssistantContextChooser({
    onSelect,
}: {
    onSelect: (context: StudentAssistantContext) => void;
}) {
    const [query, setQuery] = useState("");
    const [contexts, setContexts] = useState<StudentAssistantContext[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const timer = window.setTimeout(() => {
            setLoading(true);
            setError(null);
            listStudentAssistantContexts({ query: query.trim() || undefined, limit: 50 })
                .then((page) => {
                    if (active) setContexts(page.items);
                })
                .catch((caught) => {
                    if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar os contextos.");
                })
                .finally(() => {
                    if (active) setLoading(false);
                });
        }, query ? 200 : 0);
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [query]);

    return (
        <section className="space-y-4" aria-label="Escolher contexto de estudo">
            <div>
                <h2 className="text-lg font-semibold">Onde queres estudar?</h2>
                <p className="mt-1 text-sm leading-6 text-studyflow-text/70">Escolhe uma disciplina, área, grupo ou sala. O Assistente usa apenas as fontes desse contexto.</p>
            </div>
            <FormField id="assistant-context-search" label="Pesquisar contextos">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome da disciplina, área ou sala" />
            </FormField>
            {loading ? <InlineNotice>A carregar contextos...</InlineNotice> : null}
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error && contexts.length === 0 ? <EmptyState title="Nenhum contexto disponível" description="Adiciona materiais ou entra num contexto de estudo para começares." /> : null}
            <div className="space-y-2">
                {contexts.map((context) => (
                    <button
                        className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-studyflow-border/10 bg-studyflow-card/40 px-4 py-3 text-left hover:bg-studyflow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studyflow-brand"
                        disabled={!context.canAsk}
                        key={`${context.kind}:${context.id}`}
                        onClick={() => onSelect(context)}
                        type="button"
                    >
                        <span className="min-w-0"><span className="block truncate font-semibold">{context.label}</span><span className="block truncate text-sm text-studyflow-text/65">{context.secondaryLabel ?? contextLabel(context.kind)}</span></span>
                        <span className="shrink-0 text-sm font-semibold text-studyflow-brandText">{context.canAsk ? "Escolher" : "Consulta"}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

function contextLabel(kind: StudentAssistantContext["kind"]): string {
    if (kind === "SUBJECT") return "Disciplina";
    if (kind === "STUDY_AREA") return "Estudo pessoal";
    if (kind === "STUDY_GROUP") return "Grupo";
    if (kind === "STUDY_ROOM") return "Sala partilhada";
    return "Com o professor";
}
