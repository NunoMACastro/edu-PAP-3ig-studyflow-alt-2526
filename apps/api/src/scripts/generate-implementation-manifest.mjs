/**
 * Calcula um identificador reproduzível da implementação ignorada por Git sem
 * incluir secrets, caches, builds, uploads ou resultados de testes.
 */
import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const implementationRoot = resolve(scriptDirectory, "../../..");
const excludedDirectoryPaths = new Set([
    ".git",
    "api/coverage",
    "api/dist",
    "api/node_modules",
    "api/storage",
    "web/coverage",
    "web/dist",
    "web/node_modules",
    "web/playwright-report",
    "web/storage",
    "web/test-results",
    "web/real_dev",
]);
const requiredImplementationPaths = [
    "api/src/common/storage/dedicated-local-directory.ts",
    "api/src/scripts/release-snapshot.ts",
    "api/package.json",
    "web/package.json",
];
const entries = [];

await collect(implementationRoot);
entries.sort((left, right) => left.path.localeCompare(right.path));
for (const requiredPath of requiredImplementationPaths) {
    if (!entries.some((entry) => entry.path === requiredPath)) {
        throw new Error(`Ficheiro operativo ausente do manifesto: ${requiredPath}`);
    }
}

const aggregate = createHash("sha256");
for (const entry of entries) {
    aggregate.update(entry.path);
    aggregate.update("\0");
    aggregate.update(entry.sha256);
    aggregate.update("\n");
}

console.log(
    JSON.stringify({
        algorithm: "sha256",
        files: entries.length,
        sha256: aggregate.digest("hex"),
    }),
);

/**
 * Recolhe paths e hashes de ficheiros operativos permitidos.
 *
 * @param path Path atual da travessia.
 */
async function collect(path) {
    const metadata = await lstat(path);
    if (metadata.isSymbolicLink()) {
        throw new Error(`Symlink não suportado no manifesto: ${relative(implementationRoot, path)}`);
    }
    if (metadata.isDirectory()) {
        const relativePath = relative(implementationRoot, path).split(sep).join("/");
        if (excludedDirectoryPaths.has(relativePath)) return;
        for (const name of await readdir(path)) {
            await collect(resolve(path, name));
        }
        return;
    }
    if (
        !metadata.isFile() ||
        isSensitiveOrGeneratedFile(relative(implementationRoot, path).split(sep).join("/")) ||
        path.endsWith(".log")
    ) return;

    const content = await readFile(path);
    entries.push({
        path: relative(implementationRoot, path).split(sep).join("/"),
        sha256: createHash("sha256").update(content).digest("hex"),
    });
}

/** Exclui credenciais por padrão, mantendo apenas exemplos deliberadamente públicos. */
function isSensitiveOrGeneratedFile(relativePath) {
    const name = relativePath.split("/").at(-1);
    if (name === ".DS_Store" || name === ".npmrc" || name === ".netrc") return true;
    if (name === ".env.example") return false;
    if (name === ".env" || name.startsWith(".env.")) return true;
    return /(?:^|[._-])(?:credentials?|secrets?)(?:[._-]|$)/i.test(name) ||
        /\.(?:key|pem|p12|pfx)$/i.test(name) ||
        /^id_(?:rsa|ed25519)(?:\.pub)?$/i.test(name);
}
