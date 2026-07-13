/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    archiveGoal,
    archiveRoutine,
    createGoal,
    createRoutine,
    listRoutines,
    StudyGoal,
    StudyRoutine,
    updateGoal,
    updateRoutine,
} from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";

/**
 * Contrato de student que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type RoutineFormState = {
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
};

/**
 * Contrato de student que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type GoalFormState = {
    title: string;
    description: string;
    targetDate: string;
};

const weekdayOptions = [
    { value: "segunda", label: "Seg" },
    { value: "terca", label: "Ter" },
    { value: "quarta", label: "Qua" },
    { value: "quinta", label: "Qui" },
    { value: "sexta", label: "Sex" },
    { value: "sabado", label: "Sáb" },
    { value: "domingo", label: "Dom" },
];

const emptyRoutineForm: RoutineFormState = {
    title: "",
    weekdays: [],
    startTime: "18:00",
    durationMinutes: 45,
};

const emptyGoalForm: GoalFormState = {
    title: "",
    description: "",
    targetDate: "",
};

/**
 * Página de rotinas e objetivos.
 *
 * @returns Formulários e listagem de organização pessoal.
 */
export function RoutinesPage({
    section = "all",
    embedded = false,
}: {
    section?: "agenda" | "goals" | "all";
    embedded?: boolean;
} = {}) {
    const [data, setData] = useState<{
        routines: StudyRoutine[];
        goals: StudyGoal[];
    }>({
        routines: [],
        goals: [],
    });
    const [routineForm, setRoutineForm] =
        useState<RoutineFormState>(emptyRoutineForm);
    const [goalForm, setGoalForm] = useState<GoalFormState>(emptyGoalForm);
    const [editingRoutineId, setEditingRoutineId] = useState<string | null>(
        null,
    );
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [routinePanelOpen, setRoutinePanelOpen] = useState(false);
    const [goalPanelOpen, setGoalPanelOpen] = useState(false);
    const [savingRoutine, setSavingRoutine] = useState(false);
    const [savingGoal, setSavingGoal] = useState(false);

    useHashSidePanel("#criar-rotina", setRoutinePanelOpen);

    /**
     * Recarrega rotinas e objetivos.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refresh(): Promise<void> {
        setData(await listRoutines());
    }

    useEffect(() => {
        void refresh();
    }, []);

    /**
     * Cria ou atualiza uma rotina com os campos reais do contrato.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois da gravação.
     */
    async function handleRoutine(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSavingRoutine(true);
        try {
            if (editingRoutineId) {
                await updateRoutine(editingRoutineId, routineForm);
            } else {
                await createRoutine(routineForm);
            }
            resetRoutineForm();
            await refresh();
            setRoutinePanelOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar rotina.");
        } finally {
            setSavingRoutine(false);
        }
    }

    /**
     * Cria ou atualiza um objetivo com os campos reais do contrato.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois da gravação.
     */
    async function handleGoal(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSavingGoal(true);
        const payload = {
            title: goalForm.title,
            description: goalForm.description,
            targetDate: goalForm.targetDate || undefined,
        };

        try {
            if (editingGoalId) {
                await updateGoal(editingGoalId, payload);
            } else {
                await createGoal(payload);
            }
            resetGoalForm();
            await refresh();
            setGoalPanelOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar objetivo.");
        } finally {
            setSavingGoal(false);
        }
    }

    /**
     * Alterna um dia da semana no formulário de rotina.
     *
     * @param weekday Dia escolhido.
     * @returns Nada; atualiza estado local.
     */
    function toggleWeekday(weekday: string): void {
        setRoutineForm((current) => ({
            ...current,
            weekdays: current.weekdays.includes(weekday)
                ? current.weekdays.filter((item) => item !== weekday)
                : [...current.weekdays, weekday],
        }));
    }

    /**
     * Coloca uma rotina existente em edição.
     *
     * @param routine Rotina escolhida.
     * @returns Nada; atualiza estado local.
     */
    function beginEditRoutine(routine: StudyRoutine): void {
        setEditingRoutineId(routine._id);
        setRoutineForm({
            title: routine.title,
            weekdays: routine.weekdays,
            startTime: routine.startTime,
            durationMinutes: routine.durationMinutes,
        });
        setRoutinePanelOpen(true);
    }

    /**
     * Coloca um objetivo existente em edição.
     *
     * @param goal Objetivo escolhido.
     * @returns Nada; atualiza estado local.
     */
    function beginEditGoal(goal: StudyGoal): void {
        setEditingGoalId(goal._id);
        setGoalForm({
            title: goal.title,
            description: goal.description ?? "",
            targetDate: toDateInputValue(goal.targetDate),
        });
        setGoalPanelOpen(true);
    }

    /**
     * Arquiva uma rotina do aluno autenticado.
     *
     * @param routineId Identificador da rotina.
     * @returns Promise resolvida depois do refresh.
     */
    async function handleArchiveRoutine(routineId: string): Promise<void> {
        setError(null);
        try {
            await archiveRoutine(routineId);
            if (editingRoutineId === routineId) resetRoutineForm();
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao arquivar rotina.");
        }
    }

    /**
     * Alterna o estado concluído de um objetivo.
     *
     * @param goal Objetivo escolhido.
     * @returns Promise resolvida depois do refresh.
     */
    async function handleToggleGoal(goal: StudyGoal): Promise<void> {
        setError(null);
        try {
            await updateGoal(goal._id, { completed: !goal.completed });
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao atualizar objetivo.");
        }
    }

    /**
     * Arquiva um objetivo do aluno autenticado.
     *
     * @param goalId Identificador do objetivo.
     * @returns Promise resolvida depois do refresh.
     */
    async function handleArchiveGoal(goalId: string): Promise<void> {
        setError(null);
        try {
            await archiveGoal(goalId);
            if (editingGoalId === goalId) resetGoalForm();
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao arquivar objetivo.");
        }
    }

    /**
     * Limpa o formulário de rotina.
     *
     * @returns Nada; atualiza estado local.
     */
    function resetRoutineForm(): void {
        setEditingRoutineId(null);
        setRoutineForm(emptyRoutineForm);
    }

    /**
     * Limpa o formulário de objetivo.
     *
     * @returns Nada; atualiza estado local.
     */
    function resetGoalForm(): void {
        setEditingGoalId(null);
        setGoalForm(emptyGoalForm);
    }

    return (
        <section className="space-y-8">
            {!embedded ? <PageHeader
                action={<><button className="sf-button-primary" onClick={() => { resetRoutineForm(); setRoutinePanelOpen(true); }} type="button">Nova rotina</button><button className="sf-button-secondary" onClick={() => { resetGoalForm(); setGoalPanelOpen(true); }} type="button">Novo objetivo</button></>}
                description="Planeia blocos de estudo e acompanha metas pessoais."
                title="Rotinas"
            /> : null}
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <div className="grid gap-6 xl:grid-cols-2">
                {section !== "goals" ? <section className="sf-section-group space-y-4">
                    <SectionHeader action={embedded ? <button className="sf-button-primary" onClick={() => { resetRoutineForm(); setRoutinePanelOpen(true); }} type="button">Nova rotina</button> : undefined} description="Dias, hora e duração dos blocos de estudo." title="Rotinas de estudo" />
                    {data.routines.length === 0 ? <EmptyState icon="calendar" title="Ainda não há rotinas" /> : null}
                    <ul className="space-y-3">
                        {data.routines.map((routine) => (
                            <li className="sf-list-card text-sm" key={routine._id}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div><p className="font-semibold">{routine.title}</p><p className="mt-1 text-studyflow-text/65">{routine.weekdays.join(", ")} às {routine.startTime}, {routine.durationMinutes} min</p></div>
                                    <div className="flex shrink-0 gap-2"><button className="sf-button-secondary" onClick={() => beginEditRoutine(routine)} type="button">Editar</button><button className="sf-button-secondary" onClick={() => void handleArchiveRoutine(routine._id)} type="button">Arquivar</button></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section> : null}
                {section !== "agenda" ? <section className="sf-section-group space-y-4">
                    <SectionHeader action={embedded ? <button className="sf-button-primary" onClick={() => { resetGoalForm(); setGoalPanelOpen(true); }} type="button">Novo objetivo</button> : undefined} description="Metas pessoais e respetivo estado de conclusão." title="Objetivos" />
                    {data.goals.length === 0 ? <EmptyState icon="clipboard" title="Ainda não há objetivos" /> : null}
                    <ul className="space-y-3">
                        {data.goals.map((goal) => (
                            <li className="sf-list-card text-sm" key={goal._id}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{goal.title}</p><StatusBadge tone={goal.completed ? "brand" : "neutral"}>{goal.completed ? "Concluído" : "Em curso"}</StatusBadge></div>{goal.description ? <p className="mt-2 text-studyflow-text/65">{goal.description}</p> : null}<p className="mt-1 text-studyflow-text/65">{goal.targetDate ? `Data alvo: ${formatDatePt(goal.targetDate)}` : "Sem data alvo"}</p></div>
                                    <div className="flex shrink-0 flex-wrap gap-2"><button className="sf-button-secondary" onClick={() => void handleToggleGoal(goal)} type="button">{goal.completed ? "Reabrir" : "Concluir"}</button><button className="sf-button-secondary" onClick={() => beginEditGoal(goal)} type="button">Editar</button><button className="sf-button-secondary" onClick={() => void handleArchiveGoal(goal._id)} type="button">Arquivar</button></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section> : null}
            </div>

            <SidePanel closeDisabled={savingRoutine} description="Define dias, hora e duração do bloco de estudo." onClose={() => setRoutinePanelOpen(false)} open={routinePanelOpen} title={editingRoutineId ? "Editar rotina" : "Criar rotina"}>
                <form className="space-y-3" id="criar-rotina" onSubmit={(event) => void handleRoutine(event)}>
                    <div>
                        <label htmlFor="routineTitle">Título</label>
                        <input
                            id="routineTitle"
                            value={routineForm.title}
                            onChange={(event) =>
                                setRoutineForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-studyflow-text">Dias</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {weekdayOptions.map((weekday) => (
                                <label
                                    className="inline-flex items-center gap-2 rounded border border-studyflow-border px-3 py-2 text-sm"
                                    htmlFor={`routine-weekday-${weekday.value}`}
                                    key={weekday.value}
                                >
                                    <input
                                        checked={routineForm.weekdays.includes(
                                            weekday.value,
                                        )}
                                        className="h-4 w-4"
                                        id={`routine-weekday-${weekday.value}`}
                                        onChange={() => toggleWeekday(weekday.value)}
                                        type="checkbox"
                                    />
                                    {weekday.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor="routineStartTime">Hora</label>
                            <input
                                id="routineStartTime"
                                onChange={(event) =>
                                    setRoutineForm((current) => ({
                                        ...current,
                                        startTime: event.target.value,
                                    }))
                                }
                                required
                                type="time"
                                value={routineForm.startTime}
                            />
                        </div>
                        <div>
                            <label htmlFor="routineDuration">Duração</label>
                            <input
                                id="routineDuration"
                                max={480}
                                min={5}
                                onChange={(event) =>
                                    setRoutineForm((current) => ({
                                        ...current,
                                        durationMinutes: Number(event.target.value),
                                    }))
                                }
                                required
                                type="number"
                                value={routineForm.durationMinutes}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="sf-button-primary" disabled={savingRoutine} type="submit">
                            {savingRoutine ? "A guardar..." : editingRoutineId ? "Guardar rotina" : "Criar rotina"}
                        </button>
                        {editingRoutineId ? (
                            <button
                                className="sf-button-secondary"
                                onClick={resetRoutineForm}
                                type="button"
                            >
                                Cancelar
                            </button>
                        ) : null}
                    </div>
                </form>
            </SidePanel>

            <SidePanel closeDisabled={savingGoal} description="Regista a meta, descrição e data alvo opcional." onClose={() => setGoalPanelOpen(false)} open={goalPanelOpen} title={editingGoalId ? "Editar objetivo" : "Criar objetivo"}>
                <form className="space-y-3" onSubmit={(event) => void handleGoal(event)}>
                    <div>
                        <label htmlFor="goalTitle">Título</label>
                        <input
                            id="goalTitle"
                            onChange={(event) =>
                                setGoalForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                }))
                            }
                            required
                            value={goalForm.title}
                        />
                    </div>
                    <div>
                        <label htmlFor="goalDescription">Descrição</label>
                        <textarea
                            id="goalDescription"
                            onChange={(event) =>
                                setGoalForm((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                            rows={3}
                            value={goalForm.description}
                        />
                    </div>
                    <div>
                        <label htmlFor="goalTargetDate">Data alvo</label>
                        <input
                            id="goalTargetDate"
                            onChange={(event) =>
                                setGoalForm((current) => ({
                                    ...current,
                                    targetDate: event.target.value,
                                }))
                            }
                            type="date"
                            value={goalForm.targetDate}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="sf-button-primary" disabled={savingGoal} type="submit">
                            {savingGoal ? "A guardar..." : editingGoalId ? "Guardar objetivo" : "Criar objetivo"}
                        </button>
                        {editingGoalId ? (
                            <button
                                className="sf-button-secondary"
                                onClick={resetGoalForm}
                                type="button"
                            >
                                Cancelar
                            </button>
                        ) : null}
                    </div>
                </form>
            </SidePanel>
        </section>
    );
}

/**
 * Converte uma data persistida para o formato de input HTML.
 *
 * @param value Data serializada.
 * @returns Data `YYYY-MM-DD` ou string vazia.
 */
function toDateInputValue(value: string | undefined): string {
    return value ? value.slice(0, 10) : "";
}
