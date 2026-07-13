/**
 * Centraliza regras simples de validação frontend da MF5.
 */
export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export type RequiredField<TField extends string> = {
    name: TField;
    label: string;
    value: string;
};

/**
 * Cria mensagens de erro para campos obrigatórios vazios.
 *
 * @param fields Campos que devem ter valor antes da submissão.
 * @returns Mapa de mensagens por nome de campo.
 */
export function requireFields<TField extends string>(
    fields: Array<RequiredField<TField>>,
): FieldErrors<TField> {
    return fields.reduce<FieldErrors<TField>>((errors, field) => {
        if (field.value.trim().length === 0) {
            // A mensagem usa o label visível para orientar a correção no campo certo.
            errors[field.name] = `${field.label} é obrigatório.`;
        }

        return errors;
    }, {});
}

/**
 * Indica se ainda existe algum erro por campo.
 *
 * @param errors Mapa devolvido por `requireFields`.
 * @returns `true` quando pelo menos um campo falhou a validação.
 */
export function hasFieldErrors<TField extends string>(
    errors: FieldErrors<TField>,
): boolean {
    return Object.keys(errors).length > 0;
}
