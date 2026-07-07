/**
 * Implementa a funcionalidade frontend de preferências de notificação e o respetivo contrato com a API.
 */
import { useEffect, useState } from "react";
import {
    listNotificationPreferences,
    NotificationPreference,
    updateNotificationPreferences,
} from "./update-notification-preferences.js";

const contextLabels: Record<NotificationPreference["context"], string> = {
    STUDY_ROUTINE: "Rotinas",
    STUDY_GOAL: "Objetivos",
    GROUP_SESSION: "Sessões",
};

/**
 * Painel de preferências de notificação por contexto.
 *
 * @returns Lista editável de preferências.
 */
export function NotificationPreferencesPanel() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setPreferences(await listNotificationPreferences());
    }

    useEffect(() => {
        refresh()
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar."),
            )
            .finally(() => setLoading(false));
    }, []);

    /**
     * Mapeia o documento interno de preferências de notificação para uma forma pública estável e simples de consumir.
     *
     * @param preference Valor de preference usado pela função para executar toggle com dados explícitos.
     * @param field Valor de field usado pela função para executar toggle com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function toggle(
        preference: NotificationPreference,
        field: "email" | "push" | "inApp",
    ): Promise<void> {
        setError(null);
        try {
            const updated = await updateNotificationPreferences({
                ...preference,
                [field]: !preference[field],
            });
            setPreferences((current) =>
                current.map((item) =>
                    item.context === updated.context ? updated : item,
                ),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Notificações</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-600">A carregar preferências...</p> : null}
            <div className="grid gap-3">
                {preferences.map((preference) => (
                    <article className="rounded-md border border-slate-200 p-3" key={preference.context}>
                        <h3 className="font-medium">{contextLabels[preference.context]}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            {(["email", "push", "inApp"] as const).map((field) => (
                                <label className="flex items-center gap-2" key={field}>
                                    <input
                                        type="checkbox"
                                        checked={preference[field]}
                                        onChange={() => void toggle(preference, field)}
                                    />
                                    {field === "inApp" ? "app" : field}
                                </label>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
