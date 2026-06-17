/**
 * Implementa um componente React reutilizavel para materials.
 */
import { FormEvent, useState } from "react";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";

/**
 * Props do componente React de materiais privados; mantêm explícitas as dependências vindas da página.
 */
type MaterialSubmitFormProps = {
    studyAreaId: string;
    onSubmitted: () => Promise<void>;
};

/**
 * Formulário de submissão de materiais.
 *
 * @param props Área alvo e callback de refresh.
 * @returns Controlos para tópico, URL e ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<"TOPIC" | "URL" | "FILE">("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            if (mode === "FILE") {
                if (!file) throw new Error("Escolhe um ficheiro.");
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
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível submeter.");
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="space-y-2">
                <label htmlFor="materialMode">Tipo</label>
                <select id="materialMode" value={mode} onChange={(event) => setMode(event.target.value as "TOPIC" | "URL" | "FILE")}>
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </div>
            <div className="space-y-2">
                <label htmlFor="materialTitle">Título</label>
                <input id="materialTitle" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            {mode === "FILE" ? (
                <div className="space-y-2">
                    <label htmlFor="materialFile">Ficheiro</label>
                    <input id="materialFile" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="materialBody">{mode === "URL" ? "URL" : "Texto"}</label>
                    <textarea id="materialBody" rows={4} value={body} onChange={(event) => setBody(event.target.value)} required />
                </div>
            )}
            <button className="sf-button-primary" type="submit">Submeter</button>
        </form>
    );
}
