/**
 * Procura material sensível em documentação/evidence sem reproduzir o valor
 * encontrado. O scanner imprime apenas paths e contagens sanitizadas.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDirectory, "../../../..");
const roots = [
    { path: resolve(workspaceRoot, "docs"), required: true },
    { path: resolve(workspaceRoot, "real_dev/docs"), required: true },
];
const ignoredDirectories = new Set(["node_modules", "dist", "storage", ".git"]);
const forbiddenBrowserArtifactRoots = [
    resolve(workspaceRoot, "real_dev/web/playwright-report"),
    resolve(workspaceRoot, "real_dev/web/test-results"),
];
const MAX_SCANNABLE_FILE_BYTES = 10 * 1024 * 1024;
const globalPatterns = [
    /\bsk-[A-Za-z0-9_-]{20,}\b/g,
    /\b(?:gh[opusr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g,
    /\bAKIA[A-Z0-9]{16}\b/g,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    /mongodb(?:\+srv)?:\/\/[^\s:/]+:[^\s@/]+@/gi,
    /\b(?:postgres(?:ql)?|redis|mysql):\/\/[^\s:/]+:[^\s@/]+@/gi,
    /\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*\b/gi,
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    /^(?:OPENAI_API_KEY|SESSION_SECRET|JWT_SECRET)\s*=\s*(?!\s*$|\s*(?:changeme|example|placeholder|REDACTED|<[^>]+>)\s*$).{8,}$/gim,
];
const evidenceOnlyPatterns = [
    /["'](?:password|api[_-]?key|access[_-]?token|refresh[_-]?token|session[_-]?secret|cookie)["']\s*:\s*["'][^"'\n]{8,}["']/gi,
    /\bSTUDYFLOW_[A-Z0-9_]*PASSWORD=(?!<redacted>|REDACTED|<secret>)[^\s|`]+/g,
];

const matchesByFile = new Map();
const scanFailures = [];
for (const artifactRoot of forbiddenBrowserArtifactRoots) {
    await rejectNonEmptyArtifactRoot(artifactRoot);
}
for (const root of roots) {
    await scanPath(root.path, root.required);
}

/** Browser traces/videos can contain cookies and bodies; evidence durable recusa-os. */
async function rejectNonEmptyArtifactRoot(path) {
    try {
        const entries = await readdir(path);
        if (entries.length > 0) {
            scanFailures.push(`${relative(workspaceRoot, path)} (artefactos browser)`);
        }
    } catch (error) {
        if (error?.code !== "ENOENT") {
            scanFailures.push(relative(workspaceRoot, path));
        }
    }
}

if (matchesByFile.size > 0 || scanFailures.length > 0) {
    for (const [path, count] of [...matchesByFile].sort()) {
        console.error(`[sensitive-evidence] ${path}: ${count} ocorrência(s)`);
    }
    for (const failure of scanFailures.sort()) {
        console.error(`[sensitive-evidence] não analisado: ${failure}`);
    }
    console.error(
        `[sensitive-evidence] FAIL: ${matchesByFile.size} ficheiro(s) com padrões; ${scanFailures.length} alvo(s) sem análise completa.`,
    );
    process.exitCode = 1;
} else {
    console.log("[sensitive-evidence] PASS: nenhum padrão sensível encontrado.");
}

/**
 * Percorre recursivamente um path e analisa apenas ficheiros textuais pequenos.
 *
 * @param path Path a inspecionar.
 */
async function scanPath(path, required = false) {
    let metadata;
    try {
        metadata = await stat(path);
    } catch {
        if (required) scanFailures.push(relative(workspaceRoot, path));
        return;
    }
    if (metadata.isDirectory()) {
        if (ignoredDirectories.has(path.split("/").at(-1))) return;
        for (const entry of await readdir(path)) {
            await scanPath(resolve(path, entry));
        }
        return;
    }
    if (!metadata.isFile()) return;
    if (!/\.(?:md|json|jsonl|txt|log|ya?ml)$/i.test(path)) return;
    if (metadata.size > MAX_SCANNABLE_FILE_BYTES) {
        scanFailures.push(relative(workspaceRoot, path));
        return;
    }

    const content = await readFile(path, "utf8");
    let count = 0;
    const relativePath = relative(workspaceRoot, path).split("\\").join("/");
    const patterns = isEvidenceOrHistorical(relativePath)
        ? [...globalPatterns, ...evidenceOnlyPatterns]
        : globalPatterns;
    for (const pattern of patterns) {
        pattern.lastIndex = 0;
        count += [...content.matchAll(pattern)].length;
    }
    if (count > 0) {
        matchesByFile.set(relative(workspaceRoot, path), count);
    }
}

/** Aplica padrões de passwords apenas a evidence/relatórios, não a exemplos pedagógicos. */
function isEvidenceOrHistorical(relativePath) {
    return relativePath.startsWith("docs/evidence/") ||
        /(?:^|\/)(?:AUDITORIA|IMPLEMENTACAO|CORRECAO|PLANO-EXECUCAO)[^/]*\.md$/i.test(relativePath) ||
        relativePath === "docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md";
}
