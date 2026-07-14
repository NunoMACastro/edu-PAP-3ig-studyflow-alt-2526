/**
 * Exporta artefactos de estudo autorizados sem chamar novamente o provider IA.
 */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import {
    AiArtifact,
    AiArtifactDocument,
    AiArtifactType,
} from "./schemas/ai-artifact.schema.js";

const EXPORTABLE_ARTIFACT_TYPES = ["SUMMARY", "QUIZ"] as const;
const MAX_EXPORT_SOURCES = 5;
const MAX_SOURCE_EXCERPT_LENGTH = 180;

export type ArtifactExportFormat = "md" | "pdf";
export type ArtifactExportDisposition = "attachment" | "inline";
type ExportableArtifactType = (typeof EXPORTABLE_ARTIFACT_TYPES)[number];

export type ExportedArtifactFile = {
    fileName: string;
    contentType: string;
    disposition: ArtifactExportDisposition;
    body: string;
};

type ExportableSource = {
    title: string;
    page?: number;
    section?: string;
    excerpt?: string;
};

export type ExportableAiArtifact = {
    _id: string;
    type: ExportableArtifactType;
    contentJson: Record<string, unknown>;
    sourcesJson: ExportableSource[];
};

/**
 * Service responsável por exportar artefactos IA já autorizados.
 *
 * @remarks
 * Este service não chama providers IA. Exporta apenas dados já persistidos e
 * filtrados por sessão, área e owner.
 */
@Injectable()
export class ArtifactExportService {
    /**
     * Recebe dependências por injeção para manter a regra testável.
     *
     * @param artifactModel Modelo Mongoose de artefactos IA.
     * @param areasService Service que valida ownership da área de estudo.
     */
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        private readonly areasService: StudyAreasService,
    ) {}

    /**
     * Exporta um resumo ou quiz da área privada do aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área privada.
     * @param artifactId Identificador do artefacto IA.
     * @param formatInput Formato pedido pela query.
     * @returns Ficheiro textual pronto para resposta HTTP.
     */
    async exportArtifact(
        userId: string,
        studyAreaId: string,
        artifactId: string,
        formatInput: unknown,
    ): Promise<ExportedArtifactFile> {
        const format = validateArtifactExportFormat(formatInput);
        await this.areasService.getMyStudyArea(userId, studyAreaId);

        if (!Types.ObjectId.isValid(artifactId)) {
            throw this.artifactNotFound();
        }

        const artifact = await this.artifactModel.findOne({
            _id: new Types.ObjectId(artifactId),
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: { $in: [...EXPORTABLE_ARTIFACT_TYPES] },
        });

        if (!artifact) {
            throw this.artifactNotFound();
        }

        return this.buildExportedFile(artifact, format);
    }

    /**
     * Exporta um material privado do arquivo transversal usando apenas o owner
     * autenticado. A disponibilidade atual do destino não altera a cópia já
     * criada pelo aluno.
     */
    async exportArtifactForOwner(
        userId: string,
        artifactId: string,
        formatInput: unknown,
    ): Promise<ExportedArtifactFile> {
        const format = validateArtifactExportFormat(formatInput);
        if (!Types.ObjectId.isValid(artifactId)) {
            throw this.artifactNotFound();
        }
        const artifact = await this.artifactModel.findOne({
            _id: new Types.ObjectId(artifactId),
            userId: new Types.ObjectId(userId),
            type: { $in: [...EXPORTABLE_ARTIFACT_TYPES] },
        });
        if (!artifact) throw this.artifactNotFound();
        return this.buildExportedFile(artifact, format);
    }

    /** Constrói a resposta sem nova chamada IA nem interpolação de HTML bruto. */
    private buildExportedFile(
        artifact: AiArtifactDocument,
        format: ArtifactExportFormat,
    ): ExportedArtifactFile {
        const exportableArtifact = toExportableArtifact(artifact);
        const markdown = renderAiArtifactMarkdown(exportableArtifact);
        const fileBaseName = buildExportBaseFileName(exportableArtifact);

        if (format === "md") {
            return {
                fileName: `${fileBaseName}.md`,
                contentType: "text/markdown; charset=utf-8",
                disposition: "attachment",
                body: markdown,
            };
        }

        return {
            fileName: `${fileBaseName}.html`,
            contentType: "text/html; charset=utf-8",
            disposition: "inline",
            body: renderAiArtifactPrintHtml(markdown),
        };
    }

    /**
     * Cria erro público para artefacto ausente ou inacessível.
     *
     * @returns Exceção uniforme para 404.
     */
    private artifactNotFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_ARTIFACT_NOT_FOUND",
            message: "Artefacto IA não encontrado.",
        });
    }
}

/**
 * Valida a query `format`.
 *
 * @param format Valor recebido por query string.
 * @returns Formato suportado.
 */
export function validateArtifactExportFormat(
    format: unknown,
): ArtifactExportFormat {
    if (format === undefined || format === "md") return "md";
    if (format === "pdf") return "pdf";

    throw new BadRequestException({
        code: "INVALID_ARTIFACT_EXPORT_FORMAT",
        message: "Formato de exportação inválido.",
    });
}

/**
 * Constrói Markdown seguro para um artefacto de estudo autorizado.
 *
 * @param artifact Artefacto já filtrado por userId e studyAreaId.
 * @returns Documento Markdown pronto para download.
 */
export function renderAiArtifactMarkdown(artifact: ExportableAiArtifact): string {
    const title =
        artifact.type === "SUMMARY"
            ? getString(artifact.contentJson.title) ?? "Resumo StudyFlow"
            : getString(artifact.contentJson.title) ?? "Quiz StudyFlow";
    const lines = [`# ${cleanMarkdownText(title)}`, "", `Tipo: ${artifact.type}`, ""];

    if (artifact.type === "SUMMARY") {
        renderSummaryMarkdown(lines, artifact.contentJson);
    } else {
        renderQuizMarkdown(lines, artifact.contentJson);
    }

    renderSourcesMarkdown(lines, artifact.sourcesJson);
    return `${lines.join("\n")}\n`;
}

/**
 * Constrói HTML de impressão a partir do Markdown já minimizado.
 *
 * @param markdown Documento Markdown exportado.
 * @returns HTML pronto para o browser imprimir ou guardar como PDF.
 */
export function renderAiArtifactPrintHtml(markdown: string): string {
    return `<!doctype html>
<html lang="pt-PT">
<head>
    <meta charset="utf-8">
    <title>Exportação StudyFlow</title>
    <style>
        body { color: #0f172a; font-family: Inter, Arial, sans-serif; margin: 32px; }
        pre { font-family: inherit; line-height: 1.55; white-space: pre-wrap; }
        @media print { body { margin: 18mm; } }
    </style>
</head>
<body>
    <pre>${escapeHtml(markdown)}</pre>
</body>
</html>`;
}

/**
 * Constrói o header Content-Disposition sem aceitar nomes perigosos.
 *
 * @param file Ficheiro exportado.
 * @returns Valor seguro para o header HTTP.
 */
export function buildArtifactExportContentDisposition(
    file: ExportedArtifactFile,
): string {
    return `${file.disposition}; filename="${file.fileName.replace(/"/g, "")}"`;
}

/**
 * Normaliza um documento Mongoose para o contrato mínimo do exportador.
 *
 * @param artifact Documento persistido.
 * @returns Artefacto exportável.
 */
function toExportableArtifact(
    artifact: AiArtifactDocument,
): ExportableAiArtifact {
    const value = artifact.toObject();

    if (!isExportableArtifactType(value.type)) {
        throw new NotFoundException({
            code: "ARTIFACT_EXPORT_NOT_SUPPORTED",
            message: "Este artefacto não pode ser exportado neste BK.",
        });
    }

    return {
        _id: String(value._id),
        type: value.type,
        contentJson: value.contentJson,
        sourcesJson: normalizeSources(value.sourcesJson),
    };
}

/**
 * Confirma que o tipo pertence ao subconjunto exportável.
 *
 * @param type Tipo persistido no artefacto IA.
 * @returns `true` para `SUMMARY` e `QUIZ`.
 */
function isExportableArtifactType(
    type: AiArtifactType,
): type is ExportableArtifactType {
    return EXPORTABLE_ARTIFACT_TYPES.includes(type as ExportableArtifactType);
}

/**
 * Renderiza um resumo sem despejar JSON bruto.
 *
 * @param lines Valor de lines usado pela função para executar render summary markdown com dados explícitos.
 * @param content Valor de content usado pela função para executar render summary markdown com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
function renderSummaryMarkdown(
    lines: string[],
    content: Record<string, unknown>,
): void {
    lines.push("## Resumo", "");
    const bullets = Array.isArray(content.bullets)
        ? content.bullets.filter(isFilledString)
        : [];

    if (bullets.length === 0) {
        lines.push("- Sem pontos de resumo exportáveis.", "");
        return;
    }

    for (const bullet of bullets) {
        lines.push(`- ${cleanMarkdownText(bullet)}`);
    }
    lines.push("");
}

/**
 * Renderiza perguntas de quiz sem exportar respostas corretas por omissão.
 *
 * @param lines Valor de lines usado pela função para executar render quiz markdown com dados explícitos.
 * @param content Valor de content usado pela função para executar render quiz markdown com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
function renderQuizMarkdown(
    lines: string[],
    content: Record<string, unknown>,
): void {
    lines.push("## Quiz", "");
    const questions = Array.isArray(content.questions) ? content.questions : [];

    if (questions.length === 0) {
        lines.push("- Este quiz não tem perguntas exportáveis.", "");
        return;
    }

    questions.forEach((question, questionIndex) => {
        const record = isRecord(question) ? question : {};
        const statement =
            getString(record.question) ?? "Pergunta sem enunciado exportável.";
        const options = Array.isArray(record.options)
            ? record.options.filter(isFilledString).slice(0, 6)
            : [];

        lines.push(`### Pergunta ${questionIndex + 1}`, "");
        lines.push(cleanMarkdownText(statement), "");

        if (options.length > 0) {
            lines.push("Opções:");
            options.forEach((option, optionIndex) => {
                lines.push(`${optionIndex + 1}. ${cleanMarkdownText(option)}`);
            });
            lines.push("");
        }
    });
}

/**
 * Renderiza fontes autorizadas com limite de quantidade e excerto.
 *
 * @param lines Valor de lines usado pela função para executar render sources markdown com dados explícitos.
 * @param sources Valor de sources usado pela função para executar render sources markdown com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
function renderSourcesMarkdown(
    lines: string[],
    sources: ExportableSource[],
): void {
    lines.push("## Fontes autorizadas", "");

    if (sources.length === 0) {
        lines.push("- Sem fontes registadas no artefacto.", "");
        return;
    }

    for (const source of sources.slice(0, MAX_EXPORT_SOURCES)) {
        const location = [source.page ? `p. ${source.page}` : "", source.section]
            .filter(Boolean)
            .join(", ");
        const suffix = location ? ` (${location})` : "";
        const excerpt = source.excerpt ? ` - excerto: ${source.excerpt}` : "";
        lines.push(`- ${cleanMarkdownText(source.title)}${suffix}${excerpt}`);
    }
    lines.push("");
}

/**
 * Reduz fontes ao contrato exportável.
 *
 * @param sources Fontes persistidas no artefacto.
 * @returns Fontes sem texto privado completo.
 */
function normalizeSources(
    sources: Array<Record<string, unknown>> = [],
): ExportableSource[] {
    return sources.slice(0, MAX_EXPORT_SOURCES).map((source) => {
        const excerpt = clipText(getString(source.excerpt));

        return {
            title: getString(source.title) ?? "Fonte autorizada",
            ...(typeof source.page === "number" ? { page: source.page } : {}),
            ...(getString(source.section)
                ? { section: getString(source.section) }
                : {}),
            ...(excerpt ? { excerpt } : {}),
        };
    });
}

/**
 * Cria base de nome de ficheiro previsível.
 *
 * @param artifact Artefacto exportado.
 * @returns Nome sem extensão.
 */
function buildExportBaseFileName(artifact: ExportableAiArtifact): string {
    const typeName = artifact.type === "SUMMARY" ? "resumo" : "quiz";
    const idSuffix = sanitizeFilePart(artifact._id.slice(-8));
    return `studyflow-${typeName}-${idSuffix}`;
}

/**
 * Remove caracteres problemáticos de uma parte do nome de ficheiro.
 *
 * @param value Texto a normalizar.
 * @returns Texto seguro para ficheiro.
 */
function sanitizeFilePart(value: string): string {
    const safe = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return safe || "artefacto";
}

/**
 * Lê uma string preenchida.
 *
 * @param value Valor desconhecido.
 * @returns Texto limpo ou `undefined`.
 */
function getString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Confirma string preenchida para filtros de arrays.
 *
 * @param value Valor desconhecido.
 * @returns `true` se for string preenchida.
 */
function isFilledString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Confirma objeto JSON simples.
 *
 * @param value Valor desconhecido.
 * @returns `true` quando é objeto e não array.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Limpa quebras de linha para não deformar o Markdown exportado.
 *
 * @param value Texto original.
 * @returns Texto numa linha.
 */
function cleanMarkdownText(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

/**
 * Limita excertos para evidence e exportação.
 *
 * @param value Texto original.
 * @returns Excerto limitado ou `undefined`.
 */
function clipText(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const cleaned = cleanMarkdownText(value);
    if (cleaned.length <= MAX_SOURCE_EXCERPT_LENGTH) return cleaned;
    return `${cleaned.slice(0, MAX_SOURCE_EXCERPT_LENGTH - 1)}…`;
}

/**
 * Escapa texto antes de escrever HTML de impressão.
 *
 * @param value Texto Markdown.
 * @returns Texto seguro para HTML.
 */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
