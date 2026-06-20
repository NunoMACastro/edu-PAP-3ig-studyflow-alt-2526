/**
 * Implementa um componente React reutilizavel para materials.
 */
import { useState } from "react";
import {
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
 * Lista materiais submetidos numa área.
 *
 * @param props Materiais carregados da API.
 * @returns Lista visual com estado de processamento.
 */
export function MaterialList({ materials, studyAreaId }: MaterialListProps) {
    const [jobsByMaterial, setJobsByMaterial] = useState<
        Record<string, MaterialIndexJob>
    >({});
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param materialId Identificador usado para limitar a operação a material.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setError(null);
        try {
            const job = await indexPrivateMaterial(studyAreaId, materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Erro ao indexar material.",
            );
        }
    }

    if (materials.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há materiais.</p>;
    }

    return (
        <div className="space-y-3">
            {error ? <p className="sf-error">{error}</p> : null}
            <ul className="space-y-3">
                {materials.map((material) => {
                    const job = jobsByMaterial[material._id];
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
                                    onClick={() => void handleIndex(material._id)}
                                    type="button"
                                >
                                    Indexar
                                </button>
                                {job?.status === "DONE" ? (
                                    <a
                                        className="sf-button-secondary"
                                        href={`/app/material-index-jobs/${job._id}/versoes`}
                                    >
                                        Versões
                                    </a>
                                ) : null}
                                {job?.status === "FAILED" ? (
                                    <p className="text-sm text-red-700">{job.errorMessage}</p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
