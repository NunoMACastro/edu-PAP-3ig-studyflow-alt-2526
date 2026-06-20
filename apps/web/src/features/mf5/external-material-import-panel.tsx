// web/src/features/mf5/external-material-import-panel.tsx
import { FormEvent, useId, useState } from "react";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
    importExternalMaterial,
} from "./external-material-imports-client.js";

type ExternalMaterialImportPanelProps = {
    targetType: ExternalMaterialTargetType;
    targetId: string;
    onImported?: () => void;
};

/**
 * Formulário acessível para importar links Drive/OneDrive para materiais StudyFlow.
 *
 * @param props Destino interno e callback de atualização da página.
 * @returns Painel de importação RF61.
 */
export function ExternalMaterialImportPanel({
    targetType,
    targetId,
    onImported,
}: ExternalMaterialImportPanelProps) {
    const providerId = useId();
    const titleId = useId();
    const urlId = useId();
    const [provider, setProvider] = useState<ExternalMaterialProvider>("GOOGLE_DRIVE");
    const [title, setTitle] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("loading");
        setMessage("A importar material externo...");

        try {
            await importExternalMaterial({
                provider,
                targetType,
                targetId,
                title,
                sourceUrl,
            });
            setStatus("success");
            setMessage("Material importado para o StudyFlow.");
            setTitle("");
            setSourceUrl("");
            onImported?.();
        } catch {
            // A mensagem é controlada para não mostrar URLs privados, IDs internos ou detalhes de permissões.
            setStatus("error");
            setMessage("Não foi possível importar este link. Confirma o URL e as permissões.");
        }
    }

    return (
        <form
            className="space-y-3 rounded border border-slate-200 bg-white p-4"
            onSubmit={handleSubmit}
        >
            <h2 className="text-lg font-semibold text-slate-900">
                Importar de Drive ou OneDrive
            </h2>

            <label className="block text-sm font-medium text-slate-800" htmlFor={providerId}>
                Origem
            </label>
            <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={providerId}
                value={provider}
                onChange={(event) => setProvider(event.target.value as ExternalMaterialProvider)}
            >
                <option value="GOOGLE_DRIVE">Google Drive</option>
                <option value="ONE_DRIVE">OneDrive</option>
            </select>

            <label className="block text-sm font-medium text-slate-800" htmlFor={titleId}>
                Título
            </label>
            <input
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={titleId}
                minLength={3}
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />

            <label className="block text-sm font-medium text-slate-800" htmlFor={urlId}>
                URL partilhado
            </label>
            <input
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={urlId}
                required
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
            />

            <button
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={status === "loading"}
                type="submit"
            >
                {status === "loading" ? "A importar..." : "Importar material"}
            </button>

            {message ? (
                <p aria-live="polite" className="text-sm text-slate-700">
                    {message}
                </p>
            ) : null}
        </form>
    );
}