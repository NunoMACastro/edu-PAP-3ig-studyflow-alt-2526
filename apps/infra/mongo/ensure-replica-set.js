/**
 * Inicializa o replica set local do StudyFlow de forma idempotente e verifica
 * se o nó já aceita escritas. Este ficheiro é executado pelo `mongosh` no
 * health check do Docker Compose, não pelo runtime Node.js da API.
 */

const replicaSetName = "studyflow-rs";
const memberHost = "127.0.0.1:27017";
const replicaSetConfig = {
    _id: replicaSetName,
    members: [{ _id: 0, host: memberHost }],
};

/**
 * Determina se uma exceção MongoDB corresponde a um estado esperado durante
 * a inicialização, aceitando tanto o código numérico como o respetivo nome.
 */
function isMongoError(error, expectedCodes, expectedNames) {
    return (
        expectedCodes.includes(error?.code) ||
        expectedNames.includes(error?.codeName)
    );
}

let replicaSetAlreadyExists = false;

try {
    const status = rs.status();
    replicaSetAlreadyExists = true;

    if (status.set !== replicaSetName) {
        print(
            `Replica set inesperado: encontrado '${status.set}', esperado '${replicaSetName}'.`,
        );
        quit(1);
    }

    const existingConfig = rs.conf();
    const configuredHosts = existingConfig.members.map((member) => member.host);

    if (configuredHosts.length !== 1 || configuredHosts[0] !== memberHost) {
        print(
            `O replica set existente não usa exclusivamente '${memberHost}'. Não será reconfigurado automaticamente.`,
        );
        quit(1);
    }
} catch (error) {
    const isNotYetInitialized = isMongoError(
        error,
        [94],
        ["NotYetInitialized"],
    );

    if (!isNotYetInitialized) {
        print(`Não foi possível consultar o replica set: ${error.message}`);
        quit(1);
    }
}

if (!replicaSetAlreadyExists) {
    try {
        const result = rs.initiate(replicaSetConfig);

        if (result.ok !== 1) {
            print(
                `A inicialização do replica set falhou: ${JSON.stringify(result)}`,
            );
            quit(1);
        }
    } catch (error) {
        const wasInitializedConcurrently = isMongoError(
            error,
            [23],
            ["AlreadyInitialized"],
        );

        if (!wasInitializedConcurrently) {
            print(`A inicialização do replica set falhou: ${error.message}`);
            quit(1);
        }
    }
}

const hello = db.hello();
const isReady =
    hello.setName === replicaSetName && hello.isWritablePrimary === true;

if (!isReady) {
    print(
        `O replica set '${replicaSetName}' ainda não tem um primary gravável.`,
    );
    quit(1);
}

quit(0);
