/** IA oficial de uma disciplina com consentimento versionado e histórico privado. */
import { type FormEvent, useEffect, useState } from "react";
import { AiConsentGate } from "../../components/ai/AiConsentGate.js";
import { FormField } from "../../components/forms/FormField.js";
import { SubjectWorkspaceHeader } from "../../components/student/SubjectWorkspaceHeader.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    askClassAi,
    type ClassAiAnswer,
    listClassAiAnswers,
} from "../../lib/apiClient.js";

export function StudentClassAiPage({ subjectId }: { subjectId: string }) {
    const [question, setQuestion] = useState("");
    const [history, setHistory] = useState<ClassAiAnswer[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const askAction = useAsyncAction();

    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError(null);
        listClassAiAnswers(subjectId, { limit: 20 })
            .then((page) => {
                if (!active) return;
                setHistory(page.items);
                setNextCursor(page.nextCursor);
            })
            .catch((caught) => {
                if (active) setLoadError(caught instanceof Error ? caught.message : "Erro ao carregar histórico IA.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reloadToken, subjectId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const nextAnswer = await askAction.run(
            "ask-class-ai",
            () => askClassAi(subjectId, question),
            "Erro ao perguntar.",
        );
        if (nextAnswer) {
            setHistory((current) => [nextAnswer, ...current]);
            setQuestion("");
        }
    }

    async function loadMore(): Promise<void> {
        if (!nextCursor) return;
        setLoadingMore(true);
        setLoadError(null);
        try {
            const page = await listClassAiAnswers(subjectId, { cursor: nextCursor, limit: 20 });
            setHistory((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
        } catch (caught) {
            setLoadError(caught instanceof Error ? caught.message : "Erro ao carregar mais respostas.");
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <section className="space-y-6">
            <SubjectWorkspaceHeader active="assistant" subjectId={subjectId} />
            <AiConsentGate description="Aceita o tratamento CLASS_AI para usar a IA oficial desta disciplina." purpose="CLASS_AI">
                <Surface as="form" className="max-w-4xl space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    <SectionHeader title="Fazer uma pergunta" />
                    {askAction.error ? <p className="sf-error" role="alert">{askAction.error}</p> : null}
                    <FormField id="class-ai-question" label="Pergunta sobre a disciplina">
                        <textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} />
                    </FormField>
                    <button className="sf-button-primary" disabled={askAction.isPending || question.trim().length < 4}>{askAction.isPending ? "A perguntar..." : "Perguntar"}</button>
                </Surface>
            </AiConsentGate>

            <section className="space-y-4" aria-label="Histórico da IA da disciplina">
                <SectionHeader description="Apenas tu podes consultar este histórico." title="Histórico" />
                {loading ? <InlineNotice>A carregar histórico...</InlineNotice> : null}
                {loadError ? <div className="space-y-3"><InlineNotice tone="danger">{loadError}</InlineNotice><button className="sf-button-secondary" onClick={() => setReloadToken((value) => value + 1)} type="button">Tentar novamente</button></div> : null}
                {!loading && !loadError && history.length === 0 ? <EmptyState title="Ainda não fizeste perguntas nesta disciplina" /> : null}
                <div className="space-y-3">
                    {history.map((answer) => (
                        <Surface as="article" className="space-y-3" key={answer._id} variant="subtle">
                            <p><strong>Pergunta:</strong> {answer.question}</p>
                            <p className="whitespace-pre-wrap text-sm">{answer.answer}</p>
                            {answer.teacherVoiceApplied ? <StatusBadge tone="brand">Resposta com voz definida pelo professor</StatusBadge> : null}
                            <p className="text-sm text-studyflow-text/70">Fontes oficiais: {answer.sources.map((source) => source.title).join(", ")}</p>
                        </Surface>
                    ))}
                </div>
                {nextCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar mais"}</button> : null}
            </section>
        </section>
    );
}
