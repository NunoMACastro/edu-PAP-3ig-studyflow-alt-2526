/** Gestão docente de fontes oficiais textuais, URL, PDF e DOCX. */
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    formatMaterialSize,
    OfficialMaterialFileActions,
} from "../../components/materials/OfficialMaterialFileActions.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import { usePollingTask } from "../../hooks/usePollingTask.js";
import { formatDatePt } from "../../lib/format-date-pt.js";
import {
    createOfficialMaterial,
    getMaterialIndexJob,
    indexOfficialMaterial,
    listLatestOfficialMaterialIndexJobs,
    listOfficialMaterials,
    type MaterialIndexJob,
    type OfficialMaterial,
    uploadOfficialMaterialFile,
} from "../../lib/apiClient.js";

type MaterialType = OfficialMaterial["type"];

const TYPE_LABELS: Record<MaterialType, string> = {
    TEXT: "Texto processado",
    URL: "Referência URL",
    PDF: "Documento PDF",
    DOCX: "Documento Word",
};

function statusLabel(
    material: OfficialMaterial,
    job?: MaterialIndexJob,
): string {
    if (job?.status === "QUEUED") return "Em fila";
    if (job?.status === "PROCESSING") return "A indexar";
    if (job?.status === "FAILED") return "Falha na indexação";
    if (material.availableToAi || job?.status === "DONE") {
        return "Disponível para IA";
    }
    return "Por indexar";
}

export function TeacherOfficialMaterialsPage({ subjectId }: { subjectId: string }) {
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [jobsByMaterial, setJobsByMaterial] = useState<Record<string, MaterialIndexJob>>({});
    const [type, setType] = useState<MaterialType>("TEXT");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [indexingId, setIndexingId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    useHashSidePanel("#criar-material", setCreateOpen);

    async function refresh(): Promise<void> {
        setIsLoading(true);
        try {
            const [nextMaterials, jobs] = await Promise.all([
                listOfficialMaterials(subjectId),
                listLatestOfficialMaterialIndexJobs(subjectId),
            ]);
            setMaterials(nextMaterials);
            setJobsByMaterial(
                jobs.reduce<Record<string, MaterialIndexJob>>((index, job) => {
                    index[job.materialId] = job;
                    return index;
                }, {}),
            );
            setListError(null);
        } catch (caught) {
            setListError(caught instanceof Error ? caught.message : "Erro ao carregar materiais.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [subjectId]);

    const activeJobs = useMemo(
        () =>
            Object.values(jobsByMaterial).filter((job) =>
                ["QUEUED", "PROCESSING"].includes(job.status),
            ),
        [jobsByMaterial],
    );
    usePollingTask(
        async (signal) => {
            const updates = await Promise.all(
                activeJobs.map((job) => getMaterialIndexJob(job._id, signal)),
            );
            setJobsByMaterial((current) => {
                const next = { ...current };
                for (const job of updates) next[job.materialId] = job;
                return next;
            });
            if (updates.some((job) => job.status === "DONE" || job.status === "FAILED")) {
                const nextMaterials = await listOfficialMaterials(subjectId);
                setMaterials(nextMaterials);
            }
        },
        { enabled: activeJobs.length > 0, intervalMs: 1500 },
    );

    function resetForm(): void {
        setType("TEXT");
        setTitle("");
        setTextContent("");
        setSourceUrl("");
        setFile(null);
    }

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setActionError(null);
        setIsSaving(true);
        try {
            if (type === "PDF" || type === "DOCX") {
                if (!file) throw new Error("Seleciona um ficheiro PDF ou DOCX.");
                await uploadOfficialMaterialFile(subjectId, { title, file });
            } else {
                await createOfficialMaterial(subjectId, {
                    title,
                    type,
                    textContent: type === "TEXT" ? textContent : undefined,
                    sourceUrl: type === "URL" ? sourceUrl : undefined,
                });
            }
            resetForm();
            await refresh();
            setCreateOpen(false);
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Erro ao criar material.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleIndex(materialId: string): Promise<void> {
        setActionError(null);
        setIndexingId(materialId);
        try {
            const job = await indexOfficialMaterial(materialId);
            setJobsByMaterial((current) => ({ ...current, [materialId]: job }));
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Erro ao indexar material.");
        } finally {
            setIndexingId(null);
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={
                    <>
                        <button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Novo material</button>
                        <button aria-expanded={importOpen} className="sf-button-secondary" onClick={() => setImportOpen(true)} type="button">Importar link</button>
                    </>
                }
                description="Fontes oficiais da disciplina e respetiva disponibilidade para alunos e IA."
                title="Materiais oficiais"
            />
            {actionError && !createOpen ? <InlineNotice tone="danger">{actionError}</InlineNotice> : null}
            <AsyncStateBlock isLoading={isLoading} error={listError ?? undefined} isEmpty={materials.length === 0} emptyMessage="Ainda não há materiais oficiais." onRetry={() => void refresh()}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {materials.map((material) => {
                        const job = jobsByMaterial[material._id];
                        const active = job?.status === "QUEUED" || job?.status === "PROCESSING";
                        const size = formatMaterialSize(material.sizeBytes);
                        return (
                            <article className="sf-list-card flex min-w-0 flex-col gap-3" key={material._id}>
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <h2 className="min-w-0 break-words font-semibold">{material.title}</h2>
                                    <StatusBadge tone={material.availableToAi || job?.status === "DONE" ? "brand" : job?.status === "FAILED" ? "danger" : "neutral"}>{statusLabel(material, job)}</StatusBadge>
                                </div>
                                <p className="text-sm text-studyflow-text/65">{TYPE_LABELS[material.type]}</p>
                                {material.originalName ? <p className="break-words text-sm">{material.originalName}{size ? ` · ${size}` : ""}</p> : null}
                                <p className="text-xs text-studyflow-text/60">Submetido em {formatDatePt(material.createdAt)}</p>
                                {material.sourceUrl ? <a className="break-all text-sm text-studyflow-brandText underline" href={material.sourceUrl} rel="noreferrer" target="_blank">{material.sourceUrl}</a> : null}
                                {job?.status === "FAILED" ? <InlineNotice tone="danger">{job.errorMessage ?? "Não foi possível indexar o material."}</InlineNotice> : null}
                                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                    {(!material.availableToAi || !job) ? (
                                        <button className="sf-button-secondary" disabled={active || indexingId === material._id} onClick={() => void handleIndex(material._id)} type="button">
                                            {active || indexingId === material._id ? "A indexar..." : job?.status === "FAILED" ? "Tentar novamente" : "Indexar"}
                                        </button>
                                    ) : null}
                                    <OfficialMaterialFileActions material={material} />
                                    {job?.status === "DONE" ? <a className="sf-button-secondary" href={`/app/material-index-jobs/${job._id}/versoes`}>Versões</a> : null}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </AsyncStateBlock>
            <SidePanel closeDisabled={isSaving} description="Adiciona texto, URL, PDF ou DOCX à disciplina." onClose={() => setCreateOpen(false)} open={createOpen} title="Criar material oficial">
                <form className="space-y-4" id="criar-material" onSubmit={(event) => void handleSubmit(event)}>
                    {actionError ? <InlineNotice tone="danger">{actionError}</InlineNotice> : null}
                    <label className="block space-y-2" htmlFor="official-material-type"><span>Tipo de material</span><select id="official-material-type" value={type} onChange={(event) => { setType(event.target.value as MaterialType); setFile(null); }}><option value="TEXT">Texto processado</option><option value="URL">Referência URL</option><option value="PDF">PDF</option><option value="DOCX">DOCX</option></select></label>
                    <label className="block space-y-2" htmlFor="official-material-title"><span>Título</span><input id="official-material-title" maxLength={160} minLength={2} required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                    {type === "TEXT" ? <label className="block space-y-2" htmlFor="official-material-text"><span>Conteúdo textual oficial</span><textarea id="official-material-text" minLength={20} required rows={8} value={textContent} onChange={(event) => setTextContent(event.target.value)} /></label> : null}
                    {type === "URL" ? <label className="block space-y-2" htmlFor="official-material-url"><span>URL da fonte</span><input id="official-material-url" required type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." /></label> : null}
                    {type === "PDF" || type === "DOCX" ? <label className="block space-y-2" htmlFor="official-material-file"><span>Ficheiro {type}</span><input accept={type === "PDF" ? ".pdf,application/pdf" : ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"} id="official-material-file" required type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><span className="block text-sm text-studyflow-text/65">Máximo de 10 MiB. O ficheiro só fica disponível para IA após indexação explícita.</span></label> : null}
                    <button className="sf-button-primary" disabled={isSaving}>{isSaving ? "A enviar..." : "Guardar material"}</button>
                </form>
            </SidePanel>
            <SidePanel closeDisabled={isImporting} description="Importa uma referência externa para esta disciplina." onClose={() => setImportOpen(false)} open={importOpen} title="Importar link externo">
                <ExternalMaterialImportPanel targetId={subjectId} targetType="OFFICIAL_SUBJECT" onImported={async () => { await refresh(); setImportOpen(false); }} onSubmittingChange={setIsImporting} />
            </SidePanel>
        </section>
    );
}
