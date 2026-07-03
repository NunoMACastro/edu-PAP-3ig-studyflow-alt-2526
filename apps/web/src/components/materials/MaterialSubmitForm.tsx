/**
 * Implementa um componente React reutilizavel para materials.
 */
import { FormEvent, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import {
    type FieldErrors,
    type RequiredField,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import { submitFileMaterial, submitTextMaterial } from "../../lib/apiClient.js";

type MaterialMode = "TOPIC" | "URL" | "FILE";
type MaterialField = "title" | "body" | "fileName";

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
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<MaterialField>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } =
        useActionFeedback();
    const bodyLabel = mode === "URL" ? "URL do material" : "Texto ou tópico";
    const bodyHelpText =
        mode === "URL"
            ? "Indica um endereço que o backend possa validar."
            : "Escreve o tópico ou conteúdo base que será guardado na área.";

    /**
     * Remove uma mensagem de validação assim que o aluno corrige o campo.
     *
     * @param field Campo alterado pelo utilizador.
     * @returns Nada; apenas atualiza estado local.
     */
    function clearFieldError(field: MaterialField): void {
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    /**
     * Monta a lista de campos obrigatórios conforme o modo de material.
     *
     * @returns Erros por campo a apresentar antes de qualquer pedido HTTP.
     */
    function validateFields(): FieldErrors<MaterialField> {
        const fields: Array<RequiredField<MaterialField>> = [
            { name: "title", label: "Título", value: title },
        ];

        if (mode === "FILE") {
            // Validamos presença do ficheiro na UI; tipo e tamanho continuam responsabilidade da API.
            fields.push({ name: "fileName", label: "Ficheiro", value: file?.name ?? "" });
        } else {
            fields.push({ name: "body", label: bodyLabel, value: body });
        }

        return requireFields(fields);
    }

    /**
     * Submete o material conforme o modo escolhido.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        const nextErrors = validateFields();
        if (hasFieldErrors(nextErrors)) {
            // Sem dados mínimos, não chamamos a API nem mostramos um erro tardio genérico.
            setFieldErrors(nextErrors);
            return;
        }

        try {
            setFieldErrors({});
            setIsSubmitting(true);
            notifyLoading(mode === "FILE" ? "A enviar ficheiro..." : "A guardar material...");

            if (mode === "FILE") {
                if (!file) throw new Error("Escolhe um ficheiro.");
                // Multipart segue com cookies HttpOnly; nao guardamos ficheiros nem tokens em storage.
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
            const message =
                caught instanceof Error ? caught.message : "Não foi possível submeter.";
            setError(message);
            notifyError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            className="sf-panel space-y-4"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
        >
            <h2 className="text-lg font-bold">Novo material</h2>
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <FormField
                helpText="Escolhe se vais guardar tópico, URL ou ficheiro."
                id="materialMode"
                label="Tipo"
            >
                <select
                    disabled={isSubmitting}
                    value={mode}
                    onChange={(event) => {
                        setMode(event.target.value as MaterialMode);
                        setFieldErrors({});
                        setBody("");
                        setFile(null);
                    }}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="FILE">PDF/DOCX</option>
                </select>
            </FormField>
            <FormField
                helpText="Usa um título curto para encontrares o material depois."
                id="materialTitle"
                label="Título"
                error={fieldErrors.title}
            >
                <input
                    disabled={isSubmitting}
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value);
                        clearFieldError("title");
                    }}
                />
            </FormField>
            {mode === "FILE" ? (
                <FormField
                    helpText="Aceita PDF ou DOCX para processamento pela API."
                    id="materialFile"
                    label="Ficheiro"
                    error={fieldErrors.fileName}
                >
                    <input
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        disabled={isSubmitting}
                        type="file"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            clearFieldError("fileName");
                        }}
                    />
                </FormField>
            ) : (
                <FormField
                    helpText={bodyHelpText}
                    id="materialBody"
                    label={bodyLabel}
                    error={fieldErrors.body}
                >
                    <textarea
                        disabled={isSubmitting}
                        rows={4}
                        value={body}
                        onChange={(event) => {
                            setBody(event.target.value);
                            clearFieldError("body");
                        }}
                    />
                </FormField>
            )}
            <button className="sf-button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "A submeter..." : "Submeter"}
            </button>
        </form>
    );
}
