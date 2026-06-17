/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import {
    BadGatewayException,
    GatewayTimeoutException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { OpenAiProvider } from "./ai-provider.js";

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
});
