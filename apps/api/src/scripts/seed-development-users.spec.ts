import { assertDevelopmentSeedTarget } from "./seed-development-users.js";

describe("guardas da seed de demonstração", () => {
    const originalReplace = process.env.STUDYFLOW_REPLACE_EXISTING_DATA;
    const originalConfirmation = process.env.STUDYFLOW_RESET_CONFIRMATION;

    afterEach(() => {
        restore("STUDYFLOW_REPLACE_EXISTING_DATA", originalReplace);
        restore("STUDYFLOW_RESET_CONFIRMATION", originalConfirmation);
    });

    it("aceita replica set local sem substituição", () => {
        expect(
            assertDevelopmentSeedTarget(
                "mongodb://127.0.0.1:27017/studyflow_dev?replicaSet=studyflow-rs",
            ),
        ).toEqual({ databaseName: "studyflow_dev", replaceExistingData: false });
    });

    it("recusa Atlas sem modo destrutivo explícito", () => {
        delete process.env.STUDYFLOW_REPLACE_EXISTING_DATA;
        expect(() =>
            assertDevelopmentSeedTarget(
                "mongodb+srv://user:secret@example.mongodb.net/studyflow",
            ),
        ).toThrow("STUDYFLOW_REPLACE_EXISTING_DATA=true");
    });

    it("aceita Atlas apenas com confirmação exata", () => {
        process.env.STUDYFLOW_REPLACE_EXISTING_DATA = "true";
        process.env.STUDYFLOW_RESET_CONFIRMATION = "studyflow";
        expect(
            assertDevelopmentSeedTarget(
                "mongodb+srv://user:secret@example.mongodb.net/studyflow",
            ),
        ).toEqual({ databaseName: "studyflow", replaceExistingData: true });
    });
});

function restore(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}
