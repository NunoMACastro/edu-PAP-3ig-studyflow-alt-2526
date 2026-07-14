/**
 * Implementa um componente React reutilizavel para materials.
 */
import { FormEvent, useRef, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import {
    type FieldErrors,
    type RequiredField,
    hasFieldErrors,
    requireFields,
} from "../../features/mf5/form-validation.js";
import {
    submitFileMaterial,
    submitTextMaterial,
    type StudyMaterial,
} from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { MarkdownEditor } from "../markdown/MarkdownEditor.js";

export type MaterialMode = "TOPIC" | "URL" | "MARKDOWN" | "FILE";
type MaterialField = "title" | "body" | "fileName";

/**
 * Props do componente React de materiais privados; mantêm explícitas as dependências vindas da página.
 */
type MaterialSubmitFormProps = {
    studyAreaId: string;
    onSubmitted: (material: StudyMaterial) => Promise<void>;
    onModeChange?: (mode: MaterialMode) => void;
    onSubmittingChange?: (isSubmitting: boolean) => void;
};

/**
 * Formulário de submissão de materiais.
 *
 * @param props Área alvo e callback de refresh.
 * @returns Controlos para tópico, URL e ficheiro.
 */
export function MaterialSubmitForm({ studyAreaId, onSubmitted, onModeChange, onSubmittingChange }: MaterialSubmitFormProps) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<MaterialField>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const submitAction = useAsyncAction();
    const isSubmitting = submitAction.isPending;
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } =
        useActionFeedback();
    const bodyLabel = mode === "URL" ? "URL do material" : mode === "MARKDOWN" ? "Fonte Markdown" : "Texto ou tópico";
    const bodyHelpText =
        mode === "URL"
            ? "Indica um endereço que o backend possa validar."
            : mode === "MARKDOWN"
              ? "Escreve GFM seguro. O documento fica imediatamente disponível para a IA desta área."
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
        clearFeedback();

        const nextErrors = validateFields();
        if (hasFieldErrors(nextErrors)) {
            // Sem dados mínimos, não chamamos a API nem mostramos um erro tardio genérico.
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        onSubmittingChange?.(true);
        notifyLoading(mode === "FILE" ? "A enviar ficheiro..." : "A guardar material...");
        const completed = await submitAction.run(
            "submit-material",
            async () => {
                let created: StudyMaterial;
                if (mode === "FILE") {
                    if (!file) throw new Error("Escolhe um ficheiro.");
                    // Multipart segue com cookies HttpOnly; nao guardamos ficheiros nem tokens em storage.
                    created = await submitFileMaterial(studyAreaId, file, title);
                } else {
                    created = await submitTextMaterial(studyAreaId, {
                        type: mode,
                        title,
                        url: mode === "URL" ? body : undefined,
                        topicText: mode === "TOPIC" ? body : undefined,
                        markdownSource: mode === "MARKDOWN" ? body : undefined,
                    });
                }
                setTitle("");
                setBody("");
                setFile(null);
                await onSubmitted(created);
                return true;
            },
            "Não foi possível submeter.",
        );
        onSubmittingChange?.(false);
        if (completed) {
            notifySuccess("Material submetido com sucesso.");
        } else {
            notifyError(submitAction.error ?? "Não foi possível submeter.");
        }
    }

    return (
        <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            ref={formRef}
        >
            {submitAction.error ? <p className="sf-error" role="alert">{submitAction.error}</p> : null}
            <FormField
                helpText="Escolhe se vais guardar tópico, URL ou ficheiro."
                id="materialMode"
                label="Tipo"
            >
                <select
                    disabled={isSubmitting}
                    value={mode}
                    onChange={(event) => {
                        const nextMode = event.target.value as MaterialMode;
                        setMode(nextMode);
                        onModeChange?.(nextMode);
                        setFieldErrors({});
                        setBody("");
                        setFile(null);
                    }}
                >
                    <option value="TOPIC">Tópico</option>
                    <option value="URL">URL</option>
                    <option value="MARKDOWN">Markdown no editor</option>
                    <option value="FILE">Upload PDF/DOCX/MD</option>
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
                    helpText="Aceita PDF, DOCX ou MD. Um MD fica editável após o upload."
                    id="materialFile"
                    label="Ficheiro"
                    error={fieldErrors.fileName}
                >
                    <input
                        accept=".pdf,.docx,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain"
                        disabled={isSubmitting}
                        type="file"
                        onChange={(event) => {
                            setFile(event.target.files?.[0] ?? null);
                            clearFieldError("fileName");
                        }}
                    />
                </FormField>
            ) : mode === "MARKDOWN" ? (
                <div>
                    <p className="mb-2 text-sm font-semibold">{bodyLabel}</p>
                    {fieldErrors.body ? <p className="sf-error mb-2" role="alert">{fieldErrors.body}</p> : null}
                    <MarkdownEditor
                        error={submitAction.error}
                        isDirty={body.length > 0}
                        isSaving={isSubmitting}
                        onChange={(next) => {
                            setBody(next);
                            clearFieldError("body");
                        }}
                        onSave={() => formRef.current?.requestSubmit()}
                        saveLabel="Criar Markdown"
                        value={body}
                    />
                </div>
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
            {mode !== "MARKDOWN" ? (
                <button className="sf-button-primary" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "A submeter..." : "Submeter"}
                </button>
            ) : null}
        </form>
    );
}
