/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { StudyHistoryList } from "../../components/study/StudyHistoryList.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { listStudyHistory, type StudyHistoryEvent } from "../../lib/apiClient.js";

/**
 * Página do histórico de estudo.
 *
 * @returns Histórico pessoal do aluno autenticado.
 */
export function StudyHistoryPage({ embedded = false }: { embedded?: boolean } = {}) {
    const [events, setEvents] = useState<StudyHistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
         *
         * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
         */
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

    return (
        <section className="space-y-6">
            {!embedded ? <PageHeader description="Consulta cronologicamente a tua atividade e os momentos de estudo registados." title="Histórico" /> : null}
            <AsyncStateBlock error={error ?? undefined} isEmpty={events.length === 0} isLoading={loading} emptyMessage="Ainda não existe atividade de estudo">
                <StudyHistoryList events={events} />
            </AsyncStateBlock>
        </section>
    );
}
