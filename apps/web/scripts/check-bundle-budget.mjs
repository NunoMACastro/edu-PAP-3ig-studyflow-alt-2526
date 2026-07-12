/**
 * Valida budgets gzip do bundle sem depender de serviços externos.
 */
import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { basename } from "node:path";

const DIST_DIR = new URL("../dist/", import.meta.url);
const ASSETS_DIR = new URL("../dist/assets/", import.meta.url);
const MANIFEST_PATH = new URL("../dist/.vite/manifest.json", import.meta.url);
const ENTRY_GZIP_LIMIT_BYTES = 90 * 1024;
const ENTRY_AND_FIRST_ROUTE_LIMIT_BYTES = 160 * 1024;
const CHUNK_GZIP_LIMIT_BYTES = 25 * 1024;
const ROLE_JOURNEY_GZIP_LIMIT_BYTES = 190 * 1024;
const PUBLIC_AUTH_ENTRY_LIMIT_BYTES = 90 * 1024;
const AUTH_LOGO_PATH = "studyflow-logo.svg";
const ROLES = ["STUDENT", "TEACHER", "ADMIN"];

const html = await readFile(new URL("index.html", DIST_DIR), "utf8");
const entryMatch = html.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/);
if (!entryMatch) throw new Error("Não foi possível identificar o entry JS em dist/index.html.");

const assetNames = (await readdir(ASSETS_DIR)).filter((name) =>
    name.endsWith(".js"),
);
const sizes = await Promise.all(
    assetNames.map(async (name) => ({
        name,
        gzipBytes: gzipSync(await readFile(new URL(name, ASSETS_DIR))).byteLength,
    })),
);
const entry = sizes.find((asset) => asset.name === basename(entryMatch[1]));
if (!entry) throw new Error(`Entry ${entryMatch[1]} não existe em dist/assets.`);
const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const manifestEntry = Object.entries(manifest).find(
    ([, chunk]) => chunk.isEntry === true,
);
if (!manifestEntry) {
    throw new Error("Não foi possível identificar o entry JS no manifesto Vite.");
}
const entrySource = await readFile(new URL(entry.name, ASSETS_DIR), "utf8");
if (!entrySource.includes(`/assets/${AUTH_LOGO_PATH}`)) {
    throw new Error("O entry público não referencia o logo leve esperado.");
}
const authLogoGzipBytes = gzipSync(
    await readFile(new URL(`assets/${AUTH_LOGO_PATH}`, DIST_DIR)),
).byteLength;
const publicAuthEntryBytes = entry.gzipBytes + authLogoGzipBytes;

const totalGzipBytes = sizes.reduce((total, asset) => total + asset.gzipBytes, 0);
const roleJourneys = Object.fromEntries(
    ROLES.map((role) => [role, calculateRoleJourney(role)]),
);
const sharedApiClient = sizes.find((asset) => asset.name.startsWith("apiClient-"));
const firstRouteChunks = sizes.filter((asset) =>
    [
        "SoloStudyDashboard-",
        "TeacherDashboardPage-",
        "AdminGovernancePage-",
    ].some((prefix) => asset.name.startsWith(prefix)),
);
const largestFirstRoute = firstRouteChunks.toSorted(
    (left, right) => right.gzipBytes - left.gzipBytes,
)[0];
const entryAndFirstRouteBytes =
    entry.gzipBytes +
    (sharedApiClient?.gzipBytes ?? 0) +
    (largestFirstRoute?.gzipBytes ?? 0);
const oversizedChunks = sizes.filter(
    (asset) => asset.name !== entry.name && asset.gzipBytes > CHUNK_GZIP_LIMIT_BYTES,
);
const failures = [];
if (publicAuthEntryBytes > PUBLIC_AUTH_ENTRY_LIMIT_BYTES) {
    failures.push(
        `entrada pública + logo: ${formatKb(publicAuthEntryBytes)} > ${formatKb(PUBLIC_AUTH_ENTRY_LIMIT_BYTES)}`,
    );
}
if (entry.gzipBytes > ENTRY_GZIP_LIMIT_BYTES) {
    failures.push(
        `entry ${entry.name}: ${formatKb(entry.gzipBytes)} > ${formatKb(ENTRY_GZIP_LIMIT_BYTES)}`,
    );
}
if (entryAndFirstRouteBytes > ENTRY_AND_FIRST_ROUTE_LIMIT_BYTES) {
    failures.push(
        `entry + primeira rota: ${formatKb(entryAndFirstRouteBytes)} > ${formatKb(ENTRY_AND_FIRST_ROUTE_LIMIT_BYTES)}`,
    );
}
if (firstRouteChunks.length !== 3 || !sharedApiClient) {
    failures.push("não foi possível identificar todas as primeiras rotas e o cliente API");
}
for (const chunk of oversizedChunks) {
    failures.push(
        `chunk ${chunk.name}: ${formatKb(chunk.gzipBytes)} > ${formatKb(CHUNK_GZIP_LIMIT_BYTES)}`,
    );
}
for (const [role, journey] of Object.entries(roleJourneys)) {
    if (journey.gzipBytes > ROLE_JOURNEY_GZIP_LIMIT_BYTES) {
        failures.push(
            `percurso ${role}: ${formatKb(journey.gzipBytes)} > ${formatKb(ROLE_JOURNEY_GZIP_LIMIT_BYTES)}`,
        );
    }
}
const classifiedAssets = new Set(
    Object.values(roleJourneys).flatMap((journey) => journey.assets),
);
const unclassifiedAssets = sizes.filter(
    (asset) => !classifiedAssets.has(asset.name),
);
if (unclassifiedAssets.length > 0) {
    failures.push(
        `chunks sem papel alcançável no manifesto: ${unclassifiedAssets.map((asset) => asset.name).join(", ")}`,
    );
}

const roleJourneySummary = Object.entries(roleJourneys)
    .map(([role, journey]) => `${role}=${formatKb(journey.gzipBytes)}`)
    .join(", ");
console.log(
    `Bundle gzip: publicEntry=${formatKb(publicAuthEntryBytes)}, entry=${formatKb(entry.gzipBytes)}, entry+firstRoute=${formatKb(entryAndFirstRouteBytes)}, roleJourneys=[${roleJourneySummary}], totalCatalogueJS=${formatKb(totalGzipBytes)} (diagnóstico), chunks=${sizes.length}.`,
);
if (failures.length > 0) {
    throw new Error(`Bundle budget excedido:\n${failures.join("\n")}`);
}

/**
 * Formata bytes em KiB para output estável de CI.
 */
function formatKb(bytes) {
    return `${(bytes / 1024).toFixed(2)} KiB`;
}

/**
 * Soma uma única vez o entry, as páginas lazy permitidas ao papel e todos os
 * imports estáticos dessas páginas. Este é o pior percurso cumulativo que uma
 * sessão desse papel consegue descarregar.
 *
 * O total de todos os ficheiros em `dist/assets` fica apenas como diagnóstico:
 * inclui páginas lazy mutuamente exclusivas por papel e, por isso, cresce
 * legitimamente quando é acrescentada funcionalidade que nunca integra o mesmo
 * percurso de rede.
 */
function calculateRoleJourney(role) {
    const seeds = [manifestEntry[0]];
    for (const [key, chunk] of Object.entries(manifest)) {
        if (
            chunk.isDynamicEntry === true &&
            getAllowedRoles(chunk.src).includes(role)
        ) {
            seeds.push(key);
        }
    }

    const manifestKeys = new Set();
    const visit = (key) => {
        if (manifestKeys.has(key)) return;
        manifestKeys.add(key);
        for (const importedKey of manifest[key]?.imports ?? []) {
            visit(importedKey);
        }
    };
    for (const seed of seeds) visit(seed);

    const assets = [...manifestKeys]
        .map((key) => manifest[key]?.file)
        .filter((file) => typeof file === "string" && file.endsWith(".js"))
        .map((file) => basename(file));
    const uniqueAssets = [...new Set(assets)];
    return {
        assets: uniqueAssets,
        gzipBytes: uniqueAssets.reduce((total, name) => {
            const asset = sizes.find((candidate) => candidate.name === name);
            if (!asset) {
                throw new Error(`Chunk ${name} do manifesto não existe em dist/assets.`);
            }
            return total + asset.gzipBytes;
        }, 0),
    };
}

/**
 * Espelha a matriz de rotas protegidas sem depender dos hashes dos chunks.
 */
function getAllowedRoles(source) {
    if (typeof source !== "string") return [];
    if (source.endsWith("/student/PrivacyPage.tsx")) return ROLES;
    if (source.includes("/pages/student/")) return ["STUDENT"];
    if (source.includes("/pages/teacher/")) return ["TEACHER"];
    if (source.includes("/pages/admin/")) return ["ADMIN"];
    if (source.includes("/pages/shared/")) return ["STUDENT", "TEACHER"];
    return [];
}
