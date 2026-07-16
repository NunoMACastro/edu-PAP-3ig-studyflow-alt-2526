/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
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
    addClassStudent,
    changeTeacherClassStatus,
    createTeacherClass,
    listTeacherClasses,
    removeClassStudent,
    updateTeacherClass,
    type SchoolClass,
} from "../../lib/apiClient.js";
import { TeacherClassAiVoiceDialog } from "./TeacherAiVoicePage.js";

type TeacherClassField = "name" | "code" | "schoolYear";
type StudentEmailField = "studentEmail";
type TeacherClassSortMode = "recent" | "name" | "schoolYear";
type TeacherClassStatusFilter = "ACTIVE" | "ARCHIVED";
type TeacherClassesPageProps = {
    initialVoiceClassId?: string;
};

type ClassShortcut = {
    label: string;
    icon: ShellIconName;
    href: (classId: string) => string;
};

const CLASS_SHORTCUTS: ClassShortcut[] = [
    {
        label: "Publicações",
        icon: "megaphone",
        href: (classId) => `/app/professor/turmas/${classId}/publicacoes`,
    },
    {
        label: "Salas guiadas",
        icon: "graduation",
        href: (classId) => `/app/professor/turmas/${classId}/salas-guiadas`,
    },
    {
        label: "Projectos",
        icon: "folder",
        href: (classId) => `/app/professor/turmas/${classId}/projectos`,
    },
    {
        label: "Resumo da turma",
        icon: "chart",
        href: (classId) => `/app/professor/turmas/${classId}/progresso`,
    },
];

const CREATE_CLASS_HASH = "#criar-turma";
const SCHOOL_YEAR_PATTERN = /^[0-9]{4}\/[0-9]{4}$/;

/**
 * Normaliza texto para pesquisas locais tolerantes a maiúsculas e acentos.
 *
 * @param value Texto original vindo da UI ou da turma.
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
 * Formata a contagem de alunos com plural simples em português.
 *
 * @param count Número de alunos inscritos na turma.
 * @returns Texto curto pronto para badges e metadados.
 */
function formatStudentCount(count: number): string {
    return `${count} ${count === 1 ? "aluno" : "alunos"}`;
}

/**
 * Formata a contagem total de turmas ativas.
 *
 * @param count Número de turmas carregadas.
 * @returns Texto curto com plural correto.
 */
function formatClassCount(count: number, status: TeacherClassStatusFilter): string {
    if (status === "ARCHIVED") {
        return `${count} ${count === 1 ? "turma arquivada" : "turmas arquivadas"}`;
    }
    return `${count} ${count === 1 ? "turma ativa" : "turmas ativas"}`;
}

/**
 * Formata a contagem de turmas visíveis depois de pesquisa local.
 *
 * @param visibleCount Número de turmas atualmente renderizadas.
 * @param totalCount Número total de turmas carregadas.
 * @returns Texto de contexto para a barra de ferramentas.
 */
function formatVisibleClassCount(visibleCount: number, totalCount: number): string {
    return `${visibleCount} de ${totalCount} ${
        totalCount === 1 ? "turma visível" : "turmas visíveis"
    }`;
}

/**
 * Extrai o primeiro ano de um valor `YYYY/YYYY` para ordenar anos letivos.
 *
 * @param schoolYear Ano letivo da turma.
 * @returns Ano inicial ou `0` quando o formato não é reconhecido.
 */
function getSchoolYearStart(schoolYear: string): number {
    const match = schoolYear.match(/^([0-9]{4})/);
    return match?.[1] ? Number(match[1]) : 0;
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
 * Lê o hash usado por atalhos para abrir a secção de alunos de uma turma.
 *
 * @returns Identificador da turma no hash atual ou `null`.
 */
function getStudentSectionClassIdFromHash(): string | null {
    const match = window.location.hash.match(/^#students-(.+)$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Valida localmente o payload de criação de turma com as mesmas fronteiras do DTO.
 *
 * @param input Campos controlados pelo formulário.
 * @returns Mapa de erros pronto para a UI.
 */
function validateTeacherClassFields(input: {
    name: string;
    code: string;
    schoolYear: string;
}): FieldErrors<TeacherClassField> {
    const nextErrors = requireFields<TeacherClassField>([
        { name: "name", label: "Nome", value: input.name },
        { name: "code", label: "Código", value: input.code },
        { name: "schoolYear", label: "Ano letivo", value: input.schoolYear },
    ]);

    const trimmedName = input.name.trim();
    const trimmedCode = input.code.trim();
    const trimmedSchoolYear = input.schoolYear.trim();

    if (!nextErrors.name && (trimmedName.length < 2 || trimmedName.length > 120)) {
        nextErrors.name = "Nome deve ter entre 2 e 120 caracteres.";
    }

    if (!nextErrors.code && (trimmedCode.length < 2 || trimmedCode.length > 40)) {
        nextErrors.code = "Código deve ter entre 2 e 40 caracteres.";
    }

    if (
        !nextErrors.schoolYear &&
        (trimmedSchoolYear.length < 4 || trimmedSchoolYear.length > 20)
    ) {
        nextErrors.schoolYear = "Ano letivo deve ter entre 4 e 20 caracteres.";
    }

    if (!nextErrors.schoolYear && !SCHOOL_YEAR_PATTERN.test(trimmedSchoolYear)) {
        nextErrors.schoolYear = "Ano letivo deve seguir o formato 2025/2026.";
    }

    return nextErrors;
}

/**
 * Página de turmas oficiais do professor.
 *
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherClassesPage({ initialVoiceClassId }: TeacherClassesPageProps = {}) {
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const editNameInputRef = useRef<HTMLInputElement | null>(null);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [schoolYear, setSchoolYear] = useState("2025/2026");
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [sortMode, setSortMode] = useState<TeacherClassSortMode>("recent");
    const [statusFilter, setStatusFilter] = useState<TeacherClassStatusFilter>("ACTIVE");
    const [classFieldErrors, setClassFieldErrors] = useState<
        FieldErrors<TeacherClassField>
    >({});
    const [studentFieldErrors, setStudentFieldErrors] = useState<
        Record<string, FieldErrors<StudentEmailField>>
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editSchoolYear, setEditSchoolYear] = useState("");
    const [editFieldErrors, setEditFieldErrors] = useState<
        FieldErrors<TeacherClassField>
    >({});
    const [shouldFocusCreatePanel, setShouldFocusCreatePanel] = useState(false);
    const [hasAutoOpenedCreatePanel, setHasAutoOpenedCreatePanel] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
    const [removingStudentKey, setRemovingStudentKey] = useState<string | null>(null);
    const [updatingClassId, setUpdatingClassId] = useState<string | null>(null);
    const [openStudentSections, setOpenStudentSections] = useState<
        Record<string, boolean>
    >({});
    const [voiceClassId, setVoiceClassId] = useState<string | null>(
        initialVoiceClassId ?? null,
    );
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
    const hasActiveSearch = searchTerm.trim().length > 0;
    const visibleClasses = useMemo(() => {
        const normalizedQuery = normalizeSearchText(searchTerm);

        return classes
            .map((schoolClass, index) => ({ index, schoolClass }))
            .filter(({ schoolClass }) => {
                if ((schoolClass.status ?? "ACTIVE") !== statusFilter) return false;
                if (!normalizedQuery) return true;

                const searchableText = normalizeSearchText(
                    `${schoolClass.name} ${schoolClass.code} ${schoolClass.schoolYear}`,
                );
                return searchableText.includes(normalizedQuery);
            })
            .sort((left, right) => {
                if (sortMode === "name") {
                    const byName = left.schoolClass.name.localeCompare(
                        right.schoolClass.name,
                        "pt",
                    );
                    if (byName !== 0) return byName;

                    return left.schoolClass.code.localeCompare(right.schoolClass.code, "pt");
                }

                if (sortMode === "schoolYear") {
                    const byYear =
                        getSchoolYearStart(right.schoolClass.schoolYear) -
                        getSchoolYearStart(left.schoolClass.schoolYear);
                    if (byYear !== 0) return byYear;

                    return left.schoolClass.name.localeCompare(right.schoolClass.name, "pt");
                }

                const byCreatedAt =
                    getCreatedAtTimestamp(right.schoolClass.createdAt) -
                    getCreatedAtTimestamp(left.schoolClass.createdAt);
                if (byCreatedAt !== 0) return byCreatedAt;

                return left.index - right.index;
            })
            .map(({ schoolClass }) => schoolClass);
    }, [classes, searchTerm, sortMode, statusFilter]);
    const statusClassCount = classes.filter(
        (schoolClass) => (schoolClass.status ?? "ACTIVE") === statusFilter,
    ).length;

    /**
     * Carrega as turmas iniciais respeitando unmounts durante a chamada assíncrona.
     *
     * @param active Função que indica se o componente ainda pode receber estado.
     * @returns Promise resolvida depois de carregar ou falhar de forma controlada.
     */
    async function loadInitialClasses(active: () => boolean): Promise<void> {
        const measurement = startPerformanceBudget("teacher-classes-dashboard");
        setIsLoading(true);
        setError(null);
        setPerformanceWarning(null);
        try {
            const nextClasses = await listTeacherClasses();
            if (active()) setClasses(nextClasses);
        } catch (caught) {
            if (active()) {
                setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
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
     * Aplica no estado local a turma devolvida pela mutação confirmada pela API.
     *
     * @param nextClass Turma criada ou atualizada pelo backend.
     * @returns Nada; apenas sincroniza a lista visível.
     */
    function upsertClass(nextClass: SchoolClass): void {
        setClasses((current) => {
            const exists = current.some((schoolClass) => schoolClass._id === nextClass._id);
            if (!exists) return [nextClass, ...current];

            return current.map((schoolClass) =>
                schoolClass._id === nextClass._id ? nextClass : schoolClass,
            );
        });
    }

    useEffect(() => {
        let active = true;
        void loadInitialClasses(() => active);
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isLoading && classes.length === 0 && !hasAutoOpenedCreatePanel) {
            setIsCreatePanelOpen(true);
            setHasAutoOpenedCreatePanel(true);
        }
    }, [classes.length, hasAutoOpenedCreatePanel, isLoading]);

    useEffect(() => {
        function applyHashShortcut(): void {
            if (window.location.hash === CREATE_CLASS_HASH) {
                setIsCreatePanelOpen(true);
                setShouldFocusCreatePanel(true);
                return;
            }

            const classId = getStudentSectionClassIdFromHash();
            if (!classId) return;
            setOpenStudentSections((current) => ({
                ...current,
                [classId]: true,
            }));
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

    const selectedVoiceClass = useMemo(
        () => classes.find((schoolClass) => schoolClass._id === voiceClassId),
        [classes, voiceClassId],
    );

    /**
     * Remove uma mensagem de validação quando o professor começa a corrigir o campo.
     *
     * @param field Campo do formulário de criação de turma.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearClassFieldError(field: TeacherClassField): void {
        setClassFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Remove o erro do email de aluno dentro da turma indicada.
     *
     * @param classId Turma onde o professor está a escrever.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearStudentFieldError(classId: string): void {
        setStudentFieldErrors((current) => ({
            ...current,
            [classId]: {},
        }));
    }

    /**
     * Alterna a área de gestão de alunos sem alterar a rota atual.
     *
     * @param classId Turma cujo painel deve abrir ou fechar.
     * @returns Nada; apenas altera estado local.
     */
    function toggleStudentSection(classId: string): void {
        setOpenStudentSections((current) => ({
            ...current,
            [classId]: !current[classId],
        }));
    }

    /**
     * Abre a configuração da voz IA como ação contextual da turma.
     *
     * @param classId Turma cuja voz base deve ser editada.
     * @returns Nada; apenas mostra a modal.
     */
    function openVoiceDialog(classId: string): void {
        setVoiceClassId(classId);
    }

    /**
     * Fecha a configuração da voz e repõe o URL base quando veio de deep link antigo.
     *
     * @returns Nada; apenas sincroniza estado local e histórico do browser.
     */
    function closeVoiceDialog(): void {
        const currentVoiceClassId = voiceClassId;
        setVoiceClassId(null);
        if (
            currentVoiceClassId &&
            window.location.pathname ===
                `/app/professor/turmas/${currentVoiceClassId}/voz`
        ) {
            window.history.replaceState(null, "", "/app/professor/turmas");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     * @returns Promise resolvida depois de criar ou reportar erro.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const trimmedName = name.trim();
        const trimmedCode = code.trim();
        const trimmedSchoolYear = schoolYear.trim();
        const nextErrors = validateTeacherClassFields({
            name: trimmedName,
            code: trimmedCode,
            schoolYear: trimmedSchoolYear,
        });

        if (hasFieldErrors(nextErrors)) {
            // A API continua a ser a barreira de segurança; este return evita um pedido vazio.
            setClassFieldErrors(nextErrors);
            return;
        }

        setClassFieldErrors({});
        setIsCreating(true);
        try {
            // O backend valida o professor autenticado; a UI nao envia teacherId.
            const createdClass = await createTeacherClass({
                name: trimmedName,
                code: trimmedCode,
                schoolYear: trimmedSchoolYear,
            });
            upsertClass(createdClass);
            setName("");
            setCode("");
            setIsCreatePanelOpen(false);
            setSuccessMessage("Turma criada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar turma.");
        } finally {
            setIsCreating(false);
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param classId Identificador usado para limitar a operação a turma.
     * @returns Promise resolvida depois de associar aluno ou reportar erro.
     */
    async function handleAddStudent(classId: string): Promise<void> {
        setError(null);
        setSuccessMessage(null);
        const email = emails[classId] ?? "";

        const nextErrors = requireFields<StudentEmailField>([
            { name: "studentEmail", label: "Email do aluno", value: email },
        ]);

        if (hasFieldErrors(nextErrors)) {
            // Evita a chamada vazia; ownership e permissões continuam no backend.
            setStudentFieldErrors((current) => ({
                ...current,
                [classId]: nextErrors,
            }));
            return;
        }

        setStudentFieldErrors((current) => ({ ...current, [classId]: {} }));
        setAddingStudentId(classId);
        try {
            const updatedClass = await addClassStudent(classId, email.trim());
            upsertClass(updatedClass);
            setEmails((current) => ({ ...current, [classId]: "" }));
            setSuccessMessage("Aluno adicionado à turma.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar aluno.");
        } finally {
            setAddingStudentId(null);
        }
    }

    /**
     * Remove a associação de um aluno após confirmação explícita do professor.
     *
     * @param classId Turma onde o aluno está inscrito.
     * @param className Nome da turma usado para contexto na confirmação.
     * @param studentId Aluno a desassociar.
     * @param studentEmail Email visível do aluno, usado apenas na UI.
     * @returns Promise resolvida depois de remover ou reportar erro.
     */
    async function handleRemoveStudent(
        classId: string,
        className: string,
        studentId: string,
        studentEmail: string,
    ): Promise<void> {
        const confirmed = window.confirm(
            `Remover ${studentEmail} da turma ${className}?`,
        );
        if (!confirmed) return;

        setError(null);
        setSuccessMessage(null);
        const mutationKey = `${classId}:${studentId}`;
        setRemovingStudentKey(mutationKey);
        try {
            const updatedClass = await removeClassStudent(classId, studentId);
            upsertClass(updatedClass);
            setSuccessMessage("Aluno removido da turma.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao remover aluno.");
        } finally {
            setRemovingStudentKey(null);
        }
    }

    /** Abre o formulário contextual com os dados atuais da turma. */
    function openEditClass(schoolClass: SchoolClass): void {
        setIsCreatePanelOpen(false);
        setEditingClass(schoolClass);
        setEditName(schoolClass.name);
        setEditCode(schoolClass.code);
        setEditSchoolYear(schoolClass.schoolYear);
        setEditFieldErrors({});
        setError(null);
        setSuccessMessage(null);
    }

    /** Remove um erro do formulário de edição quando o respetivo campo muda. */
    function clearEditFieldError(field: TeacherClassField): void {
        setEditFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /** Persiste a edição da turma e fecha o painel apenas depois de sucesso. */
    async function handleEditClass(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!editingClass) return;
        const validation = validateTeacherClassFields({
            name: editName,
            code: editCode,
            schoolYear: editSchoolYear,
        });
        if (hasFieldErrors(validation)) {
            setEditFieldErrors(validation);
            return;
        }
        setUpdatingClassId(editingClass._id);
        setEditFieldErrors({});
        setError(null);
        try {
            upsertClass(await updateTeacherClass(editingClass._id, {
                name: editName.trim(),
                code: editCode.trim(),
                schoolYear: editSchoolYear.trim(),
            }));
            setEditingClass(null);
            setSuccessMessage("Turma atualizada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao atualizar turma.");
        } finally {
            setUpdatingClassId(null);
        }
    }

    /** Arquiva ou restaura a turma após confirmação explícita. */
    async function handleClassStatus(schoolClass: SchoolClass): Promise<void> {
        const nextStatus = schoolClass.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
        if (nextStatus === "ARCHIVED" && !window.confirm(`Arquivar a turma ${schoolClass.name}? As atividades ativas serão encerradas.`)) return;
        setUpdatingClassId(schoolClass._id);
        setError(null);
        try {
            upsertClass(await changeTeacherClassStatus(schoolClass._id, nextStatus));
            setSuccessMessage(nextStatus === "ACTIVE" ? "Turma restaurada." : "Turma arquivada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao alterar estado da turma.");
        } finally {
            setUpdatingClassId(null);
        }
    }

    const createClassForm = (
        <form
            className="space-y-5"
            id="criar-turma"
            noValidate
            onSubmit={(event) => void handleCreate(event)}
        >
            <div className="grid min-w-0 gap-5">
                <FormField
                    helpText="Nome visivel da turma para alunos e professor."
                    id="teacherClassName"
                    label="Nome"
                    error={classFieldErrors.name}
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
                            clearClassFieldError("name");
                        }}
                    />
                </FormField>

                <FormField
                    helpText="Codigo curto usado para identificar a turma."
                    id="teacherClassCode"
                    label="Código"
                    error={classFieldErrors.code}
                >
                    <input
                        className="sf-field"
                        disabled={isCreating}
                        maxLength={40}
                        minLength={2}
                        value={code}
                        onChange={(event) => {
                            setCode(event.target.value);
                            clearClassFieldError("code");
                        }}
                    />
                </FormField>

                <FormField
                    helpText="Formato esperado: 2025/2026."
                    id="teacherClassSchoolYear"
                    label="Ano letivo"
                    error={classFieldErrors.schoolYear}
                >
                    <input
                        className="sf-field"
                        disabled={isCreating}
                        maxLength={20}
                        minLength={4}
                        pattern="[0-9]{4}/[0-9]{4}"
                        value={schoolYear}
                        onChange={(event) => {
                            setSchoolYear(event.target.value);
                            clearClassFieldError("schoolYear");
                        }}
                    />
                </FormField>

                <button
                    className="sf-button-primary mt-2 min-h-11 w-full"
                    disabled={isCreating}
                    type="submit"
                >
                    {isCreating ? "A criar..." : "Criar turma"}
                </button>
            </div>
        </form>
    );

    const editClassForm = editingClass ? (
        <form className="space-y-5" id="editar-turma" noValidate onSubmit={(event) => void handleEditClass(event)}>
            <FormField
                helpText="Nome visível da turma para alunos e professor."
                id="editTeacherClassName"
                label="Nome"
                error={editFieldErrors.name}
            >
                <input
                    className="sf-field"
                    disabled={updatingClassId === editingClass._id}
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
                helpText="Código curto usado para identificar a turma."
                id="editTeacherClassCode"
                label="Código"
                error={editFieldErrors.code}
            >
                <input
                    className="sf-field"
                    disabled={updatingClassId === editingClass._id}
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
                helpText="Formato esperado: 2025/2026."
                id="editTeacherClassSchoolYear"
                label="Ano letivo"
                error={editFieldErrors.schoolYear}
            >
                <input
                    className="sf-field"
                    disabled={updatingClassId === editingClass._id}
                    maxLength={20}
                    minLength={4}
                    onChange={(event) => {
                        setEditSchoolYear(event.target.value);
                        clearEditFieldError("schoolYear");
                    }}
                    pattern="[0-9]{4}/[0-9]{4}"
                    value={editSchoolYear}
                />
            </FormField>
            <button
                className="sf-button-primary min-h-11 w-full"
                disabled={updatingClassId === editingClass._id}
                type="submit"
            >
                {updatingClassId === editingClass._id ? "A guardar..." : "Guardar alterações"}
            </button>
        </form>
    ) : null;

    return (
        <section className="space-y-6">
            <PageHeader
                title="Turmas"
                description="Gestão docente de turmas, alunos inscritos e atalhos para disciplinas, publicações e progresso."
                action={
                    <button
                        aria-controls="criar-turma"
                        aria-expanded={isCreatePanelOpen}
                        className="sf-button-primary w-fit gap-2"
                        onClick={() => setIsCreatePanelOpen((current) => !current)}
                        type="button"
                    >
                        <ShellIcon className="h-4 w-4" name="plus" />
                        {classes.length > 0 ? "Nova turma" : "Criar turma"}
                    </button>
                }
            />

            {!isLoading && classes.length > 0 ? (
                <section
                    aria-label="Ferramentas de turmas"
                    className="sf-toolbar md:grid-cols-[minmax(0,1fr)_12rem_14rem_auto] md:items-end"
                >
                    <label className="grid min-w-0 gap-2 text-sm text-studyflow-text">
                        <span className="font-semibold">Pesquisar turma</span>
                        <input
                            className="sf-field"
                            placeholder="Nome, código ou ano"
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
                                setStatusFilter(event.target.value as TeacherClassStatusFilter)
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
                                setSortMode(event.target.value as TeacherClassSortMode)
                            }
                        >
                            <option value="recent">Mais recentes</option>
                            <option value="name">Nome A-Z</option>
                            <option value="schoolYear">Ano letivo</option>
                        </select>
                    </label>

                    <p className="text-sm text-studyflow-text/65 md:pb-3">
                        {hasActiveSearch
                            ? formatVisibleClassCount(visibleClasses.length, statusClassCount)
                            : formatClassCount(statusClassCount, statusFilter)}
                    </p>
                </section>
            ) : null}

            {!isLoading && classes.length === 0 ? (
                <div className="sf-empty-state">
                    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-studyflow-brand/15 text-studyflow-brandText">
                        <ShellIcon className="h-5 w-5" name="graduation" />
                    </span>
                    <p className="text-sm text-studyflow-text/70">
                        Ainda não tens turmas criadas.
                    </p>
                </div>
            ) : null}

            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {successMessage ? (
                <p className="sf-success" role="status">{successMessage}</p>
            ) : null}

            <section aria-label="Turmas do professor" className="min-w-0 space-y-4">
                {isLoading ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-text">A carregar turmas...</p>
                ) : null}
                {performanceWarning ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-alertText" role="status">
                        {performanceWarning}
                    </p>
                ) : null}
                {!isLoading && classes.length === 0 && !isCreatePanelOpen ? (
                    <p className="sf-empty-state text-sm text-studyflow-text/70">
                        Cria a primeira turma para associar alunos, disciplinas e atividades.
                    </p>
                ) : null}
                {!isLoading && classes.length > 0 && visibleClasses.length === 0 ? (
                    <p className="sf-empty-state text-sm text-studyflow-text/70">
                        {hasActiveSearch
                            ? "Nenhuma turma corresponde à pesquisa."
                            : statusFilter === "ARCHIVED"
                              ? "Ainda não existem turmas arquivadas."
                              : "Ainda não existem turmas ativas."}
                    </p>
                ) : null}

                {visibleClasses.map((schoolClass) => {
                    const visibleStudents = schoolClass.students ?? [];
                    const totalStudents = schoolClass.studentIds?.length ?? schoolClass.students?.length ?? 0;
                    const hasStudents = totalStudents > 0;
                    const studentManagementLabel = hasStudents
                        ? `Gerir ${formatStudentCount(totalStudents)}`
                        : "Adicionar primeiro aluno";

                    return (
                        <article
                            className="sf-surface sf-surface-interactive min-w-0 space-y-4 overflow-visible"
                            key={schoolClass._id}
                        >
                            <div className="flex min-w-0 flex-col gap-4 border-b border-studyflow-border/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-normal text-studyflow-brandText">
                                        {schoolClass.code} · {schoolClass.schoolYear}
                                    </p>
                                    <h2 className="break-words text-xl font-bold text-studyflow-text">
                                        {schoolClass.name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-studyflow-text">
                                        <span>{formatStudentCount(totalStudents)}</span>
                                        <span className="sf-badge">
                                            {schoolClass.status === "ARCHIVED" ? "Arquivada · consulta" : hasStudents ? "Com alunos" : "Sem alunos"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                                    <button className="sf-button-secondary h-10" disabled={schoolClass.status === "ARCHIVED" || updatingClassId === schoolClass._id} onClick={() => openEditClass(schoolClass)} type="button">Editar</button>
                                    <button className="sf-button-secondary h-10" disabled={updatingClassId === schoolClass._id} onClick={() => void handleClassStatus(schoolClass)} type="button">{updatingClassId === schoolClass._id ? "A guardar..." : schoolClass.status === "ARCHIVED" ? "Restaurar" : "Arquivar"}</button>
                                    <button
                                        aria-label={`Voz IA da turma ${schoolClass.name}`}
                                        aria-haspopup="dialog"
                                        className="sf-button-secondary h-10 w-fit min-w-0 gap-2 px-3"
                                        disabled={schoolClass.status === "ARCHIVED"}
                                        onClick={() => openVoiceDialog(schoolClass._id)}
                                        type="button"
                                    >
                                        <ShellIcon className="h-4 w-4 shrink-0" name="spark" />
                                        <span className="truncate">Voz IA da turma</span>
                                    </button>

                                    <a
                                        className="sf-button-secondary h-10 w-fit gap-2 px-3"
                                        href={`/app/professor/turmas/${schoolClass._id}/disciplinas`}
                                    >
                                        <ShellIcon className="h-4 w-4 shrink-0" name="book" />
                                        Gerir disciplinas
                                    </a>

                                    <nav
                                        aria-label={`Atalhos de ${schoolClass.name}`}
                                        className="flex min-w-0 flex-wrap gap-2"
                                    >
                                        {CLASS_SHORTCUTS.map((shortcut) => (
                                            <a
                                                aria-label={`${shortcut.label} de ${schoolClass.name}`}
                                                className="sf-icon-button group relative"
                                                href={shortcut.href(schoolClass._id)}
                                                key={shortcut.label}
                                            >
                                                <ShellIcon className="h-5 w-5" name={shortcut.icon} />
                                                <span className="sr-only">{shortcut.label}</span>
                                                <IconTooltip align="center">
                                                    {shortcut.label}
                                                </IconTooltip>
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            <button
                                aria-label={studentManagementLabel}
                                aria-controls={`students-panel-${schoolClass._id}`}
                                aria-expanded={Boolean(openStudentSections[schoolClass._id])}
                                className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-studyflow-text transition hover:bg-studyflow-page/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
                                id={`students-${schoolClass._id}`}
                                onClick={() => toggleStudentSection(schoolClass._id)}
                                type="button"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <ShellIcon className="h-4 w-4 shrink-0" name="users" />
                                    <span className="truncate">{studentManagementLabel}</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-normal text-studyflow-brandText">
                                    {openStudentSections[schoolClass._id] ? "Ocultar" : "Gerir"}
                                    <ShellIcon
                                        className={`h-4 w-4 transition ${
                                            openStudentSections[schoolClass._id]
                                                ? "-rotate-90"
                                                : "rotate-90"
                                        }`}
                                        name="arrowRight"
                                    />
                                </span>
                            </button>

                            {openStudentSections[schoolClass._id] ? (
                                <section
                                    aria-labelledby={`students-${schoolClass._id}`}
                                    className="min-w-0 space-y-4 border-t border-studyflow-border/10 pt-4"
                                    id={`students-panel-${schoolClass._id}`}
                                >
                                    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)]">
                                        <div className="min-w-0 space-y-3">
                                            {visibleStudents.length > 0 ? (
                                                <ul className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                                    {visibleStudents.map((student) => {
                                                        const mutationKey = `${schoolClass._id}:${student.id}`;
                                                        return (
                                                            <li
                                                                className="flex min-w-0 items-center gap-2 rounded-xl bg-studyflow-page/55 px-3 py-2 text-sm text-studyflow-text"
                                                                key={student.id}
                                                            >
                                                                <span className="min-w-0 flex-1" title={`${student.displayName ?? student.email} — ${student.email}`}>
                                                                    <span className="block truncate font-semibold">{student.displayName ?? student.email}</span>
                                                                    <span className="block truncate text-xs text-studyflow-text/60">{student.email}</span>
                                                                </span>
                                                                <button
                                                                    aria-label={`Remover ${student.displayName ?? student.email} de ${schoolClass.name}`}
                                                                    className="sf-icon-button group relative h-8 w-8 shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    disabled={schoolClass.status === "ARCHIVED" || removingStudentKey === mutationKey}
                                                                    onClick={() =>
                                                                        void handleRemoveStudent(
                                                                            schoolClass._id,
                                                                            schoolClass.name,
                                                                            student.id,
                                                                            student.email,
                                                                        )
                                                                    }
                                                                    type="button"
                                                                >
                                                                    <ShellIcon className="h-4 w-4" name="trash" />
                                                                    <IconTooltip align="right">
                                                                        Remover aluno
                                                                    </IconTooltip>
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p className="rounded-xl border border-dashed border-studyflow-border/15 px-3 py-2 text-sm text-studyflow-text/70">
                                                    {totalStudents > 0
                                                        ? "Há alunos inscritos sem email disponível."
                                                        : "Ainda não há alunos inscritos."}
                                                </p>
                                            )}
                                        </div>

                                        {schoolClass.status !== "ARCHIVED" ? <form
                                            className="min-w-0 space-y-3"
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                void handleAddStudent(schoolClass._id);
                                            }}
                                        >
                                            <FormField
                                                helpText="Usa o email da conta StudyFlow do aluno."
                                                id={`studentEmail-${schoolClass._id}`}
                                                label="Adicionar aluno"
                                                error={studentFieldErrors[schoolClass._id]?.studentEmail}
                                            >
                                                <input
                                                    className="sf-field"
                                                    disabled={addingStudentId === schoolClass._id}
                                                    type="email"
                                                    value={emails[schoolClass._id] ?? ""}
                                                    onChange={(event) => {
                                                        setEmails((current) => ({
                                                            ...current,
                                                            [schoolClass._id]: event.target.value,
                                                        }));
                                                        clearStudentFieldError(schoolClass._id);
                                                    }}
                                                />
                                            </FormField>
                                            <button
                                                className="sf-button-secondary w-full sm:w-fit"
                                                disabled={addingStudentId === schoolClass._id}
                                                type="submit"
                                            >
                                                {addingStudentId === schoolClass._id
                                                    ? "A adicionar..."
                                                    : "Adicionar aluno"}
                                            </button>
                                        </form> : <p className="sf-notice text-sm">A turma arquivada permanece disponível apenas para consulta.</p>}
                                    </div>
                                </section>
                            ) : null}
                        </article>
                    );
                })}
            </section>
            <SidePanel
                closeDisabled={isCreating}
                description="Define a identificação usada pelos alunos e pelas áreas docentes."
                initialFocusRef={nameInputRef}
                onClose={() => setIsCreatePanelOpen(false)}
                open={isCreatePanelOpen}
                title="Criar turma"
            >
                {createClassForm}
            </SidePanel>
            <SidePanel
                closeDisabled={Boolean(editingClass && updatingClassId === editingClass._id)}
                description="Atualiza a identificação refletida nas áreas do professor e do aluno."
                initialFocusRef={editNameInputRef}
                onClose={() => setEditingClass(null)}
                open={Boolean(editingClass)}
                title="Editar turma"
            >
                {editClassForm}
            </SidePanel>
            {voiceClassId ? (
                <TeacherClassAiVoiceDialog
                    classId={voiceClassId}
                    className={selectedVoiceClass?.name}
                    onClose={closeVoiceDialog}
                />
            ) : null}
        </section>
    );
}
