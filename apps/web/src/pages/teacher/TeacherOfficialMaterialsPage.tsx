/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
import {
    createOfficialMaterial,
    indexOfficialMaterial,
    listOfficialMaterials,
    MaterialIndexJob,
    OfficialMaterial,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherOfficialMaterialsPageProps = {
    subjectId: string;
};

/**
 * Página de materiais oficiais da disciplina.
 */
export function TeacherOfficialMaterialsPage({ subjectId }: TeacherOfficialMaterialsPageProps) {
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [jobsByMaterial, setJobsByMaterial] = useState<
        Record<string, MaterialIndexJob>
    >({});

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        setMaterials(await listOfficialMaterials(subjectId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar materiais."),
        );
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createOfficialMaterial(subjectId, {
                title,
                type,
                textContent: type === "TEXT" ? textContent : undefined,
                sourceUrl: type === "URL" ? sourceUrl : undefined,
            });
            setTitle("");
            setTextContent("");
            setSourceUrl("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar material.");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param materialId Identificador usado para limitar a operação a material.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setError(null);
        try {
            const job = await indexOfficialMaterial(materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao indexar material.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6">
                <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    <h1 className="text-xl font-bold">Materiais oficiais</h1>
                    {error ? <p className="sf-error">{error}</p> : null}
                    <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                        <option value="TEXT">Texto processado</option>
                        <option value="URL">Referência URL</option>
                    </select>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                    {type === "TEXT" ? (
                        <textarea rows={8} value={textContent} onChange={(event) => setTextContent(event.target.value)} placeholder="Conteúdo textual oficial" />
                    ) : (
                        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." />
                    )}
                    <button className="sf-button-primary">Guardar material</button>
                </form>
                <ExternalMaterialImportPanel
                    targetId={subjectId}
                    targetType="OFFICIAL_SUBJECT"
                    onImported={refresh}
                />
            </div>
            <div className="grid gap-3">
                {materials.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não há materiais oficiais.</p> : null}
                {materials.map((material) => (
                    <article className="sf-panel space-y-1" key={material._id}>
                        <h2 className="font-semibold">{material.title}</h2>
                        <p className="text-sm text-slate-600">{material.type} · {material.status}</p>
                        {material.sourceUrl ? <a className="text-sm text-studyflow-brand" href={material.sourceUrl}>{material.sourceUrl}</a> : null}
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button
                                className="sf-button-secondary"
                                onClick={() => void handleIndex(material._id)}
                                type="button"
                            >
                                Indexar
                            </button>
                            {jobsByMaterial[material._id]?.status === "DONE" ? (
                                <a
                                    className="sf-button-secondary"
                                    href={`/app/material-index-jobs/${jobsByMaterial[material._id]._id}/versoes`}
                                >
                                    Versões
                                </a>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
