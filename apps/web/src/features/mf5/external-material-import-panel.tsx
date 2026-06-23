/**
 * Painel RF61 para importar links Google Drive/OneDrive como materiais.
 */
import { FormEvent, useId, useState } from "react";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
    importExternalMaterial,
} from "./external-material-imports-client.js";

/**
 * Props do painel de importacao; o destino vem da pagina que ja conhece o contexto.
 */
type ExternalMaterialImportPanelProps = {
    targetId: string;
    targetType: ExternalMaterialTargetType;
    onImported: () => Promise<void>;
};

/**
 * Formulario reutilizavel para destinos privados e oficiais.
 *
 * @param props Destino interno e callback de refresh.
 * @returns Painel de importacao unidirecional de links externos.
 */
export function ExternalMaterialImportPanel({
    targetId,
    targetType,
    onImported,
}: ExternalMaterialImportPanelProps) {
    const idPrefix = useId();
    const [provider, setProvider] =
        useState<ExternalMaterialProvider>("GOOGLE_DRIVE");
    const [title, setTitle] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    /**
     * Submete o link sem expor userId, role ou ownership no browser.
     *
     * @param event Evento de submissao do formulario.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await importExternalMaterial({
                provider,
                targetType,
                targetId,
                title,
                sourceUrl,
            });
            setTitle("");
            setSourceUrl("");
            setSuccess("Link importado como material StudyFlow.");
            await onImported();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível importar o link externo.",
            );
        } finally {
            setLoading(false);
        }
    }

    const submitDisabled =
        loading || title.trim().length < 3 || sourceUrl.trim().length < 8;

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Importar link externo</h2>
                <p className="text-sm text-slate-600">
                    Google Drive ou OneDrive, sem sincronização nem credenciais externas.
                </p>
            </div>

            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {success ? <p className="sf-success" role="status">{success}</p> : null}

            <div className="space-y-2">
                <label htmlFor={`${idPrefix}-provider`}>Origem externa</label>
                <select
                    id={`${idPrefix}-provider`}
                    value={provider}
                    onChange={(event) =>
                        setProvider(event.target.value as ExternalMaterialProvider)
                    }
                >
                    <option value="GOOGLE_DRIVE">Google Drive</option>
                    <option value="ONE_DRIVE">OneDrive</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor={`${idPrefix}-title`}>Título importado</label>
                <input
                    id={`${idPrefix}-title`}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor={`${idPrefix}-source-url`}>Link externo</label>
                <input
                    id={`${idPrefix}-source-url`}
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    required
                />
            </div>

            <button className="sf-button-primary" disabled={submitDisabled} type="submit">
                {loading ? "A importar..." : "Importar link"}
            </button>
        </form>
    );
}
