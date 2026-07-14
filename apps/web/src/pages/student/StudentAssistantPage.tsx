/** Página completa do Assistente com histórico agrupado por contexto. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import {
    createStudentAssistantConversation,
    getStudentAssistantContext,
    listStudentAssistantConversations,
    type StudentAssistantContext,
    type StudentAssistantContextKind,
    type StudentAssistantConversation,
} from "../../lib/apiClient.js";
import { StudentAssistantContextChooser } from "../../features/student-assistant/StudentAssistantContextChooser.js";
import { StudentAssistantConversationView } from "../../features/student-assistant/StudentAssistantConversationView.js";
import { StudentAssistantForkInvitations } from "../../features/student-assistant/StudentAssistantForkInvitations.js";

export function StudentAssistantPage() {
    const params = useParams();
    const navigate = useNavigate();
    const conversationId = params.conversationId;
    const contextKind = isContextKind(params.contextKind) ? params.contextKind : undefined;
    const contextId = params.contextId;
    const [conversations, setConversations] = useState<StudentAssistantConversation[]>([]);
    const [newContext, setNewContext] = useState<StudentAssistantContext | null>(null);
    const [archived, setArchived] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const refresh = () => {
        setLoading(true);
        return listStudentAssistantConversations({ status: archived ? "ARCHIVED" : "ACTIVE", limit: 50 })
            .then((page) => setConversations(page.items))
            .catch((caught) => setError(caught instanceof Error ? caught.message : "Não foi possível carregar as conversas."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { void refresh(); }, [archived]);
    useEffect(() => {
        if (!contextKind || !contextId) { setNewContext(null); return; }
        let active = true;
        getStudentAssistantContext(contextKind, contextId)
            .then((context) => { if (active) setNewContext(context); })
            .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Contexto indisponível."); });
        return () => { active = false; };
    }, [contextId, contextKind]);

    const groups = useMemo(() => {
        const map = new Map<string, StudentAssistantConversation[]>();
        for (const conversation of conversations) {
            const key = `${conversation.context.kind}:${conversation.context.id}`;
            map.set(key, [...(map.get(key) ?? []), conversation]);
        }
        return [...map.entries()];
    }, [conversations]);

    async function create(context: StudentAssistantContext): Promise<void> {
        setError(null);
        try {
            const conversation = await createStudentAssistantConversation({ kind: context.kind, id: context.id });
            await refresh();
            navigate(`/app/assistente/${conversation.id}`, { replace: true });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar a conversa.");
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader title="Assistente de estudo" description="Conversas organizadas pelo contexto em que estás a estudar." action={<button className="sf-button-primary" onClick={() => navigate("/app/assistente")} type="button">Nova conversa</button>} />
            <StudentAssistantForkInvitations
                onAccepted={(conversation) => {
                    setNotice("Fork criado. O histórico recebido já está disponível.");
                    void refresh();
                    navigate(`/app/assistente/${conversation.id}`);
                }}
            />
            {notice ? <InlineNotice>{notice}</InlineNotice> : null}
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <div className="grid min-h-[36rem] gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className={conversationId || newContext ? "hidden min-w-0 rounded-2xl border border-studyflow-border/10 bg-studyflow-card/20 p-3 lg:block" : "min-w-0 rounded-2xl border border-studyflow-border/10 bg-studyflow-card/20 p-3"} aria-label="Histórico de conversas"><div className="mb-3 flex gap-2"><button className={!archived ? "sf-button-primary flex-1" : "sf-button-secondary flex-1"} onClick={() => setArchived(false)} type="button">Ativas</button><button className={archived ? "sf-button-primary flex-1" : "sf-button-secondary flex-1"} onClick={() => setArchived(true)} type="button">Arquivo</button></div>{loading ? <InlineNotice>A carregar...</InlineNotice> : null}<div className="space-y-4">{groups.map(([key, items]) => <section key={key}><h2 className="mb-2 truncate text-xs font-semibold uppercase tracking-[.12em] text-studyflow-text/60">{items[0].context.access === "REVOKED" ? "Acesso terminado · " : ""}{items[0].context.label}</h2><div className="space-y-1">{items.map((conversation) => <button aria-current={conversation.id === conversationId ? "page" : undefined} className={conversation.id === conversationId ? "min-h-11 w-full truncate rounded-xl bg-studyflow-brand px-3 text-left text-sm font-semibold text-white" : "min-h-11 w-full truncate rounded-xl px-3 text-left text-sm font-semibold hover:bg-studyflow-card"} key={conversation.id} onClick={() => navigate(`/app/assistente/${conversation.id}`)} type="button">{conversation.title}</button>)}</div></section>)}</div></aside>
                <main className="min-w-0 rounded-2xl border border-studyflow-border/10 bg-studyflow-card/10 p-4 sm:p-6">{conversationId ? <><button className="mb-4 text-sm font-semibold text-studyflow-brandText underline lg:hidden" onClick={() => navigate("/app/assistente")} type="button">Voltar às conversas</button><StudentAssistantConversationView conversationId={conversationId} onChanged={() => void refresh()} onDeleted={(message) => { setNotice(message); void refresh(); navigate("/app/assistente", { replace: true }); }} variant="page" /></> : newContext ? <section className="space-y-4"><h2 className="text-xl font-bold">{newContext.label}</h2><p className="text-studyflow-text/70">{newContext.secondaryLabel}</p><p className="leading-6">A nova conversa ficará limitada às fontes autorizadas deste contexto.</p><button className="sf-button-primary" onClick={() => void create(newContext)} type="button">Começar conversa</button><button className="sf-button-secondary ml-2" onClick={() => navigate("/app/assistente")} type="button">Cancelar</button></section> : <StudentAssistantContextChooser onSelect={(context) => void create(context)} />}</main>
            </div>
        </section>
    );
}

function isContextKind(value: string | undefined): value is StudentAssistantContextKind {
    return value !== undefined && ["SUBJECT", "STUDY_AREA", "STUDY_GROUP", "STUDY_ROOM", "GUIDED_ROOM"].includes(value);
}
