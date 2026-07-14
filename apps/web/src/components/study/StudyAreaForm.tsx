/**
 * Implementa um componente React reutilizavel para study.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { StudyArea } from "../../lib/apiClient.js";

/**
 * Contrato de rotinas e objetivos de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type StudyAreaFormValues = {
    name: string;
    description: string;
};

/**
 * Props do componente React de rotinas e objetivos de estudo; mantêm explícitas as dependências vindas da página.
 */
type StudyAreaFormProps = {
    area?: StudyArea;
    error?: string | null;
    formId?: string;
    onSavingChange?: (saving: boolean) => void;
    submitLabel: string;
    onCancel?: () => void;
    onSubmit: (values: StudyAreaFormValues) => Promise<boolean>;
};

/**
 * Formulário partilhado para criar e editar áreas de estudo.
 *
 * @param props Área opcional e callbacks de gravação.
 * @returns Formulário controlado de área.
 */
export function StudyAreaForm({
    area,
    error,
    formId,
    onSavingChange,
    submitLabel,
    onCancel,
    onSubmit,
}: StudyAreaFormProps) {
    const [values, setValues] = useState<StudyAreaFormValues>({
        name: area?.name ?? "",
        description: area?.description ?? "",
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setValues({
            name: area?.name ?? "",
            description: area?.description ?? "",
        });
    }, [area]);

    /**
     * Submete os valores atuais.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois da gravação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setIsSaving(true);
        onSavingChange?.(true);
        try {
            const saved = await onSubmit(values);
            if (saved && !area) {
                setValues({ name: "", description: "" });
            }
        } finally {
            setIsSaving(false);
            onSavingChange?.(false);
        }
    }

    return (
        <form className="space-y-4" id={formId} onSubmit={(event) => void handleSubmit(event)}>
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <FormField id={area ? "editAreaName" : "areaName"} label="Nome">
                <input
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            name: event.target.value,
                        }))
                    }
                    required
                    value={values.name}
                />
            </FormField>
            <FormField id={area ? "editAreaDescription" : "areaDescription"} label="Descrição">
                <textarea
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            description: event.target.value,
                        }))
                    }
                    rows={4}
                    value={values.description}
                />
            </FormField>
            <div className="flex flex-wrap gap-2">
                <button className="sf-button-primary" disabled={isSaving} type="submit">
                    {isSaving ? "A guardar..." : submitLabel}
                </button>
                {onCancel ? (
                    <button
                        className="sf-button-secondary"
                        disabled={isSaving}
                        onClick={onCancel}
                        type="button"
                    >
                        Cancelar
                    </button>
                ) : null}
            </div>
        </form>
    );
}
