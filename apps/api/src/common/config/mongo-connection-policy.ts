/**
 * Define a política única das ligações MongoDB aceites pela StudyFlow.
 */

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const STUDYFLOW_DATABASE_PATTERN = /^studyflow(?:[_-](?:dev|test|e2e))?$/i;

export type MongoConnectionPolicy = {
    kind: "local" | "atlas";
    uri: string;
};

/**
 * Valida uma URI MongoDB sem a incluir em mensagens de erro.
 *
 * O runtime aceita um replica set local sem credenciais ou MongoDB Atlas por
 * SRV, autenticado e sem desativar TLS. Outros destinos remotos continuam
 * recusados para não transformar uma variável de ambiente numa saída de rede
 * arbitrária.
 *
 * @param rawUri URI MongoDB recebida através do ambiente seguro do processo.
 * @returns URI original e tipo de ligação depois de validar o contrato.
 */
export function validateMongoConnectionUri(rawUri: string): MongoConnectionPolicy {
    let uri: URL;
    try {
        uri = new URL(rawUri);
    } catch {
        throw new Error("MONGODB_URI não contém uma URI MongoDB válida.");
    }

    if (uri.hash) {
        throw new Error("MONGODB_URI não pode conter um fragmento.");
    }

    const databaseName = uri.pathname.replace(/^\//, "");
    if (!STUDYFLOW_DATABASE_PATTERN.test(databaseName)) {
        throw new Error("MONGODB_URI tem de indicar uma base StudyFlow permitida.");
    }

    if (uri.protocol === "mongodb:") {
        return validateLocalMongoConnection(uri, rawUri);
    }
    if (uri.protocol === "mongodb+srv:") {
        return validateAtlasMongoConnection(uri, rawUri);
    }

    throw new Error(
        "MONGODB_URI deve usar MongoDB local ou MongoDB Atlas através de SRV.",
    );
}

/** Valida o replica set local usado em desenvolvimento e nos testes isolados. */
function validateLocalMongoConnection(uri: URL, rawUri: string): MongoConnectionPolicy {
    if (!LOOPBACK_HOSTS.has(uri.hostname.toLowerCase())) {
        throw new Error(
            "MONGODB_URI mongodb:// só pode apontar para o replica set local em loopback.",
        );
    }
    if (uri.username || uri.password) {
        throw new Error("MONGODB_URI local não pode incluir credenciais.");
    }
    if (uri.searchParams.get("replicaSet") !== "studyflow-rs") {
        throw new Error("MONGODB_URI local tem de configurar replicaSet=studyflow-rs.");
    }
    return { kind: "local", uri: rawUri };
}

/** Valida uma ligação Atlas autenticada sem permitir downgrade explícito de TLS. */
function validateAtlasMongoConnection(uri: URL, rawUri: string): MongoConnectionPolicy {
    const hostname = uri.hostname.toLowerCase();
    if (hostname === "mongodb.net" || !hostname.endsWith(".mongodb.net")) {
        throw new Error(
            "MONGODB_URI Atlas tem de apontar para um cluster oficial em *.mongodb.net.",
        );
    }
    if (!uri.username || !uri.password) {
        throw new Error("MONGODB_URI Atlas tem de incluir utilizador e password.");
    }

    const options = new Map(
        [...uri.searchParams.entries()].map(([key, value]) => [
            key.toLowerCase(),
            value.toLowerCase(),
        ]),
    );
    if (options.get("tls") === "false" || options.get("ssl") === "false") {
        throw new Error("MONGODB_URI Atlas não pode desativar TLS.");
    }
    if (options.get("directconnection") === "true") {
        throw new Error("MONGODB_URI Atlas não pode ativar directConnection.");
    }

    return { kind: "atlas", uri: rawUri };
}
