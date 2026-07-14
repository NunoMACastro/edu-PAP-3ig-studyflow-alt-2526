/** Agregador das salas guiadas de todas as turmas oficiais do aluno. */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, StatusBadge, Toolbar } from "../../components/ui/CalmUi.js";
import {
    listAllStudentGuidedStudyRooms,
    type GuidedStudyRoom,
    type StudentGuidedStudyRoomListItem,
} from "../../lib/apiClient.js";

export function StudentGuidedStudyRoomsPage({ classId, embedded = false }: { classId?: string; embedded?: boolean } = {}) {
    const [status, setStatus] = useState<GuidedStudyRoom["status"]>(() =>
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("status") === "CLOSED"
            ? "CLOSED"
            : "OPEN",
    );
    const [rooms, setRooms] = useState<StudentGuidedStudyRoomListItem[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listAllStudentGuidedStudyRooms({ status, limit: 24, classId })
            .then((page) => {
                if (!active) return;
                setRooms(page.items);
                setNextCursor(page.nextCursor);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar salas guiadas.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, reloadToken, status]);

    async function loadMore(): Promise<void> {
        if (!nextCursor) return;
        setLoadingMore(true);
        setError(null);
        try {
            const page = await listAllStudentGuidedStudyRooms({ status, cursor: nextCursor, limit: 24, classId });
            setRooms((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar mais salas guiadas.");
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <section className="space-y-6">
            {!embedded ? <PageHeader title="Salas guiadas" description="Atividades orientadas pelos professores em todas as tuas turmas oficiais." /> : null}
            <Toolbar ariaLabel="Escolher salas guiadas">
                <button className={status === "OPEN" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("OPEN")} type="button">Abertas</button>
                <button className={status === "CLOSED" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("CLOSED")} type="button">Histórico</button>
            </Toolbar>
            {error && rooms.length > 0 ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <AsyncStateBlock error={rooms.length === 0 ? error ?? undefined : undefined} isEmpty={rooms.length === 0} isLoading={loading} emptyMessage={status === "OPEN" ? "Não há salas guiadas abertas" : "Ainda não existe histórico"} onRetry={() => setReloadToken((value) => value + 1)}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {rooms.map((room) => (
                        <article className="sf-list-card space-y-3" key={room._id}>
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold">{room.title}</h2>
                                <StatusBadge tone={room.myParticipation?.status === "COMPLETED" ? "brand" : "neutral"}>
                                    {room.myParticipation?.status === "COMPLETED" ? "Concluída" : room.myParticipation ? "Visualizada" : room.status === "OPEN" ? "Por iniciar" : "Não iniciada"}
                                </StatusBadge>
                            </div>
                            <p className="text-sm font-medium">{room.className}{room.subjectName ? ` · ${room.subjectName}` : ""}</p>
                            {room.goal ? <p className="text-sm">{room.goal}</p> : null}
                            <p className="line-clamp-3 text-sm text-studyflow-text/70">{room.description}</p>
                            {room.startsAt || room.durationMinutes ? <p className="text-xs text-studyflow-text/65">{room.startsAt ? `Início: ${new Date(room.startsAt).toLocaleString("pt-PT")}` : "Sem início agendado"}{room.durationMinutes ? ` · ${room.durationMinutes} minutos` : ""}</p> : null}
                            <a className="sf-button-primary inline-flex" href={`/app/turmas/${room.classId}/salas-guiadas/${room._id}`}>{room.status === "OPEN" ? "Abrir atividade" : "Consultar histórico"}</a>
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
            {nextCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar mais"}</button> : null}
        </section>
    );
}
