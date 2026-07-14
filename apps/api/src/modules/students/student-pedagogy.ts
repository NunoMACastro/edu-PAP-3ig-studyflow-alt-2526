/** Contexto pedagógico normalizado sem conservar idade nem dados livres do perfil. */
export type StudentEducationStage =
    | "PRIMARY"
    | "LOWER_SECONDARY"
    | "UPPER_SECONDARY"
    | "HIGHER_EDUCATION"
    | "UNKNOWN";

const GUIDANCE: Record<StudentEducationStage, string> = {
    PRIMARY:
        "Usa frases curtas, passos pequenos, exemplos concretos e vocabulário simples. Evita abstrações desnecessárias.",
    LOWER_SECONDARY:
        "Explica de forma clara e progressiva, define conceitos novos e usa exemplos escolares adequados ao ensino básico.",
    UPPER_SECONDARY:
        "Usa linguagem de ensino secundário, com mais detalhe, ligações entre conceitos e exemplos formais quando forem úteis.",
    HIGHER_EDUCATION:
        "Podes usar linguagem técnica, abstração e justificações mais formais, mantendo a resposta baseada nas fontes.",
    UNKNOWN:
        "Usa uma explicação clara, gradual e inclusiva, sem assumir idade ou nível escolar específico.",
};

/** Normaliza o valor legacy de `year` num estágio canónico. */
export function resolveStudentEducationStage(
    year?: string | null,
): StudentEducationStage {
    const normalized = String(year ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[ºª]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    if (!normalized) return "UNKNOWN";
    if (
        [
            "faculdade",
            "ensino superior",
            "universidade",
            "licenciatura",
            "mestrado",
            "doutoramento",
            "pos graduacao",
            "pos-graduacao",
        ].some((term) => normalized.includes(term))
    ) {
        return "HIGHER_EDUCATION";
    }
    const match = normalized.match(/\b(1[0-2]|[1-9])\s*(?:o|a)?(?:\s*ano)?\b/);
    if (!match) return "UNKNOWN";
    const value = Number.parseInt(match[1], 10);
    if (value <= 4) return "PRIMARY";
    if (value <= 9) return "LOWER_SECONDARY";
    return "UPPER_SECONDARY";
}

/** Devolve apenas orientação de escrita; o ano nunca entra no prompt. */
export function getStudentPedagogicalGuidance(year?: string | null): string {
    return GUIDANCE[resolveStudentEducationStage(year)];
}
