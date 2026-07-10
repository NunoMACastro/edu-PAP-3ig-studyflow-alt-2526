/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { type FormEvent, useEffect, useState } from "react";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
import {
    createOfficialMaterial,
    indexOfficialMaterial,
    listOfficialMaterials,
    type MaterialIndexJob,
    type OfficialMaterial,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherOfficialMaterialsPageProps = {
    subjectId: string;
};

const MATERIAL_TYPE_LABELS: Record<OfficialMaterial["type"], string> = {
    TEXT: "Texto processado",
    URL: "Referência URL",
};

const MATERIAL_STATUS_LABELS: Record<OfficialMaterial["status"], string> = {
    PROCESSED: "Processado",
    REFERENCE_ONLY: "Apenas referência",
};

/**
 * Traduz os enums do material oficial para labels adequados à interface docente.
 *
 * @param material Material devolvido pela API.
 * @returns Labels de tipo e estado em português.
 */
function getMaterialLabels(material: OfficialMaterial): { type: string; status: string } {
    return {
        type: MATERIAL_TYPE_LABELS[material.type],
        status: MATERIAL_STATUS_LABELS[material.status],
    };
}

/**
 * Página de materiais oficiais da disciplina.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherOfficialMaterialsPage({ subjectId }: TeacherOfficialMaterialsPageProps) {
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [actionError, setActionError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [jobsByMaterial, setJobsByMaterial] = useState<
        Record<string, MaterialIndexJob>
    >({});

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setIsLoadingMaterials(true);
        try {
            setMaterials(await listOfficialMaterials(subjectId));
            setListError(null);
        } catch (caught) {
            setListError(caught instanceof Error ? caught.message : "Erro ao carregar materiais.");
        } finally {
            setIsLoadingMaterials(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setActionError(null);
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
            setActionError(caught instanceof Error ? caught.message : "Erro ao criar material.");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleIndex(materialId: string): Promise<void> {
        setActionError(null);
        try {
            const job = await indexOfficialMaterial(materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Erro ao indexar material.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-6">
                <form className="sf-panel space-y-4" id="criar-material" onSubmit={(event) => void handleSubmit(event)}>
                    <h1 className="text-xl font-bold">Materiais oficiais</h1>
                    {actionError ? <p className="sf-error" role="alert">{actionError}</p> : null}
                    <label className="block space-y-2">
                        <span>Tipo de material</span>
                        <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                            <option value="TEXT">Texto processado</option>
                            <option value="URL">Referência URL</option>
                        </select>
                    </label>
                    <label className="block space-y-2">
                        <span>Título</span>
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </label>
                    {type === "TEXT" ? (
                        <label className="block space-y-2">
                            <span>Conteúdo textual oficial</span>
                            <textarea rows={8} value={textContent} onChange={(event) => setTextContent(event.target.value)} />
                        </label>
                    ) : (
                        <label className="block space-y-2">
                            <span>URL da fonte</span>
                            <input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." />
                        </label>
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
                <AsyncStateBlock
                    isLoading={isLoadingMaterials}
                    error={listError ?? undefined}
                    isEmpty={materials.length === 0}
                    emptyMessage="Ainda não há materiais oficiais."
                >
                    {materials.map((material) => {
                        // O backend limita materiais por disciplina e professor antes da renderização.
                        const labels = getMaterialLabels(material);

                        return (
                            <article className="sf-panel space-y-1" key={material._id}>
                                <h2 className="font-semibold">{material.title}</h2>
                                <p className="text-sm text-studyflow-text">{labels.type} · {labels.status}</p>
                                {material.sourceUrl ? <a className="text-sm text-studyflow-brandText underline" href={material.sourceUrl}>{material.sourceUrl}</a> : null}
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
                        );
                    })}
                </AsyncStateBlock>
            </div>
        </section>
    );
}
