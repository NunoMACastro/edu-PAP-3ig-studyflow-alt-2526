/**
 * Props do componente React de rotinas e objetivos de estudo; mantêm explícitas as dependências vindas da página.
 */
type StudyHistoryListProps = {
    events: unknown[];
};

/**
 * Lista eventos de histórico de estudo.
 *
 * @param props Eventos carregados da API.
 * @returns Lista visual do histórico.
 */
export function StudyHistoryList({ events }: StudyHistoryListProps) {
    if (events.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há eventos.</p>;
    }

    return (
        <ul className="space-y-3">
            {events.map((event, index) => {
                const item = event as { title?: string; description?: string; occurredAt?: string };
                return (
                    <li className="rounded-md border border-slate-200 p-3" key={index}>
                        <p className="font-medium">{item.title ?? "Evento"}</p>
                        {item.description ? <p className="text-sm text-slate-600">{item.description}</p> : null}
                        {item.occurredAt ? <p className="mt-1 text-xs text-slate-500">{new Date(item.occurredAt).toLocaleDateString("pt-PT")}</p> : null}
                    </li>
                );
            })}
        </ul>
    );
}
