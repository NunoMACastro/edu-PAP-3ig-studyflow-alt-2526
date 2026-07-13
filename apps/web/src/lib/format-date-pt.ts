/**
 * Centraliza a formatação de datas visíveis em português de Portugal para a UI.
 */
const PT_DATE_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Lisbon",
});

/**
 * Formata uma data técnica para apresentação curta em português de Portugal.
 *
 * @param value Data ISO, `Date` ou valor vazio vindo de um contrato já autorizado.
 * @returns Data em `dd/mm/aaaa`, `Data indisponível` ou `Data inválida`.
 */
export function formatDatePt(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "Data indisponível";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Data inválida";
    }

    // A API continua a transportar ISO; esta função só altera a apresentação visível.
    // Centralizar o formatter impede pequenas diferenças entre páginas da mesma app.
    return PT_DATE_FORMATTER.format(date);
}
