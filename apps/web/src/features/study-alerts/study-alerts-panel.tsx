/**
 * Implementa a funcionalidade frontend de alertas de estudo e o respetivo contrato com a API.
 */
import { useEffect, useState } from "react";
import { loadStudyAlerts, StudyAlert } from "./load-study-alerts.js";

/**
 * Painel de alertas internos de estudo.
 *
 * @returns Lista de alertas.
 */
export function StudyAlertsPanel() {
    const [alerts, setAlerts] = useState<StudyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            setAlerts(await loadStudyAlerts(true));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    return (
        <section className="sf-panel space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Alertas</h2>
                <button className="sf-button-secondary" onClick={() => void refresh()}>
                    Atualizar
                </button>
            </div>
            {error ? <p className="sf-error">{error}</p> : null}
            {loading ? <p className="text-sm text-studyflow-text">A carregar alertas...</p> : null}
            {!loading && alerts.length === 0 ? (
                <p className="text-sm text-studyflow-text">Sem alertas ativos.</p>
            ) : null}
            <div className="grid gap-2">
                {alerts.map((alert) => (
                    <article className="rounded-md border border-studyflow-border p-3 text-sm" key={alert.key}>
                        <strong>{alert.title}</strong>
                        <p className="text-studyflow-text">{alert.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
