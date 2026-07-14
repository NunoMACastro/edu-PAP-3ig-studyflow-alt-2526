/** Workspace de grupo com conversa, notas e sessões em rotas estáveis. */
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { Breadcrumbs, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { FormField } from "../../components/forms/FormField.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { StudyGroupChatPanel } from "../../features/study-group-messages/StudyGroupChatPanel.js";
import { StudyGroupNotesPanel } from "../../features/study-group-messages/StudyGroupNotesPanel.js";
import { StudyGroupSessionsPanel } from "../../features/study-group-sessions/study-group-sessions-panel.js";
import {
    addStudyGroupMember,
    listStudyGroups,
    type StudyGroup,
} from "../../features/study-groups/create-study-group.js";
import { listStudyGroupChatUnread } from "../../features/study-group-messages/study-group-chat-client.js";
import { getCurrentUser, rememberStudentContext } from "../../lib/apiClient.js";

type GroupWorkspaceTab = "mensagens" | "notas" | "sessoes";

/** Mantém bookmarks antigos e aplica owner-only também na apresentação da ação. */
export function StudentGroupWorkspacePage({
    groupId,
    tab = "mensagens",
}: {
    groupId: string;
    tab?: GroupWorkspaceTab;
}) {
    const base = `/app/grupos/${groupId}`;
    const [group, setGroup] = useState<StudyGroup | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [memberPanelOpen, setMemberPanelOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);
    const [memberError, setMemberError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([listStudyGroups(), getCurrentUser(), listStudyGroupChatUnread()])
            .then(([groups, user, unread]) => {
                const nextGroup = groups.find((item) => item._id === groupId);
                if (!nextGroup) throw new Error("Grupo não encontrado.");
                if (!active) return;
                setGroup(nextGroup);
                setCurrentUserId(user.id);
                setUnreadCount(unread.find((item) => item.groupId === groupId)?.unreadCount ?? 0);
                void rememberStudentContext({ kind: "STUDY_GROUP", contextId: groupId }).catch(() => undefined);
            })
            .catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível abrir o grupo."));
        const handleRead = (event: Event) => {
            const detail = (event as CustomEvent<{ groupId?: string }>).detail;
            if (detail?.groupId === groupId) setUnreadCount(0);
        };
        window.addEventListener("student-study-group-chat-read", handleRead);
        return () => {
            active = false;
            window.removeEventListener("student-study-group-chat-read", handleRead);
        };
    }, [groupId]);

    async function handleAddMember(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!memberEmail.trim() || addingMember) return;
        setAddingMember(true);
        setMemberError(null);
        try {
            const updated = await addStudyGroupMember(groupId, memberEmail);
            setGroup(updated);
            setMemberEmail("");
            setMemberPanelOpen(false);
        } catch (caught) {
            setMemberError(caught instanceof Error ? caught.message : "Não foi possível adicionar o aluno.");
        } finally {
            setAddingMember(false);
        }
    }

    if (error) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (!group) return <InlineNotice>A carregar grupo...</InlineNotice>;
    const isOwner = group.ownerStudentId === currentUserId;
    return (
        <section className="space-y-6">
            <Breadcrumbs items={[{ label: "Em grupo", href: "/app/em-grupo" }, { label: group.title }]} />
            <PageHeader
                action={isOwner ? <button className="sf-button-secondary" onClick={() => { setMemberError(null); setMemberPanelOpen(true); }} type="button">Adicionar membro</button> : undefined}
                description="Conversa em tempo real, notas e sessões partilham este contexto."
                title={group.title}
            />
            <WorkspaceTabs items={[
                { label: unreadCount > 0 ? `Conversar (${unreadCount})` : "Conversar", href: `${base}/mensagens`, active: tab === "mensagens" },
                { label: "Notas", href: `${base}/notas`, active: tab === "notas" },
                { label: "Sessões", href: `${base}/sessoes`, active: tab === "sessoes" },
            ]} />
            {tab === "mensagens" ? <StudyGroupChatPanel groupId={groupId} /> : null}
            {tab === "notas" ? <StudyGroupNotesPanel groupId={groupId} /> : null}
            {tab === "sessoes" ? <StudyGroupSessionsPanel contextLocked initialGroupId={groupId} /> : null}
            <SidePanel
                closeDisabled={addingMember}
                description="Indica o email da conta de aluno que queres juntar ao grupo."
                onClose={() => setMemberPanelOpen(false)}
                open={memberPanelOpen}
                title="Adicionar membro"
            >
                <form className="space-y-4" onSubmit={(event) => void handleAddMember(event)}>
                    {memberError ? <InlineNotice tone="danger">{memberError}</InlineNotice> : null}
                    <FormField id="study-group-member-email" label="Email do aluno">
                        <input autoComplete="email" onChange={(event) => setMemberEmail(event.target.value)} required type="email" value={memberEmail} />
                    </FormField>
                    <button className="sf-button-primary" disabled={addingMember || !memberEmail.trim()}>{addingMember ? "A adicionar..." : "Adicionar"}</button>
                </form>
            </SidePanel>
        </section>
    );
}
