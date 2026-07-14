/**
 * Testa a política comum de ligações MongoDB locais e Atlas.
 */
import { validateMongoConnectionUri } from "./mongo-connection-policy.js";

describe("validateMongoConnectionUri", () => {
    it("aceita o replica set local endurecido", () => {
        const uri =
            "mongodb://127.0.0.1:27017/studyflow_test?replicaSet=studyflow-rs";

        expect(validateMongoConnectionUri(uri)).toEqual({ kind: "local", uri });
    });

    it("aceita MongoDB Atlas autenticado por SRV", () => {
        const uri =
            "mongodb+srv://pap-user:secret%40encoded@paps.example.mongodb.net/studyflow?retryWrites=true&w=majority&appName=StudyFlow";

        expect(validateMongoConnectionUri(uri)).toEqual({ kind: "atlas", uri });
    });

    it.each([
        ["mongodb://db.example.test:27017/studyflow?replicaSet=studyflow-rs", "loopback"],
        ["mongodb+srv://user:secret@db.example.test/studyflow", "mongodb.net"],
        ["mongodb+srv://paps.example.mongodb.net/studyflow", "utilizador e password"],
        [
            "mongodb+srv://user:secret@paps.example.mongodb.net/studyflow?tls=false",
            "TLS",
        ],
        [
            "mongodb+srv://user:secret@paps.example.mongodb.net/studyflow?directConnection=true",
            "directConnection",
        ],
        [
            "mongodb+srv://user:secret@paps.example.mongodb.net/production",
            "base StudyFlow",
        ],
    ])("recusa uma configuração MongoDB fora da política", (uri, message) => {
        expect(() => validateMongoConnectionUri(uri)).toThrow(message);
    });

    it("não inclui credenciais no erro de uma URI inválida", () => {
        const uri = "mongodb+srv://user:super-secret@";

        expect(() => validateMongoConnectionUri(uri)).toThrow(
            "MONGODB_URI não contém uma URI MongoDB válida.",
        );
        try {
            validateMongoConnectionUri(uri);
        } catch (error) {
            expect(String(error)).not.toContain("super-secret");
        }
    });
});
