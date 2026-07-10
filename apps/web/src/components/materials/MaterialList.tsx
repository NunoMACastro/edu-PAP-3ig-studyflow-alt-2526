/**
 * Implementa um componente React reutilizavel para materials.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePollingTask } from "../../hooks/usePollingTask.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    getMaterialIndexJob,
    indexPrivateMaterial,
    listLatestPrivateMaterialIndexJobs,
    MaterialIndexJob,
    StudyMaterial,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de materiais privados; mantêm explícitas as dependências vindas da página.
 */
type MaterialListProps = {
    materials: StudyMaterial[];
    studyAreaId: string;
};

/**
 * Lista materiais submetidos numa área privada.
 *
 * @param props Materiais carregados da API e área autenticada do aluno.
 * @returns Lista visual com estado de processamento e erros PT-PT.
 */
export function MaterialList({ materials, studyAreaId }: MaterialListProps) {
    const [jobsByMaterial, setJobsByMaterial] = useState<
        Record<string, MaterialIndexJob>
    >({});
    const [error, setError] = useState<string | null>(null);
    const indexAction = useAsyncAction();

    useEffect(() => {
        let active = true;
        listLatestPrivateMaterialIndexJobs(studyAreaId)
            .then((jobs) => {
                if (!active) return;
                setJobsByMaterial(
                    jobs.reduce<Record<string, MaterialIndexJob>>((index, job) => {
                        index[job.materialId] = job;
                        return index;
                    }, {}),
                );
            })
            .catch((caught) => {
                if (!active) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível recuperar as indexações.",
                );
            });
        return () => {
            active = false;
        };
    }, [materials, studyAreaId]);

    const activeJobs = Object.values(jobsByMaterial).filter((job) =>
        ["QUEUED", "PROCESSING"].includes(job.status),
    );
    usePollingTask(
        async (signal) => {
            const updatedJobs = await Promise.all(
                activeJobs.map(async (job) => {
                    try {
                        return await getMaterialIndexJob(job._id, signal);
                    } catch {
                        if (signal.aborted) return job;
                        setError("Não foi possível atualizar o estado da indexação.");
                        return job;
                    }
                }),
            );
            setJobsByMaterial((current) => {
                const next = { ...current };
                for (const job of updatedJobs) {
                    const previous = current[job.materialId];
                    if (!previous || canAdvanceJob(previous.status, job.status)) {
                        next[job.materialId] = job;
                    }
                }
                return next;
            });
        },
        { enabled: activeJobs.length > 0, intervalMs: 1500 },
    );

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleIndex(materialId: string): Promise<void> {
        await indexAction.run(`index-${materialId}`, async () => {
            const job = await indexPrivateMaterial(studyAreaId, materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        }, "Não foi possível indexar o material.");
    }

    if (materials.length === 0) {
        return <p className="text-sm text-studyflow-text">Ainda não há materiais.</p>;
    }

    return (
        <div className="space-y-3">
            {error || indexAction.error ? <p className="sf-error" role="alert">{indexAction.error ?? error}</p> : null}
            <ul className="space-y-3">
                {materials.map((material) => {
                    const job = jobsByMaterial[material._id];
                    const isIndexing =
                        job?.status === "QUEUED" || job?.status === "PROCESSING";
                    return (
                        <li className="rounded-md border border-studyflow-border bg-studyflow-card p-4" key={material._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{material.title}</p>
                                    <p className="text-sm text-studyflow-text">{materialTypeLabel(material.type)}</p>
                                </div>
                                <span className="rounded-full bg-studyflow-card px-3 py-1 text-xs font-medium text-studyflow-text">
                                    {materialStatusLabel(material.status)}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    className="sf-button-secondary"
                                    disabled={isIndexing || indexAction.isPending}
                                    onClick={() => void handleIndex(material._id)}
                                    type="button"
                                >
                                    {isIndexing || indexAction.pendingKey === `index-${material._id}`
                                        ? "A indexar..."
                                        : "Indexar"}
                                </button>
                                {isIndexing ? (
                                    <p className="text-sm text-studyflow-text" aria-live="polite">
                                        Indexação em {job.status === "QUEUED" ? "fila" : "processamento"}.
                                    </p>
                                ) : null}
                                {job?.status === "DONE" ? (
                                    <Link
                                        className="sf-button-secondary"
                                        to={`/app/material-index-jobs/${job._id}/versoes`}
                                    >
                                        Versões
                                    </Link>
                                ) : null}
                                {job?.status === "FAILED" ? (
                                    <p className="text-sm text-studyflow-alertText" role="alert">
                                        {job.errorMessage ??
                                            "O material não tem texto legível para estudar."}
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * Impede respostas atrasadas de fazer um job terminal regressar a estado ativo.
 */
function canAdvanceJob(
    previous: MaterialIndexJob["status"],
    next: MaterialIndexJob["status"],
): boolean {
    if (previous === "DONE" || previous === "FAILED") return next === previous;
    const rank: Record<MaterialIndexJob["status"], number> = {
        QUEUED: 0,
        PROCESSING: 1,
        DONE: 2,
        FAILED: 2,
    };
    return rank[next] >= rank[previous];
}

/** Traduz tipos de material persistidos para PT-PT. */
function materialTypeLabel(type: StudyMaterial["type"]): string {
    if (type === "TOPIC") return "Tópico";
    if (type === "URL") return "Ligação web";
    return type;
}

/** Traduz o estado técnico de processamento. */
function materialStatusLabel(status: StudyMaterial["status"]): string {
    if (status === "PENDING_PROCESSING") return "A processar";
    if (status === "READY") return "Pronto";
    return "Falhou";
}
