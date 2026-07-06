// apps/web/src/pages/student/RoomAiPage.tsx
/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    askRoomAi,
    listSharedRoomAiAnswers,
    RoomAiAnswer,
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
 */
export function RoomAiPage({ roomId }: RoomAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    const [sharedAnswers, setSharedAnswers] = useState<RoomAiSharedAnswer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sharedError, setSharedError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sharedLoading, setSharedLoading] = useState(false);
    const [sharingAnswerId, setSharingAnswerId] = useState<string | null>(null);

    /**
     * Carrega respostas partilhadas da sala depois de a API validar membership.
     */
    const loadSharedAnswers = useCallback(async (): Promise<void> => {
        setSharedLoading(true);
        setSharedError(null);
        try {
            setSharedAnswers(await listSharedRoomAiAnswers(roomId));
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
        void loadSharedAnswers();
    }, [loadSharedAnswers]);

    /**
     * Trata a pergunta do aluno à IA da sala.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setNotice(null);
        try {
            setAnswer(await askRoomAi(roomId, { question }));
            setQuestion("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar.");
        } finally {
            setLoading(false);
        }
    }

    /**
     * Partilha a última resposta própria em modo read-only.
     */
    async function handleShareCurrentAnswer(): Promise<void> {
        if (!answer) return;

        setSharingAnswerId(answer._id);
        setError(null);
        setNotice(null);
        try {
            await shareRoomAiAnswer(roomId, answer._id, { mode: "READ_ONLY" });
            setNotice("Resposta partilhada em modo read-only.");
            await loadSharedAnswers();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível partilhar a resposta.",
            );
        } finally {
            setSharingAnswerId(null);
        }
    }

    /**
     * Guarda uma cópia privada de uma resposta partilhada.
     *
     * @param sharedAnswer Resposta partilhada escolhida pelo aluno.
     */
    async function handleCreatePrivateFork(
        sharedAnswer: RoomAiSharedAnswer,
    ): Promise<void> {
        setSharingAnswerId(sharedAnswer._id);
        setSharedError(null);
        setNotice(null);
        try {
            await shareRoomAiAnswer(roomId, sharedAnswer._id, {
                mode: "PRIVATE_FORK",
            });
            setNotice("Cópia privada guardada no teu histórico.");
        } catch (caught) {
            setSharedError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível guardar a cópia privada.",
            );
        } finally {
            setSharingAnswerId(null);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da sala</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
                <label className="text-sm font-medium text-slate-700" htmlFor="room-ai-question">
                    Pergunta para a IA da sala
                </label>
                <textarea
                    id="room-ai-question"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                />
                <button className="sf-button-primary" disabled={loading || question.trim().length < 4}>
                    {loading ? "A perguntar..." : "Perguntar"}
                </button>
            </form>

            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {answer.answer}
                    </p>
                    <p className="text-sm text-slate-600">
                        Fontes usadas: {answer.sources.map((source) => source.title).join(", ")}
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
                <div className="flex items-center justify-between gap-3">
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
                {sharedError ? <p className="sf-error">{sharedError}</p> : null}
                {sharedLoading ? <p className="text-sm text-slate-600">A carregar...</p> : null}
                {!sharedLoading && sharedAnswers.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não há respostas partilhadas nesta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {sharedAnswers.map((sharedAnswer) => (
                        <article className="rounded border border-slate-200 p-3" key={sharedAnswer._id}>
                            <p className="text-sm font-medium text-slate-800">
                                {sharedAnswer.question}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
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
        </section>
    );
}