/** Painel acessível para criar um material privado a partir da conversa atual. */
import { useEffect, useState, type FormEvent, type RefObject } from "react";
import { AiConsentGate } from "../../components/ai/AiConsentGate.js";
import { FormField } from "../../components/forms/FormField.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    generateStudentAssistantArtifact,
    getStudentAssistantArtifactSetup,
    listStudentAssistantArtifactTargets,
    type StudentAssistantArtifactGenerationResult,
    type StudentAssistantArtifactSetup,
    type StudentAssistantArtifactType,
    type StudentStudyMaterialTarget,
} from "../../lib/apiClient.js";

type Props = {
    conversationId: string;
    initialTopic?: string;
    initialType?: StudentAssistantArtifactType;
    onClose: () => void;
    onGenerated: (result: StudentAssistantArtifactGenerationResult) => void;
    open: boolean;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

export function StudentAssistantArtifactPanel({
    conversationId,
    initialTopic,
    initialType = "SUMMARY",
    onClose,
    onGenerated,
    open,
    returnFocusRef,
}: Props) {
    const [type, setType] = useState<StudentAssistantArtifactType>("SUMMARY");
    const [topic, setTopic] = useState("");
    const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
    const [setup, setSetup] = useState<StudentAssistantArtifactSetup | null>(null);
    const [targets, setTargets] = useState<StudentStudyMaterialTarget[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<StudentStudyMaterialTarget | null>(null);
    const [targetQuery, setTargetQuery] = useState("");
    const [nextTargetCursor, setNextTargetCursor] = useState<string | null>(null);
    const [loadingSetup, setLoadingSetup] = useState(false);
    const [loadingTargets, setLoadingTargets] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        let active = true;
        setError(null);
        setSetup(null);
        setTargets([]);
        setSelectedTarget(null);
        setTargetQuery("");
        setType(initialType);
        setTopic(initialType === "SUMMARY" ? "" : initialTopic ?? "");
        setRequestKey(crypto.randomUUID());
        setLoadingSetup(true);
        getStudentAssistantArtifactSetup(conversationId)
            .then((nextSetup) => {
                if (!active) return;
                setLoadingTargets(nextSetup.targetMode === "SELECTION_REQUIRED");
                setSetup(nextSetup);
                if (nextSetup.fixedTarget) {
                    setSelectedTarget(nextSetup.fixedTarget);
                }
            })
            .catch((caught) => {
                if (active) {
                    setLoadingTargets(false);
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível preparar a criação do material.",
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingSetup(false);
                }
            });
        return () => {
            active = false;
        };
    }, [open, conversationId, initialTopic, initialType]);

    useEffect(() => {
        if (!open || setup?.targetMode !== "SELECTION_REQUIRED") return;
        let active = true;
        setLoadingTargets(true);
        const timeout = window.setTimeout(() => {
            listStudentAssistantArtifactTargets(conversationId, {
                query: targetQuery.trim() || undefined,
                limit: 20,
            })
                .then((page) => {
                    if (!active) return;
                    setTargets(page.items);
                    setNextTargetCursor(page.nextCursor);
                })
                .catch((caught) => {
                    if (!active) return;
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível pesquisar destinos.",
                    );
                })
                .finally(() => {
                    if (active) setLoadingTargets(false);
                });
        }, 250);
        return () => {
            active = false;
            window.clearTimeout(timeout);
        };
    }, [conversationId, open, setup?.targetMode, targetQuery]);

    function changeType(next: StudentAssistantArtifactType): void {
        setType(next);
        setError(null);
        setRequestKey(crypto.randomUUID());
        if (next === "SUMMARY") setTopic("");
    }

    async function loadMoreTargets(): Promise<void> {
        if (!nextTargetCursor || loadingTargets) return;
        setLoadingTargets(true);
        try {
            const page = await listStudentAssistantArtifactTargets(conversationId, {
                query: targetQuery.trim() || undefined,
                cursor: nextTargetCursor,
                limit: 20,
            });
            setTargets((current) => [
                ...current,
                ...page.items.filter(
                    (item) =>
                        !current.some(
                            (existing) =>
                                existing.kind === item.kind && existing.id === item.id,
                        ),
                ),
            ]);
            setNextTargetCursor(page.nextCursor);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar mais destinos.",
            );
        } finally {
            setLoadingTargets(false);
        }
    }

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (generating || !setup || !selectedTarget) return;
        setGenerating(true);
        setError(null);
        try {
            const result = await generateStudentAssistantArtifact(
                conversationId,
                {
                    type,
                    ...(type !== "SUMMARY" && topic.trim()
                        ? { topic: topic.trim() }
                        : {}),
                    ...(setup.targetMode === "SELECTION_REQUIRED"
                        ? {
                              target: {
                                  kind: selectedTarget.kind,
                                  id: selectedTarget.id,
                              },
                          }
                        : {}),
                },
                requestKey,
            );
            onGenerated(result);
            if (result.status === "FAILED") {
                setRequestKey(crypto.randomUUID());
                setError(
                    result.job.errorMessage ??
                        "Não foi possível criar o quiz. Podes tentar novamente.",
                );
                return;
            }
            onClose();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível criar o material de estudo.",
            );
        } finally {
            setGenerating(false);
        }
    }

    const purpose = type === "SUMMARY" ? "SUMMARY" : "STUDY_TOOL";
    const selectedLimit =
        type === "SUMMARY"
            ? setup?.preview.sourceLimits.SUMMARY
            : setup?.preview.sourceLimits.STUDY_TOOL;
    return (
        <SidePanel
            closeDisabled={generating}
            description="Cria uma cópia privada baseada no snapshot atual da conversa e organiza-a num contexto teu."
            onClose={onClose}
            open={open}
            returnFocusRef={returnFocusRef}
            title="Criar material de estudo"
        >
            <form className="space-y-5" onSubmit={(event) => void submit(event)}>
                {loadingSetup ? <InlineNotice>A preparar conversa…</InlineNotice> : null}

                {setup ? (
                    <InlineNotice>
                        Serão considerados os últimos {setup.preview.turnCount} turno(s)
                        {setup.preview.candidateSourceCount > 0
                            ? ` e até ${selectedLimit ?? 0} fonte(s) autorizada(s).`
                            : "."}
                    </InlineNotice>
                ) : null}

                {setup?.preview.groundingMode === "CHAT_ONLY" ? (
                    <InlineNotice tone="attention">
                        Esta conversa não tem fontes processáveis atuais. O material será
                        criado apenas a partir do histórico visível da conversa.
                    </InlineNotice>
                ) : null}

                <FormField id="assistant-artifact-type" label="Tipo de material">
                    <select
                        disabled={generating || loadingSetup}
                        id="assistant-artifact-type"
                        onChange={(event) =>
                            changeType(event.target.value as StudentAssistantArtifactType)
                        }
                        value={type}
                    >
                        <option value="SUMMARY">Resumo</option>
                        <option value="EXPLANATION">Explicação</option>
                        <option value="FLASHCARDS">Flashcards</option>
                        <option value="QUIZ">Quiz</option>
                    </select>
                </FormField>

                {type !== "SUMMARY" ? (
                    <FormField id="assistant-artifact-topic" label="Tópico opcional">
                        <input
                            disabled={generating}
                            id="assistant-artifact-topic"
                            maxLength={120}
                            onChange={(event) => {
                                setTopic(event.target.value);
                                setRequestKey(crypto.randomUUID());
                            }}
                            placeholder="Por exemplo, normalização de dados"
                            value={topic}
                        />
                    </FormField>
                ) : null}

                {setup?.targetMode === "FIXED" && selectedTarget ? (
                    <div className="rounded-xl border border-studyflow-border/10 bg-studyflow-card/35 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[.12em] text-studyflow-text/60">
                            Organizar em
                        </p>
                        <p className="mt-1 font-semibold">{selectedTarget.label}</p>
                        {selectedTarget.secondaryLabel ? (
                            <p className="text-sm text-studyflow-text/65">
                                {selectedTarget.secondaryLabel}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {setup?.targetMode === "SELECTION_REQUIRED" ? (
                    <fieldset className="space-y-3">
                        <legend className="font-semibold">Organizar em</legend>
                        <label className="sr-only" htmlFor="assistant-artifact-target-query">
                            Pesquisar disciplina, turma ou área pessoal
                        </label>
                        <input
                            id="assistant-artifact-target-query"
                            maxLength={100}
                            onChange={(event) => setTargetQuery(event.target.value)}
                            placeholder="Pesquisar disciplina, turma ou área pessoal"
                            type="search"
                            value={targetQuery}
                        />
                        {loadingTargets ? <p className="text-sm text-studyflow-text/65">A pesquisar…</p> : null}
                        {!loadingTargets && targets.length === 0 ? (
                            <InlineNotice>Não existem destinos ativos para esta pesquisa.</InlineNotice>
                        ) : null}
                        <div className="space-y-2">
                            {targets.map((target) => {
                                const checked =
                                    selectedTarget?.kind === target.kind &&
                                    selectedTarget.id === target.id;
                                return (
                                    <label
                                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-studyflow-border/10 p-3 hover:bg-studyflow-card/35"
                                        key={`${target.kind}:${target.id}`}
                                    >
                                        <input
                                            checked={checked}
                                            name="assistant-artifact-target"
                                            onChange={() => {
                                                setSelectedTarget(target);
                                                setRequestKey(crypto.randomUUID());
                                            }}
                                            type="radio"
                                        />
                                        <span>
                                            <span className="block font-semibold">{target.label}</span>
                                            <span className="block text-sm text-studyflow-text/65">
                                                {target.secondaryLabel ?? targetKindLabel(target.kind)}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {nextTargetCursor ? (
                            <button
                                className="sf-button-secondary"
                                disabled={loadingTargets}
                                onClick={() => void loadMoreTargets()}
                                type="button"
                            >
                                Mostrar mais
                            </button>
                        ) : null}
                    </fieldset>
                ) : null}

                <InlineNotice tone="attention">
                    O material fica privado na tua conta. A disciplina, turma ou área
                    serve apenas para organização; professores e colegas não recebem acesso.
                </InlineNotice>

                {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                {generating ? <InlineNotice>A criar material…</InlineNotice> : null}

                <AiConsentGate
                    description="Aceita o tratamento necessário para criar este material de estudo."
                    purpose={purpose}
                >
                    <div className="flex flex-wrap justify-end gap-2 border-t border-studyflow-border/10 pt-4">
                        <button
                            className="sf-button-secondary"
                            disabled={generating}
                            onClick={onClose}
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button
                            className="sf-button-primary"
                            disabled={generating || loadingSetup || !setup || !selectedTarget}
                            type="submit"
                        >
                            {generating ? "A criar…" : "Criar material"}
                        </button>
                    </div>
                </AiConsentGate>
            </form>
        </SidePanel>
    );
}

function targetKindLabel(kind: StudentStudyMaterialTarget["kind"]): string {
    if (kind === "SUBJECT") return "Disciplina";
    if (kind === "CLASS") return "Turma";
    return "Estudo pessoal";
}
