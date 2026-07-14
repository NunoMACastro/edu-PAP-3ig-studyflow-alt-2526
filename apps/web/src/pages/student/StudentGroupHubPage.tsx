/** Hub colaborativo focado em salas dos alunos e atividades do professor. */
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { ContextCard, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { listStudyRoomChatUnread } from "../../features/study-room-messages/study-room-chat-client.js";
import {
    createStudyRoom,
    getCurrentUser,
    listAllStudentGuidedStudyRooms,
    listStudyRooms,
    type StudentGuidedStudyRoomListItem,
    type StudyRoom,
} from "../../lib/apiClient.js";
import { StudentGuidedStudyRoomsPage } from "./StudentGuidedStudyRoomsPage.js";

export function StudentGroupHubPage() {
    const [searchParams] = useSearchParams();
    const requestedView = searchParams.get("vista");
    const view = requestedView === "professor" || requestedView === "salas"
        ? requestedView
        : undefined;
    const [guided, setGuided] = useState<StudentGuidedStudyRoomListItem[]>([]);
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roomOpen, setRoomOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [description, setDescription] = useState("");

    async function refresh(): Promise<void> {
        const [guidedPage, nextRooms, user, unread] = await Promise.all([
            listAllStudentGuidedStudyRooms({ status: "OPEN", limit: 6 }),
            listStudyRooms(),
            getCurrentUser(),
            listStudyRoomChatUnread(),
        ]);
        setGuided(guidedPage.items);
        setRooms(nextRooms);
        setCurrentUserId(user.id);
        setUnreadByRoom(Object.fromEntries(unread.map((item) => [item.roomId, item.unreadCount])));
    }

    useEffect(() => {
        let active = true;
        refresh()
            .catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível carregar os espaços de estudo."))
            .finally(() => active && setLoading(false));
        const handleRead = (event: Event) => {
            const roomId = (event as CustomEvent<{ roomId?: string }>).detail?.roomId;
            if (roomId) setUnreadByRoom((current) => ({ ...current, [roomId]: 0 }));
        };
        window.addEventListener("student-study-room-chat-read", handleRead);
        return () => {
            active = false;
            window.removeEventListener("student-study-room-chat-read", handleRead);
        };
    }, []);

    async function submitRoom(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await createStudyRoom({
                name: title,
                type: discipline ? "SUBJECT" : "FREE",
                disciplineName: discipline || undefined,
                description,
            });
            await refresh();
            resetForm();
            setRoomOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar a sala.");
        } finally {
            setSaving(false);
        }
    }

    function resetForm(): void {
        setTitle("");
        setDiscipline("");
        setDescription("");
    }

    if (requestedView === "grupos") {
        return <Navigate replace to="/app/em-grupo?vista=salas" />;
    }
    if (view === "professor") {
        return (
            <section className="space-y-6">
                <PageHeader title="Em grupo" description="Atividades guiadas pelo professor, abertas e em histórico." />
                <WorkspaceTabs items={groupTabs("professor")} />
                <StudentGuidedStudyRoomsPage embedded />
            </section>
        );
    }

    return (
        <section className="space-y-8">
            <PageHeader title="Em grupo" description="Salas partilhadas entre alunos e atividades guiadas pelo professor." />
            <WorkspaceTabs items={groupTabs(view)} />
            {loading ? <InlineNotice>A carregar espaços...</InlineNotice> : null}
            {error && !roomOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error ? (
                <>
                    {!view ? (
                        <GroupSection
                            action={<Link className="sf-button-secondary" to="/app/em-grupo?vista=professor">Ver atividades</Link>}
                            empty="Não há atividades guiadas abertas."
                            title="Com o professor"
                        >
                            {guided.map((room) => (
                                <ContextCard
                                    actionLabel="Abrir atividade"
                                    description={`${room.className}${room.subjectName ? ` · ${room.subjectName}` : ""}`}
                                    href={`/app/turmas/${room.classId}/salas-guiadas/${room._id}`}
                                    key={room._id}
                                    meta={<div className="flex flex-wrap gap-2"><StatusBadge>Criada pelo professor</StatusBadge></div>}
                                    title={room.title}
                                />
                            ))}
                        </GroupSection>
                    ) : null}
                    {!view || view === "salas" ? (
                        <GroupSection
                            action={<button className="sf-button-secondary" onClick={() => { resetForm(); setRoomOpen(true); }} type="button">Nova sala</button>}
                            empty="Ainda não tens salas partilhadas."
                            title="Salas partilhadas"
                        >
                            {rooms.map((room) => (
                                <ContextCard
                                    actionLabel="Abrir sala"
                                    description={room.description ?? room.disciplineName ?? "Espaço de estudo colaborativo."}
                                    href={`/app/salas/${room._id}`}
                                    key={room._id}
                                    meta={<div className="flex flex-wrap gap-2">
                                        <StatusBadge>{room.ownerStudentId === currentUserId ? "Criada por ti" : "Criada por outro aluno"}</StatusBadge>
                                        <StatusBadge tone={unreadByRoom[room._id] > 0 ? "attention" : "brand"}>Partilhada · {memberLabel(room.memberIds.length)}{unreadByRoom[room._id] > 0 ? ` · ${unreadByRoom[room._id]} por ler` : ""}</StatusBadge>
                                    </div>}
                                    title={room.name}
                                />
                            ))}
                        </GroupSection>
                    ) : null}
                </>
            ) : null}
            <SidePanel closeDisabled={saving} description="Cria uma sala para conversar, guardar notas, agendar sessões, partilhar fontes e usar o Assistente." onClose={() => setRoomOpen(false)} open={roomOpen} title="Nova sala partilhada">
                <ContextForm
                    description={description}
                    discipline={discipline}
                    error={error}
                    onDescription={setDescription}
                    onDiscipline={setDiscipline}
                    onSubmit={submitRoom}
                    onTitle={setTitle}
                    saving={saving}
                    submitLabel="Criar sala"
                    title={title}
                />
            </SidePanel>
        </section>
    );
}

function groupTabs(active?: "professor" | "salas") {
    return [
        { label: "Com o professor", href: "/app/em-grupo?vista=professor", active: active === "professor" },
        { label: "Salas partilhadas", href: "/app/em-grupo?vista=salas", active: active === "salas" },
    ];
}

function GroupSection({ title, empty, action, children }: { title: string; empty: string; action: ReactNode; children: ReactNode[] }) {
    return <section className="space-y-4"><SectionHeader action={action} title={title} />{children.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div> : <EmptyState description={empty} icon="users" title={empty} />}</section>;
}

function ContextForm(props: { error: string | null; onSubmit: (event: FormEvent) => Promise<void>; saving: boolean; title: string; discipline: string; description: string; onTitle: (value: string) => void; onDiscipline: (value: string) => void; onDescription: (value: string) => void; submitLabel: string }) {
    return <form className="space-y-4" onSubmit={(event) => void props.onSubmit(event)}>{props.error ? <InlineNotice tone="danger">{props.error}</InlineNotice> : null}<FormField id={`${props.submitLabel}-title`} label="Nome"><input required minLength={3} value={props.title} onChange={(event) => props.onTitle(event.target.value)} /></FormField><FormField id={`${props.submitLabel}-discipline`} label="Disciplina" helpText="Opcional"><input value={props.discipline} onChange={(event) => props.onDiscipline(event.target.value)} /></FormField><FormField id={`${props.submitLabel}-description`} label="Descrição" helpText="Opcional"><textarea rows={3} value={props.description} onChange={(event) => props.onDescription(event.target.value)} /></FormField><button className="sf-button-primary" disabled={props.saving || props.title.trim().length < 3} type="submit">{props.saving ? "A guardar..." : props.submitLabel}</button></form>;
}

function memberLabel(count: number): string {
    return count === 1 ? "1 membro" : `${count} membros`;
}
