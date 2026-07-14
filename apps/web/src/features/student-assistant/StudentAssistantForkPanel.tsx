/** Painel acessível para convidar um membro a criar um fork independente. */
import { FormEvent, useEffect, useState, type RefObject } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    cancelStudentAssistantForkInvitation,
    createStudentAssistantForkInvitation,
    listStudentAssistantForkInvitations,
    listStudentAssistantForkRecipients,
    type StudentAssistantForkInvitation,
    type StudentAssistantForkRecipient,
} from "../../lib/apiClient.js";

export function StudentAssistantForkPanel({
    conversationId,
    onClose,
    open,
    returnFocusRef,
}: {
    conversationId: string;
    onClose: () => void;
    open: boolean;
    returnFocusRef?: RefObject<HTMLElement | null>;
}) {
    const [recipients, setRecipients] = useState<StudentAssistantForkRecipient[]>([]);
    const [sent, setSent] = useState<StudentAssistantForkInvitation[]>([]);
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    async function load(search = query): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            const [recipientPage, invitationPage] = await Promise.all([
                listStudentAssistantForkRecipients(conversationId, {
                    query: search.trim() || undefined,
                    limit: 50,
                }),
                listStudentAssistantForkInvitations({
                    direction: "sent",
                    conversationId,
                    limit: 50,
                }),
            ]);
            setRecipients(recipientPage.items);
            setSent(invitationPage.items);
            if (!recipientPage.items.some((recipient) => recipient.id === selectedId)) {
                setSelectedId("");
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível preparar a partilha.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!open) return;
        setQuery("");
        setSelectedId("");
        setConfirmed(false);
        setNotice(null);
        void load("");
        // A abertura é a fronteira intencional para recarregar membros e convites.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, open]);

    async function search(event: FormEvent): Promise<void> {
        event.preventDefault();
        await load(query);
    }

    async function send(): Promise<void> {
        if (!selectedId || !confirmed || saving) return;
        setSaving(true);
        setError(null);
        setNotice(null);
        try {
            await createStudentAssistantForkInvitation(conversationId, selectedId);
            setNotice("Convite enviado. O snapshot ficou congelado neste momento.");
            setSelectedId("");
            setConfirmed(false);
            await load(query);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível enviar o convite.");
        } finally {
            setSaving(false);
        }
    }

    async function cancel(invitationId: string): Promise<void> {
        if (saving) return;
        setSaving(true);
        setError(null);
        try {
            await cancelStudentAssistantForkInvitation(invitationId);
            setSent((current) => current.filter((item) => item.id !== invitationId));
            setNotice("Convite cancelado.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível cancelar o convite.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <SidePanel
            closeDisabled={saving}
            description="Envia um snapshot completo e independente a um membro deste contexto."
            onClose={onClose}
            open={open}
            returnFocusRef={returnFocusRef}
            title="Partilhar conversa"
        >
            <div className="space-y-6">
                {notice ? <InlineNotice>{notice}</InlineNotice> : null}
                {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}

                <section className="space-y-4">
                    <SectionHeader
                        description="Apenas alunos ativos que já pertencem à mesma sala ou grupo."
                        title="Escolher destinatário"
                    />
                    <form className="flex flex-wrap gap-2" onSubmit={(event) => void search(event)}>
                        <FormField id="assistant-fork-recipient-search" label="Pesquisar membro">
                            <input
                                id="assistant-fork-recipient-search"
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Email do aluno"
                                type="search"
                                value={query}
                            />
                        </FormField>
                        <button className="sf-button-secondary self-end" disabled={loading} type="submit">
                            Pesquisar
                        </button>
                    </form>
                    <AsyncStateBlock
                        emptyMessage="Não existem membros elegíveis para este convite."
                        isEmpty={!error && recipients.length === 0}
                        isLoading={loading}
                    >
                        <fieldset className="space-y-2">
                            <legend className="sr-only">Membro destinatário</legend>
                            {recipients.map((recipient) => (
                                <label className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 hover:bg-studyflow-card/45" key={recipient.id}>
                                    <input
                                        checked={selectedId === recipient.id}
                                        name="assistant-fork-recipient"
                                        onChange={() => setSelectedId(recipient.id)}
                                        type="radio"
                                    />
                                    <span className="min-w-0 break-all text-sm">{recipient.email}</span>
                                </label>
                            ))}
                        </fieldset>
                    </AsyncStateBlock>
                    <InlineNotice tone="attention">
                        Todo o histórico visível será copiado. A cópia será independente, não poderá ser revogada depois de aceite e o destinatário poderá voltar a partilhá-la.
                    </InlineNotice>
                    <label className="flex items-start gap-3 text-sm leading-6">
                        <input
                            checked={confirmed}
                            className="mt-1"
                            onChange={(event) => setConfirmed(event.target.checked)}
                            type="checkbox"
                        />
                        <span>Compreendo e quero enviar este snapshot.</span>
                    </label>
                    <button
                        className="sf-button-primary"
                        disabled={!selectedId || !confirmed || saving}
                        onClick={() => void send()}
                        type="button"
                    >
                        {saving ? "A enviar..." : "Enviar convite"}
                    </button>
                </section>

                {sent.length ? (
                    <section className="space-y-3">
                        <SectionHeader title="Convites pendentes" />
                        <ul className="divide-y divide-studyflow-border/10">
                            {sent.map((invitation) => (
                                <li className="flex min-w-0 items-center justify-between gap-3 py-3" key={invitation.id}>
                                    <div className="min-w-0">
                                        <p className="break-all text-sm font-semibold">{invitation.recipient.email}</p>
                                        <p className="text-xs text-studyflow-text/65">{invitation.turnCount} turnos · expira em {new Date(invitation.expiresAt).toLocaleDateString("pt-PT")}</p>
                                    </div>
                                    <button className="sf-button-secondary shrink-0" disabled={saving} onClick={() => void cancel(invitation.id)} type="button">
                                        Cancelar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>
        </SidePanel>
    );
}
