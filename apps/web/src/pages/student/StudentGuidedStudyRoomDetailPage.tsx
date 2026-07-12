/** Workspace do aluno numa sala guiada, incluindo participação e histórico. */
import { type FormEvent, useEffect, useState } from "react";
import { AiConsentGate } from "../../components/ai/AiConsentGate.js";
import { PageHeader } from "../../components/PageHeader.js";
import { OfficialMaterialFileActions } from "../../components/materials/OfficialMaterialFileActions.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    askGuidedStudyRoomAi,
    completeGuidedStudyRoom,
    getStudentGuidedStudyRoom,
    type GuidedStudyRoomAiPage,
    type StudentGuidedStudyRoomDetail,
    type GuidedStudyRoomParticipation,
    listStudentGuidedStudyRoomAi,
    markGuidedStudyRoomViewed,
} from "../../lib/apiClient.js";

export function StudentGuidedStudyRoomDetailPage({ classId, roomId }: { classId: string; roomId: string }) {
    const [room, setRoom] = useState<StudentGuidedStudyRoomDetail | null>(null);
    const [participation, setParticipation] = useState<GuidedStudyRoomParticipation | null>(null);
    const [history, setHistory] = useState<GuidedStudyRoomAiPage>({ items: [], nextCursor: null });
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [markViewedError, setMarkViewedError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [historyReloadToken, setHistoryReloadToken] = useState(0);
    const [viewReloadToken, setViewReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setRoomError(null);
        setRoom(null);
        setHistoryLoading(true);
        setHistoryError(null);
        setHistory({ items: [], nextCursor: null });
        getStudentGuidedStudyRoom(classId, roomId)
            .then((nextRoom) => {
                if (!active) return;
                setRoom(nextRoom);
                setParticipation(nextRoom.myParticipation);
            })
            .catch((caught) => {
                if (active) setRoomError(caught instanceof Error ? caught.message : "Erro ao carregar a sala guiada.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, reloadToken, roomId]);

    useEffect(() => {
        if (!room) return;
        let active = true;
        setHistoryLoading(true);
        setHistoryError(null);
        setHistory({ items: [], nextCursor: null });
        listStudentGuidedStudyRoomAi(classId, roomId)
            .then((nextHistory) => {
                if (active) setHistory(nextHistory);
            })
            .catch((caught) => {
                if (active) setHistoryError(caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.");
            })
            .finally(() => {
                if (active) setHistoryLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, historyReloadToken, room?._id, roomId]);

    useEffect(() => {
        if (!room || room.status !== "OPEN") return;
        let active = true;
        setMarkViewedError(null);
        markGuidedStudyRoomViewed(classId, roomId)
            .then((nextParticipation) => {
                if (active) setParticipation(nextParticipation);
            })
            .catch((caught) => {
                if (active) setMarkViewedError(caught instanceof Error ? caught.message : "Não foi possível registar a visualização.");
            });
        return () => {
            active = false;
        };
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

    async function ask(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!question.trim()) return;
        setSaving(true);
        setActionError(null);
        try {
            const answer = await askGuidedStudyRoomAi(classId, roomId, question.trim());
            setHistory((current) => ({ ...current, items: [answer, ...current.items] }));
            setQuestion("");
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Não foi possível perguntar à IA.");
        } finally {
            setSaving(false);
        }
    }

    async function loadMore(): Promise<void> {
        if (!history.nextCursor) return;
        setLoadingMore(true);
        setHistoryError(null);
        try {
            const next = await listStudentGuidedStudyRoomAi(classId, roomId, history.nextCursor);
            setHistory((current) => ({ items: [...current.items, ...next.items], nextCursor: next.nextCursor }));
        } catch (caught) {
            setHistoryError(caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.");
        } finally {
            setLoadingMore(false);
        }
    }

    const closed = room?.status === "CLOSED";
    return (
        <section className="space-y-6">
            <PageHeader title={room?.title ?? "Sala guiada"} description={room?.goal ?? "Atividade guiada pelo professor."} />
            {actionError && room ? <InlineNotice tone="danger">{actionError}</InlineNotice> : null}
            {markViewedError && room ? (
                <InlineNotice tone="attention">
                    {markViewedError} <button className="underline" onClick={() => setViewReloadToken((value) => value + 1)} type="button">Tentar novamente</button>
                </InlineNotice>
            ) : null}
            <AsyncStateBlock error={!room ? roomError ?? undefined : undefined} isEmpty={!room} isLoading={loading} emptyMessage="Sala guiada indisponível" onRetry={() => setReloadToken((value) => value + 1)}>
                {room ? (
                    <>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge tone={closed ? "neutral" : "brand"}>{closed ? "Encerrada · consulta" : "Aberta"}</StatusBadge>
                            {participation ? <StatusBadge tone={participation.status === "COMPLETED" ? "brand" : "neutral"}>{participation.status === "COMPLETED" ? "Concluída" : "Visualizada"}</StatusBadge> : null}
                        </div>
                        <section className="sf-surface space-y-4">
                            <SectionHeader title="Instruções" />
                            <p className="whitespace-pre-wrap leading-6">{room.description}</p>
                            {room.startsAt || room.durationMinutes ? <p className="text-sm">{room.startsAt ? `Início previsto: ${new Date(room.startsAt).toLocaleString("pt-PT")}` : "Sem início agendado"}{room.durationMinutes ? ` · ${room.durationMinutes} minutos` : ""}</p> : null}
                            <div className="grid gap-3">{room.materials.map((material) => <article className="sf-surface-subtle space-y-2" key={material._id}><h3 className="font-semibold">{material.title}</h3>{material.textContent ? <p className="whitespace-pre-wrap text-sm">{material.textContent}</p> : null}{material.sourceUrl ? <a className="text-studyflow-brandText underline" href={material.sourceUrl} rel="noreferrer" target="_blank">Abrir referência</a> : null}<OfficialMaterialFileActions material={material} /></article>)}</div>
                            {room.officialTest ? <a className="sf-button-secondary inline-flex" href={`/app/disciplinas/${room.officialTest.subjectId}/testes`}>Realizar mini-teste: {room.officialTest.title}</a> : null}
                            {!closed && participation?.status !== "COMPLETED" ? <button className="sf-button-primary" disabled={saving} onClick={() => void complete()} type="button">{saving ? "A guardar..." : "Marcar como concluída"}</button> : null}
                            {room.officialTest && participation?.status !== "COMPLETED" ? <p className="text-sm text-studyflow-text/70">É necessário submeter pelo menos uma tentativa do mini-teste antes de concluir.</p> : null}
                        </section>
                        <section className="sf-surface space-y-4">
                            <SectionHeader title="IA da sala" description="Usa apenas materiais selecionados e pode aplicar a voz pedagógica configurada pelo professor." />
                            <InlineNotice tone="attention">As perguntas e respostas desta sala podem ser consultadas pelo professor responsável, associadas à tua identidade.</InlineNotice>
                            {!closed && room.aiAvailable ? (
                                <AiConsentGate description="Aceita o tratamento CLASS_AI para usar a IA supervisionada desta sala." purpose="CLASS_AI">
                                    <form className="space-y-3" onSubmit={(event) => void ask(event)}>
                                        <label className="block" htmlFor="guided-room-ai-question">Pergunta<textarea id="guided-room-ai-question" maxLength={1000} minLength={2} onChange={(event) => setQuestion(event.target.value)} value={question} /></label>
                                        <button className="sf-button-primary" disabled={saving || question.trim().length < 2}>{saving ? "A responder..." : "Perguntar à IA"}</button>
                                    </form>
                                </AiConsentGate>
                            ) : <InlineNotice>{closed ? "A sala está encerrada; o histórico permanece disponível." : "A IA não está disponível nesta sala."}</InlineNotice>}
                            {historyLoading ? <InlineNotice>A carregar histórico...</InlineNotice> : null}
                            {historyError ? <div className="space-y-2"><InlineNotice tone="danger">{historyError}</InlineNotice><button className="sf-button-secondary" onClick={() => setHistoryReloadToken((value) => value + 1)} type="button">Tentar carregar histórico</button></div> : null}
                            {!historyLoading && !historyError && history.items.length === 0 ? <EmptyState title="Ainda não tens conversas nesta sala" /> : null}
                            {history.items.length > 0 ? <div className="space-y-3">{history.items.map((item) => <article className="sf-surface-subtle space-y-2" key={item._id}><p><strong>Pergunta:</strong> {item.question}</p><p className="whitespace-pre-wrap"><strong>Resposta:</strong> {item.answer}</p>{item.teacherVoiceApplied ? <StatusBadge tone="brand">Resposta com voz definida pelo professor</StatusBadge> : null}<div className="space-y-2 text-sm text-studyflow-text/70"><p>Fontes: {item.sources.map((source) => source.title).join(", ")}</p>{item.sources.map((source) => <OfficialMaterialFileActions key={source._id} material={source} />)}</div></article>)}</div> : null}
                            {history.nextCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar mais"}</button> : null}
                        </section>
                    </>
                ) : null}
            </AsyncStateBlock>
        </section>
    );
}
