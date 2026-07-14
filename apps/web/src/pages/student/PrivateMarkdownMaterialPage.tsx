/** Visualização e edição segura de um material Markdown privado. */
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MarkdownEditor } from "../../components/markdown/MarkdownEditor.js";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer.js";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    getPrivateMaterial,
    isApiError,
    type StudyMaterial,
    updatePrivateMarkdown,
} from "../../lib/apiClient.js";

export function PrivateMarkdownMaterialPage({
    studyAreaId,
    materialId,
}: {
    studyAreaId: string;
    materialId: string;
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [material, setMaterial] = useState<StudyMaterial | null>(null);
    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);
    const editing = searchParams.get("edit") === "1";

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setConflict(false);
        try {
            const next = await getPrivateMaterial(studyAreaId, materialId);
            if (next.type !== "MARKDOWN" || !next.markdownSource) {
                throw new Error("Este material não é um documento Markdown editável.");
            }
            setMaterial(next);
            setTitle(next.title);
            setSource(next.markdownSource);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível carregar o documento.");
        } finally {
            setLoading(false);
        }
    }, [materialId, studyAreaId]);

    useEffect(() => {
        void load();
    }, [load]);

    const isDirty = Boolean(
        material && (title !== material.title || source !== material.markdownSource),
    );

    async function save(): Promise<void> {
        if (!material?.contentRevision) return;
        setSaving(true);
        setError(null);
        setConflict(false);
        try {
            const updated = await updatePrivateMarkdown(studyAreaId, materialId, {
                title,
                markdownSource: source,
                expectedRevision: material.contentRevision,
            });
            setMaterial(updated);
            setTitle(updated.title);
            setSource(updated.markdownSource ?? source);
        } catch (caught) {
            if (isApiError(caught) && caught.code === "MATERIAL_REVISION_CONFLICT") {
                setConflict(true);
                setError("Existe uma revisão mais recente. O teu texto continua neste editor.");
            } else {
                setError(caught instanceof Error ? caught.message : "Não foi possível guardar o documento.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="space-y-6">
            <Link className="text-sm text-studyflow-brandText underline" to={`/app/areas/${studyAreaId}/materiais`}>Voltar aos materiais</Link>
            <PageHeader
                action={material ? (
                    <div className="flex flex-wrap gap-2">
                        <button className="sf-button-secondary" onClick={() => setSearchParams(editing ? {} : { edit: "1" })} type="button">{editing ? "Ver documento" : "Editar"}</button>
                        <a className="sf-button-secondary" href={`/api/study-areas/${studyAreaId}/materials/${materialId}/download`}>Descarregar .md</a>
                    </div>
                ) : undefined}
                description="Material privado disponível para a IA desta área de estudo."
                title={material?.title ?? "Documento Markdown"}
            />
            <AsyncStateBlock error={!material ? error ?? undefined : undefined} isEmpty={!material} isLoading={loading} emptyMessage="Documento indisponível" onRetry={() => void load()}>
                {material ? (
                    <article className="sf-surface space-y-4">
                        <div className="flex flex-wrap gap-2"><StatusBadge tone="brand">Disponível para IA</StatusBadge><StatusBadge>Revisão {material.contentRevision ?? 1}</StatusBadge></div>
                        {editing ? (
                            <>
                                <label className="block text-sm font-semibold" htmlFor="private-markdown-title">Título</label>
                                <input id="private-markdown-title" maxLength={160} onChange={(event) => setTitle(event.target.value)} value={title} />
                                <MarkdownEditor error={error} isDirty={isDirty} isSaving={saving} onChange={setSource} onSave={() => void save()} value={source} />
                                {conflict ? <div className="flex flex-wrap gap-2"><button className="sf-button-secondary" onClick={() => void load()} type="button">Recarregar versão atual</button><button className="sf-button-secondary" onClick={() => void navigator.clipboard.writeText(source)} type="button">Copiar o meu texto</button></div> : null}
                            </>
                        ) : (
                            <MarkdownViewer source={material.markdownSource ?? ""} />
                        )}
                        {!editing && error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                    </article>
                ) : null}
            </AsyncStateBlock>
        </section>
    );
}
