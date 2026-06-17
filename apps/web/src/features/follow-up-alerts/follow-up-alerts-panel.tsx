// apps/web/src/features/follow-up-alerts/follow-up-alerts-panel.tsx
import { useEffect, useState } from "react";
import { FollowUpAlertRule, loadFollowUpAlerts, runFollowUpAlert } from "./follow-up-alerts-client.js";

/**
 * Painel docente para acompanhar regras de inatividade.
 */
export function FollowUpAlertsPanel() {
    const [rules, setRules] = useState<FollowUpAlertRule[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFollowUpAlerts().then(setRules).catch((err: Error) => setError(err.message));
    }, []);

    async function handleRun(ruleId: string) {
        setBusyId(ruleId);
        setError(null);
        try {
            await runFollowUpAlert(ruleId);
        } catch (err) {
            // O erro fica visível para o professor corrigir permissões ou dados.
            setError(err instanceof Error ? err.message : "Não foi possível executar o alerta.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <section aria-labelledby="follow-up-alerts-title">
            <h2 id="follow-up-alerts-title">Alertas de acompanhamento</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ul>
                {rules.map((rule) => (
                    <li key={rule.id}>
                        <strong>{rule.title}</strong>
                        <span>{rule.inactivityDays} dias sem actividade</span>
                        <button type="button" disabled={busyId === rule.id} onClick={() => handleRun(rule.id)}>
                            {busyId === rule.id ? "A enviar..." : "Enviar alerta"}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}