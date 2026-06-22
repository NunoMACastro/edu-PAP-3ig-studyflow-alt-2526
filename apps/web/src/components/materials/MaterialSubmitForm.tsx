// apps/web/src/components/materials/MaterialSubmitForm.tsx
import { FormEvent, useState } from "react";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";

type MaterialMode = "TOPIC" | "URL" | "FILE";

/**
 * Props do formulário de materiais privados.
 */
type MaterialSubmitFormProps = {
    /** Área privada onde o material será submetido. */
    studyAreaId: string;
    /** Callback para atualizar a página depois de criar o material. */
    onSubmitted: () => Promise<void>;
};

/**
 * Formulário de submissão de materiais com feedback imediato.
 *
 * @param props Área alvo e callback de atualização.
 * @returns Formulário para tópico, URL ou ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } = useActionFeedback();

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar e atualizar a lista.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        try {
            setIsSubmitting(true);
            notifyLoading(mode === "FILE" ? "A enviar ficheiro..." : "A guardar material...");

            if (mode === "FILE") {
                if (!file) {
                    throw new Error("Escolhe um ficheiro.");
                }
                // O ficheiro segue por multipart com cookies HttpOnly; não guardes ficheiros nem tokens no browser.
                await submitFileMaterial(studyAreaId, file, title);
            } else {
                await submitTextMaterial(studyAreaId, {
                    type: mode,
                    title,
                    url: mode === "URL" ? body : undefined,
                    topicText: mode === "TOPIC" ? body : undefined,
                });
            }

            setTitle("");
            setBody("");
            setFile(null);
            await onSubmitted();
            notifySuccess("Material submetido com sucesso.");
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Não foi possível submeter.";
            setError(message);
            // A mensagem é segura para UI e não expõe storage, cookie, prompt ou conteúdo privado.
            notifyError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <div className="space-y-2">
                <label htmlFor="materialMode">Tipo</label>
                <select
                    disabled={isSubmitting}
                    id="materialMode"
                    onChange={(event) => setMode(event.target.value as MaterialMode)}
                    value={mode}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="materialTitle">Título</label>
                <input
                    disabled={isSubmitting}
                    id="materialTitle"
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    value={title}
                />
            </div>

            {mode === "FILE" ? (
                <div className="space-y-2">
                    <label htmlFor="materialFile">Ficheiro</label>
                    <input
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        disabled={isSubmitting}
                        id="materialFile"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        required
                        type="file"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="materialBody">{mode === "URL" ? "URL" : "Texto"}</label>
                    <textarea
                        disabled={isSubmitting}
                        id="materialBody"
                        onChange={(event) => setBody(event.target.value)}
                        required
                        rows={4}
                        value={body}
                    />
                </div>
            )}

            <button className="sf-button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "A submeter..." : "Submeter"}
            </button>
        </form>
    );
}
