// apps/api/src/modules/source-grounded-ai/citation-policy.ts
export type PublicCitation = {
    sourceJobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

const PUBLIC_EXCERPT_MAX_LENGTH = 420;

/**
 * Normaliza citações públicas para respostas de IA com fontes.
 *
 * @param citation Citação candidata criada depois de validar a fonte.
 * @returns Citação segura para persistência e resposta pública.
 */
export function normalizePublicCitation(citation: PublicCitation): PublicCitation {
    const sourceLabel = citation.sourceLabel.trim();
    const locator = citation.locator.trim();
    const excerpt = citation.excerpt.trim();

    if (!sourceLabel) {
        throw new Error("A citação precisa de nome de fonte.");
    }

    if (!locator) {
        throw new Error("A citação precisa de página, secção ou chunk.");
    }

    if (!excerpt) {
        throw new Error("A citação precisa de excerto verificável.");
    }

    // O excerto prova a origem sem devolver o material completo ao frontend.
    return {
        ...citation,
        sourceLabel,
        locator,
        excerpt: excerpt.slice(0, PUBLIC_EXCERPT_MAX_LENGTH),
    };
}