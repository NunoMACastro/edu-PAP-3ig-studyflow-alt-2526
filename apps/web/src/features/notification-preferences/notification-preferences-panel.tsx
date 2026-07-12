/**
 * Implementa a funcionalidade frontend de preferências de notificação e o respetivo contrato com a API.
 */
import { useEffect, useState } from "react";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    listNotificationPreferences,
    NotificationPreference,
    updateNotificationPreferences,
} from "./update-notification-preferences.js";

const contextLabels: Record<NotificationPreference["context"], string> = {
    STUDY_ROUTINE: "Rotinas",
    STUDY_GOAL: "Objetivos",
    GROUP_SESSION: "Sessões",
    GUIDED_ROOM: "Salas guiadas",
    CLASS_UPDATES: "Atualizações das turmas",
    LEARNING_CONTENT: "Conteúdos de aprendizagem",
    ASSESSMENT: "Avaliações",
    FOLLOW_UP: "Acompanhamento docente",
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
        field: "inApp",
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
        <Surface as="section" className="space-y-4">
            <SectionHeader description="Ativa ou desativa notificações na aplicação. Email e push ainda não estão disponíveis." title="Notificações" />
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar preferências...</InlineNotice> : null}
            <div className="grid gap-3">
                {preferences.map((preference) => (
                    <article className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3" key={preference.context}>
                        <h3 className="font-medium">{contextLabels[preference.context]}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            {(["inApp"] as const).map((field) => (
                                <label className="flex items-center gap-2" htmlFor={`notification-${preference.context}-${field}`} key={field}>
                                    <input
                                        id={`notification-${preference.context}-${field}`}
                                        type="checkbox"
                                        checked={preference[field]}
                                        onChange={() => void toggle(preference, field)}
                                    />
                                    na aplicação
                                </label>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </Surface>
    );
}
