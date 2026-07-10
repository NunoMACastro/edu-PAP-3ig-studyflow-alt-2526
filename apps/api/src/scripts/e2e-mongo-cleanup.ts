/**
 * Contrato mínimo do servidor Mongo efémero usado pelo runner E2E.
 * Mantém esta unidade testável sem arrancar processos ao importar o módulo.
 */
export type StoppableMongoServer = {
    stop(): Promise<unknown>;
};

/**
 * Para o Mongo efémero e tolera apenas o caso em que o processo já recebeu o
 * mesmo sinal do terminal. Qualquer outro erro continua a falhar o teardown.
 *
 * @param mongoServer Servidor efémero criado pelo runner E2E.
 * @returns `true` quando o processo foi parado aqui; `false` quando já estava parado.
 */
export async function stopE2eMongoSafely(
    mongoServer: StoppableMongoServer | undefined,
): Promise<boolean> {
    if (!mongoServer) return true;

    // mongodb-memory-server captura a falha do shutdown gracioso quando o
    // terminal já sinalizou o mongod, mas escreve a exceção crua em
    // console.warn antes de continuar o kill. Durante este teardown
    // single-thread filtramos apenas esse ECONNREFUSED esperado e restauramos
    // imediatamente o logger global; qualquer outro warning é preservado.
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
        if (args.length === 1 && hasErrorCode(args[0], "ECONNREFUSED")) {
            return;
        }
        originalWarn(...args);
    };

    try {
        await mongoServer.stop();
        return true;
    } catch (error: unknown) {
        if (hasErrorCode(error, "ECONNREFUSED")) {
            return false;
        }
        throw error;
    } finally {
        console.warn = originalWarn;
    }
}

/**
 * Percorre a cadeia `cause` sem depender das classes internas do driver Mongo.
 * O limite evita ciclos malformados e não usa a mensagem, que pode conter URI.
 */
function hasErrorCode(error: unknown, expectedCode: string): boolean {
    let current: unknown = error;
    const visited = new Set<object>();

    for (let depth = 0; depth < 8; depth += 1) {
        if (!current || typeof current !== "object" || visited.has(current)) {
            return false;
        }

        visited.add(current);
        const candidate = current as { code?: unknown; cause?: unknown };
        if (candidate.code === expectedCode) {
            return true;
        }
        current = candidate.cause;
    }

    return false;
}
