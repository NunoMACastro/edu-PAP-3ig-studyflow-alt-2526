/**
 * Lê e valida os inputs privados da turma real sem transportar identidades ou
 * conteúdos pedagógicos para o código da aplicação.
 */
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { parseDocumentBuffer } from "../../modules/material-index/document-parser.js";
import { validateMaterialUpload } from "../../modules/materials/validators/material-upload.validator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MARKDOWN_PART_CHARACTERS = 18_000;
const MAX_TITLE_CHARACTERS = 160;
const SUPPORTED_SUBJECT_CODES = ["LP-11", "LP-12", "SI-12"] as const;
const IGNORED_EXTENSIONS = new Set([".js", ".png", ".jpg", ".jpeg", ".gif", ".webp"]);

export type PrivateSeedSubjectCode = (typeof SUPPORTED_SUBJECT_CODES)[number];
export type PrivateSeedClassStatus = "ACTIVE" | "ARCHIVED";

export type PrivateSeedPerson = {
    name: string;
    email: string;
};

export type PrivateSeedStudent = PrivateSeedPerson & {
    technologies: string[];
};

export type PrivateSeedSubject = {
    name: string;
    code: PrivateSeedSubjectCode;
    description: string;
    folderPath: string;
    absoluteFolderPath: string;
};

export type PrivateSeedClass = {
    name: string;
    code: string;
    schoolYear: string;
    course: string;
    status: PrivateSeedClassStatus;
    subjects: PrivateSeedSubject[];
};

export type PrivateSeedData = {
    teacher: PrivateSeedPerson;
    cohort: { name: string; code: string; course: string };
    classes: PrivateSeedClass[];
    students: PrivateSeedStudent[];
};

export type PrivateSeedChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

export type PrivateSeedMaterial = {
    subjectCode: PrivateSeedSubjectCode;
    sourcePath: string;
    sourceRelativePath: string;
    title: string;
    type: "MARKDOWN" | "PDF";
    markdownSource?: string;
    textContent: string;
    chunks: PrivateSeedChunk[];
    originalName?: string;
    mimeType?: "application/pdf";
    buffer?: Buffer;
    sha256?: string;
};

export type PrivateSeedQuestion = {
    statement: string;
    topic: string;
    options: [string, string, string, string];
    correctOptionIndex: number;
};

export type PrivateSeedQuiz = {
    key: string;
    subjectCode: PrivateSeedSubjectCode;
    title: string;
    description: string;
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    sourcePaths: string[];
    questions: PrivateSeedQuestion[];
};

export type PrivateSeedPreflight = {
    inputRoot: string;
    data: PrivateSeedData;
    materials: PrivateSeedMaterial[];
    quizzes: PrivateSeedQuiz[];
    inputDigest: string;
    sourceMarkdownCount: number;
    sourcePdfCount: number;
};

/**
 * Executa todo o trabalho falível de leitura e parsing antes de a seed tocar
 * na base de dados ou no storage persistente.
 */
export async function preflightPrivateSeedInput(options: {
    inputRoot?: string;
    workspaceRoot?: string;
} = {}): Promise<PrivateSeedPreflight> {
    const inputRoot = resolve(options.inputRoot ?? resolve(process.cwd(), "../seed-input-private"));
    const workspaceRoot = await realpath(
        resolve(options.workspaceRoot ?? resolve(process.cwd(), "../..")),
    ).catch(() => {
        throw new Error("Diretório base da seed privada não encontrado.");
    });
    const canonicalInputRoot = await realpath(inputRoot).catch(() => {
        throw new Error(`Diretório privado da seed não encontrado: ${inputRoot}`);
    });
    const dadosPath = resolve(canonicalInputRoot, "dados.md");
    const quizzesPath = resolve(canonicalInputRoot, "quizzes.json");
    const [dadosSource, quizzesSource] = await Promise.all([
        readFile(dadosPath, "utf8"),
        readFile(quizzesPath, "utf8").catch(() => {
            throw new Error("Falta seed-input-private/quizzes.json.");
        }),
    ]);
    const data = parsePrivateSeedData(dadosSource, {
        inputRoot: canonicalInputRoot,
        workspaceRoot,
    });
    const materialInputs: PrivateSeedMaterial[] = [];
    const digestFiles = new Map<string, Buffer>();
    let sourceMarkdownCount = 0;
    let sourcePdfCount = 0;

    for (const schoolClass of data.classes) {
        for (const subject of schoolClass.subjects) {
            const files = await walkMaterialFiles(subject.absoluteFolderPath);
            for (const filePath of files) {
                const extension = extname(filePath).toLowerCase();
                if (basename(filePath) === ".DS_Store" || IGNORED_EXTENSIONS.has(extension)) {
                    continue;
                }
                if (extension !== ".md" && extension !== ".pdf") {
                    throw new Error(`Extensão não suportada na pasta de materiais: ${filePath}`);
                }
                const buffer = await readFile(filePath);
                const sourceRelativePath = relative(canonicalInputRoot, filePath).split(sep).join("/");
                digestFiles.set(sourceRelativePath, buffer);
                if (extension === ".md") {
                    sourceMarkdownCount += 1;
                    materialInputs.push(...prepareMarkdownMaterial({
                        subjectCode: subject.code,
                        subjectRoot: subject.absoluteFolderPath,
                        sourcePath: filePath,
                        sourceRelativePath,
                        source: buffer.toString("utf8"),
                    }));
                } else {
                    sourcePdfCount += 1;
                    materialInputs.push(await preparePdfMaterial({
                        subjectCode: subject.code,
                        subjectRoot: subject.absoluteFolderPath,
                        sourcePath: filePath,
                        sourceRelativePath,
                        buffer,
                    }));
                }
            }
        }
    }

    if (sourceMarkdownCount === 0 && sourcePdfCount === 0) {
        throw new Error("A seed privada não encontrou materiais Markdown ou PDF.");
    }
    disambiguateMaterialTitles(materialInputs);
    assertUniqueMaterialTitles(materialInputs);
    const quizzes = parsePrivateSeedQuizzes(quizzesSource, data, new Set(digestFiles.keys()));
    const digest = createHash("sha256")
        .update(dadosSource)
        .update("\0quizzes\0")
        .update(quizzesSource);
    for (const [path, bytes] of [...digestFiles.entries()].sort(([left], [right]) => left.localeCompare(right))) {
        digest.update(`\0${path}\0`).update(bytes);
    }

    return {
        inputRoot: canonicalInputRoot,
        data,
        materials: materialInputs,
        quizzes,
        inputDigest: digest.digest("hex"),
        sourceMarkdownCount,
        sourcePdfCount,
    };
}

/** Interpreta o contrato Markdown humano sem exigir uma segunda cópia de PII. */
export function parsePrivateSeedData(
    source: string,
    paths: { inputRoot: string; workspaceRoot: string },
): PrivateSeedData {
    const professor = section(source, "Professor", "Coorte");
    const cohort = section(source, "Coorte", "Turmas");
    const classesSection = section(source, "Turmas", "Alunos");
    const studentsSection = section(source, "Alunos");
    const teacher = {
        name: field(professor, "Nome", "Professor"),
        email: normalizedEmail(field(professor, "Email de demonstração", "Professor"), "Professor"),
    };
    const cohortData = {
        name: field(cohort, "Nome", "Coorte"),
        code: field(cohort, "Código", "Coorte"),
        course: field(cohort, "Curso", "Coorte"),
    };
    const classes = splitBlocks(classesSection, "Turma").map((block, classIndex) => {
        const header = block.split(/^### Disciplina\s+\d+\s*$/m, 1)[0];
        const subjects = splitBlocks(block, "Disciplina", 3).map((subjectBlock, subjectIndex) => {
            const context = `Turma ${classIndex + 1}, Disciplina ${subjectIndex + 1}`;
            const code = field(subjectBlock, "Código", context);
            if (!SUPPORTED_SUBJECT_CODES.includes(code as PrivateSeedSubjectCode)) {
                throw new Error(`${context}: código de disciplina não suportado: ${code}`);
            }
            const folderPath = field(subjectBlock, "Pasta correspondente", context);
            const absoluteFolderPath = resolve(paths.workspaceRoot, folderPath);
            assertContainedPath(paths.inputRoot, absoluteFolderPath, context);
            return {
                name: field(subjectBlock, "Nome", context),
                code: code as PrivateSeedSubjectCode,
                description: field(subjectBlock, "Descrição", context),
                folderPath,
                absoluteFolderPath,
            };
        });
        const status = field(header, "Estado", `Turma ${classIndex + 1}`);
        if (status !== "ACTIVE" && status !== "ARCHIVED") {
            throw new Error(`Turma ${classIndex + 1}: Estado deve ser ACTIVE ou ARCHIVED.`);
        }
        return {
            name: field(header, "Nome", `Turma ${classIndex + 1}`),
            code: field(header, "Código", `Turma ${classIndex + 1}`),
            schoolYear: field(header, "Ano letivo", `Turma ${classIndex + 1}`),
            course: field(header, "Curso", `Turma ${classIndex + 1}`),
            status,
            subjects,
        } satisfies PrivateSeedClass;
    });
    const students = splitBlocks(studentsSection, "Aluno").map((block, index) => {
        const context = `Aluno ${index + 1}`;
        return {
            name: field(block, "Nome", context),
            email: normalizedEmail(field(block, "Email de demonstração", context), context),
            technologies: field(block, "Tecnologias utilizadas", context)
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
        };
    });

    if (classes.length !== 2) throw new Error("A seed TIG exige exatamente duas turmas.");
    if (classes.flatMap(({ subjects }) => subjects).length !== 3) {
        throw new Error("A seed TIG exige exatamente três disciplinas.");
    }
    if (students.length !== 4) throw new Error("A seed TIG exige exatamente quatro alunos.");
    assertUnique("emails", [teacher.email, ...students.map(({ email }) => email)]);
    assertUnique("códigos de turma", classes.map(({ code }) => code));
    assertUnique("códigos de disciplina", classes.flatMap(({ subjects }) => subjects.map(({ code }) => code)));
    if (!classes.some(({ status }) => status === "ARCHIVED") || !classes.some(({ status }) => status === "ACTIVE")) {
        throw new Error("A seed TIG exige uma turma ACTIVE e uma ARCHIVED.");
    }
    return { teacher, cohort: cohortData, classes, students };
}

/** Remove construções incompatíveis com o renderer e o validator atuais. */
export function normalizeSeedMarkdown(source: string): string {
    return source
        .replace(/<a\s+id=(?:"[^"]+"|'[^']+')\s*><\/a>/gi, "")
        .replace(/^.*!\[([^\]]*)\]\(([^)]+)\).*$/gm, (line, alt: string, target: string) => {
            if (/header|footer|cabe[cç]alho|rodap[eé]|logo/i.test(`${alt} ${target}`)) return "";
            if (/^https?:\/\//i.test(target.trim())) {
                return `[Imagem de referência: ${alt || "imagem"}](${target.trim()})`;
            }
            return `> Imagem de referência omitida no seed local: ${alt || basename(target.trim())}.`;
        })
        .replace(/\[([^\]]+)\]\((?!https?:\/\/|mailto:|#)([^)]+\.md(?:#[^)]*)?)\)/gi, (_match, label: string) =>
            `**Referência relacionada:** ${label}`,
        )
        .replace(/[ \t]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/** Divide Markdown sem cortar fences; um fence individual excessivo é rejeitado. */
export function splitSeedMarkdown(
    source: string,
    maxCharacters = MAX_MARKDOWN_PART_CHARACTERS,
): string[] {
    if (source.length <= maxCharacters) return [source];
    const blocks: string[] = [];
    let block: string[] = [];
    let fence: string | null = null;
    const flush = () => {
        const value = block.join("\n").trim();
        if (value) blocks.push(value);
        block = [];
    };
    for (const line of source.split("\n")) {
        const marker = line.match(/^\s*(```+|~~~+)/)?.[1] ?? null;
        if (marker) {
            if (!fence) fence = marker[0];
            else if (marker[0] === fence) fence = null;
        }
        if (!fence && block.length > 0 && (/^#{1,3}\s+/.test(line) || line.trim() === "")) flush();
        block.push(line);
    }
    flush();
    if (fence) throw new Error("Markdown com code fence não fechado.");
    const parts: string[] = [];
    let current = "";
    for (const candidate of blocks) {
        if (candidate.length > maxCharacters) {
            throw new Error("Bloco Markdown individual excede 18 000 caracteres; divide-o no ficheiro de origem.");
        }
        const combined = current ? `${current}\n\n${candidate}` : candidate;
        if (combined.length <= maxCharacters) current = combined;
        else {
            parts.push(current);
            current = candidate;
        }
    }
    if (current) parts.push(current);
    return parts;
}

/** Cria chunks pequenos e determinísticos para o índice e as versões. */
export function buildSeedChunks(text: string, sourceLabel: string): PrivateSeedChunk[] {
    const chunks: string[] = [];
    let current = "";
    for (const paragraph of text.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean)) {
        const combined = current ? `${current}\n\n${paragraph}` : paragraph;
        if (combined.length <= 1_500) current = combined;
        else {
            if (current) chunks.push(current);
            if (paragraph.length <= 1_500) current = paragraph;
            else {
                for (let offset = 0; offset < paragraph.length; offset += 1_500) {
                    chunks.push(paragraph.slice(offset, offset + 1_500));
                }
                current = "";
            }
        }
    }
    if (current) chunks.push(current);
    return chunks.map((chunk, order) => ({
        order,
        text: chunk,
        sourceLabel,
        locator: `segmento ${order + 1}`,
    }));
}

function prepareMarkdownMaterial(input: {
    subjectCode: PrivateSeedSubjectCode;
    subjectRoot: string;
    sourcePath: string;
    sourceRelativePath: string;
    source: string;
}): PrivateSeedMaterial[] {
    const normalized = normalizeSeedMarkdown(input.source);
    if (!normalized) throw new Error(`Material Markdown vazio: ${input.sourcePath}`);
    const parts = splitSeedMarkdown(normalized);
    const moduleName = relative(input.subjectRoot, dirname(input.sourcePath)).split(sep)[0] || input.subjectCode;
    const firstHeading = normalized.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const baseTitle = basename(input.sourcePath).toLowerCase() === "readme.md"
        ? `Índice — ${moduleName}`
        : `[${moduleName}] ${firstHeading || basename(input.sourcePath, extname(input.sourcePath)).replace(/[_-]+/g, " ")}`;
    return parts.map((markdownSource, index) => {
        const suffix = parts.length > 1 ? ` (parte ${index + 1}/${parts.length})` : "";
        const title = truncateTitle(baseTitle, suffix);
        const textContent = markdownToText(markdownSource).slice(0, 20_000);
        return {
            subjectCode: input.subjectCode,
            sourcePath: input.sourcePath,
            sourceRelativePath: input.sourceRelativePath,
            title,
            type: "MARKDOWN",
            markdownSource,
            textContent,
            chunks: buildSeedChunks(textContent, title),
        };
    });
}

async function preparePdfMaterial(input: {
    subjectCode: PrivateSeedSubjectCode;
    subjectRoot: string;
    sourcePath: string;
    sourceRelativePath: string;
    buffer: Buffer;
}): Promise<PrivateSeedMaterial> {
    const file: Express.Multer.File = {
        fieldname: "file",
        originalname: basename(input.sourcePath),
        encoding: "7bit",
        mimetype: "application/pdf",
        size: input.buffer.byteLength,
        buffer: input.buffer,
        stream: Readable.from(input.buffer),
        destination: "",
        filename: basename(input.sourcePath),
        path: input.sourcePath,
    };
    validateMaterialUpload(file);
    const extracted = await parseDocumentBuffer("PDF", input.buffer);
    if (!extracted) throw new Error(`PDF sem texto extraível: ${input.sourcePath}`);
    const moduleName = relative(input.subjectRoot, dirname(input.sourcePath)).split(sep)[0] || input.subjectCode;
    const title = truncateTitle(`[${moduleName}] ${basename(input.sourcePath, ".pdf").replace(/[_-]+/g, " ")}`, "");
    return {
        subjectCode: input.subjectCode,
        sourcePath: input.sourcePath,
        sourceRelativePath: input.sourceRelativePath,
        title,
        type: "PDF",
        textContent: extracted.slice(0, 20_000),
        chunks: buildSeedChunks(extracted, title),
        originalName: basename(input.sourcePath),
        mimeType: "application/pdf",
        buffer: input.buffer,
        sha256: createHash("sha256").update(input.buffer).digest("hex"),
    };
}

export function parsePrivateSeedQuizzes(
    source: string,
    data: PrivateSeedData,
    materialPaths: Set<string>,
): PrivateSeedQuiz[] {
    let raw: unknown;
    try {
        raw = JSON.parse(source);
    } catch {
        throw new Error("quizzes.json não contém JSON válido.");
    }
    const candidates = (raw as { version?: unknown; officialTests?: unknown }) ?? {};
    if (candidates.version !== 1 || !Array.isArray(candidates.officialTests)) {
        throw new Error("quizzes.json deve ter version=1 e officialTests[].");
    }
    const subjectCodes = new Set(data.classes.flatMap(({ subjects }) => subjects.map(({ code }) => code)));
    const quizzes = candidates.officialTests.map((value, index) => validateQuiz(value, index, subjectCodes, materialPaths));
    if (quizzes.length !== 9) throw new Error("quizzes.json deve definir exatamente nove testes oficiais.");
    assertUnique("chaves de quiz", quizzes.map(({ key }) => key));
    for (const code of SUPPORTED_SUBJECT_CODES) {
        const subjectQuizzes = quizzes.filter(({ subjectCode }) => subjectCode === code);
        if (subjectQuizzes.length !== 3) throw new Error(`${code} deve ter exatamente três testes.`);
        const statuses = subjectQuizzes.map(({ status }) => status).sort().join(",");
        if (code === "LP-11" && statuses !== "CLOSED,CLOSED,CLOSED") {
            throw new Error("Os três testes LP-11 devem estar CLOSED.");
        }
        if (code !== "LP-11" && statuses !== "CLOSED,DRAFT,PUBLISHED") {
            throw new Error(`${code} deve ter um teste DRAFT, um PUBLISHED e um CLOSED.`);
        }
    }
    return quizzes;
}

function validateQuiz(
    value: unknown,
    index: number,
    subjectCodes: Set<PrivateSeedSubjectCode>,
    materialPaths: Set<string>,
): PrivateSeedQuiz {
    const item = value as Partial<PrivateSeedQuiz>;
    const context = `officialTests[${index}]`;
    if (!item || typeof item.key !== "string" || item.key.trim().length < 3) throw new Error(`${context}.key inválida.`);
    if (!subjectCodes.has(item.subjectCode as PrivateSeedSubjectCode)) throw new Error(`${context}.subjectCode inválido.`);
    if (typeof item.title !== "string" || !item.title.startsWith("Demonstração — ")) throw new Error(`${context}.title deve começar por “Demonstração — ”.`);
    if (typeof item.description !== "string" || item.description.length < 5) throw new Error(`${context}.description inválida.`);
    if (!item.status || !["DRAFT", "PUBLISHED", "CLOSED"].includes(item.status)) throw new Error(`${context}.status inválido.`);
    if (!Array.isArray(item.sourcePaths) || item.sourcePaths.length === 0) throw new Error(`${context}.sourcePaths vazio.`);
    for (const path of item.sourcePaths) {
        if (typeof path !== "string" || !materialPaths.has(path)) throw new Error(`${context}: fonte não encontrada: ${String(path)}`);
    }
    if (!Array.isArray(item.questions) || item.questions.length !== 5) throw new Error(`${context} deve ter cinco perguntas.`);
    const questions = item.questions.map((question, questionIndex) => {
        const candidate = question as Partial<PrivateSeedQuestion>;
        if (typeof candidate.statement !== "string" || candidate.statement.trim().length < 5) throw new Error(`${context}.questions[${questionIndex}].statement inválida.`);
        if (typeof candidate.topic !== "string" || candidate.topic.trim().length < 2) throw new Error(`${context}.questions[${questionIndex}].topic inválido.`);
        if (!Array.isArray(candidate.options) || candidate.options.length !== 4 || candidate.options.some((option) => typeof option !== "string" || option.trim().length === 0)) throw new Error(`${context}.questions[${questionIndex}].options inválidas.`);
        if (!Number.isInteger(candidate.correctOptionIndex) || Number(candidate.correctOptionIndex) < 0 || Number(candidate.correctOptionIndex) > 3) throw new Error(`${context}.questions[${questionIndex}].correctOptionIndex inválido.`);
        return candidate as PrivateSeedQuestion;
    });
    return { ...item, questions } as PrivateSeedQuiz;
}

async function walkMaterialFiles(root: string): Promise<string[]> {
    const rootStats = await lstat(root).catch(() => {
        throw new Error(`Pasta de disciplina inexistente: ${root}`);
    });
    if (rootStats.isSymbolicLink()) {
        throw new Error(`Symlink não permitido como pasta de disciplina: ${root}`);
    }
    const canonicalRoot = await realpath(root).catch(() => {
        throw new Error(`Pasta de disciplina inexistente: ${root}`);
    });
    const files: string[] = [];
    const visit = async (directory: string): Promise<void> => {
        const entries = await readdir(directory, { withFileTypes: true });
        for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, "pt-PT"))) {
            const path = resolve(directory, entry.name);
            const stats = await lstat(path);
            if (stats.isSymbolicLink()) throw new Error(`Symlink não permitido nos materiais: ${path}`);
            if (stats.isDirectory()) await visit(path);
            else if (stats.isFile()) files.push(path);
        }
    };
    await visit(canonicalRoot);
    return files;
}

function section(source: string, name: string, next?: string): string {
    const start = source.match(new RegExp(`^# ${escapeRegExp(name)}\\s*$`, "m"));
    if (!start?.index && start?.index !== 0) throw new Error(`Secção # ${name} em falta em dados.md.`);
    const contentStart = start.index + start[0].length;
    if (!next) return source.slice(contentStart);
    const end = source.slice(contentStart).match(new RegExp(`^# ${escapeRegExp(next)}\\s*$`, "m"));
    if (!end?.index && end?.index !== 0) throw new Error(`Secção # ${next} em falta em dados.md.`);
    return source.slice(contentStart, contentStart + end.index);
}

function splitBlocks(source: string, label: string, headingLevel = 2): string[] {
    const hashes = "#".repeat(headingLevel);
    const expression = new RegExp(`^${hashes} ${escapeRegExp(label)}\\s+\\d+\\s*$`, "gm");
    const matches = [...source.matchAll(expression)];
    return matches.map((match, index) => source.slice(
        Number(match.index) + match[0].length,
        matches[index + 1]?.index ?? source.length,
    ));
}

function field(source: string, label: string, context: string): string {
    const match = source.match(new RegExp(`^${escapeRegExp(label)}:\\s*(.+?)\\s*$`, "m"));
    const value = match?.[1]?.trim();
    if (!value) throw new Error(`${context}: campo “${label}” em falta ou vazio.`);
    return value;
}

function normalizedEmail(email: string, context: string): string {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) throw new Error(`${context}: email inválido.`);
    return normalized;
}

function assertContainedPath(root: string, candidate: string, context: string): void {
    const relativePath = relative(resolve(root), resolve(candidate));
    if (relativePath.startsWith("..") || relativePath === "" || relativePath.includes(`..${sep}`)) {
        throw new Error(`${context}: a pasta deve ficar dentro de seed-input-private.`);
    }
}

function assertUnique(label: string, values: string[]): void {
    const normalized = values.map((value) => value.trim().toLowerCase());
    if (new Set(normalized).size !== normalized.length) throw new Error(`Existem ${label} duplicados.`);
}

function assertUniqueMaterialTitles(materials: PrivateSeedMaterial[]): void {
    const keys = materials.map(({ subjectCode, title }) => `${subjectCode}:${title.toLowerCase()}`);
    if (new Set(keys).size !== keys.length) throw new Error("A normalização produziu títulos de material duplicados na mesma disciplina.");
}

/**
 * Desambigua apenas headings repetidos, mantendo o H1 e o módulo como título
 * principal. O nome relativo do ficheiro é acrescentado só quando necessário.
 */
function disambiguateMaterialTitles(materials: PrivateSeedMaterial[]): void {
    const groups = new Map<string, PrivateSeedMaterial[]>();
    for (const material of materials) {
        const key = `${material.subjectCode}:${material.title.toLowerCase()}`;
        groups.set(key, [...(groups.get(key) ?? []), material]);
    }
    for (const duplicates of groups.values()) {
        if (duplicates.length < 2) continue;
        for (const material of duplicates) {
            const partSuffix = material.title.match(/ \(parte \d+\/\d+\)$/)?.[0] ?? "";
            const titleWithoutPart = partSuffix ? material.title.slice(0, -partSuffix.length) : material.title;
            const sourceLabel = material.sourceRelativePath
                .replace(/^materiais\//, "")
                .replace(/\.(?:md|pdf)$/i, "")
                .replaceAll("/", " · ");
            material.title = truncateTitle(`${titleWithoutPart} — ${sourceLabel}`, partSuffix);
            material.chunks = material.chunks.map((chunk) => ({ ...chunk, sourceLabel: material.title }));
        }
    }
}

function truncateTitle(base: string, suffix: string): string {
    return `${base.slice(0, MAX_TITLE_CHARACTERS - suffix.length).trim()}${suffix}`;
}

function markdownToText(source: string): string {
    return source
        .replace(/^```[^\n]*$/gm, "")
        .replace(/^~~~[^\n]*$/gm, "")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_~`>]+/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
