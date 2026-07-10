/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import {
    BadGatewayException,
    GatewayTimeoutException,
    ServiceUnavailableException,
} from "@nestjs/common";
import {
    createAiProvider,
    E2eFakeAiProvider,
    OpenAiProvider,
} from "./ai-provider.js";
import { validateStudyToolArtifact } from "../validators/ai-artifact.validator.js";

/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type FakeOpenAiClient = {
    responses: {
        create: jest.Mock;
    };
};

describe("OpenAiProvider", () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    const originalModel = process.env.OPENAI_MODEL;
    const originalTimeout = process.env.OPENAI_TIMEOUT_MS;

    afterEach(() => {
        process.env.OPENAI_API_KEY = originalApiKey;
        process.env.OPENAI_MODEL = originalModel;
        process.env.OPENAI_TIMEOUT_MS = originalTimeout;
        jest.restoreAllMocks();
    });

    it("devolve erro controlado quando o provider não está configurado", async () => {
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_MODEL;
        const provider = new OpenAiProvider();

        await expect(
            provider.generateSummary({ prompt: "Resume." }),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_NOT_CONFIGURED",
            },
        });
        await expect(
            provider.generateSummary({ prompt: "Resume." }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it("mapeia timeout do SDK para AI_PROVIDER_TIMEOUT", async () => {
        const provider = new OpenAiProvider();
        const client = {
            responses: {
                create: jest.fn().mockRejectedValue(new Error("Request timed out")),
            },
        };

        await expect(
            (
                provider as unknown as {
                    createResponse: (
                        client: FakeOpenAiClient,
                        model: string,
                        prompt: string,
                    ) => Promise<unknown>;
                }
            ).createResponse(client, "model", "prompt"),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_TIMEOUT",
            },
        });
        await expect(
            (
                provider as unknown as {
                    createResponse: (
                        client: FakeOpenAiClient,
                        model: string,
                        prompt: string,
                    ) => Promise<unknown>;
                }
            ).createResponse(client, "model", "prompt"),
        ).rejects.toBeInstanceOf(GatewayTimeoutException);
    });

    it("preserva erro controlado quando a IA devolve JSON inválido", async () => {
        process.env.OPENAI_API_KEY = "test-key";
        process.env.OPENAI_MODEL = "test-model";
        const provider = new OpenAiProvider();
        jest.spyOn(
            provider as unknown as {
                createResponse: () => Promise<{ output_text: string }>;
            },
            "createResponse",
        ).mockResolvedValue({ output_text: "nao-json" });

        await expect(
            provider.generateSummary({ prompt: "Resume." }),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_INVALID_JSON",
            },
        });
        await expect(
            provider.generateSummary({ prompt: "Resume." }),
        ).rejects.toBeInstanceOf(BadGatewayException);
    });

    it("usa o modelo definido pela política quando é fornecido", async () => {
        process.env.OPENAI_API_KEY = "test-key";
        process.env.OPENAI_MODEL = "env-model";
        const provider = new OpenAiProvider();
        const createResponse = jest.spyOn(
            provider as unknown as {
                createResponse: () => Promise<{ output_text: string }>;
            },
            "createResponse",
        ).mockResolvedValue({ output_text: JSON.stringify({ title: "Resumo", bullets: [], sourceMaterialIds: [] }) });

        await expect(
            provider.generateSummary({
                prompt: "Resume.",
                options: { model: "policy-model", timeoutMs: 1234 },
            }),
        ).resolves.toMatchObject({ title: "Resumo" });
        expect(createResponse).toHaveBeenCalledWith(
            expect.anything(),
            "policy-model",
            "Resume.",
        );
    });
});

describe("E2eFakeAiProvider", () => {
    const sourceId = "507f1f77bcf86cd799439010";
    const prompt = `Fontes:\nFonte 1 (${sourceId}) - Material E2E\nTexto processavel.`;

    it("gera ferramentas compatíveis com os validadores de artefactos", async () => {
        const provider = new E2eFakeAiProvider();

        for (const type of ["EXPLANATION", "FLASHCARDS", "QUIZ"] as const) {
            const artifact = await provider.generateStudyTool({ prompt, type });

            expect(() =>
                validateStudyToolArtifact(type, artifact, [sourceId]),
            ).not.toThrow();
        }
    });
});

describe("createAiProvider", () => {
    const e2eEnvironmentNames = [
        "NODE_ENV",
        "STUDYFLOW_E2E_MODE",
        "STUDYFLOW_E2E_FAKE_AI",
        "STUDYFLOW_E2E_IN_MEMORY_REDIS",
        "STUDYFLOW_E2E_SEED_AI_GOVERNANCE",
    ] as const;
    const originalEnvironment = Object.fromEntries(
        e2eEnvironmentNames.map((name) => [name, process.env[name]]),
    );

    afterEach(() => {
        for (const name of e2eEnvironmentNames) {
            const originalValue = originalEnvironment[name];
            if (originalValue === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = originalValue;
            }
        }
    });

    it("recusa o provider fake sem boundary E2E completa", () => {
        process.env.NODE_ENV = "test";
        delete process.env.STUDYFLOW_E2E_MODE;
        process.env.STUDYFLOW_E2E_FAKE_AI = "true";

        expect(() => createAiProvider()).toThrow("STUDYFLOW_E2E_MODE=true");
    });

    it("cria o provider fake apenas com marcador explícito e NODE_ENV=test", () => {
        process.env.NODE_ENV = "test";
        process.env.STUDYFLOW_E2E_MODE = "true";
        process.env.STUDYFLOW_E2E_FAKE_AI = "true";

        expect(createAiProvider()).toBeInstanceOf(E2eFakeAiProvider);
    });
});
