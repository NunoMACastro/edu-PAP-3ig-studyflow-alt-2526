/** Gestão docente de rascunhos e revisões Markdown oficiais. */
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MarkdownEditor } from "../../components/markdown/MarkdownEditor.js";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer.js";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    getTeacherOfficialMaterial,
    isApiError,
    type OfficialMaterial,
    publishOfficialMarkdown,
    updateOfficialMarkdown,
} from "../../lib/apiClient.js";

export function TeacherOfficialMarkdownPage({
    subjectId,
    materialId,
}: {
    subjectId: string;
    materialId: string;
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [material, setMaterial] = useState<OfficialMaterial | null>(null);
    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);
    const editing = searchParams.get("edit") === "1";
    const returnTo = safeTeacherReturnTo(searchParams.get("returnTo"));

    function toggleEditing(): void {
        const next = new URLSearchParams(searchParams);
        if (editing) next.delete("edit");
        else next.set("edit", "1");
        setSearchParams(next);
    }

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setConflict(false);
        try {
            const next = await getTeacherOfficialMaterial(subjectId, materialId);
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
    }, [materialId, subjectId]);

    useEffect(() => {
        void load();
    }, [load]);

    const isDirty = Boolean(material && (title !== material.title || source !== material.markdownSource));

    async function save(): Promise<void> {
        if (!material?.contentRevision) return;
        setSaving(true);
        setError(null);
        setNotice(null);
        setConflict(false);
        try {
            const updated = await updateOfficialMarkdown(subjectId, materialId, {
                title,
                markdownSource: source,
                expectedRevision: material.contentRevision,
            });
            setMaterial(updated);
            setTitle(updated.title);
            setSource(updated.markdownSource ?? source);
            setNotice(updated.status === "DRAFT" ? "Rascunho guardado. Ainda não está visível para os alunos nem para a IA." : "Alterações publicadas e disponíveis para os alunos e para a IA.");
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

    async function publish(): Promise<void> {
        if (!material?.contentRevision || isDirty) return;
        setPublishing(true);
        setError(null);
        try {
            const published = await publishOfficialMarkdown(subjectId, materialId, material.contentRevision);
            setMaterial(published);
            setNotice("Material publicado. Está agora disponível para os alunos e para a IA da disciplina.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível publicar o documento.");
        } finally {
            setPublishing(false);
        }
    }

    return (
        <section className="space-y-6">
            <Link className="text-sm text-studyflow-brandText underline" to={returnTo ?? `/app/professor/disciplinas/${subjectId}/materiais`}>{returnTo ? "Voltar à sala guiada" : "Voltar aos materiais"}</Link>
            <PageHeader
                action={material ? <div className="flex flex-wrap gap-2"><button className="sf-button-secondary" onClick={toggleEditing} type="button">{editing ? "Ver documento" : "Editar"}</button><a className="sf-button-secondary" href={`/api/official-materials/${materialId}/download`}>Descarregar .md</a>{material.status === "DRAFT" ? <button className="sf-button-primary" disabled={publishing || isDirty} onClick={() => void publish()} type="button">{publishing ? "A publicar..." : "Publicar"}</button> : null}</div> : undefined}
                description={material?.status === "DRAFT" ? "Rascunho privado: não alimenta a IA e não está visível aos alunos." : "Cada gravação atualiza imediatamente alunos e IA."}
                title={material?.title ?? "Documento Markdown oficial"}
            />
            {notice ? <InlineNotice tone="brand">{notice}</InlineNotice> : null}
            <AsyncStateBlock error={!material ? error ?? undefined : undefined} isEmpty={!material} isLoading={loading} emptyMessage="Documento indisponível" onRetry={() => void load()}>
                {material ? <article className="sf-surface space-y-4"><div className="flex flex-wrap gap-2"><StatusBadge tone={material.status === "DRAFT" ? "neutral" : "brand"}>{material.status === "DRAFT" ? "Rascunho" : "Publicado"}</StatusBadge><StatusBadge>Revisão {material.contentRevision ?? 1}</StatusBadge></div>{editing ? <><label className="block text-sm font-semibold" htmlFor="official-markdown-title">Título</label><input id="official-markdown-title" maxLength={160} onChange={(event) => setTitle(event.target.value)} value={title} /><MarkdownEditor error={error} isDirty={isDirty} isSaving={saving} onChange={setSource} onSave={() => void save()} saveLabel={material.status === "DRAFT" ? "Guardar rascunho" : "Guardar e publicar alterações"} value={source} />{conflict ? <div className="flex flex-wrap gap-2"><button className="sf-button-secondary" onClick={() => void load()} type="button">Recarregar versão atual</button><button className="sf-button-secondary" onClick={() => void navigator.clipboard.writeText(source)} type="button">Copiar o meu texto</button></div> : null}</> : <MarkdownViewer source={material.markdownSource ?? ""} />}{!editing && error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}</article> : null}
            </AsyncStateBlock>
        </section>
    );
}

/** Impede que `returnTo` transforme a navegação de retorno num open redirect. */
function safeTeacherReturnTo(value: string | null): string | null {
    return value?.startsWith("/app/professor/") ? value : null;
}
