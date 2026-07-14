/** Testa apenas a barreira de segurança do reset; nunca apaga dados reais. */
import { join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { normaliseLocalResetOptions } from "./reset-local-data.js";

const valid = {
    allowReset: true,
    confirmation: "studyflow_test",
    mongoUri: "mongodb://127.0.0.1:27017/studyflow_test",
    redisUrl: "redis://127.0.0.1:6379/1",
    storageDir: join(tmpdir(), "studyflow-reset-spec"),
};

describe("normaliseLocalResetOptions", () => {
    it("aceita apenas alvos locais confirmados", () => {
        expect(normaliseLocalResetOptions(valid)).toMatchObject({
            databaseName: "studyflow_test",
        });
    });

    it("usa o mesmo storage predefinido do runtime", () => {
        expect(
            normaliseLocalResetOptions({ ...valid, storageDir: undefined })
                .storageDir,
        ).toBe(resolve(homedir(), ".studyflow", "studyflow-materials"));
    });

    it.each([
        [{ ...valid, allowReset: false }, "ALLOW_DATA_RESET"],
        [{ ...valid, confirmation: "outra" }, "RESET_CONFIRMATION"],
        [{ ...valid, mongoUri: "mongodb://db.example/studyflow_test" }, "loopback"],
        [
            {
                ...valid,
                mongoUri: "mongodb://127.0.0.1:27017/productionstudyflow",
                confirmation: "productionstudyflow",
            },
            "desenvolvimento/teste",
        ],
        [{ ...valid, redisUrl: "redis://cache.example:6379" }, "loopback"],
        [{ ...valid, redisUrl: "redis://127.0.0.1:6379/0" }, "base dedicada"],
        [{ ...valid, redisUrl: "redis://127.0.0.1:6379" }, "base dedicada"],
        [{ ...valid, storageDir: process.cwd() }, "fora do checkout"],
        [{ ...valid, storageDir: resolve(process.cwd(), "../../..") }, "fora do checkout"],
    ])("recusa opção insegura", (options, message) => {
        expect(() => normaliseLocalResetOptions(options)).toThrow(message);
    });
});
