// apps/web/src/components/forms/FormField.tsx
import { cloneElement, type ReactElement, type ReactNode } from "react";

type FormControlElement = ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
}>;

type FormFieldProps = {
    id: string;
    label: string;
    helpText?: string;
    error?: string;
    children: FormControlElement;
};

/**
 * Envolve um controlo de formulário com label, ajuda e erro acessíveis.
 *
 * @param props Identificador, textos visíveis e controlo React.
 * @returns Campo pronto a ser usado por teclado e tecnologias de apoio.
 */
export function FormField({ id, label, helpText, error, children }: FormFieldProps) {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-800" htmlFor={id}>
                {label}
            </label>
            {cloneElement(children, {
                id,
                "aria-describedby": describedBy,
                "aria-invalid": Boolean(error),
            })}
            {helpText ? (
                <p className="text-xs text-slate-600" id={helpId}>
                    {helpText}
                </p>
            ) : null}
            {error ? (
                <p className="text-xs font-medium text-red-700" id={errorId} role="alert">
                    {/* O erro fica junto ao campo para o utilizador saber onde corrigir. */}
                    {error}
                </p>
            ) : null}
        </div>
    );
}