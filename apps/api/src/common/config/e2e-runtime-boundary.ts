/**
 * Isola doubles e fixtures E2E do runtime local usado pela aplicação real.
 */

/** Marcador explícito exigido antes de aceitar qualquer double do processo E2E. */
export const STUDYFLOW_E2E_MODE_FLAG = "STUDYFLOW_E2E_MODE";

/** Flags que alteram dependências ou dados do runtime e nunca podem ativar-se implicitamente. */
export const STUDYFLOW_E2E_RUNTIME_DOUBLE_FLAGS = [
    "STUDYFLOW_E2E_FAKE_AI",
    "STUDYFLOW_E2E_IN_MEMORY_REDIS",
    "STUDYFLOW_E2E_SEED_AI_GOVERNANCE",
] as const;

export type StudyFlowE2eRuntimeDoubleFlag =
    (typeof STUDYFLOW_E2E_RUNTIME_DOUBLE_FLAGS)[number];

/**
 * Confirma que os doubles E2E só existem num processo de teste explicitamente
 * marcado. A mensagem inclui apenas nomes de variáveis, nunca os seus valores.
 *
 * @param environment Ambiente do processo a validar.
 * @throws Error quando um double está ativo fora da boundary E2E.
 */
export function assertE2eRuntimeDoublesAllowed(
    environment: NodeJS.ProcessEnv = process.env,
): void {
    const enabledFlags = STUDYFLOW_E2E_RUNTIME_DOUBLE_FLAGS.filter(
        (name) => environment[name] === "true",
    );
    if (enabledFlags.length === 0) return;

    if (
        environment[STUDYFLOW_E2E_MODE_FLAG] !== "true" ||
        environment.NODE_ENV !== "test"
    ) {
        throw new Error(
            `Doubles E2E requerem ${STUDYFLOW_E2E_MODE_FLAG}=true e NODE_ENV=test: ${enabledFlags.join(", ")}.`,
        );
    }
}

/**
 * Decide se um double específico está ativo depois de validar a boundary total.
 *
 * @param name Flag de runtime E2E conhecida.
 * @param environment Ambiente do processo a validar.
 * @returns `true` apenas quando o double foi explicitamente ativado em modo E2E.
 */
export function isE2eRuntimeDoubleEnabled(
    name: StudyFlowE2eRuntimeDoubleFlag,
    environment: NodeJS.ProcessEnv = process.env,
): boolean {
    assertE2eRuntimeDoublesAllowed(environment);
    return environment[name] === "true";
}

/**
 * Lista variáveis E2E efetivamente ativas para gates de release fail-closed.
 * Valores vazios, `false` e `0` representam flags desativadas.
 *
 * @param environment Ambiente candidato à release.
 * @returns Nomes ordenados das variáveis E2E ativas, sem expor os valores.
 */
export function listActiveE2eVariables(
    environment: NodeJS.ProcessEnv = process.env,
): string[] {
    return Object.entries(environment)
        .filter(([name, rawValue]) => {
            if (!name.startsWith("STUDYFLOW_E2E_")) return false;
            const value = rawValue?.trim().toLowerCase() ?? "";
            return value !== "" && value !== "false" && value !== "0";
        })
        .map(([name]) => name)
        .sort();
}
