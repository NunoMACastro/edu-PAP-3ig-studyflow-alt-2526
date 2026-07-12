/** Catálogo e detalhe seguro de materiais oficiais disponibilizados pelo professor. */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
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

function materialTypeLabel(type: StudentOfficialMaterial["type"]): string {
    return type === "TEXT" ? "Conteúdo textual" : type === "URL" ? "Referência externa" : type === "PDF" ? "Documento PDF" : "Documento Word";
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
            <PageHeader description="Conteúdo oficial ativo, igual ao utilizado pela IA e pelas salas guiadas." title="Materiais oficiais" />
            {error && items.length > 0 ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <AsyncStateBlock error={items.length === 0 ? error ?? undefined : undefined} isEmpty={items.length === 0} isLoading={loading} emptyMessage="Ainda não há materiais oficiais disponíveis" onRetry={() => setReloadToken((value) => value + 1)}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((material) => (
                        <article className="sf-list-card space-y-3" key={material._id}>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-semibold">{material.title}</h2>
                                <StatusBadge tone={material.availableToAi ? "brand" : "neutral"}>{material.availableToAi ? "Disponível para IA" : "Só leitura"}</StatusBadge>
                            </div>
                            <p className="text-sm text-studyflow-text/65">{materialTypeLabel(material.type)} · revisão {material.contentRevision}</p>
                            {material.originalName ? <p className="break-words text-sm">{material.originalName}{formatMaterialSize(material.sizeBytes) ? ` · ${formatMaterialSize(material.sizeBytes)}` : ""}</p> : null}
                            <p className="text-xs text-studyflow-text/60">Submetido em {formatDatePt(material.createdAt)}</p>
                            <div className="flex flex-wrap gap-2"><a className="sf-button-secondary inline-flex" href={`/app/disciplinas/${subjectId}/materiais/${material._id}`}>Consultar material</a><OfficialMaterialFileActions material={material} /></div>
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
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
                        {material.sourceUrl ? <a className="sf-button-primary inline-flex" href={material.sourceUrl} rel="noreferrer" target="_blank">Abrir referência externa</a> : null}
                        {material.originalName ? <p className="break-words text-sm">{material.originalName}{formatMaterialSize(material.sizeBytes) ? ` · ${formatMaterialSize(material.sizeBytes)}` : ""}</p> : null}
                        <OfficialMaterialFileActions material={material} />
                    </article>
                ) : null}
            </AsyncStateBlock>
        </section>
    );
}
