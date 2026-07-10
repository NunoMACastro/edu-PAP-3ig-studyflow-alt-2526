/**
 * Valida budgets gzip do bundle sem depender de serviços externos.
 */
import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { basename } from "node:path";

const DIST_DIR = new URL("../dist/", import.meta.url);
const ASSETS_DIR = new URL("../dist/assets/", import.meta.url);
const ENTRY_GZIP_LIMIT_BYTES = 90 * 1024;
const ENTRY_AND_FIRST_ROUTE_LIMIT_BYTES = 160 * 1024;
const CHUNK_GZIP_LIMIT_BYTES = 25 * 1024;
const TOTAL_JS_GZIP_LIMIT_BYTES = 190 * 1024;
const PUBLIC_AUTH_ENTRY_LIMIT_BYTES = 90 * 1024;
const AUTH_LOGO_PATH = "studyflow-logo.svg";

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
const entrySource = await readFile(new URL(entry.name, ASSETS_DIR), "utf8");
if (!entrySource.includes(`/assets/${AUTH_LOGO_PATH}`)) {
    throw new Error("O entry público não referencia o logo leve esperado.");
}
const authLogoGzipBytes = gzipSync(
    await readFile(new URL(`assets/${AUTH_LOGO_PATH}`, DIST_DIR)),
).byteLength;
const publicAuthEntryBytes = entry.gzipBytes + authLogoGzipBytes;

const totalGzipBytes = sizes.reduce((total, asset) => total + asset.gzipBytes, 0);
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
if (totalGzipBytes > TOTAL_JS_GZIP_LIMIT_BYTES) {
    failures.push(
        `total JS: ${formatKb(totalGzipBytes)} > ${formatKb(TOTAL_JS_GZIP_LIMIT_BYTES)}`,
    );
}

console.log(
    `Bundle gzip: publicEntry=${formatKb(publicAuthEntryBytes)}, entry=${formatKb(entry.gzipBytes)}, entry+firstRoute=${formatKb(entryAndFirstRouteBytes)}, totalJS=${formatKb(totalGzipBytes)}, chunks=${sizes.length}.`,
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
