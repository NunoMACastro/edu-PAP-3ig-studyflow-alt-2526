/** Lista compacta de convites recebidos na página completa do Assistente. */
import { useEffect, useState } from "react";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    acceptStudentAssistantForkInvitation,
    declineStudentAssistantForkInvitation,
    listStudentAssistantForkInvitations,
    type StudentAssistantConversation,
    type StudentAssistantForkInvitation,
} from "../../lib/apiClient.js";

export function StudentAssistantForkInvitations({
    onAccepted,
}: {
    onAccepted: (conversation: StudentAssistantConversation) => void;
}) {
    const [items, setItems] = useState<StudentAssistantForkInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        listStudentAssistantForkInvitations({ direction: "received", limit: 50 })
            .then((page) => {
                if (active) setItems(page.items);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar os convites.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    async function accept(invitationId: string): Promise<void> {
        setPendingId(invitationId);
        setError(null);
        try {
            const conversation = await acceptStudentAssistantForkInvitation(invitationId);
            setItems((current) => current.filter((item) => item.id !== invitationId));
            onAccepted(conversation);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível aceitar o convite.");
        } finally {
            setPendingId(null);
        }
    }

    async function decline(invitationId: string): Promise<void> {
        setPendingId(invitationId);
        setError(null);
        try {
            await declineStudentAssistantForkInvitation(invitationId);
            setItems((current) => current.filter((item) => item.id !== invitationId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível recusar o convite.");
        } finally {
            setPendingId(null);
        }
    }

    if (!loading && items.length === 0 && !error) return null;

    return (
        <Surface as="section" className="space-y-3" variant="subtle">
            <SectionHeader
                description="Aceitar cria uma cópia privada e independente no mesmo contexto."
                title="Convites para continuar conversas"
            />
            {loading ? <InlineNotice>A carregar convites...</InlineNotice> : null}
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {items.length ? (
                <ul className="divide-y divide-studyflow-border/10">
                    {items.map((invitation) => (
                        <li className="flex min-w-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between" key={invitation.id}>
                            <div className="min-w-0">
                                <p className="break-words font-semibold">{invitation.conversationTitle}</p>
                                <p className="mt-1 break-all text-sm text-studyflow-text/70">
                                    {invitation.sender.email} · {invitation.context.label} · {invitation.turnCount} turnos
                                </p>
                                <p className="mt-1 text-xs text-studyflow-text/60">
                                    Expira em {new Date(invitation.expiresAt).toLocaleString("pt-PT")}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <button className="sf-button-primary" disabled={pendingId !== null} onClick={() => void accept(invitation.id)} type="button">
                                    {pendingId === invitation.id ? "A processar..." : "Aceitar"}
                                </button>
                                <button className="sf-button-secondary" disabled={pendingId !== null} onClick={() => void decline(invitation.id)} type="button">
                                    Recusar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}
        </Surface>
    );
}
