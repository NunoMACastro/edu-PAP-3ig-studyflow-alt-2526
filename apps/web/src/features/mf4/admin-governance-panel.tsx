/**
 * Painel administrativo MF4 para utilizadores, auditoria e IA.
 */
import { useEffect, useState } from "react";
import {
    AdminUser,
    AiModelPolicy,
    AiQuotaPolicy,
    AiUsageRow,
    AuditEvent,
    changeUserRole,
    listAdminUsers,
    listAiModelPolicies,
    listAiQuotas,
    listAiUsage,
    listAuditEvents,
    listNotificationPolicies,
    NotificationPolicy,
    saveAiModelPolicy,
    saveAiQuotaPolicy,
    saveNotificationPolicy,
} from "./mf4-client.js";

const AI_PURPOSES = [
    "PRIVATE_AREA_AI",
    "GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
];

/**
 * Painel admin mínimo para validar contratos MF4.
 *
 * @returns UI administrativa.
 */
export function AdminGovernancePanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [notificationPolicies, setNotificationPolicies] = useState<NotificationPolicy[]>([]);
    const [modelPolicies, setModelPolicies] = useState<AiModelPolicy[]>([]);
    const [quotas, setQuotas] = useState<AiQuotaPolicy[]>([]);
    const [usage, setUsage] = useState<AiUsageRow[]>([]);
    const [modelDraft, setModelDraft] = useState<AiModelPolicy>({
        purpose: "PRIVATE_AREA_AI",
        enabled: true,
        provider: "openai",
        model: "gpt-5.4-mini",
        timeoutMs: 8000,
        maxSourceCount: 10,
        maxPromptChars: 12000,
    });
    const [quotaDraft, setQuotaDraft] = useState<AiQuotaPolicy>({
        scope: "USER",
        targetId: "",
        purpose: "PRIVATE_AREA_AI",
        monthlyLimitUnits: 100,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Recarrega a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        const [nextUsers, nextEvents, nextNotificationPolicies, nextModelPolicies, nextQuotas, nextUsage] =
            await Promise.all([
                listAdminUsers(),
                listAuditEvents(),
                listNotificationPolicies(),
                listAiModelPolicies(),
                listAiQuotas(),
                listAiUsage(),
            ]);
        setUsers(nextUsers);
        setEvents(nextEvents);
        setNotificationPolicies(nextNotificationPolicies);
        setModelPolicies(nextModelPolicies);
        setQuotas(nextQuotas);
        setUsage(nextUsage);
    }

    useEffect(() => {
        refresh()
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar governança."),
            )
            .finally(() => setLoading(false));
    }, []);

    /**
     * Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @param userId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param role Papel funcional que define permissões e comportamento autorizado dentro da aplicação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function updateRole(userId: string, role: AdminUser["role"]): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            await changeUserRole(userId, role);
            await refresh();
            setSuccess("Papel atualizado.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao alterar papel.");
        }
    }

    /**
     * Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @param policy Política editada ou avaliada antes de persistir regras administrativas.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function persistNotificationPolicy(policy: NotificationPolicy): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            const saved = await saveNotificationPolicy(policy.channel, {
                enabled: policy.enabled,
                maxPerUserPerDay: policy.maxPerUserPerDay,
                maxPerContextPerHour: policy.maxPerContextPerHour,
            });
            setNotificationPolicies((items) =>
                items.map((item) => (item.channel === saved.channel ? saved : item)),
            );
            setSuccess("Política de notificação guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar política de notificação.");
        }
    }

    /**
     * Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @param policy Política editada ou avaliada antes de persistir regras administrativas.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function persistModelPolicy(policy: AiModelPolicy): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            const saved = await saveAiModelPolicy(policy.purpose, {
                enabled: policy.enabled,
                provider: policy.provider,
                model: policy.model,
                timeoutMs: policy.timeoutMs,
                maxSourceCount: policy.maxSourceCount,
                maxPromptChars: policy.maxPromptChars,
            });
            setModelPolicies((items) => {
                const exists = items.some((item) => item.purpose === saved.purpose);
                return exists
                    ? items.map((item) => (item.purpose === saved.purpose ? saved : item))
                    : [...items, saved];
            });
            setModelDraft(saved);
            setSuccess("Política IA guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar política IA.");
        }
    }

    /**
     * Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @param policy Política editada ou avaliada antes de persistir regras administrativas.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function persistQuotaPolicy(policy: AiQuotaPolicy): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            const saved = await saveAiQuotaPolicy(policy);
            setQuotas((items) => {
                const exists = items.some(
                    (item) =>
                        item.scope === saved.scope &&
                        item.targetId === saved.targetId &&
                        item.purpose === saved.purpose,
                );
                return exists
                    ? items.map((item) =>
                          item.scope === saved.scope &&
                          item.targetId === saved.targetId &&
                          item.purpose === saved.purpose
                              ? saved
                              : item,
                      )
                    : [...items, saved];
            });
            setQuotaDraft(saved);
            setSuccess("Quota IA guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar quota IA.");
        }
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Governança</h1>
                <p className="text-sm text-slate-600">Utilizadores, auditoria, notificações e limites de IA.</p>
            </header>
            {error ? <p className="sf-error">{error}</p> : null}
            {success ? <p className="sf-success">{success}</p> : null}
            {loading ? <p className="text-sm text-slate-600">A carregar governança...</p> : null}

            <div className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Utilizadores</h2>
                {users.length === 0 && !loading ? <p className="text-sm text-slate-600">Sem utilizadores.</p> : null}
                <div className="grid gap-2">
                    {users.map((user) => (
                        <article className="rounded-md border border-slate-200 p-3" key={user.id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-xs text-slate-500">{user.role}</p>
                                </div>
                                <select
                                    value={user.role}
                                    onChange={(event) =>
                                        void updateRole(user.id, event.target.value as AdminUser["role"])
                                    }
                                >
                                    <option value="STUDENT">Aluno</option>
                                    <option value="TEACHER">Professor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="sf-panel space-y-3">
                    <h2 className="text-lg font-semibold">Auditoria</h2>
                    {events.slice(0, 8).map((event) => (
                        <article className="rounded-md border border-slate-200 p-3" key={event.id}>
                            <p className="font-medium">{event.action}</p>
                            <p className="text-xs text-slate-500">{event.domain} · {event.result}</p>
                        </article>
                    ))}
                </section>
                <section className="sf-panel space-y-4">
                    <h2 className="text-lg font-semibold">Canais</h2>
                    {notificationPolicies.map((policy) => (
                        <form
                            className="grid gap-2 rounded-md border border-slate-200 p-3"
                            key={policy.channel}
                            onSubmit={(event) => {
                                event.preventDefault();
                                void persistNotificationPolicy(policy);
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <strong>{policy.channel}</strong>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        checked={policy.enabled}
                                        type="checkbox"
                                        onChange={(event) =>
                                            setNotificationPolicies((items) =>
                                                items.map((item) =>
                                                    item.channel === policy.channel
                                                        ? { ...item, enabled: event.target.checked }
                                                        : item,
                                                ),
                                            )
                                        }
                                    />
                                    Ativo
                                </label>
                            </div>
                            <label className="grid gap-1 text-sm">
                                Máx. utilizador/dia
                                <input
                                    min={1}
                                    type="number"
                                    value={policy.maxPerUserPerDay}
                                    onChange={(event) =>
                                        setNotificationPolicies((items) =>
                                            items.map((item) =>
                                                item.channel === policy.channel
                                                    ? { ...item, maxPerUserPerDay: Number(event.target.value) }
                                                    : item,
                                            ),
                                        )
                                    }
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                Máx. contexto/hora
                                <input
                                    min={1}
                                    type="number"
                                    value={policy.maxPerContextPerHour}
                                    onChange={(event) =>
                                        setNotificationPolicies((items) =>
                                            items.map((item) =>
                                                item.channel === policy.channel
                                                    ? { ...item, maxPerContextPerHour: Number(event.target.value) }
                                                    : item,
                                            ),
                                        )
                                    }
                                />
                            </label>
                            <button className="sf-button-primary" type="submit">Guardar</button>
                        </form>
                    ))}
                </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="sf-panel space-y-4">
                    <h2 className="text-lg font-semibold">Modelos IA</h2>
                    {[...modelPolicies, modelDraft].map((policy, index) => (
                        <form
                            className="grid gap-2 rounded-md border border-slate-200 p-3"
                            key={`${policy.purpose}-${index}`}
                            onSubmit={(event) => {
                                event.preventDefault();
                                void persistModelPolicy(policy);
                            }}
                        >
                            <label className="grid gap-1 text-sm">
                                Finalidade
                                <select
                                    value={policy.purpose}
                                    onChange={(event) => {
                                        const next = { ...policy, purpose: event.target.value };
                                        if (index === modelPolicies.length) setModelDraft(next);
                                        else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                    }}
                                >
                                    {AI_PURPOSES.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
                                </select>
                            </label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className="grid gap-1 text-sm">
                                    Modelo
                                    <input
                                        value={policy.model}
                                        onChange={(event) => {
                                            const next = { ...policy, model: event.target.value };
                                            if (index === modelPolicies.length) setModelDraft(next);
                                            else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                        }}
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Timeout
                                    <input
                                        min={1000}
                                        type="number"
                                        value={policy.timeoutMs}
                                        onChange={(event) => {
                                            const next = { ...policy, timeoutMs: Number(event.target.value) };
                                            if (index === modelPolicies.length) setModelDraft(next);
                                            else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                        }}
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Fontes
                                    <input
                                        min={1}
                                        type="number"
                                        value={policy.maxSourceCount}
                                        onChange={(event) => {
                                            const next = { ...policy, maxSourceCount: Number(event.target.value) };
                                            if (index === modelPolicies.length) setModelDraft(next);
                                            else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                        }}
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Máx. prompt
                                    <input
                                        min={500}
                                        type="number"
                                        value={policy.maxPromptChars}
                                        onChange={(event) => {
                                            const next = { ...policy, maxPromptChars: Number(event.target.value) };
                                            if (index === modelPolicies.length) setModelDraft(next);
                                            else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                        }}
                                    />
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        checked={policy.enabled}
                                        type="checkbox"
                                        onChange={(event) => {
                                            const next = { ...policy, enabled: event.target.checked };
                                            if (index === modelPolicies.length) setModelDraft(next);
                                            else setModelPolicies((items) => items.map((item) => item.purpose === policy.purpose ? next : item));
                                        }}
                                    />
                                    Ativo
                                </label>
                            </div>
                            <button className="sf-button-primary" type="submit">Guardar modelo</button>
                        </form>
                    ))}
                </section>

                <section className="sf-panel space-y-4">
                    <h2 className="text-lg font-semibold">Quotas IA</h2>
                    <form
                        className="grid gap-2 rounded-md border border-slate-200 p-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void persistQuotaPolicy(quotaDraft);
                        }}
                    >
                        <div className="grid gap-2 sm:grid-cols-2">
                            <label className="grid gap-1 text-sm">
                                Âmbito
                                <select
                                    value={quotaDraft.scope}
                                    onChange={(event) =>
                                        setQuotaDraft((current) => ({
                                            ...current,
                                            scope: event.target.value as AiQuotaPolicy["scope"],
                                        }))
                                    }
                                >
                                    <option value="USER">Utilizador</option>
                                    <option value="CLASS">Turma</option>
                                    <option value="GROUP">Grupo</option>
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                Target ID
                                <input
                                    value={quotaDraft.targetId}
                                    onChange={(event) =>
                                        setQuotaDraft((current) => ({ ...current, targetId: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                Finalidade
                                <select
                                    value={quotaDraft.purpose}
                                    onChange={(event) =>
                                        setQuotaDraft((current) => ({ ...current, purpose: event.target.value }))
                                    }
                                >
                                    {AI_PURPOSES.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                Limite mensal
                                <input
                                    min={1}
                                    type="number"
                                    value={quotaDraft.monthlyLimitUnits}
                                    onChange={(event) =>
                                        setQuotaDraft((current) => ({
                                            ...current,
                                            monthlyLimitUnits: Number(event.target.value),
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <button className="sf-button-primary" type="submit">Guardar quota</button>
                    </form>
                    <div className="grid gap-2">
                        {quotas.slice(0, 6).map((quota) => (
                            <button
                                className="rounded-md border border-slate-200 p-3 text-left"
                                key={`${quota.scope}-${quota.targetId}-${quota.purpose}`}
                                type="button"
                                onClick={() => setQuotaDraft(quota)}
                            >
                                <strong>{quota.scope}</strong> · {quota.purpose}
                                <span className="block text-xs text-slate-500">{quota.monthlyLimitUnits} unidades</span>
                            </button>
                        ))}
                    </div>
                    <h3 className="text-base font-semibold">Consumo</h3>
                    {usage.slice(0, 5).map((row) => (
                        <p className="text-sm text-slate-600" key={`${row.scope}-${row.targetId}-${row.purpose}-${row.period}`}>
                            {row.period} · {row.scope} · {row.purpose}: {row.usedUnits}
                        </p>
                    ))}
                </section>
            </div>
        </section>
    );
}
