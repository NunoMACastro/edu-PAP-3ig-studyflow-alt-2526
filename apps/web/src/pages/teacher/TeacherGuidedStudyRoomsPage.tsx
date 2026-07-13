/** Gestão docente completa das salas guiadas de uma turma. */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    EmptyState,
    InlineNotice,
    StatusBadge,
    Toolbar,
} from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    changeGuidedStudyRoomStatus,
    createGuidedStudyRoom,
    GuidedStudyRoom,
    GuidedStudyRoomInput,
    listOfficialMaterials,
    listOfficialTests,
    listSubjects,
    listTeacherGuidedStudyRooms,
    OfficialMaterial,
    OfficialTest,
    Subject,
    updateGuidedStudyRoom,
} from "../../lib/apiClient.js";

const emptyInput: GuidedStudyRoomInput = {
    title: "",
    description: "",
    goal: "",
    subjectId: undefined,
    materialIds: [],
    officialTestId: undefined,
    startsAt: undefined,
    durationMinutes: undefined,
    aiEnabled: false,
};

export function TeacherGuidedStudyRoomsPage({ classId }: { classId: string }) {
    const [rooms, setRooms] = useState<GuidedStudyRoom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [tests, setTests] = useState<OfficialTest[]>([]);
    const [form, setForm] = useState<GuidedStudyRoomInput>(emptyInput);
    const [editing, setEditing] = useState<GuidedStudyRoom | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | GuidedStudyRoom["status"]>("ALL");
    const [subjectFilter, setSubjectFilter] = useState("");

    async function refresh(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            const [nextRooms, nextSubjects] = await Promise.all([
                listTeacherGuidedStudyRooms(classId),
                listSubjects(classId),
            ]);
            const materialGroups = await Promise.all(
                nextSubjects.map((subject) => listOfficialMaterials(subject._id)),
            );
            const testGroups = await Promise.all(
                nextSubjects.map((subject) => listOfficialTests(subject._id)),
            );
            setRooms(nextRooms);
            setSubjects(nextSubjects);
            setMaterials(materialGroups.flat());
            setTests(testGroups.flat());
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar salas guiadas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [classId]);

    useEffect(() => {
        const editId = new URLSearchParams(window.location.search).get("edit");
        if (!editId || rooms.length === 0) return;
        const room = rooms.find((item) => item._id === editId);
        if (room?.status === "OPEN") openEdit(room);
    }, [rooms]);

    const subjectsById = useMemo(
        () => new Map(subjects.map((subject) => [subject._id, subject])),
        [subjects],
    );
    const compatibleMaterials = materials.filter(
        (material) =>
            material.availableToAi === true &&
            (!form.subjectId || material.subjectId === form.subjectId),
    );
    const compatibleTests = tests.filter(
        (test) => test.subjectId === form.subjectId && test.status === "PUBLISHED",
    );
    const visibleRooms = rooms.filter((room) => {
        const text = `${room.title} ${room.description}`.toLocaleLowerCase("pt-PT");
        return (
            text.includes(search.trim().toLocaleLowerCase("pt-PT")) &&
            (statusFilter === "ALL" || room.status === statusFilter) &&
            (!subjectFilter || room.subjectId === subjectFilter)
        );
    });

    function openCreate(): void {
        setEditing(null);
        setForm(emptyInput);
        setError(null);
        setPanelOpen(true);
    }

    function openEdit(room: GuidedStudyRoom): void {
        setEditing(room);
        setForm({
            title: room.title,
            description: room.description,
            goal: room.goal ?? "",
            subjectId: room.subjectId,
            materialIds: room.materialIds,
            officialTestId: room.officialTestId,
            startsAt: room.startsAt ? room.startsAt.slice(0, 16) : undefined,
            durationMinutes: room.durationMinutes,
            aiEnabled: room.aiEnabled,
        });
        setError(null);
        setPanelOpen(true);
    }

    function changeSubject(subjectId: string): void {
        if (
            (form.materialIds.length > 0 || form.officialTestId) &&
            !window.confirm("Alterar a disciplina remove materiais e mini-teste incompatíveis. Continuar?")
        ) {
            return;
        }
        setForm((current) => ({
            ...current,
            subjectId: subjectId || undefined,
            materialIds: current.materialIds.filter((id) =>
                materials.some(
                    (material) =>
                        material._id === id && (!subjectId || material.subjectId === subjectId),
                ),
            ),
            officialTestId: undefined,
        }));
    }

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload: GuidedStudyRoomInput = {
                ...form,
                goal: form.goal?.trim() || undefined,
                startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
            };
            if (editing) {
                await updateGuidedStudyRoom(classId, editing._id, payload);
            } else {
                await createGuidedStudyRoom(classId, payload);
            }
            setPanelOpen(false);
            setEditing(null);
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível guardar a sala.");
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(room: GuidedStudyRoom): Promise<void> {
        const next = room.status === "OPEN" ? "CLOSED" : "OPEN";
        if (next === "CLOSED" && !window.confirm("Encerrar esta sala guiada?")) return;
        setError(null);
        try {
            await changeGuidedStudyRoomStatus(classId, room._id, next);
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível alterar o estado.");
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={<button className="sf-button-primary" onClick={openCreate} type="button">Nova sala guiada</button>}
                description="Prepara atividades, materiais, mini-testes e IA supervisionada para a turma."
                title="Salas guiadas"
            />
            {error && !panelOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <Toolbar ariaLabel="Filtrar salas guiadas">
                <label className="min-w-0 flex-1">Pesquisa<input aria-label="Pesquisar salas" onChange={(event) => setSearch(event.target.value)} value={search} /></label>
                <label>Estado<select onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} value={statusFilter}><option value="ALL">Todos</option><option value="OPEN">Abertas</option><option value="CLOSED">Encerradas</option></select></label>
                <label>Disciplina<select onChange={(event) => setSubjectFilter(event.target.value)} value={subjectFilter}><option value="">Todas</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label>
            </Toolbar>
            {loading ? <InlineNotice>A carregar salas guiadas...</InlineNotice> : null}
            {!loading && !error && rooms.length === 0 ? <EmptyState icon="users" title="Ainda não existem salas guiadas" description="Cria uma atividade orientada e disponibiliza-a imediatamente à turma." /> : null}
            {!loading && !error && rooms.length > 0 && visibleRooms.length === 0 ? <EmptyState icon="info" title="Nenhuma sala corresponde aos filtros" /> : null}
            <div className="grid gap-3 sm:grid-cols-2">
                {visibleRooms.map((room) => (
                    <article className="sf-list-card flex min-w-0 flex-col" key={room._id}>
                        <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-semibold">{room.title}</h2><StatusBadge tone={room.status === "OPEN" ? "brand" : "neutral"}>{room.status === "OPEN" ? "Aberta" : "Encerrada"}</StatusBadge></div>
                        {room.goal ? <p className="mt-2 text-sm font-medium">{room.goal}</p> : null}
                        <p className="mt-2 line-clamp-3 text-sm text-studyflow-text/70">{room.description}</p>
                        <p className="mt-3 text-xs uppercase tracking-wide text-studyflow-text/70">{room.subjectId ? subjectsById.get(room.subjectId)?.name ?? "Disciplina" : "Turma"} · IA {room.aiEnabled ? "ativa" : "inativa"}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <a className="sf-button-primary" href={`/app/professor/turmas/${classId}/salas-guiadas/${room._id}`}>Abrir</a>
                            <button className="sf-button-secondary" disabled={room.status === "CLOSED"} onClick={() => openEdit(room)} type="button">Editar</button>
                            <button className="sf-button-secondary" onClick={() => void toggleStatus(room)} type="button">{room.status === "OPEN" ? "Encerrar" : "Reabrir"}</button>
                        </div>
                    </article>
                ))}
            </div>
            <SidePanel closeDisabled={saving} description="A sala fica imediatamente disponível para a turma." onClose={() => setPanelOpen(false)} open={panelOpen} title={editing ? "Editar sala guiada" : "Criar sala guiada"}>
                <form className="space-y-4" onSubmit={(event) => void submit(event)}>
                    {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                    <label className="block">Título<input maxLength={160} minLength={3} onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label>
                    <label className="block">Objetivo<input maxLength={500} onChange={(event) => setForm({ ...form, goal: event.target.value })} value={form.goal ?? ""} /></label>
                    <label className="block">Instruções<textarea maxLength={8000} minLength={5} onChange={(event) => setForm({ ...form, description: event.target.value })} required value={form.description} /></label>
                    <label className="block">Disciplina<select onChange={(event) => changeSubject(event.target.value)} value={form.subjectId ?? ""}><option value="">Contexto geral da turma</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label>
                    <fieldset className="space-y-2"><legend className="font-medium">Materiais disponíveis para IA</legend>{compatibleMaterials.length ? compatibleMaterials.map((material) => <label className="flex items-center gap-2" key={material._id}><input checked={form.materialIds.includes(material._id)} onChange={(event) => setForm({ ...form, materialIds: event.target.checked ? [...form.materialIds, material._id] : form.materialIds.filter((id) => id !== material._id) })} type="checkbox" />{material.title} <span className="text-xs text-studyflow-text/70">processado</span></label>) : <p className="text-sm text-studyflow-text/70">Não existem materiais processados neste contexto.</p>}<p className="text-sm text-studyflow-text/65">A IA utilizará apenas os materiais processados que selecionares.</p></fieldset>
                    {form.subjectId ? <label className="block">Mini-teste<select onChange={(event) => { if (!event.target.value && form.officialTestId && editing && !window.confirm("Remover o mini-teste associado?")) return; setForm({ ...form, officialTestId: event.target.value || undefined }); }} value={form.officialTestId ?? ""}><option value="">Sem mini-teste</option>{compatibleTests.map((test) => <option key={test._id} value={test._id}>{test.title}</option>)}</select></label> : null}
                    <div className="grid gap-3 sm:grid-cols-2"><label>Início previsto<input onChange={(event) => setForm({ ...form, startsAt: event.target.value || undefined })} type="datetime-local" value={form.startsAt ?? ""} /></label><label>Duração (minutos)<input max={480} min={10} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value ? Number(event.target.value) : undefined })} type="number" value={form.durationMinutes ?? ""} /></label></div>
                    <label className="flex items-start gap-3"><input checked={form.aiEnabled} onChange={(event) => setForm({ ...form, aiEnabled: event.target.checked })} type="checkbox" /><span><strong>Disponibilizar IA supervisionada</strong><span className="block text-sm text-studyflow-text/70">Usa apenas os materiais processados selecionados e herda a voz da disciplina ou turma.</span></span></label>
                    <button className="sf-button-primary" disabled={saving || form.title.trim().length < 3 || form.description.trim().length < 5}>{saving ? "A guardar..." : editing ? "Guardar alterações" : "Criar e disponibilizar"}</button>
                </form>
            </SidePanel>
        </section>
    );
}
