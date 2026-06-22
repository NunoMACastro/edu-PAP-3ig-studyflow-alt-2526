// apps/web/src/components/materials/MaterialSubmitForm.tsx
import { FormEvent, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";
import {
    FieldErrors,
    RequiredField,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";

type MaterialSubmitFormProps = {
    studyAreaId: string;
    onSubmitted: () => Promise<void>;
};

type MaterialMode = "TOPIC" | "URL" | "FILE";
type MaterialField = "title" | "body" | "fileName";

/**
 * Formulário de submissão de materiais.
 *
 * @param props Área alvo e callback de refresh.
 * @returns Controlos acessíveis para tópico, URL e ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<"TOPIC" | "URL" | "FILE">("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<MaterialField>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bodyLabel = mode === "URL" ? "URL" : "Texto";
    const bodyHelpText =
        mode === "URL"
            ? "Indica o endereço do material que queres guardar."
            : "Escreve o tópico ou apontamento que queres estudar.";

    /**
     * Remove a mensagem de erro de um campo quando o aluno começa a corrigi-lo.
     *
     * @param field Campo alterado pelo utilizador.
     */
    function clearFieldError(field: MaterialField): void {
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Monta os campos obrigatórios conforme o modo escolhido.
     *
     * @returns Erros por campo que devem ser mostrados antes da API.
     */
    function validateFields(): FieldErrors<MaterialField> {
        const fields: Array<RequiredField<MaterialField>> = [
            { name: "title", label: "Título", value: title },
        ];

        if (mode === "FILE") {
            // O ficheiro é validado pelo nome aqui; a API continua a validar tipo e tamanho.
            fields.push({ name: "fileName", label: "Ficheiro", value: file?.name ?? "" });
        } else {
            fields.push({ name: "body", label: bodyLabel, value: body });
        }

        return requireFields(fields);
    }
    const bodyLabel = mode === "URL" ? "URL do material" : "Texto ou tópico";
    const bodyHelpText =
        mode === "URL"
            ? "Indica um endereço que o backend possa validar."
            : "Escreve o tópico ou conteúdo base que será guardado na área.";

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        const nextErrors = validateFields();
        if (hasFieldErrors(nextErrors)) {
            // Sem dados mínimos, não chamamos a API e mostramos erros junto aos campos.
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        setSubmitting(true);
        try {
            if (mode === "FILE") {
                await submitFileMaterial(studyAreaId, file!, title);
        try {
            if (mode === "FILE") {
                if (!file) throw new Error("Escolhe um ficheiro.");
                await submitFileMaterial(studyAreaId, file, title);
            } else {
                // O userId vem da sessão HttpOnly no backend; o frontend envia apenas dados do material.
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
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error">{error}</p> : null}

            <FormField id="materialMode" label="Tipo" helpText="Escolhe se vais guardar tópico, URL ou ficheiro.">
                <select
                    value={mode}
                    onChange={(event) => {
                        setMode(event.target.value as MaterialMode);
                        setFieldErrors({});
                    }}
            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}
            <FormField id="materialMode" label="Tipo" helpText="Escolhe se vais guardar tópico, URL ou ficheiro.">
                <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value as "TOPIC" | "URL" | "FILE")}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </FormField>

            <FormField
                id="materialTitle"
                label="Título"
                helpText="Usa um título curto para encontrares o material depois."
                error={fieldErrors.title}
            >
                <input value={title} onChange={(event) => {
                    setTitle(event.target.value);
                    clearFieldError("title");
                }} />
            </FormField>

            {mode === "FILE" ? (
                <FormField
                    id="materialFile"
                    label="Ficheiro"
                    helpText="Escolhe um PDF ou DOCX para a API processar."
                    error={fieldErrors.fileName}
                >
                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            clearFieldError("fileName");
                        }}
                    />
                </FormField>
            ) : (
                <FormField
                    id="materialBody"
                    label={bodyLabel}
                    helpText={bodyHelpText}
                    error={fieldErrors.body}
                >
                    <textarea rows={4} value={body} onChange={(event) => {
                        setBody(event.target.value);
                        clearFieldError("body");
                    }} />
                </FormField>
            )}

            <button className="sf-button-primary" disabled={submitting} type="submit">
                {submitting ? "A submeter..." : "Submeter"}
            <FormField id="materialTitle" label="Título" helpText="Usa um título curto para encontrares o material depois.">
                <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </FormField>
            {mode === "FILE" ? (
                <FormField id="materialFile" label="Ficheiro" helpText="Aceita PDF ou DOCX para processamento pela API.">
                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        required
                    />
                </FormField>
            ) : (
                <FormField id="materialBody" label={bodyLabel} helpText={bodyHelpText}>
                    <textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} required />
                </FormField>
            )}
            <button className="sf-button-primary" type="submit">
                Submeter
            </button>
        </form>
    );
}