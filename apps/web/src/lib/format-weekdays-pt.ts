/**
 * Formata dias de rotinas para apresentação em português de Portugal.
 *
 * Mantém os valores internos intactos e reconhece aliases em inglês para que
 * dados legacy não sejam expostos diretamente ao aluno.
 */

const weekdayLabelsPt: Record<string, string> = {
    segunda: "segunda-feira",
    "segunda-feira": "segunda-feira",
    "segunda feira": "segunda-feira",
    monday: "segunda-feira",
    terca: "terça-feira",
    "terca-feira": "terça-feira",
    "terca feira": "terça-feira",
    tuesday: "terça-feira",
    quarta: "quarta-feira",
    "quarta-feira": "quarta-feira",
    "quarta feira": "quarta-feira",
    wednesday: "quarta-feira",
    quinta: "quinta-feira",
    "quinta-feira": "quinta-feira",
    "quinta feira": "quinta-feira",
    thursday: "quinta-feira",
    sexta: "sexta-feira",
    "sexta-feira": "sexta-feira",
    "sexta feira": "sexta-feira",
    friday: "sexta-feira",
    sabado: "sábado",
    saturday: "sábado",
    domingo: "domingo",
    sunday: "domingo",
};

const weekdayListFormatter = new Intl.ListFormat("pt-PT", {
    style: "long",
    type: "conjunction",
});

/**
 * Converte dias canónicos ou legacy numa lista legível em PT-PT.
 *
 * @param weekdays Dias recebidos da API, pela ordem definida na rotina.
 * @returns Lista localizada, ou string vazia quando não existem dias válidos.
 */
export function formatStudyWeekdaysPt(weekdays: readonly string[]): string {
    const labels = weekdays
        .map((weekday) => weekday.trim())
        .filter(Boolean)
        .map((weekday) => weekdayLabelsPt[normalizeWeekday(weekday)] ?? weekday);
    const formatted = weekdayListFormatter.format(labels);

    return formatted
        ? `${formatted[0].toLocaleUpperCase("pt-PT")}${formatted.slice(1)}`
        : "";
}

/** Normaliza apenas para procurar um label; não altera o valor recebido. */
function normalizeWeekday(weekday: string): string {
    return weekday
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}
