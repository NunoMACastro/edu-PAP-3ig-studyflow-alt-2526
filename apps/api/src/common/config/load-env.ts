/**
 * Carrega configuração local de runtime de forma controlada.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ENV_FILE_PATH = fileURLToPath(new URL("../../../.env", import.meta.url));

/**
 * Carrega variáveis locais do `.env` do pacote API atual.
 *
 * O loader é intencionalmente pequeno para evitar uma dependência nova. Valores
 * já definidos no ambiente do processo têm prioridade sobre o ficheiro.
 */
function loadEnvFile(): void {
    if (!existsSync(ENV_FILE_PATH)) return;

    const content = readFileSync(ENV_FILE_PATH, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const separatorIndex = line.indexOf("=");
        if (separatorIndex <= 0) continue;

        const key = line.slice(0, separatorIndex).trim();
        const value = parseEnvValue(line.slice(separatorIndex + 1).trim());
        if (!key || process.env[key] !== undefined) continue;

        process.env[key] = value;
    }
}

/**
 * Normaliza valores `.env` com ou sem aspas.
 *
 * @param value Valor textual lido do ficheiro.
 * @returns Valor pronto para `process.env`.
 */
function parseEnvValue(value: string): string {
    if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1).replace(/\\n/g, "\n");
    }
    return value;
}

loadEnvFile();
