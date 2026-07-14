/**
 * Valida as condicoes minimas para publicar uma release StudyFlow.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Caminho por defeito do plano de rollback quando o comando corre a partir de `real_dev/api`.
 */
export const DEFAULT_ROLLBACK_DOCUMENT_PATH = "../docs/ops/DEPLOY-ROLLBACK.md";

/**
 * Dados minimos que o script precisa para decidir se uma release pode avancar.
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
 * Valida as condicoes operacionais minimas antes de fazer deploy do StudyFlow.
 *
 * @param input Versao da release e caminho opcional do documento de rollback.
 * @returns Informacao estruturada de readiness para evidence de deploy.
 */
export function validateDeployReadiness(
    input: DeployReadinessInput,
): DeployReadinessResult {
    const version = input.version.trim();
    const rollbackDocumentPath =
        input.rollbackDocumentPath?.trim() || DEFAULT_ROLLBACK_DOCUMENT_PATH;
    const absoluteRollbackPath = resolve(process.cwd(), rollbackDocumentPath);
    const rollbackDocumentExists = existsSync(absoluteRollbackPath);

    // A versao e obrigatoria para a equipa saber exatamente que release foi publicada.
    const versionCheck =
        version.length > 0 ? "versao:definida" : "versao:em-falta";

    // O documento de rollback e obrigatorio porque define como recuperar se o deploy falhar.
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
 * Bloqueia o processo de deploy quando falta uma condicao obrigatoria de readiness.
 *
 * @param input Versao da release e caminho opcional do documento de rollback.
 * @returns Informacao de readiness quando todas as validacoes passam.
 * @throws Error quando falta a versao da release ou o documento de rollback.
 */
export function assertDeployReadiness(
    input: DeployReadinessInput,
): DeployReadinessResult {
    const result = validateDeployReadiness(input);

    if (!result.ready) {
        throw new Error(
            "Deploy bloqueado: define STUDYFLOW_RELEASE_VERSION e cria real_dev/docs/ops/DEPLOY-ROLLBACK.md.",
        );
    }

    return result;
}

const executedScriptPath = process.argv[1] ?? "";
const isDirectExecution =
    executedScriptPath.endsWith("validate-deploy-readiness.js") ||
    executedScriptPath.endsWith("validate-deploy-readiness.ts");

if (isDirectExecution) {
    const result = assertDeployReadiness({
        version: process.env.STUDYFLOW_RELEASE_VERSION ?? "",
        rollbackDocumentPath: process.env.STUDYFLOW_ROLLBACK_DOC_PATH,
    });

    console.log(JSON.stringify(result, null, 2));
}
