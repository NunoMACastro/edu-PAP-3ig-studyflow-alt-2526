/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    askRoomAi,
    listMyRoomAiHistory,
    RoomAiAnswer,
    RoomAiHistoryItem,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type RoomAiPageProps = {
    roomId: string;
};

/**
 * Página da IA partilhada da sala.
 */
export function RoomAiPage({ roomId }: RoomAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    const [history, setHistory] = useState<RoomAiHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    /**
     * Carrega o histórico privado da IA da sala para o aluno autenticado.
     */
    async function loadHistory(): Promise<void> {
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
    }

    useEffect(() => {
        void loadHistory();
    }, [roomId]);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a ação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const nextAnswer = await askRoomAi(roomId, { question });
            setAnswer(nextAnswer);
            setQuestion("");
            // Depois do POST, a lista volta ao backend para refletir a persistência real.
            await loadHistory();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da sala</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <textarea
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
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{answer.answer}</p>
                    <p className="text-sm text-slate-600">
                        Fontes usadas: {answer.sources.map((source) => source.title).join(", ")}
                    </p>
                </article>
            ) : null}

            <section className="sf-panel space-y-3">
                <h2 className="font-semibold">O meu histórico privado</h2>
                {historyLoading ? <p className="text-sm text-slate-600">A carregar...</p> : null}
                {historyError ? <p className="sf-error">{historyError}</p> : null}
                {!historyLoading && !historyError && history.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não fizeste perguntas à IA desta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {history.map((item) => (
                        <article key={item._id} className="rounded border border-slate-200 p-3">
                            <p className="text-xs text-slate-500">
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString("pt-PT")
                                    : "Sem data"}
                            </p>
                            <h3 className="mt-2 text-sm font-semibold">{item.question}</h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                {item.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}