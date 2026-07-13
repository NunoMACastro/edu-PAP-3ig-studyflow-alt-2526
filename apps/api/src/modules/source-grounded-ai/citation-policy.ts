export type PublicCitation = {
    sourceJobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

const PUBLIC_EXCERPT_MAX_LENGTH = 420;

/**
 * Normaliza citacoes publicas para respostas de IA com fontes.
 *
 * @param citation Citacao candidata criada depois de validar a fonte.
 * @returns Citacao segura para persistencia e resposta publica.
 * @throws Error quando falta nome, localizacao ou excerto verificavel.
 */
export function normalizePublicCitation(citation: PublicCitation): PublicCitation {
    const sourceLabel = citation.sourceLabel.trim();
    const locator = citation.locator.trim();
    const excerpt = citation.excerpt.trim();

    if (!sourceLabel) {
        throw new Error("A citacao precisa de nome de fonte.");
    }

    if (!locator) {
        throw new Error("A citacao precisa de pagina, seccao ou chunk.");
    }

    if (!excerpt) {
        throw new Error("A citacao precisa de excerto verificavel.");
    }

    // O excerto prova a origem sem devolver o material completo ao frontend.
    return {
        ...citation,
        sourceLabel,
        locator,
        excerpt: excerpt.slice(0, PUBLIC_EXCERPT_MAX_LENGTH),
    };
}
