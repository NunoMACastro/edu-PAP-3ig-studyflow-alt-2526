// apps/api/src/scripts/validate-deploy-readiness.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Caminho por defeito do plano de rollback quando o comando corre a partir de apps/api.
 */
export const DEFAULT_ROLLBACK_DOCUMENT_PATH = "../../docs/ops/DEPLOY-ROLLBACK.md";

/**
 * Dados mínimos que o script precisa para decidir se uma release pode avançar.
 */
export type DeployReadinessInput = {
    version: string;
    rollbackDocumentPath?: string;
};

/**
 * Resultado estruturado usado como evidence curta do gate de deploy.
 */
export type DeployReadinessResult = {
    version: string;
    rollbackDocumentPath: string;
    rollbackDocumentExists: boolean;
    ready: boolean;
    checks: string[];
};

/**
 * Valida as condições operacionais mínimas antes de fazer deploy do StudyFlow.
 *
 * @param input - Versão da release e caminho opcional do documento de rollback.
 * @returns Informação estruturada de readiness para evidence de deploy.
 */
export function validateDeployReadiness(input: DeployReadinessInput): DeployReadinessResult {
    const version = input.version.trim();
    const rollbackDocumentPath = input.rollbackDocumentPath ?? DEFAULT_ROLLBACK_DOCUMENT_PATH;
    const absoluteRollbackPath = resolve(process.cwd(), rollbackDocumentPath);
    const rollbackDocumentExists = existsSync(absoluteRollbackPath);

    // A versão é obrigatória para a equipa saber exatamente que release foi publicada.
    const versionCheck = version.length > 0 ? "versão:definida" : "versão:em-falta";

    // O documento de rollback é obrigatório porque define como recuperar se o deploy falhar.
    const rollbackCheck = rollbackDocumentExists
        ? "rollback:documento-encontrado"
        : "rollback:documento-em-falta";

    return {
        version,
        rollbackDocumentPath,
        rollbackDocumentExists,
        ready: version.length > 0 && rollbackDocumentExists,
        checks: [versionCheck, rollbackCheck],
    };
}

/**
 * Bloqueia o processo de deploy quando falta uma condição obrigatória de readiness.
 *
 * @param input - Versão da release e caminho opcional do documento de rollback.
 * @returns Informação de readiness quando todas as validações passam.
 * @throws Error quando falta a versão da release ou o documento de rollback.
 */
export function assertDeployReadiness(input: DeployReadinessInput): DeployReadinessResult {
    const result = validateDeployReadiness(input);

    if (!result.ready) {
        throw new Error("Deploy bloqueado: define STUDYFLOW_RELEASE_VERSION e cria docs/ops/DEPLOY-ROLLBACK.md.");
    }

    return result;
}

const isDirectExecution =
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
    const result = assertDeployReadiness({
        version: process.env.STUDYFLOW_RELEASE_VERSION ?? "",
        rollbackDocumentPath: process.env.STUDYFLOW_ROLLBACK_DOC_PATH,
    });

    console.log(JSON.stringify(result, null, 2));
}