// apps/web/src/features/materials/MaterialIndexStatusButton.tsx
import { useEffect, useState } from "react";
import {
    getMaterialIndexJob,
    indexPrivateMaterial,
    MaterialIndexJob,
} from "../../lib/apiClient";

type MaterialIndexStatusButtonProps = {
    studyAreaId: string;
    materialId: string;
    onIndexed?: (job: MaterialIndexJob) => void;
};

/**
 * Botão que inicia a indexação e acompanha o estado sem bloquear a página.
 */
export function MaterialIndexStatusButton({
    studyAreaId,
    materialId,
    onIndexed,
}: MaterialIndexStatusButtonProps) {
    const [job, setJob] = useState<MaterialIndexJob | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!job || !["QUEUED", "PROCESSING"].includes(job.status)) return;

        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getMaterialIndexJob(job._id);
                setJob(nextJob);
                if (nextJob.status === "DONE") onIndexed?.(nextJob);
            } catch {
                // A mensagem evita expor nomes de ficheiros ou texto privado do material.
                setError("Não foi possível atualizar o estado da indexação.");
            }
        }, 1500);

        return () => window.clearInterval(timer);
    }, [job, onIndexed]);

    async function handleStartIndexing() {
        setIsStarting(true);
        setError(null);
        try {
            const queuedJob = await indexPrivateMaterial(studyAreaId, materialId);
            setJob(queuedJob);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Não foi possível iniciar a indexação.",
            );
        } finally {
            setIsStarting(false);
        }
    }

    const disabled = isStarting || job?.status === "QUEUED" || job?.status === "PROCESSING";

    return (
        <section aria-live="polite">
            <button type="button" onClick={handleStartIndexing} disabled={disabled}>
                {disabled ? "A indexar material" : "Indexar material"}
            </button>
            {job?.status === "DONE" && <p>Material indexado e pronto para IA.</p>}
            {job?.status === "FAILED" && <p>{job.errorMessage ?? "A indexação falhou."}</p>}
            {error && <p>{error}</p>}
        </section>
    );
}