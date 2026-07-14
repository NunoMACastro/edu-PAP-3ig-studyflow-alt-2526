import { E2eFakeAiProvider, createAiProvider } from "./ai-provider.js";

describe("provider fake da demonstração", () => {
    const original = {
        nodeEnv: process.env.NODE_ENV,
        demoMode: process.env.STUDYFLOW_DEMO_MODE,
        demoFake: process.env.STUDYFLOW_DEMO_FAKE_AI,
        e2eMode: process.env.STUDYFLOW_E2E_MODE,
        e2eFake: process.env.STUDYFLOW_E2E_FAKE_AI,
    };

    afterEach(() => {
        restore("NODE_ENV", original.nodeEnv);
        restore("STUDYFLOW_DEMO_MODE", original.demoMode);
        restore("STUDYFLOW_DEMO_FAKE_AI", original.demoFake);
        restore("STUDYFLOW_E2E_MODE", original.e2eMode);
        restore("STUDYFLOW_E2E_FAKE_AI", original.e2eFake);
    });

    it("usa o provider determinístico apenas com as duas guardas em development", () => {
        process.env.NODE_ENV = "development";
        process.env.STUDYFLOW_DEMO_MODE = "true";
        process.env.STUDYFLOW_DEMO_FAKE_AI = "true";
        delete process.env.STUDYFLOW_E2E_MODE;
        delete process.env.STUDYFLOW_E2E_FAKE_AI;
        expect(createAiProvider()).toBeInstanceOf(E2eFakeAiProvider);
    });

    it("recusa uma guarda incompleta", () => {
        process.env.NODE_ENV = "development";
        process.env.STUDYFLOW_DEMO_MODE = "true";
        delete process.env.STUDYFLOW_DEMO_FAKE_AI;
        expect(() => createAiProvider()).toThrow("STUDYFLOW_DEMO_FAKE_AI=true");
    });

    it("recusa o provider de demo fora de development", () => {
        process.env.NODE_ENV = "production";
        process.env.STUDYFLOW_DEMO_MODE = "true";
        process.env.STUDYFLOW_DEMO_FAKE_AI = "true";
        expect(() => createAiProvider()).toThrow("NODE_ENV=development");
    });
});

function restore(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}
