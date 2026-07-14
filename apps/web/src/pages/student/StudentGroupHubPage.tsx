/** Hub colaborativo que preserva os modelos existentes sem os fundir. */
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { ContextCard, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { createStudyGroup, listStudyGroups, type StudyGroup } from "../../features/study-groups/create-study-group.js";
import { listStudyGroupChatUnread } from "../../features/study-group-messages/study-group-chat-client.js";
import { createStudyRoom, listAllStudentGuidedStudyRooms, listStudyRooms, type StudentGuidedStudyRoomListItem, type StudyRoom } from "../../lib/apiClient.js";
import { StudentGuidedStudyRoomsPage } from "./StudentGuidedStudyRoomsPage.js";

export function StudentGroupHubPage() {
    const [searchParams] = useSearchParams();
    const view = searchParams.get("vista");
    const [guided, setGuided] = useState<StudentGuidedStudyRoomListItem[]>([]);
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [unreadByGroup, setUnreadByGroup] = useState<Record<string, number>>({});
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupOpen, setGroupOpen] = useState(false);
    const [roomOpen, setRoomOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [description, setDescription] = useState("");

    async function refresh(): Promise<void> {
        const [guidedPage, nextGroups, nextRooms, unread] = await Promise.all([
            listAllStudentGuidedStudyRooms({ status: "OPEN", limit: 6 }),
            listStudyGroups(),
            listStudyRooms(),
            listStudyGroupChatUnread(),
        ]);
        setGuided(guidedPage.items);
        setGroups(nextGroups);
        setRooms(nextRooms);
        setUnreadByGroup(Object.fromEntries(unread.map((item) => [item.groupId, item.unreadCount])));
    }

    useEffect(() => {
        let active = true;
        refresh().catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível carregar os espaços de grupo.")).finally(() => active && setLoading(false));
        const handleRead = (event: Event) => {
            const groupId = (event as CustomEvent<{ groupId?: string }>).detail?.groupId;
            if (groupId) setUnreadByGroup((current) => ({ ...current, [groupId]: 0 }));
        };
        window.addEventListener("student-study-group-chat-read", handleRead);
        return () => {
            active = false;
            window.removeEventListener("student-study-group-chat-read", handleRead);
        };
    }, []);

    async function submitGroup(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await createStudyGroup({ title, disciplineName: discipline || undefined, description });
            await refresh();
            resetForm();
            setGroupOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar o grupo.");
        } finally {
            setSaving(false);
        }
    }

    async function submitRoom(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await createStudyRoom({ name: title, type: discipline ? "SUBJECT" : "FREE", disciplineName: discipline || undefined, description });
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

    if (view === "professor") {
        return <section className="space-y-6"><PageHeader title="Em grupo" description="Atividades guiadas pelo professor, abertas e em histórico." /><WorkspaceTabs items={groupTabs("professor")} /><StudentGuidedStudyRoomsPage embedded /></section>;
    }

    return (
        <section className="space-y-8">
            <PageHeader title="Em grupo" description="Atividades do professor, grupos de alunos e salas partilhadas, cada um com o seu contexto." />
            <WorkspaceTabs items={groupTabs(view === "grupos" || view === "salas" ? view : undefined)} />
            {loading ? <InlineNotice>A carregar espaços...</InlineNotice> : null}
            {error && !groupOpen && !roomOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error ? (
                <>
                    {!view ? <GroupSection title="Com o professor" empty="Não há atividades guiadas abertas." action={<Link className="sf-button-secondary" to="/app/em-grupo?vista=professor">Ver atividades</Link>}>
                        {guided.map((room) => <ContextCard actionLabel="Abrir atividade" description={`${room.className}${room.subjectName ? ` · ${room.subjectName}` : ""}`} href={`/app/turmas/${room.classId}/salas-guiadas/${room._id}`} key={room._id} title={room.title} />)}
                    </GroupSection> : null}
                    {!view || view === "grupos" ? <GroupSection title="Grupos" empty="Ainda não participas em grupos." action={<button className="sf-button-secondary" onClick={() => { resetForm(); setGroupOpen(true); }} type="button">Novo grupo</button>}>
                        {groups.map((group) => <ContextCard actionLabel="Abrir grupo" description={group.disciplineName ?? group.description} href={`/app/grupos/${group._id}`} key={group._id} meta={unreadByGroup[group._id] > 0 ? <StatusBadge tone="attention">{unreadByGroup[group._id]} por ler</StatusBadge> : undefined} title={group.title} />)}
                    </GroupSection> : null}
                    {!view || view === "salas" ? <GroupSection title="Salas partilhadas" empty="Ainda não tens salas partilhadas." action={<button className="sf-button-secondary" onClick={() => { resetForm(); setRoomOpen(true); }} type="button">Nova sala</button>}>
                        {rooms.map((room) => <ContextCard actionLabel="Abrir sala" description={room.description} href={`/app/salas/${room._id}`} key={room._id} title={room.name} />)}
                    </GroupSection> : null}
                </>
            ) : null}
            <SidePanel closeDisabled={saving} description="Cria um espaço para mensagens, notas, sessões e Assistente de estudo." onClose={() => setGroupOpen(false)} open={groupOpen} title="Novo grupo">
                <ContextForm error={error} onSubmit={submitGroup} saving={saving} title={title} discipline={discipline} description={description} onTitle={setTitle} onDiscipline={setDiscipline} onDescription={setDescription} submitLabel="Criar grupo" />
            </SidePanel>
            <SidePanel closeDisabled={saving} description="Cria uma sala para membros, partilhas e Assistente baseado nas fontes da sala." onClose={() => setRoomOpen(false)} open={roomOpen} title="Nova sala partilhada">
                <ContextForm error={error} onSubmit={submitRoom} saving={saving} title={title} discipline={discipline} description={description} onTitle={setTitle} onDiscipline={setDiscipline} onDescription={setDescription} submitLabel="Criar sala" />
            </SidePanel>
        </section>
    );
}

function groupTabs(active?: "professor" | "grupos" | "salas") {
    return [
        { label: "Com o professor", href: "/app/em-grupo?vista=professor", active: active === "professor" },
        { label: "Grupos", href: "/app/em-grupo?vista=grupos", active: active === "grupos" },
        { label: "Salas partilhadas", href: "/app/em-grupo?vista=salas", active: active === "salas" },
    ];
}

function GroupSection({ title, empty, action, children }: { title: string; empty: string; action: ReactNode; children: ReactNode[] }) {
    return <section className="space-y-4"><SectionHeader action={action} title={title} />{children.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div> : <EmptyState description={empty} icon="users" title={empty} />}</section>;
}

function ContextForm(props: { error: string | null; onSubmit: (event: FormEvent) => Promise<void>; saving: boolean; title: string; discipline: string; description: string; onTitle: (value: string) => void; onDiscipline: (value: string) => void; onDescription: (value: string) => void; submitLabel: string }) {
    return <form className="space-y-4" onSubmit={(event) => void props.onSubmit(event)}>{props.error ? <InlineNotice tone="danger">{props.error}</InlineNotice> : null}<FormField id={`${props.submitLabel}-title`} label="Nome"><input required minLength={3} value={props.title} onChange={(event) => props.onTitle(event.target.value)} /></FormField><FormField id={`${props.submitLabel}-discipline`} label="Disciplina" helpText="Opcional"><input value={props.discipline} onChange={(event) => props.onDiscipline(event.target.value)} /></FormField><FormField id={`${props.submitLabel}-description`} label="Descrição" helpText="Opcional"><textarea rows={3} value={props.description} onChange={(event) => props.onDescription(event.target.value)} /></FormField><button className="sf-button-primary" disabled={props.saving || props.title.trim().length < 3} type="submit">{props.saving ? "A guardar..." : props.submitLabel}</button></form>;
}
