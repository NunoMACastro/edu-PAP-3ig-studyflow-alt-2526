/**
 * Renderiza eventos de histórico de estudo com datas localizadas.
 */
import type { StudyHistoryEvent } from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";

type StudyHistoryListProps = {
    events: StudyHistoryEvent[];
};

/**
 * Lista eventos de histórico de estudo.
 *
 * @param props Eventos carregados da API para o aluno autenticado.
 * @returns Lista visual do histórico.
 */
export function StudyHistoryList({ events }: StudyHistoryListProps) {
    if (events.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há eventos.</p>;
    }

    return (
        <ul className="space-y-3">
            {events.map((event) => (
                <li className="rounded-md border border-slate-200 p-3" key={event.id}>
                    <p className="font-medium">{event.title}</p>
                    {event.description ? (
                        <p className="text-sm text-slate-600">{event.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">
                        {/* A data chega em ISO e só é localizada no último momento, junto da UI. */}
                        {formatDatePt(event.occurredAt)}
                    </p>
                </li>
            ))}
        </ul>
    );
}
