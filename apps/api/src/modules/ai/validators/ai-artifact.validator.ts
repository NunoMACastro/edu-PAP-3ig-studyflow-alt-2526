/**
 * Centraliza validações reutilizáveis de ai.
 */
import { BadGatewayException } from "@nestjs/common";
import { StudyToolType } from "../dto/create-study-tool.dto.js";
import { SummaryResult } from "../providers/ai-provider.js";
import { validateQuizArtifact } from "./quiz.validator.js";

/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type JsonRecord = Record<string, unknown>;

/**
 * Valida um resumo devolvido pelo provider antes de o persistir.
 *
 * @param content Conteúdo JSON devolvido pela IA.
 * @param allowedSourceIds Materiais processáveis usados no prompt.
 * @returns Nada quando o resumo cumpre o contrato.
 */
export function validateSummaryArtifact(
    content: SummaryResult,
    allowedSourceIds: string[],
    allowEmptySources = false,
): void {
    const record = requireRecord(content, "INVALID_SUMMARY_FORMAT");
    requireNonEmptyString(record.title, "SUMMARY_TITLE_REQUIRED");
    requireNonEmptyStringArray(record.bullets, "SUMMARY_BULLETS_REQUIRED");
    requireValidSourceIds(
        record.sourceMaterialIds,
        allowedSourceIds,
        "SUMMARY_SOURCE_REQUIRED",
        "SUMMARY_UNKNOWN_SOURCE",
        allowEmptySources,
    );
}

/**
 * Valida ferramentas de estudo devolvidas pela IA.
 *
 * @param type Tipo pedido pelo aluno.
 * @param content Conteúdo JSON devolvido pela IA.
 * @param allowedSourceIds Materiais processáveis usados no prompt.
 * @returns Nada quando a ferramenta cumpre o contrato.
 */
export function validateStudyToolArtifact(
    type: StudyToolType,
    content: JsonRecord,
    allowedSourceIds: string[],
    allowEmptySources = false,
): void {
    if (type === "EXPLANATION") {
        validateExplanation(content, allowedSourceIds, allowEmptySources);
        return;
    }

    if (type === "FLASHCARDS") {
        validateFlashcards(content, allowedSourceIds, allowEmptySources);
        return;
    }

    validateQuizArtifact(content, allowedSourceIds, allowEmptySources);
}

/**
 * Valida uma explicação estruturada por secções.
 *
 * @param content Conteúdo JSON devolvido pela IA.
 * @param allowedSourceIds Materiais processáveis usados no prompt.
 * @returns Nada quando o contrato é válido.
 */
function validateExplanation(
    content: JsonRecord,
    allowedSourceIds: string[],
    allowEmptySources: boolean,
): void {
    const record = requireRecord(content, "INVALID_EXPLANATION_FORMAT");
    requireNonEmptyString(record.title, "EXPLANATION_TITLE_REQUIRED");

    if (!Array.isArray(record.sections) || record.sections.length === 0) {
        rejectInvalidArtifact("EXPLANATION_SECTIONS_REQUIRED");
    }

    for (const section of record.sections) {
        const sectionRecord = requireRecord(
            section,
            "INVALID_EXPLANATION_SECTION",
        );
        requireNonEmptyString(
            sectionRecord.heading,
            "EXPLANATION_HEADING_REQUIRED",
        );
        requireNonEmptyString(sectionRecord.body, "EXPLANATION_BODY_REQUIRED");
        requireValidSourceIds(
            sectionRecord.sourceMaterialIds,
            allowedSourceIds,
            "EXPLANATION_SOURCE_REQUIRED",
            "EXPLANATION_UNKNOWN_SOURCE",
            allowEmptySources,
        );
    }
}

/**
 * Valida flashcards gerados pela IA.
 *
 * @param content Conteúdo JSON devolvido pela IA.
 * @param allowedSourceIds Materiais processáveis usados no prompt.
 * @returns Nada quando o contrato é válido.
 */
function validateFlashcards(
    content: JsonRecord,
    allowedSourceIds: string[],
    allowEmptySources: boolean,
): void {
    const record = requireRecord(content, "INVALID_FLASHCARDS_FORMAT");

    if (!Array.isArray(record.cards) || record.cards.length === 0) {
        rejectInvalidArtifact("FLASHCARDS_REQUIRED");
    }

    for (const card of record.cards) {
        const cardRecord = requireRecord(card, "INVALID_FLASHCARD");
        requireNonEmptyString(cardRecord.front, "FLASHCARD_FRONT_REQUIRED");
        requireNonEmptyString(cardRecord.back, "FLASHCARD_BACK_REQUIRED");
        requireValidSourceIds(
            cardRecord.sourceMaterialIds,
            allowedSourceIds,
            "FLASHCARD_SOURCE_REQUIRED",
            "FLASHCARD_UNKNOWN_SOURCE",
            allowEmptySources,
        );
    }
}

/**
 * Garante que o valor é um objeto JSON.
 *
 * @param value Valor a validar.
 * @param code Código de erro técnico.
 * @returns Registo JSON.
 */
function requireRecord(value: unknown, code: string): JsonRecord {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        rejectInvalidArtifact(code);
    }
    return value as JsonRecord;
}

/**
 * Garante que um campo textual vem preenchido.
 *
 * @param value Valor a validar.
 * @param code Código de erro técnico.
 * @returns Nada quando o valor é válido.
 */
function requireNonEmptyString(value: unknown, code: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
        rejectInvalidArtifact(code);
    }
}

/**
 * Garante que um array contém apenas strings preenchidas.
 *
 * @param value Valor a validar.
 * @param code Código de erro técnico.
 * @returns Nada quando o array é válido.
 */
function requireNonEmptyStringArray(value: unknown, code: string): void {
    if (
        !Array.isArray(value) ||
        value.length === 0 ||
        !value.every((item) => typeof item === "string" && item.trim())
    ) {
        rejectInvalidArtifact(code);
    }
}

/**
 * Valida que as fontes existem e pertencem ao conjunto usado no prompt.
 *
 * @param value Lista de identificadores devolvida pela IA.
 * @param allowedSourceIds Identificadores permitidos.
 * @param missingCode Código para fonte em falta.
 * @param unknownCode Código para fonte desconhecida.
 * @returns Nada quando as fontes são válidas.
 */
function requireValidSourceIds(
    value: unknown,
    allowedSourceIds: string[],
    missingCode: string,
    unknownCode: string,
    allowEmptySources: boolean,
): void {
    if (allowEmptySources && Array.isArray(value) && value.length === 0) return;
    if (
        !Array.isArray(value) ||
        value.length === 0 ||
        !value.every((item) => typeof item === "string" && item.trim())
    ) {
        rejectInvalidArtifact(missingCode);
    }

    const allowed = new Set(allowedSourceIds);
    if (!value.every((item) => allowed.has(item))) {
        rejectInvalidArtifact(unknownCode);
    }
}

/**
 * Lança erro padronizado para outputs IA inválidos.
 *
 * @param code Código técnico do contrato quebrado.
 * @returns Nunca retorna; lança exceção.
 */
function rejectInvalidArtifact(code: string): never {
    throw new BadGatewayException({
        code,
        message: "A IA devolveu conteúdo com formato inválido. Tenta novamente.",
    });
}
