/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useCallback, useEffect, useState } from "react";
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
        <section className="space-y-4">
            <form
                className="sf-panel space-y-4"
                onSubmit={(event) => void handleSubmit(event)}
            >
                <h1 className="text-xl font-bold">IA da sala</h1>
                {error ? <p className="sf-error" role="alert">{error}</p> : null}
                {notice ? (
                    <p className="text-sm text-studyflow-brandText" role="status">
                        {notice}
                    </p>
                ) : null}
                <label
                    className="text-sm font-medium text-studyflow-text"
                    htmlFor="room-ai-question"
                >
                    Pergunta para a IA da sala
                </label>
                <textarea
                    id="room-ai-question"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                />
                <button
                    className="sf-button-primary"
                    disabled={loading || question.trim().length < 4}
                >
                    {loading ? "A perguntar..." : "Perguntar"}
                </button>
            </form>

            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
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
                </article>
            ) : null}

            <section className="sf-panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold">Respostas partilhadas</h2>
                    <button
                        className="sf-button-secondary"
                        disabled={sharedLoading}
                        onClick={() => void loadSharedAnswers()}
                        type="button"
                    >
                        Atualizar
                    </button>
                </div>
                {sharedLoading ? (
                    <p className="text-sm text-studyflow-text">A carregar...</p>
                ) : null}
                {sharedError ?? sharedActionError ? (
                    <p className="sf-error" role="alert">
                        {sharedError ?? sharedActionError}
                    </p>
                ) : null}
                {!sharedLoading && !sharedError && !sharedActionError && sharedAnswers.length === 0 ? (
                    <p className="text-sm text-studyflow-text">
                        Ainda não há respostas partilhadas nesta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {sharedAnswers.map((sharedAnswer) => (
                        <article
                            key={sharedAnswer._id}
                            className="rounded border border-studyflow-border p-3"
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
            </section>

            <section className="sf-panel space-y-3">
                <h2 className="font-semibold">O meu histórico privado</h2>
                {historyLoading ? (
                    <p className="text-sm text-studyflow-text">A carregar...</p>
                ) : null}
                {historyError ? <p className="sf-error" role="alert">{historyError}</p> : null}
                {!historyLoading && !historyError && history.length === 0 ? (
                    <p className="text-sm text-studyflow-text">
                        Ainda não fizeste perguntas à IA desta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {history.map((item) => (
                        <article
                            key={item._id}
                            className="rounded border border-studyflow-border p-3"
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
            </section>
        </section>
    );
}
