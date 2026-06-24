// apps/web/src/features/ai/QuizGenerationPanel.tsx
import { useEffect, useState } from "react";
import {
    createQuizGenerationJob,
    getQuizGenerationJob,
    QuizGenerationJob,
} from "../../lib/apiClient";

type QuizGenerationPanelProps = {
    studyAreaId: string;
    topic?: string;
    onQuizReady?: (artifactId: string) => void;
};

/**
 * Painel que inicia e acompanha um quiz gerado em background.
 */
export function QuizGenerationPanel({
    studyAreaId,
    topic,
    onQuizReady,
}: QuizGenerationPanelProps) {
    const [job, setJob] = useState<QuizGenerationJob | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!job || !["QUEUED", "PROCESSING"].includes(job.status)) return;

        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getQuizGenerationJob(studyAreaId, job._id);
                setJob(nextJob);
                if (nextJob.status === "DONE" && nextJob.artifactId) {
                    onQuizReady?.(nextJob.artifactId);
                }
            } catch {
                // A UI não mostra detalhes técnicos que possam revelar fontes privadas.
                setError("Não foi possível atualizar o estado do quiz.");
            }
        }, 1500);

        return () => window.clearInterval(timer);
    }, [job, onQuizReady, studyAreaId]);

    async function handleStartQuiz() {
        setIsStarting(true);
        setError(null);
        try {
            const nextJob = await createQuizGenerationJob(studyAreaId, { topic });
            setJob(nextJob);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Não foi possível iniciar o quiz.",
            );
        } finally {
            setIsStarting(false);
        }
    }

    const disabled = isStarting || job?.status === "QUEUED" || job?.status === "PROCESSING";

    return (
        <section aria-live="polite">
            <button type="button" onClick={handleStartQuiz} disabled={disabled}>
                {disabled ? "A preparar quiz" : "Gerar quiz"}
            </button>
            {job?.status === "DONE" && <p>Quiz pronto para resolver.</p>}
            {job?.status === "FAILED" && <p>{job.errorMessage ?? "Não foi possível gerar o quiz."}</p>}
            {error && <p>{error}</p>}
        </section>
    );
}