/**
 * Resolve o contexto pedagogico usado pela IA da sala sem expor idade exata.
 */

/**
 * Etapa pedagogica derivada do ano escolar preenchido pelo aluno.
 */
export type RoomAiEducationStage =
    | "PRIMARY"
    | "LOWER_SECONDARY"
    | "UPPER_SECONDARY"
    | "HIGHER_EDUCATION"
    | "UNKNOWN";

/**
 * Contexto seguro que pode entrar no prompt da IA da sala.
 */
export type RoomAiPedagogicalContext = {
    stage: RoomAiEducationStage;
    yearLabel: string | null;
    promptLabel: string;
    promptGuidance: string;
};

const HIGHER_EDUCATION_TERMS = [
    "faculdade",
    "ensino superior",
    "universidade",
    "licenciatura",
    "mestrado",
    "doutoramento",
    "pos graduacao",
    "pos-graduacao",
];

const GUIDANCE_BY_STAGE: Record<RoomAiEducationStage, string> = {
    PRIMARY:
        "Usa frases curtas, passos pequenos, exemplos concretos e vocabulario simples. Evita abstracoes desnecessarias.",
    LOWER_SECONDARY:
        "Explica de forma clara e progressiva, define conceitos novos e usa exemplos escolares adequados ao 2.º/3.º ciclo.",
    UPPER_SECONDARY:
        "Usa linguagem de ensino secundario, com mais detalhe, ligacoes entre conceitos e exemplos formais quando forem uteis.",
    HIGHER_EDUCATION:
        "Podes usar linguagem tecnica, abstracao e justificacoes mais formais, mantendo a resposta baseada nas fontes.",
    UNKNOWN:
        "Usa uma explicacao clara, gradual e inclusiva, sem assumir idade ou nivel escolar especifico.",
};

/**
 * Converte o campo livre `year` do perfil do aluno num contexto pedagogico seguro.
 *
 * @param year Ano escolar escrito pelo aluno no perfil.
 * @returns Contexto pedagogico normalizado para o prompt da IA da sala.
 */
export function resolveRoomAiPedagogicalContext(
    year?: string | null,
): RoomAiPedagogicalContext {
    const normalized = normalizeYear(year);
    if (!normalized) return buildContext("UNKNOWN", null);

    if (HIGHER_EDUCATION_TERMS.some((term) => normalized.includes(term))) {
        return buildContext("HIGHER_EDUCATION", "ensino superior");
    }

    const yearNumber = extractSchoolYear(normalized);
    if (!yearNumber) return buildContext("UNKNOWN", null);

    if (yearNumber >= 1 && yearNumber <= 4) {
        return buildContext("PRIMARY", formatSchoolYear(yearNumber));
    }
    if (yearNumber >= 5 && yearNumber <= 9) {
        return buildContext("LOWER_SECONDARY", formatSchoolYear(yearNumber));
    }
    if (yearNumber >= 10 && yearNumber <= 12) {
        return buildContext("UPPER_SECONDARY", formatSchoolYear(yearNumber));
    }

    return buildContext("UNKNOWN", null);
}

/**
 * Normaliza texto livre sem tentar inferir idade a partir de numeros soltos fora do intervalo escolar.
 *
 * @param year Valor do campo ano.
 * @returns Texto normalizado para matching.
 */
function normalizeYear(year?: string | null): string {
    return String(year ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[ºª]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Extrai anos escolares portugueses usuais, aceitando "4 ano", "4o ano" ou apenas "4".
 *
 * @param normalizedYear Texto normalizado.
 * @returns Ano entre 1 e 12 ou null quando nao ha ano escolar reconhecivel.
 */
function extractSchoolYear(normalizedYear: string): number | null {
    const match = normalizedYear.match(/\b(1[0-2]|[1-9])\s*(?:o|a)?(?:\s*ano)?\b/);
    if (!match) return null;

    return Number.parseInt(match[1], 10);
}

/**
 * Formata o ano escolar de forma consistente para documentacao interna do prompt.
 *
 * @param yearNumber Ano numerico entre 1 e 12.
 * @returns Label em portugues.
 */
function formatSchoolYear(yearNumber: number): string {
    return `${yearNumber}.º ano`;
}

/**
 * Cria o objeto final usado pelo prompt, mantendo labels e instrucoes num ponto unico.
 *
 * @param stage Etapa pedagogica resolvida.
 * @param yearLabel Ano escolar normalizado ou null.
 * @returns Contexto pedagogico pronto para prompt.
 */
function buildContext(
    stage: RoomAiEducationStage,
    yearLabel: string | null,
): RoomAiPedagogicalContext {
    return {
        stage,
        yearLabel,
        promptLabel: yearLabel
            ? `${yearLabel} (${stage})`
            : `ano escolar nao indicado ou nao reconhecido (${stage})`,
        promptGuidance: GUIDANCE_BY_STAGE[stage],
    };
}
