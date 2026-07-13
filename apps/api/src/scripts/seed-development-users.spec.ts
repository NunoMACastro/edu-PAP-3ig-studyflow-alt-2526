import {
    assertDevelopmentSeedTarget,
    quotaDefaultMatrix,
    resolveDemoAiPolicyModel,
} from "./seed-development-users.js";

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

    it("mantém nas políticas demo o modelo OpenAI configurado", () => {
        expect(
            resolveDemoAiPolicyModel({ OPENAI_MODEL: "  gpt-5.4-mini  " }),
        ).toBe("gpt-5.4-mini");
    });

    it("recusa um modelo administrativo inválido", () => {
        expect(() => resolveDemoAiPolicyModel({ OPENAI_MODEL: "x" })).toThrow(
            "OPENAI_MODEL deve conter entre 2 e 80 caracteres",
        );
    });

    it("define dez defaults apenas nos âmbitos consumidos pelos domínios", () => {
        const matrix = quotaDefaultMatrix();

        expect(matrix).toHaveLength(10);
        expect(matrix).toEqual(
            expect.arrayContaining([
                { scope: "USER", purpose: "PRIVATE_AREA_AI" },
                { scope: "USER", purpose: "SUMMARY" },
                { scope: "USER", purpose: "STUDY_TOOL" },
                { scope: "CLASS", purpose: "CLASS_AI" },
                { scope: "GROUP", purpose: "GROUP_AI" },
                { scope: "GROUP", purpose: "ROOM_AI" },
            ]),
        );
        expect(
            matrix.some(
                ({ scope, purpose }) =>
                    scope === "USER" &&
                    ["CLASS_AI", "GROUP_AI", "ROOM_AI"].includes(purpose),
            ),
        ).toBe(false);
    });
});

function restore(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}
