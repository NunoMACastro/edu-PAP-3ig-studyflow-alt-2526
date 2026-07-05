// apps/web/src/pages/student/StudyHistoryPage.tsx
/**
 * Implementa a página de histórico do aluno com dados tipados.
 */
import { useEffect, useState } from "react";
import { StudyHistoryList } from "../../components/study/StudyHistoryList.js";
import { listStudyHistory, type StudyHistoryEvent } from "../../lib/apiClient.js";

/**
 * Página do histórico de estudo.
 *
 * @returns Histórico pessoal do aluno autenticado.
 */
export function StudyHistoryPage() {
    const [events, setEvents] = useState<StudyHistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadHistory(): Promise<void> {
            try {
                // O pedido usa a sessão HttpOnly existente; a página não envia userId.
                setEvents(await listStudyHistory());
            } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        }

        void loadHistory();
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar histórico...</p>;
    }

    return (
        <section className="sf-panel space-y-4">
            <h1 className="text-xl font-bold">Histórico</h1>
            {error ? <p className="sf-error text-red-600">{error}</p> : null}
            <StudyHistoryList events={events} />
        </section>
    );
}