/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useCallback, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    askRoomAi,
    listMyRoomAiHistory,
    listSharedRoomAiAnswers,
    RoomAiAnswer,
    RoomAiHistoryItem,
    RoomAiSharedAnswer,
    shareRoomAiAnswer,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type RoomAiPageProps = {
    roomId: string;
};

/**
 * Página da IA partilhada da sala.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function RoomAiPage({ roomId }: RoomAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    const [history, setHistory] = useState<RoomAiHistoryItem[]>([]);
    const [sharedAnswers, setSharedAnswers] = useState<RoomAiSharedAnswer[]>([]);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [sharedError, setSharedError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [sharedLoading, setSharedLoading] = useState(false);
    const [shareErrorScope, setShareErrorScope] = useState<
        "current" | "shared" | null
    >(null);
    const askAction = useAsyncAction();
    const shareAction = useAsyncAction();
    const loading = askAction.isPending;
    const sharingAnswerId = shareAction.pendingKey?.startsWith("share:")
        ? shareAction.pendingKey.slice("share:".length)
        : null;
    const error =
        askAction.error ??
        (shareErrorScope === "current" ? shareAction.error : null);
    const sharedActionError =
        shareErrorScope === "shared" ? shareAction.error : null;

    /**
     * Carrega o histórico privado da IA da sala para o aluno autenticado.
     */
    const loadHistory = useCallback(async (): Promise<void> => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const nextHistory = await listMyRoomAiHistory(roomId);
            setHistory(nextHistory);
        } catch (caught) {
            setHistoryError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar o histórico privado.",
            );
        } finally {
            setHistoryLoading(false);
        }
    }, [roomId]);

    /**
     * Carrega respostas partilhadas da sala depois de a API validar membership.
     */
    const loadSharedAnswers = useCallback(async (): Promise<void> => {
        setSharedLoading(true);
        setSharedError(null);
        try {
            const nextSharedAnswers = await listSharedRoomAiAnswers(roomId);
            setSharedAnswers(nextSharedAnswers);
        } catch (caught) {
            setSharedError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar respostas partilhadas.",
            );
        } finally {
            setSharedLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        void loadHistory();
        void loadSharedAnswers();
    }, [loadHistory, loadSharedAnswers]);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setNotice(null);
        setShareErrorScope(null);
        shareAction.clearError();
        const nextAnswer = await askAction.run(
            "ask-room-ai",
            () => askRoomAi(roomId, { question }),
            "Erro ao perguntar.",
        );
        if (nextAnswer) {
            setAnswer(nextAnswer);
            setQuestion("");
            await loadHistory();
        }
    }

    /**
     * Partilha a resposta própria mais recente em modo read-only.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleShareCurrentAnswer(): Promise<void> {
        if (!answer) return;

        setShareErrorScope("current");
        askAction.clearError();
        setNotice(null);
        await shareAction.run(`share:${answer._id}`, async () => {
            await shareRoomAiAnswer(roomId, answer._id, { mode: "READ_ONLY" });
            setNotice("Resposta partilhada em modo read-only.");
            await loadSharedAnswers();
            await loadHistory();
        }, "Não foi possível partilhar a resposta.");
    }

    /**
     * Guarda uma cópia privada de uma resposta partilhada.
     *
     * @param sharedAnswer Valor de sharedAnswer usado pela função para executar handle create private fork com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleCreatePrivateFork(
        sharedAnswer: RoomAiSharedAnswer,
    ): Promise<void> {
        setShareErrorScope("shared");
        setSharedError(null);
        setNotice(null);
        await shareAction.run(`share:${sharedAnswer._id}`, async () => {
            await shareRoomAiAnswer(roomId, sharedAnswer._id, {
                mode: "PRIVATE_FORK",
            });
            setNotice("Cópia privada guardada no teu histórico.");
            await loadHistory();
        }, "Não foi possível guardar a cópia privada.");
    }

    return (
        <section className="space-y-6">
            <PageHeader description="Conversa com a IA usando as fontes partilhadas nesta sala e controla o que fica público." title="IA da sala" />
            <Surface
                as="form"
                className="space-y-4"
                onSubmit={(event) => void handleSubmit(event)}
            >
                <SectionHeader description="A tua pergunta e a resposta permanecem privadas até escolheres partilhá-las." title="Fazer uma pergunta" />
                {error ? <p className="sf-error" role="alert">{error}</p> : null}
                {notice ? (
                    <InlineNotice tone="brand">{notice}</InlineNotice>
                ) : null}
                <FormField id="room-ai-question" label="Pergunta para a IA da sala">
                <textarea
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                />
                </FormField>
                <button
                    className="sf-button-primary"
                    disabled={loading || question.trim().length < 4}
                >
                    {loading ? "A perguntar..." : "Perguntar"}
                </button>
            </Surface>

            {answer ? (
                <Surface as="article" className="space-y-3" variant="subtle">
                    <SectionHeader title="Resposta" />
                    <p className="whitespace-pre-wrap text-sm text-studyflow-text">
                        {answer.answer}
                    </p>
                    <p className="text-sm text-studyflow-text">
                        Fontes usadas:{" "}
                        {answer.sources.map((source) => source.title).join(", ")}
                    </p>
                    <button
                        className="sf-button-secondary"
                        disabled={sharingAnswerId === answer._id}
                        onClick={() => void handleShareCurrentAnswer()}
                        type="button"
                    >
                        {sharingAnswerId === answer._id
                            ? "A partilhar..."
                            : "Partilhar read-only"}
                    </button>
                </Surface>
            ) : null}

            <Surface as="section" className="space-y-4">
                <SectionHeader
                    action={<button
                        className="sf-button-secondary"
                        disabled={sharedLoading}
                        onClick={() => void loadSharedAnswers()}
                        type="button"
                    >
                        Atualizar
                    </button>}
                    description="Respostas que outros membros escolheram disponibilizar em modo read-only."
                    title="Respostas partilhadas"
                />
                <AsyncStateBlock error={(sharedError ?? sharedActionError) || undefined} isEmpty={sharedAnswers.length === 0} isLoading={sharedLoading} emptyMessage="Ainda não há respostas partilhadas nesta sala">
                    <div className="space-y-3">
                    {sharedAnswers.map((sharedAnswer) => (
                        <article
                            key={sharedAnswer._id}
                            className="sf-surface-subtle space-y-2"
                        >
                            <p className="text-xs text-studyflow-text">
                                {sharedAnswer.sharedAt
                                    ? `Partilhada em ${new Date(
                                          sharedAnswer.sharedAt,
                                      ).toLocaleString("pt-PT")}`
                                    : "Resposta partilhada"}
                            </p>
                            <h3 className="mt-2 text-sm font-semibold">
                                {sharedAnswer.question}
                            </h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-studyflow-text">
                                {sharedAnswer.answer}
                            </p>
                            <button
                                className="sf-button-secondary mt-3"
                                disabled={sharingAnswerId === sharedAnswer._id}
                                onClick={() => void handleCreatePrivateFork(sharedAnswer)}
                                type="button"
                            >
                                {sharingAnswerId === sharedAnswer._id
                                    ? "A guardar..."
                                    : "Guardar cópia privada"}
                            </button>
                        </article>
                    ))}
                    </div>
                </AsyncStateBlock>
            </Surface>

            <Surface as="section" className="space-y-4">
                <SectionHeader description="Perguntas próprias e cópias privadas guardadas nesta sala." title="O meu histórico privado" />
                <AsyncStateBlock error={historyError ?? undefined} isEmpty={history.length === 0} isLoading={historyLoading} emptyMessage="Ainda não fizeste perguntas à IA desta sala">
                    <div className="space-y-3">
                    {history.map((item) => (
                        <article
                            key={item._id}
                            className="sf-surface-subtle space-y-2"
                        >
                            <p className="text-xs text-studyflow-text">
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString("pt-PT")
                                    : "Sem data"}
                            </p>
                            <h3 className="mt-2 text-sm font-semibold">
                                {item.question}
                            </h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-studyflow-text">
                                {item.answer}
                            </p>
                        </article>
                    ))}
                    </div>
                </AsyncStateBlock>
            </Surface>
        </section>
    );
}
