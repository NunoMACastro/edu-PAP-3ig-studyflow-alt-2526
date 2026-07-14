/** Workspace único da sala com partilhas, conversa, notas e sessões. */
import { type FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { Breadcrumbs, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { StudyRoomChatPanel } from "../../features/study-room-messages/StudyRoomChatPanel.js";
import { listStudyRoomChatUnread } from "../../features/study-room-messages/study-room-chat-client.js";
import { StudyRoomSessionsPanel } from "../../features/study-room-sessions/StudyRoomSessionsPanel.js";
import {
    addStudyRoomMember,
    getCurrentUser,
    getStudyRoom,
    rememberStudentContext,
    type StudyRoom,
} from "../../lib/apiClient.js";
import { RoomSharesPage } from "./RoomSharesPage.js";

export type StudyRoomWorkspaceTab = "partilhas" | "conversar" | "notas" | "sessoes";

export function StudentStudyRoomWorkspacePage({
    roomId,
    tab = "partilhas",
}: {
    roomId: string;
    tab?: StudyRoomWorkspaceTab;
}) {
    const base = `/app/salas/${roomId}`;
    const [room, setRoom] = useState<StudyRoom | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [memberOpen, setMemberOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [savingMember, setSavingMember] = useState(false);
    const [memberError, setMemberError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([getStudyRoom(roomId), getCurrentUser(), listStudyRoomChatUnread()])
            .then(([nextRoom, user, unread]) => {
                if (!active) return;
                setRoom(nextRoom);
                setCurrentUserId(user.id);
                setUnreadCount(unread.find((item) => item.roomId === roomId)?.unreadCount ?? 0);
                void rememberStudentContext({ kind: "STUDY_ROOM", contextId: roomId }).catch(() => undefined);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Não foi possível abrir a sala.");
            });
        const handleRead = (event: Event) => {
            const detail = (event as CustomEvent<{ roomId?: string }>).detail;
            if (detail?.roomId === roomId) setUnreadCount(0);
        };
        window.addEventListener("student-study-room-chat-read", handleRead);
        return () => {
            active = false;
            window.removeEventListener("student-study-room-chat-read", handleRead);
        };
    }, [roomId]);

    async function handleAddMember(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!memberEmail.trim() || savingMember) return;
        setSavingMember(true);
        setMemberError(null);
        try {
            setRoom(await addStudyRoomMember(roomId, memberEmail));
            setMemberEmail("");
            setMemberOpen(false);
        } catch (caught) {
            setMemberError(caught instanceof Error ? caught.message : "Não foi possível adicionar o aluno.");
        } finally {
            setSavingMember(false);
        }
    }

    if (error) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (!room) return <InlineNotice>A carregar sala...</InlineNotice>;
    const createdByCurrentStudent = room.ownerStudentId === currentUserId;

    return (
        <section className="space-y-6">
            <Breadcrumbs items={[{ label: "Em grupo", href: "/app/em-grupo?vista=salas" }, { label: room.name }]} />
            <PageHeader
                action={<>
                    <a className="sf-button-secondary" href={`/app/assistente/novo/STUDY_ROOM/${roomId}`}>Abrir Assistente</a>
                    <button className="sf-button-secondary" onClick={() => { setMemberError(null); setMemberOpen(true); }} type="button">Adicionar membro</button>
                </>}
                description={room.description ?? (room.disciplineName ? `Sala de ${room.disciplineName}.` : "Espaço de estudo colaborativo entre alunos.")}
                title={room.name}
            />
            <div className="flex flex-wrap gap-2" aria-label="Informação da sala">
                <StatusBadge>{createdByCurrentStudent ? "Criada por ti" : "Criada por outro aluno"}</StatusBadge>
                <StatusBadge tone="brand">Partilhada · {memberLabel(room.memberIds.length)}</StatusBadge>
            </div>
            <WorkspaceTabs items={[
                { label: "Partilhas", href: base, active: tab === "partilhas" },
                { label: unreadCount > 0 ? `Conversar (${unreadCount})` : "Conversar", href: `${base}/conversar`, active: tab === "conversar" },
                { label: "Notas", href: `${base}/notas`, active: tab === "notas" },
                { label: "Sessões", href: `${base}/sessoes`, active: tab === "sessoes" },
            ]} />
            {tab === "partilhas" ? <RoomSharesPage embedded roomId={roomId} /> : null}
            {tab === "conversar" ? <StudyRoomChatPanel roomId={roomId} /> : null}
            {tab === "notas" ? <RoomSharesPage embedded mode="notes" roomId={roomId} /> : null}
            {tab === "sessoes" ? <StudyRoomSessionsPanel roomId={roomId} /> : null}
            <SidePanel
                closeDisabled={savingMember}
                description="Convida outro aluno através do email da respetiva conta."
                onClose={() => setMemberOpen(false)}
                open={memberOpen}
                title="Adicionar membro"
            >
                <form className="space-y-4" onSubmit={(event) => void handleAddMember(event)}>
                    {memberError ? <InlineNotice tone="danger">{memberError}</InlineNotice> : null}
                    <FormField id="study-room-member-email" label="Email do aluno">
                        <input autoComplete="email" onChange={(event) => setMemberEmail(event.target.value)} required type="email" value={memberEmail} />
                    </FormField>
                    <button className="sf-button-primary" disabled={savingMember || !memberEmail.trim()}>
                        {savingMember ? "A adicionar..." : "Adicionar"}
                    </button>
                </form>
            </SidePanel>
        </section>
    );
}

function memberLabel(count: number): string {
    return count === 1 ? "1 membro" : `${count} membros`;
}
