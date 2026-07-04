// apps/web/src/components/materials/MaterialList.tsx
/**
 * Implementa um componente React reutilizavel para materials.
 */
import { useEffect, useState } from "react";
import {
    getMaterialIndexJob,
    indexPrivateMaterial,
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
 * Lista materiais submetidos numa área de estudo privada.
 *
 * @param props Materiais carregados da API e área autenticada do aluno.
 * @returns Lista visual com estado de processamento e erros PT-PT.
 */
export function MaterialList({ materials, studyAreaId }: MaterialListProps) {
    const [jobsByMaterial, setJobsByMaterial] = useState<Record<string, MaterialIndexJob>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const activeJobs = Object.values(jobsByMaterial).filter((job) =>
            ["QUEUED", "PROCESSING"].includes(job.status),
        );
        if (activeJobs.length === 0) return undefined;

        const timer = window.setInterval(async () => {
            const updatedJobs = await Promise.all(
                activeJobs.map(async (job) => {
                    try {
                        return await getMaterialIndexJob(job._id);
                    } catch {
                        // A mensagem pública evita expor nome de ficheiro, texto extraído ou storage key.
                        setError("Não foi possível atualizar o estado da indexação.");
                        return job;
                    }
                }),
            );

            setJobsByMaterial((current) => {
                const next = { ...current };
                for (const job of updatedJobs) {
                    next[job.materialId] = job;
                }
                return next;
            });
        }, 1500);

        return () => window.clearInterval(timer);
    }, [jobsByMaterial]);

    /**
     * Inicia indexação e guarda o job devolvido pela API.
     *
     * @param materialId Material privado que o backend volta a validar por ownership.
     * @returns Promise resolvida após atualizar estado local.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setError(null);
        try {
            const job = await indexPrivateMaterial(studyAreaId, materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível indexar o material.",
            );
        }
    }

    if (materials.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há materiais.</p>;
    }

    return (
        <div className="space-y-3">
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <ul className="space-y-3">
                {materials.map((material) => {
                    const job = jobsByMaterial[material._id];
                    const isIndexing =
                        job?.status === "QUEUED" || job?.status === "PROCESSING";

                    return (
                        <li className="rounded-md border border-slate-200 bg-white p-4" key={material._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{material.title}</p>
                                    <p className="text-sm text-slate-600">{material.type}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    {material.status}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    className="sf-button-secondary"
                                    disabled={isIndexing}
                                    onClick={() => void handleIndex(material._id)}
                                    type="button"
                                >
                                    {isIndexing ? "A indexar..." : "Indexar"}
                                </button>
                                {isIndexing ? (
                                    <p className="text-sm text-slate-600" aria-live="polite">
                                        Indexação em {job.status === "QUEUED" ? "fila" : "processamento"}.
                                    </p>
                                ) : null}
                                {job?.status === "DONE" ? (
                                    <a className="sf-button-secondary" href={`/app/material-index-jobs/${job._id}/versoes`}>
                                        Versões
                                    </a>
                                ) : null}
                                {job?.status === "FAILED" ? (
                                    <p className="text-sm text-red-700" role="alert">
                                        {job.errorMessage ?? "O material não tem texto legível para estudar."}
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