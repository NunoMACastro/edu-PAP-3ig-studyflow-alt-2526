/**
 * Implementa um componente React reutilizavel para study.
 */
import { FormEvent, useEffect, useState } from "react";
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
        try {
            const saved = await onSubmit(values);
            if (saved && !area) {
                setValues({ name: "", description: "" });
            }
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="space-y-2">
                <label htmlFor={area ? "editAreaName" : "areaName"}>Nome</label>
                <input
                    id={area ? "editAreaName" : "areaName"}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            name: event.target.value,
                        }))
                    }
                    required
                    value={values.name}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor={area ? "editAreaDescription" : "areaDescription"}>
                    Descrição
                </label>
                <textarea
                    id={area ? "editAreaDescription" : "areaDescription"}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            description: event.target.value,
                        }))
                    }
                    rows={4}
                    value={values.description}
                />
            </div>
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
