/** Workspace docente de acompanhamento de uma sala guiada. */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { OfficialMaterialFileActions } from "../../components/materials/OfficialMaterialFileActions.js";
import {
    EmptyState,
    InlineNotice,
    MetricStrip,
    SectionHeader,
    StatusBadge,
    Toolbar,
} from "../../components/ui/CalmUi.js";
import {
    changeGuidedStudyRoomStatus,
    getGuidedStudyRoomProgress,
    getTeacherGuidedStudyRoom,
    GuidedStudyRoomAiPage,
    GuidedStudyRoomDetail,
    GuidedStudyRoomProgress,
    listTeacherGuidedStudyRoomAi,
} from "../../lib/apiClient.js";

export function TeacherGuidedStudyRoomDetailPage({ classId, roomId }: { classId: string; roomId: string }) {
    const [room, setRoom] = useState<GuidedStudyRoomDetail | null>(null);
    const [progress, setProgress] = useState<GuidedStudyRoomProgress | null>(null);
    const [history, setHistory] = useState<GuidedStudyRoomAiPage>({ items: [], nextCursor: null });
    const [studentFilter, setStudentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            const [nextRoom, nextProgress, nextHistory] = await Promise.all([
                getTeacherGuidedStudyRoom(classId, roomId),
                getGuidedStudyRoomProgress(classId, roomId),
                listTeacherGuidedStudyRoomAi(classId, roomId, {
                    studentId: studentFilter || undefined,
                }),
            ]);
            setRoom(nextRoom);
            setProgress(nextProgress);
            setHistory(nextHistory);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar a sala guiada.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void refresh(); }, [classId, roomId, studentFilter]);

    async function toggleStatus(): Promise<void> {
        if (!room) return;
        const status = room.status === "OPEN" ? "CLOSED" : "OPEN";
        if (status === "CLOSED" && !window.confirm("Encerrar esta sala guiada?")) return;
        try {
            await changeGuidedStudyRoomStatus(classId, roomId, status);
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao alterar o estado.");
        }
    }

    async function loadMore(): Promise<void> {
        if (!history.nextCursor) return;
        const next = await listTeacherGuidedStudyRoomAi(classId, roomId, {
            cursor: history.nextCursor,
            studentId: studentFilter || undefined,
        });
        setHistory({ items: [...history.items, ...next.items], nextCursor: next.nextCursor });
    }

    if (loading) return <InlineNotice>A carregar sala guiada...</InlineNotice>;
    if (error && !room) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (!room || !progress) return <EmptyState title="Sala guiada indisponível" />;
    const visibleStudents = progress.students.filter(
        (student) => statusFilter === "ALL" || student.status === statusFilter,
    );

    return (
        <section className="space-y-6">
            <PageHeader
                action={<>{room.status === "OPEN" ? <a className="sf-button-secondary" href={`/app/professor/turmas/${classId}/salas-guiadas?edit=${roomId}`}>Editar</a> : null}<button className="sf-button-primary" onClick={() => void toggleStatus()} type="button">{room.status === "OPEN" ? "Encerrar" : "Reabrir"}</button></>}
                description={room.goal ?? room.description}
                title={room.title}
            />
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <div className="flex flex-wrap gap-2"><StatusBadge tone={room.status === "OPEN" ? "brand" : "neutral"}>{room.status === "OPEN" ? "Aberta" : "Encerrada"}</StatusBadge><StatusBadge>{room.aiEnabled ? "IA supervisionada ativa" : "IA inativa"}</StatusBadge></div>
            <MetricStrip ariaLabel="Progresso da sala guiada" items={[{ label: "Audiência", value: progress.totalStudents }, { label: "Não visualizaram", value: progress.notViewed }, { label: "Visualizaram", value: progress.viewed }, { label: "Concluíram", value: progress.completed }, { label: "Conclusão", value: `${progress.completionPercent}%` }]} />
            <section className="sf-surface space-y-4"><SectionHeader title="Atividade" description="Instruções e recursos disponibilizados aos alunos." /><p className="whitespace-pre-wrap text-sm leading-6">{room.description}</p>{room.startsAt ? <p className="text-sm">Início previsto: {new Date(room.startsAt).toLocaleString("pt-PT")}{room.durationMinutes ? ` · ${room.durationMinutes} minutos` : ""}</p> : null}<div className="grid gap-2">{room.materials.map((material) => <article className="sf-surface-subtle space-y-2" key={material._id}><strong>{material.title}</strong><p className="text-sm text-studyflow-text/70">{material.status === "PROCESSED" ? "Material processado" : "Referência"}</p><OfficialMaterialFileActions material={material} /></article>)}</div>{room.invalidMaterialIds.length ? <InlineNotice tone="attention">Existem {room.invalidMaterialIds.length} referências de materiais legadas inválidas. Edita a sala para as remover.</InlineNotice> : null}{room.officialTest ? <a className="sf-button-secondary" href={`/app/professor/disciplinas/${room.officialTest.subjectId}/testes`}>Abrir mini-teste: {room.officialTest.title}</a> : null}</section>
            <section className="sf-surface space-y-4"><SectionHeader title="Participação" description="Estados factuais; visualizar não equivale a presença." /><Toolbar ariaLabel="Filtrar participação"><label>Estado<select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">Todos</option><option value="NOT_VIEWED">Não visualizaram</option><option value="VIEWED">Visualizaram</option><option value="COMPLETED">Concluíram</option></select></label></Toolbar><div className="divide-y divide-studyflow-border/10">{visibleStudents.map((student) => <div className="flex flex-wrap items-center justify-between gap-2 py-3" key={student.studentId}><span>{student.email}</span><StatusBadge tone={student.status === "COMPLETED" ? "brand" : "neutral"}>{student.status === "NOT_VIEWED" ? "Não visualizou" : student.status === "VIEWED" ? "Visualizou" : "Concluiu"}</StatusBadge></div>)}</div></section>
            <section className="sf-surface space-y-4"><SectionHeader title="Conversas IA supervisionadas" description="Consulta read-only. O conteúdo não é partilhado com os restantes alunos." />{progress.students.length ? <label className="block max-w-md">Aluno<select onChange={(event) => setStudentFilter(event.target.value)} value={studentFilter}><option value="">Todos</option>{progress.students.map((student) => <option key={student.studentId} value={student.studentId}>{student.email}</option>)}</select></label> : null}{history.items.length === 0 ? <EmptyState title="Ainda não existem conversas IA" /> : <div className="space-y-3">{history.items.map((item) => <article className="sf-surface-subtle space-y-2" key={item._id}><p className="text-xs uppercase text-studyflow-brandText">{item.studentEmail} · {item.createdAt ? new Date(item.createdAt).toLocaleString("pt-PT") : ""}</p><p><strong>Pergunta:</strong> {item.question}</p><p className="whitespace-pre-wrap"><strong>Resposta:</strong> {item.answer}</p><p className="text-sm text-studyflow-text/70">Fontes: {item.sources.map((source) => source.title).join(", ")}</p></article>)}</div>}{history.nextCursor ? <button className="sf-button-secondary" onClick={() => void loadMore()} type="button">Carregar mais</button> : null}{room.subjectId ? <a className="sf-button-secondary" href={`/app/professor/disciplinas/${room.subjectId}/chat`}>Abrir chat da disciplina</a> : null}</section>
        </section>
    );
}
