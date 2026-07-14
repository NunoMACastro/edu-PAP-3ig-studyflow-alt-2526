/** Catálogo e detalhe seguro de materiais oficiais disponibilizados pelo professor. */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { IconTooltip, ShellIcon } from "../../components/layout/shell-icons.js";
import { SubjectWorkspaceHeader } from "../../components/student/SubjectWorkspaceHeader.js";
import { Breadcrumbs } from "../../components/student/StudentWorkspace.js";
import {
    formatMaterialSize,
    OfficialMaterialFileActions,
} from "../../components/materials/OfficialMaterialFileActions.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    getStudentOfficialMaterial,
    listStudentOfficialMaterials,
    type StudentOfficialMaterial,
} from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer.js";

function materialTypeLabel(type: StudentOfficialMaterial["type"]): string {
    return type === "TEXT" ? "Conteúdo textual" : type === "URL" ? "Referência externa" : type === "PDF" ? "Documento PDF" : type === "DOCX" ? "Documento Word" : "Documento Markdown";
}

export function StudentOfficialMaterialsPage({ subjectId }: { subjectId: string }) {
    const [items, setItems] = useState<StudentOfficialMaterial[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentOfficialMaterials(subjectId, { limit: 24 })
            .then((page) => {
                if (!active) return;
                setItems(page.items);
                setNextCursor(page.nextCursor);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar materiais oficiais.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reloadToken, subjectId]);

    async function loadMore(): Promise<void> {
        if (!nextCursor) return;
        setLoadingMore(true);
        setError(null);
        try {
            const page = await listStudentOfficialMaterials(subjectId, {
                cursor: nextCursor,
                limit: 24,
            });
            setItems((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar mais materiais.");
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <section className="space-y-6">
            <SubjectWorkspaceHeader active="materials" subjectId={subjectId} />
            {error && items.length > 0 ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <AsyncStateBlock error={items.length === 0 ? error ?? undefined : undefined} isEmpty={items.length === 0} isLoading={loading} emptyMessage="Ainda não há materiais oficiais disponíveis" onRetry={() => setReloadToken((value) => value + 1)}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((material) => (
                        <article className="sf-list-card flex h-full min-w-0 flex-col gap-3" key={material._id}>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-semibold">{material.title}</h2>
                                <StatusBadge className="shrink-0 whitespace-nowrap" tone={material.availableToAi ? "brand" : "neutral"}>{material.availableToAi ? "Disponível para IA" : "Só leitura"}</StatusBadge>
                            </div>
                            <p className="text-sm text-studyflow-text/65">{materialTypeLabel(material.type)} · revisão {material.contentRevision}</p>
                            {material.originalName ? <p className="break-words text-sm">{material.originalName}{formatMaterialSize(material.sizeBytes) ? ` · ${formatMaterialSize(material.sizeBytes)}` : ""}</p> : null}
                            <p className="text-xs text-studyflow-text/60">Submetido em {formatDatePt(material.createdAt)}</p>
                            <div aria-label={`Ações de ${material.title}`} className="mt-auto flex items-center justify-end gap-2 border-t border-studyflow-border/10 pt-3" role="group">
                                <a
                                    aria-label="Consultar material"
                                    className="sf-icon-button group relative min-h-11 min-w-11 shrink-0"
                                    href={`/app/disciplinas/${subjectId}/materiais/${material._id}`}
                                >
                                    <ShellIcon className="h-5 w-5" name="file" />
                                    <IconTooltip align="right" side="top">Consultar material</IconTooltip>
                                </a>
                                <OfficialMaterialFileActions material={material} variant="icons" />
                            </div>
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
            <a className="sf-button-secondary inline-flex" href={`/app/disciplinas/${subjectId}/contextos-materiais`}>Fontes utilizadas pela IA</a>
            {nextCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar mais"}</button> : null}
        </section>
    );
}

export function StudentOfficialMaterialDetailPage({ subjectId, materialId }: { subjectId: string; materialId: string }) {
    const [material, setMaterial] = useState<StudentOfficialMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getStudentOfficialMaterial(subjectId, materialId)
            .then((next) => {
                if (active) setMaterial(next);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar material.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [materialId, reloadToken, subjectId]);

    return (
        <section className="space-y-6">
            <Breadcrumbs items={[{ label: "Disciplina", href: `/app/disciplinas/${subjectId}` }, { label: "Materiais", href: `/app/disciplinas/${subjectId}/materiais` }, { label: material?.title ?? "Material" }]} />
            <PageHeader description="Versão oficial atualmente disponibilizada pelo professor." title={material?.title ?? "Material oficial"} />
            <AsyncStateBlock error={error ?? undefined} isEmpty={!material} isLoading={loading} emptyMessage="Material indisponível" onRetry={() => setReloadToken((value) => value + 1)}>
                {material ? (
                    <article className="sf-surface max-w-5xl space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge>{materialTypeLabel(material.type)}</StatusBadge>
                            <StatusBadge>Revisão {material.contentRevision}</StatusBadge>
                            <StatusBadge tone={material.availableToAi ? "brand" : "neutral"}>{material.availableToAi ? "Disponível para IA" : "Só leitura"}</StatusBadge>
                        </div>
                        {material.textContent ? <p className="whitespace-pre-wrap leading-7">{material.textContent}</p> : null}
                        {material.type === "MARKDOWN" && material.markdownSource ? <MarkdownViewer source={material.markdownSource} /> : null}
                        {material.sourceUrl ? <a className="sf-button-primary inline-flex" href={material.sourceUrl} rel="noreferrer" target="_blank">Abrir referência externa</a> : null}
                        {material.originalName ? <p className="break-words text-sm">{material.originalName}{formatMaterialSize(material.sizeBytes) ? ` · ${formatMaterialSize(material.sizeBytes)}` : ""}</p> : null}
                        <OfficialMaterialFileActions material={material} />
                        {material.revisionInfo ? <div className="rounded-xl border border-studyflow-border/10 p-3 text-sm"><p>Atualizado em {formatDatePt(material.revisionInfo.updatedAt)} · revisão {material.revisionInfo.revision}</p>{material.revisionInfo.changeSummary ? <p className="mt-1 text-studyflow-text/70">{material.revisionInfo.changeSummary}</p> : null}</div> : null}
                    </article>
                ) : null}
            </AsyncStateBlock>
        </section>
    );
}
