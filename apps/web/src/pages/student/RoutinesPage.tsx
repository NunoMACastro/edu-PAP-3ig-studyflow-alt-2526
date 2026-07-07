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
export function RoutinesPage() {
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
        try {
            if (editingRoutineId) {
                await updateRoutine(editingRoutineId, routineForm);
            } else {
                await createRoutine(routineForm);
            }
            resetRoutineForm();
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar rotina.");
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
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar objetivo.");
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
        <section className="grid gap-6 lg:grid-cols-2">
            <div className="sf-panel space-y-4">
                <div>
                    <h1 className="text-xl font-bold">Rotinas</h1>
                    <p className="text-sm text-slate-600">
                        Define dias, hora e duração para blocos de estudo.
                    </p>
                </div>
                {error ? <p className="sf-error">{error}</p> : null}
                <form className="space-y-3" onSubmit={(event) => void handleRoutine(event)}>
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
                        <span className="text-sm font-medium text-slate-700">Dias</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {weekdayOptions.map((weekday) => (
                                <label
                                    className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm"
                                    key={weekday.value}
                                >
                                    <input
                                        checked={routineForm.weekdays.includes(
                                            weekday.value,
                                        )}
                                        className="h-4 w-4"
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
                        <button className="sf-button-primary" type="submit">
                            {editingRoutineId ? "Guardar rotina" : "Criar rotina"}
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
                <ul className="space-y-2">
                    {data.routines.map((routine) => (
                        <li className="rounded-md border border-slate-200 p-3 text-sm" key={routine._id}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-semibold">{routine.title}</p>
                                    <p className="text-slate-600">
                                        {routine.weekdays.join(", ")} às {routine.startTime}, {routine.durationMinutes} min
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button className="sf-button-secondary" onClick={() => beginEditRoutine(routine)} type="button">
                                        Editar
                                    </button>
                                    <button className="sf-button-secondary" onClick={() => void handleArchiveRoutine(routine._id)} type="button">
                                        Arquivar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sf-panel space-y-4">
                <div>
                    <h2 className="text-xl font-bold">Objetivos</h2>
                    <p className="text-sm text-slate-600">
                        Regista metas pessoais e acompanha a conclusão.
                    </p>
                </div>
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
                        <button className="sf-button-primary" type="submit">
                            {editingGoalId ? "Guardar objetivo" : "Criar objetivo"}
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
                <ul className="space-y-2">
                    {data.goals.map((goal) => (
                        <li className="rounded-md border border-slate-200 p-3 text-sm" key={goal._id}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className={goal.completed ? "text-slate-500" : ""}>
                                    <p className="font-semibold">{goal.title}</p>
                                    {goal.description ? (
                                        <p className="text-slate-600">{goal.description}</p>
                                    ) : null}
                                    <p className="text-slate-600">
                                        {goal.targetDate
                                            ? `Data alvo: ${formatDatePt(goal.targetDate)}`
                                            : "Sem data alvo"}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <button className="sf-button-secondary" onClick={() => void handleToggleGoal(goal)} type="button">
                                        {goal.completed ? "Reabrir" : "Concluir"}
                                    </button>
                                    <button className="sf-button-secondary" onClick={() => beginEditGoal(goal)} type="button">
                                        Editar
                                    </button>
                                    <button className="sf-button-secondary" onClick={() => void handleArchiveGoal(goal._id)} type="button">
                                        Arquivar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
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
