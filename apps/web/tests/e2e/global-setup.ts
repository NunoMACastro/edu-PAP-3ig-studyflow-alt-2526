/**
 * Confirma a identidade dos dois serviços antes de executar qualquer cenário.
 */
import type { FullConfig } from "@playwright/test";

type StudyFlowHealth = {
    service?: string;
    version?: string;
};

/**
 * Falha cedo quando as portas pertencem a outra aplicação ou a um artefacto
 * que não expõe a assinatura StudyFlow esperada.
 *
 * @param config Configuração Playwright já normalizada.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
    const apiUrl = readMetadata(config, "studyflowApiUrl");
    const webUrl = readMetadata(config, "studyflowWebUrl");
    const runId = readMetadata(config, "runId");

    const apiResponse = await fetch(`${apiUrl}/api/health`);
    if (!apiResponse.ok) {
        throw new Error(`API StudyFlow indisponível: HTTP ${apiResponse.status}.`);
    }
    const health = (await apiResponse.json()) as StudyFlowHealth;
    if (health.service !== "studyflow-api") {
        throw new Error("A porta da API não pertence ao StudyFlow.");
    }
    if (health.version !== `e2e-${runId}`) {
        throw new Error("A API não pertence à execução E2E atual.");
    }

    const webResponse = await fetch(webUrl);
    if (!webResponse.ok) {
        throw new Error(`Web StudyFlow indisponível: HTTP ${webResponse.status}.`);
    }
    const html = await webResponse.text();
    if (!html.includes('data-app="studyflow"')) {
        throw new Error("A porta web não pertence ao StudyFlow.");
    }
}

/**
 * Obtém metadata obrigatória sem assumir valores externos.
 *
 * @param config Configuração Playwright.
 * @param key Chave esperada.
 * @returns Valor textual validado.
 */
function readMetadata(config: FullConfig, key: string): string {
    const value = config.metadata[key];
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Metadata Playwright em falta: ${key}.`);
    }
    return value;
}
