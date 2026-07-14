/**
 * Implementa a gestao docente de disciplinas com a mesma linguagem visual das turmas.
 */
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import {
    IconTooltip,
    ShellIcon,
    type ShellIconName,
} from "../../components/layout/shell-icons.js";
import { PageHeader } from "../../components/PageHeader.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    type FieldErrors,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import {
    changeSubjectStatus,
    createSubject,
    listSubjects,
    type Subject,
    updateSubject,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherSubjectsPageProps = {
    classId: string;
};

type TeacherSubjectField = "name" | "code" | "description";
type TeacherSubjectSortMode = "recent" | "name" | "code";
type TeacherSubjectStatusFilter = "ACTIVE" | "ARCHIVED";

type SubjectAction = {
    label: string;
    icon: ShellIconName;
    href: (subjectId: string) => string;
    variant: "primary" | "icon";
};

const CREATE_SUBJECT_HASH = "#criar-disciplina";

const SUBJECT_ACTIONS: SubjectAction[] = [
    {
        label: "Materiais",
        icon: "file",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/materiais`,
        variant: "primary",
    },
    {
        label: "Chat",
        icon: "message",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/chat`,
        variant: "icon",
    },
    {
        label: "Voz IA",
        icon: "spark",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/voz`,
        variant: "icon",
    },
    {
        label: "Testes",
        icon: "clipboard",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/testes`,
        variant: "icon",
    },
    {
        label: "Conteúdos aprovados",
        icon: "shield",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/revisoes-ia`,
        variant: "icon",
    },
    {
        label: "Fontes da IA",
        icon: "folder",
        href: (subjectId) => `/app/professor/disciplinas/${subjectId}/contextos-materiais`,
        variant: "icon",
    },
];

/**
 * Normaliza texto para pesquisas locais tolerantes a maiúsculas e acentos.
 *
 * @param value Texto original vindo da UI ou da disciplina.
 * @returns Texto comparável em pesquisa simples.
 */
function normalizeSearchText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-PT")
        .trim();
}

/**
 * Converte `createdAt` opcional num timestamp seguro para ordenação.
 *
 * @param createdAt Valor ISO opcional devolvido pela API.
 * @returns Timestamp numérico ou `0` quando não há data válida.
 */
function getCreatedAtTimestamp(createdAt?: string): number {
    if (!createdAt) return 0;
    const timestamp = Date.parse(createdAt);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

/**
 * Formata a contagem total de disciplinas da turma.
 *
 * @param count Número de disciplinas carregadas.
 * @returns Texto curto com plural correto.
 */
function formatSubjectCount(count: number, status: TeacherSubjectStatusFilter): string {
    if (status === "ARCHIVED") {
        return `${count} ${count === 1 ? "disciplina arquivada" : "disciplinas arquivadas"}`;
    }
    return `${count} ${count === 1 ? "disciplina ativa" : "disciplinas ativas"}`;
}

/**
 * Formata a contagem de disciplinas visíveis depois de pesquisa local.
 *
 * @param visibleCount Número de disciplinas atualmente renderizadas.
 * @param totalCount Número total de disciplinas carregadas.
 * @returns Texto de contexto para a barra de ferramentas.
 */
function formatVisibleSubjectCount(visibleCount: number, totalCount: number): string {
    return `${visibleCount} de ${totalCount} ${
        totalCount === 1 ? "disciplina visível" : "disciplinas visíveis"
    }`;
}

/**
 * Valida localmente o payload de criação de disciplina antes da chamada à API.
 *
 * @param input Campos controlados pelo formulário.
 * @returns Mapa de erros pronto para a UI.
 */
function validateTeacherSubjectFields(input: {
    name: string;
    code: string;
    description: string;
}): FieldErrors<TeacherSubjectField> {
    const nextErrors = requireFields<TeacherSubjectField>([
        { name: "name", label: "Nome", value: input.name },
        { name: "code", label: "Código", value: input.code },
    ]);

    const trimmedName = input.name.trim();
    const trimmedCode = input.code.trim();
    const trimmedDescription = input.description.trim();

    if (!nextErrors.name && (trimmedName.length < 2 || trimmedName.length > 120)) {
        nextErrors.name = "Nome deve ter entre 2 e 120 caracteres.";
    }

    if (!nextErrors.code && (trimmedCode.length < 2 || trimmedCode.length > 40)) {
        nextErrors.code = "Código deve ter entre 2 e 40 caracteres.";
    }

    if (trimmedDescription.length > 500) {
        nextErrors.description = "Descrição deve ter no máximo 500 caracteres.";
    }

    return nextErrors;
}

/**
 * Página de disciplinas de uma turma.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherSubjectsPage({ classId }: TeacherSubjectsPageProps) {
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const editNameInputRef = useRef<HTMLInputElement | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortMode, setSortMode] = useState<TeacherSubjectSortMode>("recent");
    const [statusFilter, setStatusFilter] = useState<TeacherSubjectStatusFilter>("ACTIVE");
    const [subjectFieldErrors, setSubjectFieldErrors] = useState<
        FieldErrors<TeacherSubjectField>
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [updatingSubjectId, setUpdatingSubjectId] = useState<string | null>(null);
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editFieldErrors, setEditFieldErrors] = useState<
        FieldErrors<TeacherSubjectField>
    >({});
    const [shouldFocusCreatePanel, setShouldFocusCreatePanel] = useState(false);
    const [hasAutoOpenedCreatePanel, setHasAutoOpenedCreatePanel] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
    const hasActiveSearch = searchTerm.trim().length > 0;
    const visibleSubjects = useMemo(() => {
        const normalizedQuery = normalizeSearchText(searchTerm);

        return subjects
            .map((subject, index) => ({ index, subject }))
            .filter(({ subject }) => {
                if ((subject.status ?? "ACTIVE") !== statusFilter) return false;
                if (!normalizedQuery) return true;

                const searchableText = normalizeSearchText(
                    `${subject.name} ${subject.code} ${subject.description ?? ""}`,
                );
                return searchableText.includes(normalizedQuery);
            })
            .sort((left, right) => {
                if (sortMode === "name") {
                    const byName = left.subject.name.localeCompare(right.subject.name, "pt");
                    if (byName !== 0) return byName;

                    return left.subject.code.localeCompare(right.subject.code, "pt");
                }

                if (sortMode === "code") {
                    const byCode = left.subject.code.localeCompare(right.subject.code, "pt");
                    if (byCode !== 0) return byCode;

                    return left.subject.name.localeCompare(right.subject.name, "pt");
                }

                const byCreatedAt =
                    getCreatedAtTimestamp(right.subject.createdAt) -
                    getCreatedAtTimestamp(left.subject.createdAt);
                if (byCreatedAt !== 0) return byCreatedAt;

                return left.index - right.index;
            })
            .map(({ subject }) => subject);
    }, [searchTerm, sortMode, statusFilter, subjects]);
    const statusSubjectCount = subjects.filter(
        (subject) => (subject.status ?? "ACTIVE") === statusFilter,
    ).length;

    /**
     * Carrega as disciplinas iniciais respeitando unmounts durante a chamada assíncrona.
     *
     * @param active Função que indica se o componente ainda pode receber estado.
     * @returns Promise resolvida depois de carregar ou falhar de forma controlada.
     */
    async function loadInitialSubjects(active: () => boolean): Promise<void> {
        const measurement = startPerformanceBudget("teacher-subjects");
        setIsLoading(true);
        setError(null);
        setPerformanceWarning(null);
        try {
            const nextSubjects = await listSubjects(classId);
            if (active()) setSubjects(nextSubjects);
        } catch (caught) {
            if (active()) {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Erro ao carregar disciplinas.",
                );
            }
        } finally {
            if (active()) {
                const result = finishPerformanceBudget(measurement);
                setPerformanceWarning(
                    result.exceeded
                        ? formatPerformanceBudgetMessage(result)
                        : null,
                );
                setIsLoading(false);
            }
        }
    }

    /**
     * Aplica no estado local a disciplina devolvida pela mutação confirmada pela API.
     *
     * @param nextSubject Disciplina criada ou atualizada pelo backend.
     * @returns Nada; apenas sincroniza a lista visível.
     */
    function upsertSubject(nextSubject: Subject): void {
        setSubjects((current) => {
            const exists = current.some((subject) => subject._id === nextSubject._id);
            if (!exists) return [nextSubject, ...current];

            return current.map((subject) =>
                subject._id === nextSubject._id ? nextSubject : subject,
            );
        });
    }

    useEffect(() => {
        let active = true;
        setHasAutoOpenedCreatePanel(false);
        setSearchTerm("");
        setSubjectFieldErrors({});
        setEditingSubject(null);
        setSuccessMessage(null);
        void loadInitialSubjects(() => active);
        return () => {
            active = false;
        };
    }, [classId]);

    useEffect(() => {
        if (!isLoading && subjects.length === 0 && !hasAutoOpenedCreatePanel) {
            setIsCreatePanelOpen(true);
            setHasAutoOpenedCreatePanel(true);
        }
    }, [hasAutoOpenedCreatePanel, isLoading, subjects.length]);

    useEffect(() => {
        function applyHashShortcut(): void {
            if (window.location.hash !== CREATE_SUBJECT_HASH) return;

            setIsCreatePanelOpen(true);
            setShouldFocusCreatePanel(true);
        }

        applyHashShortcut();
        window.addEventListener("hashchange", applyHashShortcut);
        return () => window.removeEventListener("hashchange", applyHashShortcut);
    }, []);

    useEffect(() => {
        if (!isCreatePanelOpen || !shouldFocusCreatePanel) return;

        nameInputRef.current?.focus();
        setShouldFocusCreatePanel(false);
    }, [isCreatePanelOpen, shouldFocusCreatePanel]);

    /**
     * Remove uma mensagem de validação quando o professor começa a corrigir o campo.
     *
     * @param field Campo do formulário de criação de disciplina.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearSubjectFieldError(field: TeacherSubjectField): void {
        setSubjectFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Abre ou fecha o painel de criação e prepara foco quando passa a abrir.
     *
     * @returns Nada; apenas altera estado local.
     */
    function toggleCreatePanel(): void {
        setIsCreatePanelOpen((current) => {
            const nextOpen = !current;
            if (nextOpen) setShouldFocusCreatePanel(true);
            return nextOpen;
        });
    }

    /**
     * Trata a submissão do formulário de criação de disciplina.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Promise resolvida depois de criar ou reportar erro.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const trimmedName = name.trim();
        const trimmedCode = code.trim();
        const trimmedDescription = description.trim();
        const nextErrors = validateTeacherSubjectFields({
            name: trimmedName,
            code: trimmedCode,
            description: trimmedDescription,
        });

        if (hasFieldErrors(nextErrors)) {
            // A API continua a ser a barreira de segurança; este return evita um pedido vazio.
            setSubjectFieldErrors(nextErrors);
            return;
        }

        setSubjectFieldErrors({});
        setIsCreating(true);
        try {
            const createdSubject = await createSubject(classId, {
                name: trimmedName,
                code: trimmedCode,
                ...(trimmedDescription ? { description: trimmedDescription } : {}),
            });
            upsertSubject(createdSubject);
            setName("");
            setCode("");
            setDescription("");
            setIsCreatePanelOpen(false);
            setSuccessMessage("Disciplina criada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar disciplina.");
        } finally {
            setIsCreating(false);
        }
    }

    /** Abre o formulário contextual com os dados atuais da disciplina. */
    function openEditSubject(subject: Subject): void {
        setIsCreatePanelOpen(false);
        setEditingSubject(subject);
        setEditName(subject.name);
        setEditCode(subject.code);
        setEditDescription(subject.description ?? "");
        setEditFieldErrors({});
        setError(null);
        setSuccessMessage(null);
    }

    /** Remove um erro do formulário de edição quando o respetivo campo muda. */
    function clearEditFieldError(field: TeacherSubjectField): void {
        setEditFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /** Persiste a edição e fecha o painel apenas após confirmação da API. */
    async function handleEditSubject(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!editingSubject) return;
        const validation = validateTeacherSubjectFields({
            name: editName,
            code: editCode,
            description: editDescription,
        });
        if (hasFieldErrors(validation)) {
            setEditFieldErrors(validation);
            return;
        }
        setUpdatingSubjectId(editingSubject._id);
        setEditFieldErrors({});
        setError(null);
        try {
            upsertSubject(await updateSubject(classId, editingSubject._id, {
                name: editName.trim(),
                code: editCode.trim(),
                description: editDescription.trim(),
            }));
            setEditingSubject(null);
            setSuccessMessage("Disciplina atualizada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao atualizar disciplina.");
        } finally {
            setUpdatingSubjectId(null);
        }
    }

    /** Arquiva ou restaura a disciplina sem apagar histórico. */
    async function handleSubjectStatus(subject: Subject): Promise<void> {
        const nextStatus = subject.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
        if (nextStatus === "ARCHIVED" && !window.confirm(`Arquivar a disciplina ${subject.name}? As atividades ativas serão encerradas.`)) return;
        setUpdatingSubjectId(subject._id);
        setError(null);
        try {
            upsertSubject(await changeSubjectStatus(classId, subject._id, nextStatus));
            setSuccessMessage(nextStatus === "ACTIVE" ? "Disciplina restaurada." : "Disciplina arquivada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao alterar estado da disciplina.");
        } finally {
            setUpdatingSubjectId(null);
        }
    }

    const createSubjectForm = (
        <form
            className="space-y-5"
            id="criar-disciplina"
            noValidate
            onSubmit={(event) => void handleCreate(event)}
        >
            <div className="grid min-w-0 gap-5">
                <FormField
                    helpText="Nome visivel da disciplina para alunos e professor."
                    id="teacherSubjectName"
                    label="Nome"
                    error={subjectFieldErrors.name}
                >
                    <input
                        className="sf-field"
                        disabled={isCreating}
                        maxLength={120}
                        minLength={2}
                        ref={nameInputRef}
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            clearSubjectFieldError("name");
                        }}
                    />
                </FormField>

                <FormField
                    helpText="Codigo curto usado para identificar a disciplina."
                    id="teacherSubjectCode"
                    label="Código"
                    error={subjectFieldErrors.code}
                >
                    <input
                        className="sf-field"
                        disabled={isCreating}
                        maxLength={40}
                        minLength={2}
                        value={code}
                        onChange={(event) => {
                            setCode(event.target.value);
                            clearSubjectFieldError("code");
                        }}
                    />
                </FormField>

                <button
                    className="sf-button-primary mt-2 min-h-11 w-full"
                    disabled={isCreating}
                    type="submit"
                >
                    {isCreating ? "A criar..." : "Criar disciplina"}
                </button>
            </div>

            <FormField
                helpText="Opcional. Maximo 500 caracteres."
                id="teacherSubjectDescription"
                label="Descrição"
                error={subjectFieldErrors.description}
            >
                <textarea
                    className="sf-field min-h-28"
                    disabled={isCreating}
                    maxLength={500}
                    rows={4}
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value);
                        clearSubjectFieldError("description");
                    }}
                />
            </FormField>
        </form>
    );

    const editSubjectForm = editingSubject ? (
        <form className="space-y-5" id="editar-disciplina" noValidate onSubmit={(event) => void handleEditSubject(event)}>
            <FormField
                helpText="Nome visível da disciplina para alunos e professor."
                id="editTeacherSubjectName"
                label="Nome"
                error={editFieldErrors.name}
            >
                <input
                    className="sf-field"
                    disabled={updatingSubjectId === editingSubject._id}
                    maxLength={120}
                    minLength={2}
                    onChange={(event) => {
                        setEditName(event.target.value);
                        clearEditFieldError("name");
                    }}
                    ref={editNameInputRef}
                    value={editName}
                />
            </FormField>
            <FormField
                helpText="Código curto usado para identificar a disciplina."
                id="editTeacherSubjectCode"
                label="Código"
                error={editFieldErrors.code}
            >
                <input
                    className="sf-field"
                    disabled={updatingSubjectId === editingSubject._id}
                    maxLength={40}
                    minLength={2}
                    onChange={(event) => {
                        setEditCode(event.target.value);
                        clearEditFieldError("code");
                    }}
                    value={editCode}
                />
            </FormField>
            <FormField
                helpText="Opcional. Máximo 500 caracteres."
                id="editTeacherSubjectDescription"
                label="Descrição"
                error={editFieldErrors.description}
            >
                <textarea
                    className="sf-field min-h-28"
                    disabled={updatingSubjectId === editingSubject._id}
                    maxLength={500}
                    onChange={(event) => {
                        setEditDescription(event.target.value);
                        clearEditFieldError("description");
                    }}
                    rows={4}
                    value={editDescription}
                />
            </FormField>
            <button
                className="sf-button-primary min-h-11 w-full"
                disabled={updatingSubjectId === editingSubject._id}
                type="submit"
            >
                {updatingSubjectId === editingSubject._id ? "A guardar..." : "Guardar alterações"}
            </button>
        </form>
    ) : null;

    return (
        <section className="space-y-6">
            <PageHeader
                title="Disciplinas"
                description="Gestão docente das disciplinas da turma, materiais oficiais, testes, chat e voz IA."
                action={
                    <>
                        <a className="sf-button-secondary w-fit" href="/app/professor/turmas">
                            Turmas
                        </a>
                        <button
                            aria-controls="criar-disciplina"
                            aria-expanded={isCreatePanelOpen}
                            className="sf-button-primary w-fit gap-2"
                            onClick={toggleCreatePanel}
                            type="button"
                        >
                            <ShellIcon className="h-4 w-4" name="plus" />
                            Nova disciplina
                        </button>
                    </>
                }
            />

            {!isLoading && subjects.length > 0 ? (
                <section
                    aria-label="Ferramentas de disciplinas"
                    className="sf-toolbar md:grid-cols-[minmax(0,1fr)_12rem_14rem_auto] md:items-end"
                >
                    <label className="grid min-w-0 gap-2 text-sm text-studyflow-text">
                        <span className="font-semibold">Pesquisar disciplina</span>
                        <input
                            className="sf-field"
                            placeholder="Nome ou código"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </label>

                    <label className="grid min-w-0 gap-2 text-sm text-studyflow-text">
                        <span className="font-semibold">Estado</span>
                        <select
                            className="sf-field"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value as TeacherSubjectStatusFilter)
                            }
                        >
                            <option value="ACTIVE">Ativas</option>
                            <option value="ARCHIVED">Arquivo</option>
                        </select>
                    </label>

                    <label className="grid min-w-0 gap-2 text-sm text-studyflow-text">
                        <span className="font-semibold">Ordenar</span>
                        <select
                            className="sf-field"
                            value={sortMode}
                            onChange={(event) =>
                                setSortMode(event.target.value as TeacherSubjectSortMode)
                            }
                        >
                            <option value="recent">Mais recentes</option>
                            <option value="name">Nome A-Z</option>
                            <option value="code">Código A-Z</option>
                        </select>
                    </label>

                    <p className="text-sm text-studyflow-text/65 md:pb-3">
                        {hasActiveSearch
                            ? formatVisibleSubjectCount(visibleSubjects.length, statusSubjectCount)
                            : formatSubjectCount(statusSubjectCount, statusFilter)}
                    </p>
                </section>
            ) : null}

            {!isLoading && subjects.length === 0 ? (
                <div className="sf-empty-state">
                    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-studyflow-brand/15 text-studyflow-brandText">
                        <ShellIcon className="h-5 w-5" name="book" />
                    </span>
                    <p className="text-sm text-studyflow-text/70">
                        Ainda não tens disciplinas criadas.
                    </p>
                </div>
            ) : null}

            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {successMessage ? (
                <p className="sf-success" role="status">{successMessage}</p>
            ) : null}

            <section aria-label="Disciplinas da turma" className="min-w-0 space-y-4">
                {isLoading ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-text">
                        A carregar disciplinas...
                    </p>
                ) : null}
                {performanceWarning ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-alertText" role="status">
                        {performanceWarning}
                    </p>
                ) : null}
                {!isLoading && subjects.length === 0 && !isCreatePanelOpen ? (
                    <p className="sf-empty-state text-sm text-studyflow-text/70">
                        Cria a primeira disciplina para associar materiais, testes e apoio IA.
                    </p>
                ) : null}
                {!isLoading && subjects.length > 0 && visibleSubjects.length === 0 ? (
                    <p className="sf-empty-state text-sm text-studyflow-text/70">
                        {hasActiveSearch
                            ? "Nenhuma disciplina corresponde à pesquisa."
                            : statusFilter === "ARCHIVED"
                              ? "Ainda não existem disciplinas arquivadas."
                              : "Ainda não existem disciplinas ativas."}
                    </p>
                ) : null}

                {visibleSubjects.map((subject) => (
                    <article
                        className="sf-surface sf-surface-interactive min-w-0 space-y-4 overflow-visible"
                        key={subject._id}
                    >
                        <div className="flex min-w-0 flex-col gap-4 border-b border-studyflow-border/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-normal text-studyflow-brandText">
                                    {subject.code}
                                </p>
                                <h2 className="break-words text-xl font-bold text-studyflow-text">
                                    {subject.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-studyflow-text">
                                    <span>
                                        {subject.description
                                            ? "Com descrição"
                                            : "Sem descrição"}
                                    </span>
                                    <span className="sf-badge">
                                        {subject.status === "ARCHIVED" ? "Arquivada · consulta" : "Apoio docente"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                                <button className="sf-button-secondary h-10" disabled={subject.status === "ARCHIVED" || updatingSubjectId === subject._id} onClick={() => openEditSubject(subject)} type="button">Editar</button>
                                <button className="sf-button-secondary h-10" disabled={updatingSubjectId === subject._id} onClick={() => void handleSubjectStatus(subject)} type="button">{updatingSubjectId === subject._id ? "A guardar..." : subject.status === "ARCHIVED" ? "Restaurar" : "Arquivar"}</button>
                                {SUBJECT_ACTIONS.filter(
                                    (action) => action.variant === "primary",
                                ).map((action) => (
                                    <a
                                        aria-label={`${action.label} de ${subject.name}`}
                                        className="sf-button-secondary h-10 w-fit gap-2 px-3"
                                        href={action.href(subject._id)}
                                        key={action.label}
                                    >
                                        <ShellIcon
                                            className="h-4 w-4 shrink-0"
                                            name={action.icon}
                                        />
                                        {action.label}
                                    </a>
                                ))}

                                <nav
                                    aria-label={`Ações de ${subject.name}`}
                                    className="flex min-w-0 flex-wrap gap-2"
                                >
                                    {SUBJECT_ACTIONS.filter(
                                        (action) => action.variant === "icon",
                                    ).map((action) => (
                                        <a
                                            aria-label={`${action.label} de ${subject.name}`}
                                            className="sf-icon-button group relative"
                                            href={action.href(subject._id)}
                                            key={action.label}
                                        >
                                            <ShellIcon
                                                className="h-5 w-5"
                                                name={action.icon}
                                            />
                                            <span className="sr-only">{action.label}</span>
                                            <IconTooltip align="center">
                                                {action.label}
                                            </IconTooltip>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {subject.description ? (
                            <p className="break-words text-sm leading-6 text-studyflow-text">
                                {subject.description}
                            </p>
                        ) : null}
                    </article>
                ))}
            </section>
            <SidePanel
                closeDisabled={isCreating}
                description="Define a disciplina usada para materiais oficiais, testes e apoio IA."
                initialFocusRef={nameInputRef}
                onClose={() => setIsCreatePanelOpen(false)}
                open={isCreatePanelOpen}
                title="Criar disciplina"
            >
                {createSubjectForm}
            </SidePanel>
            <SidePanel
                closeDisabled={Boolean(editingSubject && updatingSubjectId === editingSubject._id)}
                description="Atualiza a identificação e a descrição mostradas ao professor e aos alunos."
                initialFocusRef={editNameInputRef}
                onClose={() => setEditingSubject(null)}
                open={Boolean(editingSubject)}
                title="Editar disciplina"
            >
                {editSubjectForm}
            </SidePanel>
        </section>
    );
}
