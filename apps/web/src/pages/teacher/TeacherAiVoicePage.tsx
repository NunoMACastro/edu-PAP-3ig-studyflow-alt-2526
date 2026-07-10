/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
    deleteTeacherAiVoiceOverride,
    getClassTeacherAiVoice,
    getTeacherAiVoice,
    TeacherAiVoice,
    updateClassTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherAiVoicePageProps = {
    subjectId: string;
};

type TeacherClassAiVoiceDialogProps = {
    classId: string;
    className?: string;
    onClose: () => void;
};

type TeacherClassAiVoiceEditorProps = {
    classId: string;
    className?: string;
    surface: "page" | "dialog";
    onClose?: () => void;
};

type VoiceFormProps = {
    title: string;
    subtitle?: string;
    voice: TeacherAiVoice;
    rulesText: string;
    error: string | null;
    success: string | null;
    isSubjectOverride: boolean;
    ruleSelections: VoiceRuleSelections;
    onVoiceChange: (voice: TeacherAiVoice) => void;
    onRulesChange: (rules: string) => void;
    onRuleSelectionChange: (groupId: VoiceRuleGroupId, optionId: string) => void;
    onSubmit: (event: FormEvent) => void;
    onDeleteOverride?: () => void;
    onClose?: () => void;
    surface?: "page" | "dialog";
};

type VoiceRuleGroupId = "explanation" | "feedback" | "examples" | "boundaries";

type VoiceRuleOption = {
    id: string;
    label: string;
    rule?: string;
};

type VoiceRuleGroup = {
    id: VoiceRuleGroupId;
    label: string;
    helpText: string;
    options: VoiceRuleOption[];
};

type VoiceRuleSelections = Record<VoiceRuleGroupId, string>;

const NO_RULE_OPTION_ID = "none";
const MAX_VOICE_RULES = 12;
const MAX_VOICE_RULE_LENGTH = 180;

const DEFAULT_RULE_SELECTIONS: VoiceRuleSelections = {
    explanation: NO_RULE_OPTION_ID,
    feedback: NO_RULE_OPTION_ID,
    examples: NO_RULE_OPTION_ID,
    boundaries: NO_RULE_OPTION_ID,
};

const VOICE_RULE_GROUPS: VoiceRuleGroup[] = [
    {
        id: "explanation",
        label: "Estratégia",
        helpText: "Como conduz a explicação.",
        options: [
            { id: NO_RULE_OPTION_ID, label: "Sem preferência" },
            {
                id: "guided_questions",
                label: "Perguntas orientadoras",
                rule: "Guiar primeiro com perguntas curtas antes de dar a resposta final.",
            },
            {
                id: "step_by_step",
                label: "Passo a passo",
                rule: "Explicar em passos graduais, confirmando cada ideia antes de avançar.",
            },
            {
                id: "direct_answer",
                label: "Resposta direta",
                rule: "Começar pela resposta direta e só depois acrescentar contexto essencial.",
            },
        ],
    },
    {
        id: "feedback",
        label: "Feedback ao aluno",
        helpText: "Como reage a erros.",
        options: [
            { id: NO_RULE_OPTION_ID, label: "Sem preferência" },
            {
                id: "hint_first",
                label: "Dar pistas",
                rule: "Quando houver erro, dar uma pista antes de revelar a solução completa.",
            },
            {
                id: "explain_mistake",
                label: "Explicar o erro",
                rule: "Quando corrigir, explicar a causa provável do erro de forma construtiva.",
            },
            {
                id: "quick_validation",
                label: "Validar rápido",
                rule: "Validar respostas corretas de forma breve e avançar para o próximo passo.",
            },
        ],
    },
    {
        id: "examples",
        label: "Exemplos",
        helpText: "Que exemplos privilegia.",
        options: [
            { id: NO_RULE_OPTION_ID, label: "Sem preferência" },
            {
                id: "pap_examples",
                label: "Ligados à PAP",
                rule: "Usar exemplos ligados à PAP e ao projeto do aluno quando fizer sentido.",
            },
            {
                id: "daily_examples",
                label: "Do quotidiano",
                rule: "Usar exemplos do quotidiano antes de exemplos abstratos.",
            },
            {
                id: "code_examples",
                label: "Código/projeto",
                rule: "Quando aplicável, usar exemplos próximos de código, projeto ou produto.",
            },
        ],
    },
    {
        id: "boundaries",
        label: "Limites",
        helpText: "Que fronteiras reforça.",
        options: [
            { id: NO_RULE_OPTION_ID, label: "Sem preferência" },
            {
                id: "sources_first",
                label: "Fontes primeiro",
                rule: "Assinalar quando a resposta depende apenas dos materiais oficiais disponíveis.",
            },
            {
                id: "no_unsourced",
                label: "Sem extrapolar",
                rule: "Evitar respostas sem base nos materiais oficiais da turma.",
            },
            {
                id: "check_understanding",
                label: "Confirmar compreensão",
                rule: "Terminar com uma pergunta breve para verificar se o aluno compreendeu.",
            },
        ],
    },
];

/**
 * Separa regras conhecidas das regras livres para preencher os controlos guiados.
 *
 * @param rules Regras efetivas carregadas da API.
 * @returns Estado inicial dos selects e texto livre restante.
 */
function splitRulesForEditor(rules: string[]): {
    selections: VoiceRuleSelections;
    customRulesText: string;
} {
    const remainingRules = [...rules];
    const selections: VoiceRuleSelections = { ...DEFAULT_RULE_SELECTIONS };

    for (const group of VOICE_RULE_GROUPS) {
        const matchedOption = group.options.find(
            (option) => option.rule && remainingRules.includes(option.rule),
        );
        if (!matchedOption?.rule) continue;

        selections[group.id] = matchedOption.id;
        remainingRules.splice(remainingRules.indexOf(matchedOption.rule), 1);
    }

    return {
        selections,
        customRulesText: remainingRules.join("\n"),
    };
}

/**
 * Compõe as regras que serão guardadas, mantendo os presets e as regras livres no contrato existente.
 *
 * @param selections Opções pedagógicas escolhidas nos controlos guiados.
 * @param customRulesText Regras livres escritas pelo professor, uma por linha.
 * @returns Lista normalizada antes de enviar para a API.
 */
function buildVoiceRules(
    selections: VoiceRuleSelections,
    customRulesText: string,
): string[] {
    const guidedRules = VOICE_RULE_GROUPS.flatMap((group) => {
        const selectedOption = group.options.find(
            (option) => option.id === selections[group.id],
        );
        return selectedOption?.rule ? [selectedOption.rule] : [];
    });
    const customRules = customRulesText
        .split("\n")
        .map((rule) => rule.trim())
        .filter((rule) => rule.length > 0);

    return [...guidedRules, ...customRules];
}

/**
 * Valida localmente limites que o backend também aplica.
 *
 * @param rules Regras normalizadas antes de persistir.
 * @returns Mensagem de erro local ou `null` quando o payload é válido.
 */
function validateVoiceRules(rules: string[]): string | null {
    if (rules.length > MAX_VOICE_RULES) {
        return `A voz da IA aceita no máximo ${MAX_VOICE_RULES} orientações.`;
    }

    if (rules.some((rule) => rule.length > MAX_VOICE_RULE_LENGTH)) {
        return `Cada orientação deve ter no máximo ${MAX_VOICE_RULE_LENGTH} caracteres.`;
    }

    return null;
}

/**
 * Botão de ajuda local para explicar conceitos de configuração sem ocupar espaço permanente.
 *
 * @param props Identificador acessível da tooltip.
 * @returns Botão compacto que alterna a tooltip informativa.
 */
function VoiceGuidanceTooltip({ tooltipId }: { tooltipId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span className="relative inline-flex">
            <button
                aria-describedby={isOpen ? tooltipId : undefined}
                aria-expanded={isOpen}
                aria-label="Ajuda sobre este campo"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-studyflow-border/50 text-xs font-bold text-studyflow-text transition hover:bg-studyflow-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
                type="button"
                onBlur={() => setIsOpen(false)}
                onClick={() => setIsOpen((current) => !current)}
            >
                i
            </button>
            {isOpen ? (
                <span
                    className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-md border border-studyflow-border/50 bg-studyflow-page px-3 py-2 text-xs font-medium leading-5 text-studyflow-text shadow-xl"
                    id={tooltipId}
                    role="tooltip"
                >
                    São instruções curtas que guiam a IA desta turma. Usa uma por linha
                    para definir hábitos do docente, exemplos preferidos, limites de
                    resposta ou formas de corrigir alunos.
                </span>
            ) : null}
        </span>
    );
}

/**
 * Modal contextual para editar a voz base da turma sem sair da página de turmas.
 *
 * @param props Identificador da turma, nome visível e callback de fecho.
 * @returns Dialog acessível com o editor de voz da turma.
 */
export function TeacherClassAiVoiceDialog({
    classId,
    className,
    onClose,
}: TeacherClassAiVoiceDialogProps) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            aria-labelledby="teacher-class-ai-voice-dialog-title"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            role="dialog"
        >
            <div className="w-full max-w-2xl rounded-lg border border-studyflow-border/40 bg-studyflow-card shadow-2xl">
                <TeacherClassAiVoiceEditor
                    classId={classId}
                    className={className}
                    onClose={onClose}
                    surface="dialog"
                />
            </div>
        </div>
    );
}

/**
 * Editor reutilizável da voz textual base da turma.
 *
 * @param props Identificador da turma, superfície visual e callback opcional de fecho.
 * @returns Formulário de voz da IA docente para página ou modal.
 */
function TeacherClassAiVoiceEditor({
    classId,
    className,
    onClose,
    surface,
}: TeacherClassAiVoiceEditorProps) {
    const [voice, setVoice] = useState<TeacherAiVoice | null>(null);
    const [rulesText, setRulesText] = useState("");
    const [ruleSelections, setRuleSelections] =
        useState<VoiceRuleSelections>(DEFAULT_RULE_SELECTIONS);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setVoice(null);
        setRulesText("");
        setRuleSelections(DEFAULT_RULE_SELECTIONS);
        setError(null);
        setSuccess(null);

        getClassTeacherAiVoice(classId)
            .then((loadedVoice) => {
                if (!active) return;
                const editorState = splitRulesForEditor(loadedVoice.rules);
                setVoice(loadedVoice);
                setRulesText(editorState.customRulesText);
                setRuleSelections(editorState.selections);
            })
            .catch((caught: unknown) => {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Erro ao carregar voz.");
            });

        return () => {
            active = false;
        };
    }, [classId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!voice) return;
        setError(null);
        setSuccess(null);
        const rules = buildVoiceRules(ruleSelections, rulesText);
        const validationError = validateVoiceRules(rules);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const updated = await updateClassTeacherAiVoice(classId, {
                tone: voice.tone,
                detailLevel: voice.detailLevel,
                rules,
            });
            const editorState = splitRulesForEditor(updated.rules);
            setVoice(updated);
            setRulesText(editorState.customRulesText);
            setRuleSelections(editorState.selections);
            if (onClose) {
                onClose();
                return;
            }
            setSuccess("Voz da turma guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar voz.");
        }
    }

    if (!voice) {
        const loadingContent = (
            <>
                {error ? <p className="sf-error">{error}</p> : null}
                {!error ? (
                    <p className="text-sm text-studyflow-text">A carregar voz...</p>
                ) : null}
            </>
        );

        if (surface === "dialog") {
            return (
                <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <h1
                            className="text-lg font-bold text-studyflow-text"
                            id="teacher-class-ai-voice-dialog-title"
                        >
                            Voz IA da turma
                        </h1>
                        {onClose ? (
                            <button
                                aria-label="Fechar configuração da voz"
                                className="sf-button-secondary h-8 w-8 shrink-0 border-studyflow-border/50 px-0 py-0 text-base"
                                type="button"
                                onClick={onClose}
                            >
                                ×
                            </button>
                        ) : null}
                    </div>
                    {loadingContent}
                </div>
            );
        }

        return <div className="sf-panel mx-auto max-w-3xl">{loadingContent}</div>;
    }

    return (
        <TeacherVoiceForm
            title="Voz IA da turma"
            subtitle={className ? `Turma: ${className}` : undefined}
            voice={voice}
            rulesText={rulesText}
            error={error}
            success={success}
            isSubjectOverride={false}
            ruleSelections={ruleSelections}
            onVoiceChange={setVoice}
            onRulesChange={setRulesText}
            onRuleSelectionChange={(groupId, optionId) =>
                setRuleSelections((current) => ({ ...current, [groupId]: optionId }))
            }
            onSubmit={(event) => void handleSubmit(event)}
            onClose={onClose}
            surface={surface}
        />
    );
}

/**
 * Página de configuração do override textual docente numa disciplina.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherAiVoicePage({ subjectId }: TeacherAiVoicePageProps) {
    const [voice, setVoice] = useState<TeacherAiVoice | null>(null);
    const [rulesText, setRulesText] = useState("");
    const [ruleSelections, setRuleSelections] =
        useState<VoiceRuleSelections>(DEFAULT_RULE_SELECTIONS);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setVoice(null);
        setRulesText("");
        setRuleSelections(DEFAULT_RULE_SELECTIONS);
        setError(null);
        setSuccess(null);

        getTeacherAiVoice(subjectId)
            .then((loadedVoice) => {
                if (!active) return;
                const editorState = splitRulesForEditor(loadedVoice.rules);
                setVoice(loadedVoice);
                setRulesText(editorState.customRulesText);
                setRuleSelections(editorState.selections);
            })
            .catch((caught: unknown) => {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Erro ao carregar voz.");
            });

        return () => {
            active = false;
        };
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!voice) return;
        setError(null);
        setSuccess(null);
        const rules = buildVoiceRules(ruleSelections, rulesText);
        const validationError = validateVoiceRules(rules);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const updated = await updateTeacherAiVoice(subjectId, {
                tone: voice.tone,
                detailLevel: voice.detailLevel,
                rules,
            });
            const editorState = splitRulesForEditor(updated.rules);
            setVoice(updated);
            setRulesText(editorState.customRulesText);
            setRuleSelections(editorState.selections);
            setSuccess("Override da disciplina guardado.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar voz.");
        }
    }

    /**
     * Remove o override da disciplina e repõe a voz herdada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleDeleteOverride(): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            const updated = await deleteTeacherAiVoiceOverride(subjectId);
            const editorState = splitRulesForEditor(updated.rules);
            setVoice(updated);
            setRulesText(editorState.customRulesText);
            setRuleSelections(editorState.selections);
            setSuccess("Override removido.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao remover override.");
        }
    }

    if (!voice) {
        return (
            <div className="sf-panel mx-auto max-w-3xl">
                {error ? <p className="sf-error">{error}</p> : null}
                {!error ? (
                    <p className="text-sm text-studyflow-text">A carregar voz...</p>
                ) : null}
            </div>
        );
    }

    return (
        <TeacherVoiceForm
            title="Voz da IA docente"
            voice={voice}
            rulesText={rulesText}
            error={error}
            success={success}
            isSubjectOverride
            ruleSelections={ruleSelections}
            onVoiceChange={setVoice}
            onRulesChange={setRulesText}
            onRuleSelectionChange={(groupId, optionId) =>
                setRuleSelections((current) => ({ ...current, [groupId]: optionId }))
            }
            onSubmit={(event) => void handleSubmit(event)}
            onDeleteOverride={() => void handleDeleteOverride()}
        />
    );
}

/**
 * Renderiza a experiência de páginas React, ligando estado local, dados remotos e ações do utilizador num componente reutilizável.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
function TeacherVoiceForm({
    title,
    subtitle,
    voice,
    rulesText,
    error,
    success,
    isSubjectOverride,
    ruleSelections,
    onVoiceChange,
    onRulesChange,
    onRuleSelectionChange,
    onSubmit,
    onDeleteOverride,
    onClose,
    surface = "page",
}: VoiceFormProps) {
    const originLabel =
        voice.source === "SUBJECT_OVERRIDE"
            ? "Disciplina"
            : voice.source === "CLASS_BASE"
                ? "Turma"
                : "Predefinida";
    const composedRules = useMemo(
        () => buildVoiceRules(ruleSelections, rulesText),
        [ruleSelections, rulesText],
    );
    const formClassName =
        surface === "dialog"
            ? "space-y-5 p-5"
            : "sf-panel mx-auto max-w-2xl space-y-5";
    const controlClassName = "border-studyflow-border/50 focus:ring-1";
    const sectionClassName = "space-y-3 border-t border-studyflow-border/25 pt-4";
    const metadataLabel = [subtitle, `Origem: ${originLabel}`]
        .filter(Boolean)
        .join(" · ");
    const guidanceFieldId =
        voice.scope === "SUBJECT"
            ? "teacher-ai-subject-guidance"
            : "teacher-ai-class-guidance";
    const guidanceTooltipId = `${guidanceFieldId}-tooltip`;

    return (
        <form className={formClassName} onSubmit={onSubmit}>
            <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1
                        className="text-lg font-bold text-studyflow-text"
                        id={surface === "dialog" ? "teacher-class-ai-voice-dialog-title" : undefined}
                    >
                        {title}
                    </h1>
                    <p className="mt-1 break-words text-sm text-studyflow-text">
                        {metadataLabel}
                    </p>
                </div>
                {onClose ? (
                    <button
                        aria-label="Fechar configuração da voz"
                        className="sf-button-secondary h-8 w-8 shrink-0 border-studyflow-border/50 px-0 py-0 text-base"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                ) : null}
            </div>
            {error ? <p className="sf-error">{error}</p> : null}
            {success ? <p className="sf-success">{success}</p> : null}

            <section className={sectionClassName} aria-labelledby="voice-base-title">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-studyflow-brandText" id="voice-base-title">
                    Voz base
                </h2>
                <div className="grid min-w-0 gap-3 md:grid-cols-2">
                    <label className="block">
                        <span className="mb-1 block">Tom</span>
                        <select
                            className={controlClassName}
                            value={voice.tone}
                            onChange={(event) =>
                                onVoiceChange({
                                    ...voice,
                                    tone: event.target.value as TeacherAiVoice["tone"],
                                })
                            }
                        >
                            <option value="CALM">Calmo</option>
                            <option value="DIRECT">Direto</option>
                            <option value="SOCRATIC">Socrático</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block">Detalhe</span>
                        <select
                            className={controlClassName}
                            value={voice.detailLevel}
                            onChange={(event) =>
                                onVoiceChange({
                                    ...voice,
                                    detailLevel: event.target.value as TeacherAiVoice["detailLevel"],
                                })
                            }
                        >
                            <option value="SHORT">Curto</option>
                            <option value="BALANCED">Equilibrado</option>
                            <option value="DETAILED">Detalhado</option>
                        </select>
                    </label>
                </div>
            </section>

            <section className={sectionClassName} aria-labelledby="voice-behaviour-title">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-studyflow-brandText" id="voice-behaviour-title">
                    Comportamento pedagógico
                </h2>
                <fieldset className="grid min-w-0 gap-3 md:grid-cols-2">
                    <legend className="sr-only">Configurações pedagógicas da voz</legend>
                    {VOICE_RULE_GROUPS.map((group) => (
                        <label className="block" key={group.id}>
                            <span className="mb-1 block">{group.label}</span>
                            <select
                                aria-describedby={`voice-rule-${group.id}-help`}
                                className={controlClassName}
                                value={ruleSelections[group.id]}
                                onChange={(event) =>
                                    onRuleSelectionChange(group.id, event.target.value)
                                }
                            >
                                {group.options.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span
                                className="mt-1 block text-xs leading-5 text-studyflow-text"
                                id={`voice-rule-${group.id}-help`}
                            >
                                {group.helpText}
                            </span>
                        </label>
                    ))}
                </fieldset>
            </section>

            <section className={sectionClassName} aria-labelledby="voice-rules-title">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-studyflow-brandText" id="voice-rules-title">
                    Orientações da IA
                </h2>
                <div className="block">
                    <span className="mb-1 flex items-center gap-2">
                        <label htmlFor={guidanceFieldId}>Orientações da IA</label>
                        <VoiceGuidanceTooltip tooltipId={guidanceTooltipId} />
                    </span>
                    <textarea
                        className={`${controlClassName} min-h-32`}
                        id={guidanceFieldId}
                        rows={4}
                        value={rulesText}
                        onChange={(event) => onRulesChange(event.target.value)}
                        placeholder="Uma orientação por linha."
                    />
                    <span className="mt-1 block text-xs leading-5 text-studyflow-text">
                        {composedRules.length}/{MAX_VOICE_RULES} orientações usadas. As opções
                        guiadas também contam para este limite.
                    </span>
                </div>
            </section>

            <div className="flex flex-wrap gap-2 border-t border-studyflow-border/25 pt-4">
                <button className="sf-button-primary" type="submit">
                    {isSubjectOverride ? "Guardar override" : "Guardar"}
                </button>
                {isSubjectOverride && voice.hasOverride && onDeleteOverride ? (
                    <button
                        className="sf-button-secondary"
                        onClick={onDeleteOverride}
                        type="button"
                    >
                        Remover override
                    </button>
                ) : null}
            </div>
        </form>
    );
}
