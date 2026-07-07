/**
 * Define campos de formulário acessíveis e reutilizáveis.
 */
import { cloneElement, type ReactElement, type ReactNode } from "react";

type FormControlProps = {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
};

type FormFieldProps = {
    id: string;
    label: string;
    helpText?: string;
    error?: string;
    children: ReactElement<FormControlProps>;
};

/**
 * Envolve um controlo de formulário com label, ajuda e erro associados.
 *
 * @param props Identificador, textos visíveis e controlo React.
 * @returns Campo pronto para teclado e tecnologias de apoio.
 */
export function FormField({
    id,
    label,
    helpText,
    error,
    children,
}: FormFieldProps): ReactNode {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy =
        [children.props["aria-describedby"], helpId, errorId]
            .filter(Boolean)
            .join(" ") || undefined;

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
                <p className="text-xs leading-5 text-slate-600" id={helpId}>
                    {helpText}
                </p>
            ) : null}
            {error ? (
                <p className="text-xs font-medium text-red-700" id={errorId} role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
