/**
 * Isola os geradores MF8 anteriores ao manifesto final.
 *
 * Estes comandos existem apenas para reproduzir evidence historica. Nunca podem
 * escrever nos tres documentos de topo de `docs/evidence/MF8`, que sao banners
 * duraveis de supersessao e apontam para o ledger atual.
 */
export const LEGACY_MF8_EVIDENCE_ROOT =
    "docs/evidence/MF8/historico/gerado";

export const LEGACY_MF8_OPT_IN =
    "STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE";

/** Exige uma confirmacao explicita antes de executar ou escrever evidence antiga. */
export function assertLegacyMf8EvidenceOptIn(
    environment: NodeJS.ProcessEnv = process.env,
): void {
    if (environment[LEGACY_MF8_OPT_IN] !== "true") {
        throw new Error(
            `${LEGACY_MF8_OPT_IN}=true e obrigatoria; a evidence MF8 e apenas historica e nao fecha a release atual.`,
        );
    }
}

/** Constroi um destino fixo dentro da arvore historica, sem aceitar path externo. */
export function legacyMf8EvidencePath(filename: string): string {
    if (!/^[A-Z0-9-]+\.md$/.test(filename)) {
        throw new Error("Nome de evidence MF8 historica invalido.");
    }
    return `${LEGACY_MF8_EVIDENCE_ROOT}/${filename}`;
}

/** Front matter comum que impede a reutilizacao como evidence de release. */
export function legacyMf8FrontMatter(): string[] {
    return [
        "```yaml",
        "scope: MF8_HISTORICO",
        "status: HISTORICAL_ONLY",
        "authoritative_for_release: false",
        "superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
        "```",
    ];
}
