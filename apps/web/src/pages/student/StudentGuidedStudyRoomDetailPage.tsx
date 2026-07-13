/** Workspace do aluno numa sala guiada; a conversa IA vive no Assistente global. */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { OfficialMaterialFileActions } from "../../components/materials/OfficialMaterialFileActions.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    completeGuidedStudyRoom,
    getStudentGuidedStudyRoom,
    type GuidedStudyRoomParticipation,
    type StudentGuidedStudyRoomDetail,
    markGuidedStudyRoomViewed,
    rememberStudentContext,
} from "../../lib/apiClient.js";

export function StudentGuidedStudyRoomDetailPage({ classId, roomId }: { classId: string; roomId: string }) {
    const [room, setRoom] = useState<StudentGuidedStudyRoomDetail | null>(null);
    const [participation, setParticipation] = useState<GuidedStudyRoomParticipation | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [markViewedError, setMarkViewedError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [viewReloadToken, setViewReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setRoomError(null);
        setRoom(null);
        getStudentGuidedStudyRoom(classId, roomId)
            .then((nextRoom) => {
                if (!active) return;
                setRoom(nextRoom);
                setParticipation(nextRoom.myParticipation);
                void rememberStudentContext({ kind: "GUIDED_ROOM", contextId: roomId }).catch(() => undefined);
            })
            .catch((caught) => {
                if (active) setRoomError(caught instanceof Error ? caught.message : "Erro ao carregar a sala guiada.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [classId, reloadToken, roomId]);

    useEffect(() => {
        if (!room || room.status !== "OPEN") return;
        let active = true;
        setMarkViewedError(null);
        markGuidedStudyRoomViewed(classId, roomId)
            .then((nextParticipation) => { if (active) setParticipation(nextParticipation); })
            .catch((caught) => { if (active) setMarkViewedError(caught instanceof Error ? caught.message : "Não foi possível registar a visualização."); });
        return () => { active = false; };
    }, [classId, room?._id, room?.status, roomId, viewReloadToken]);

    async function complete(): Promise<void> {
        setSaving(true);
        setActionError(null);
        try {
            setParticipation(await completeGuidedStudyRoom(classId, roomId));
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Não foi possível concluir a sala.");
        } finally {
            setSaving(false);
        }
    }

    const closed = room?.status === "CLOSED";
    const assistantCanAsk = room
        ? room.assistantAvailability?.canAsk ?? room.aiAvailable
        : false;
    const assistantUnavailableReason = room?.assistantAvailability?.reason;
    return (
        <section className="space-y-6">
            <PageHeader
                title={room?.title ?? "Sala guiada"}
                description={room?.goal ?? "Atividade guiada pelo professor."}
                action={assistantCanAsk ? <a className="sf-button-secondary inline-flex" href={`/app/assistente/novo/GUIDED_ROOM/${roomId}`}>Perguntar ao Assistente</a> : undefined}
            />
            {actionError && room ? <InlineNotice tone="danger">{actionError}</InlineNotice> : null}
            {markViewedError && room ? <InlineNotice tone="attention">{markViewedError} <button className="underline" onClick={() => setViewReloadToken((value) => value + 1)} type="button">Tentar novamente</button></InlineNotice> : null}
            <AsyncStateBlock error={!room ? roomError ?? undefined : undefined} isEmpty={!room} isLoading={loading} emptyMessage="Sala guiada indisponível" onRetry={() => setReloadToken((value) => value + 1)}>
                {room ? <>
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={closed ? "neutral" : "brand"}>{closed ? "Encerrada · consulta" : "Aberta"}</StatusBadge>
                        {participation ? <StatusBadge tone={participation.status === "COMPLETED" ? "brand" : "neutral"}>{participation.status === "COMPLETED" ? "Concluída" : "Visualizada"}</StatusBadge> : null}
                    </div>
                    {!assistantCanAsk ? <InlineNotice>{assistantUnavailableReason === "ROOM_CLOSED" || room.status === "CLOSED" ? "A sala está encerrada; podes consultar o histórico, mas já não podes fazer novas perguntas." : assistantUnavailableReason === "AI_DISABLED" || !room.aiEnabled ? "O professor não ativou o Assistente nesta sala." : "Esta sala ainda não tem fontes processáveis para o Assistente."}</InlineNotice> : null}
                    <section className="sf-surface space-y-4">
                        <SectionHeader title="Instruções" />
                        <p className="whitespace-pre-wrap leading-6">{room.description}</p>
                        {room.startsAt || room.durationMinutes ? <p className="text-sm">{room.startsAt ? `Início previsto: ${new Date(room.startsAt).toLocaleString("pt-PT")}` : "Sem início agendado"}{room.durationMinutes ? ` · ${room.durationMinutes} minutos` : ""}</p> : null}
                        <div className="grid gap-3">{room.materials.map((material) => <article className="sf-surface-subtle space-y-2" key={material._id}><h3 className="font-semibold">{material.title}</h3>{material.textContent ? <p className="whitespace-pre-wrap text-sm">{material.textContent}</p> : null}{material.sourceUrl ? <a className="text-studyflow-brandText underline" href={material.sourceUrl} rel="noreferrer" target="_blank">Abrir referência</a> : null}<OfficialMaterialFileActions material={material} /></article>)}</div>
                        {room.officialTest ? <a className="sf-button-secondary inline-flex" href={`/app/disciplinas/${room.officialTest.subjectId}/testes`}>Realizar mini-teste: {room.officialTest.title}</a> : null}
                        {!closed && participation?.status !== "COMPLETED" ? <button className="sf-button-primary" disabled={saving} onClick={() => void complete()} type="button">{saving ? "A guardar..." : "Marcar como concluída"}</button> : null}
                        {room.officialTest && participation?.status !== "COMPLETED" ? <p className="text-sm text-studyflow-text/70">É necessário submeter pelo menos uma tentativa do mini-teste antes de concluir.</p> : null}
                    </section>
                    <InlineNotice tone="attention">As conversas do Assistente neste contexto podem ser consultadas pelo professor responsável, associadas à tua identidade.</InlineNotice>
                </> : null}
            </AsyncStateBlock>
        </section>
    );
}
