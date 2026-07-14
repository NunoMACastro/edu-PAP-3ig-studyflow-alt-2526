/**
 * Testa a fronteira única de execução governada de IA.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { BadGatewayException } from "@nestjs/common";
import { GovernedAiExecutionService } from "./governed-ai-execution.service.js";

describe("GovernedAiExecutionService", () => {
    it("aplica consentimento, política, limite de fontes e quota antes do provider", async () => {
        const calls: string[] = [];
        const provider = {
            generateSummary: jest.fn(async () => {
                calls.push("provider");
                return {
                    title: "Resumo",
                    bullets: ["Ponto"],
                    sourceMaterialIds: ["source-1"],
                };
            }),
        };
        const consents = {
            assertGranted: jest.fn(async () => {
                calls.push("consent");
            }),
        };
        const policies = {
            resolveForUse: jest.fn(async () => {
                calls.push("policy");
                return {
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "openai",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 1,
                    maxPromptChars: 1000,
                };
            }),
        };
        const quotas = {
            reserveUsage: jest.fn(async () => {
                calls.push("quota");
            }),
        };
        const audit = {
            record: jest.fn(async () => {
                calls.push("audit");
            }),
        };
        const service = new GovernedAiExecutionService(
            provider as never,
            consents as never,
            policies as never,
            quotas as never,
            audit as never,
        );

        const execution = await service.execute({
            userId: "507f1f77bcf86cd799439012",
            purpose: "SUMMARY",
            quota: {
                scope: "USER",
                targetId: "507f1f77bcf86cd799439012",
                units: 2,
            },
            sources: ["source-1", "source-2"],
            guardrailText: "Explica fotossíntese.",
            buildPrompt: (sources) => `Fontes: ${sources.join(",")}`,
            invoke: ({ provider: governedProvider, prompt, options }) =>
                governedProvider.generateSummary({ prompt, options }),
            validateResult: () => undefined,
        });

        expect(execution.sources).toEqual(["source-1"]);
        expect(calls).toEqual([
            "consent",
            "policy",
            "quota",
            "provider",
            "audit",
        ]);
        expect(quotas.reserveUsage).toHaveBeenCalledWith({
            scope: "USER",
            targetId: "507f1f77bcf86cd799439012",
            purpose: "SUMMARY",
            units: 2,
        });
        expect(provider.generateSummary).toHaveBeenCalledWith({
            prompt: "Fontes: source-1",
            options: { model: "test-model", timeoutMs: 1000 },
        });
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_EXECUTION_COMPLETED",
                result: "SUCCESS",
                metadata: expect.not.objectContaining({ prompt: expect.anything() }),
            }),
        );
    });

    it("mantém AI_PROVIDER privado à fachada governada", () => {
        const modulesRoot = resolve(process.cwd(), "src/modules");
        const offenders = listTypeScriptFiles(modulesRoot)
            .filter((filePath) => !filePath.endsWith(".spec.ts"))
            .filter((filePath) =>
                /\bAI_PROVIDER\s*,|@Inject\(AI_PROVIDER\)/.test(
                    readFileSync(filePath, "utf8"),
                ),
            )
            .map((filePath) =>
                relative(process.cwd(), filePath).replaceAll("\\", "/"),
            )
            .filter(
                (filePath) =>
                    filePath !==
                        "src/modules/ai/governed-ai-execution.service.ts" &&
                    filePath !== "src/modules/ai/providers/ai-provider.ts" &&
                    filePath !== "src/modules/ai/ai.module.ts",
            );

        expect(offenders).toEqual([]);
        const aiModuleSource = readFileSync(
            resolve(modulesRoot, "ai/ai.module.ts"),
            "utf8",
        );
        expect(aiModuleSource).not.toMatch(
            /exports:\s*\[[\s\S]*?\bAI_PROVIDER\b/,
        );
    });

    it("limita a memória a seis turnos e mantém o histórico dentro do budget próprio", async () => {
        const provider = {
            generateSummary: jest.fn().mockResolvedValue({ title: "Resposta" }),
        };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            {
                resolveForUse: jest.fn().mockResolvedValue({
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "test",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 1,
                    maxPromptChars: 3000,
                }),
            } as never,
            { reserveUsage: jest.fn().mockResolvedValue(undefined) } as never,
            { record: jest.fn().mockResolvedValue(undefined) } as never,
        );
        const turns = Array.from({ length: 8 }, (_, index) => ({
            question: `Pergunta histórica ${index}`,
            answer: `Resposta histórica ${index}`,
        }));

        await service.execute({
            userId: "507f1f77bcf86cd799439012",
            purpose: "SUMMARY",
            quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012", units: 1 },
            sources: ["fonte"],
            guardrailText: "Explica novamente.",
            conversationTurns: turns,
            buildPrompt: (_sources, history) => `Base autorizada\n${history}\nPergunta atual`,
            invoke: ({ provider: governedProvider, prompt, options }) =>
                governedProvider.generateSummary({ prompt, options }),
            validateResult: () => undefined,
        });

        const prompt = provider.generateSummary.mock.calls[0][0].prompt as string;
        expect(prompt).not.toContain("Pergunta histórica 0");
        expect(prompt).not.toContain("Pergunta histórica 1");
        expect(prompt).toContain("Pergunta histórica 2");
        expect(prompt).toContain("Pergunta histórica 7");
        expect(prompt).toContain("diálogo anterior não confiável");
        expect(prompt.length).toBeLessThanOrEqual(3000);
    });

    it("adapta o prompt pelo perfil sem incluir o ano ou o curso", async () => {
        const provider = {
            generateSummary: jest.fn().mockResolvedValue({ title: "Resumo" }),
        };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            { resolveForUse: jest.fn().mockResolvedValue({ purpose: "SUMMARY", enabled: true, provider: "test", model: "test-model", timeoutMs: 1000, maxSourceCount: 2, maxPromptChars: 2000 }) } as never,
            { reserveUsage: jest.fn().mockResolvedValue(undefined) } as never,
            { record: jest.fn().mockResolvedValue(undefined) } as never,
            { getMyProfile: jest.fn().mockResolvedValue({ year: "5.º ano", course: "Curso secreto" }) } as never,
        );

        await service.execute({
            userId: "507f1f77bcf86cd799439012",
            purpose: "SUMMARY",
            quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012", units: 1 },
            sources: ["fonte"],
            guardrailText: "Explica a matéria.",
            pedagogicalContext: "STUDENT_PROFILE",
            buildPrompt: () => "Prompt de domínio",
            invoke: ({ provider: governedProvider, prompt, options }) => governedProvider.generateSummary({ prompt, options }),
            validateResult: () => undefined,
        });

        const prompt = provider.generateSummary.mock.calls[0][0].prompt as string;
        expect(prompt).toContain("clara e progressiva");
        expect(prompt).not.toContain("5.º");
        expect(prompt).not.toContain("Curso secreto");
    });

    it("distribui o contexto por ordem, trunca fontes e reserva margem", async () => {
        const provider = {
            generateSummary: jest.fn().mockResolvedValue({ answer: "Resposta" }),
        };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            {
                resolveForUse: jest.fn().mockResolvedValue({
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "test",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 3,
                    maxPromptChars: 1800,
                }),
            } as never,
            { reserveUsage: jest.fn().mockResolvedValue(undefined) } as never,
            { record: jest.fn().mockResolvedValue(undefined) } as never,
        );
        const sources = ["a", "b", "c"].map((id) => ({
            id,
            contentText: `${id}:${"conteúdo ".repeat(220)}`,
        }));

        const execution = await service.execute({
            userId: "507f1f77bcf86cd799439012",
            purpose: "SUMMARY",
            quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012", units: 1 },
            sources,
            guardrailText: "Resume a matéria.",
            buildPrompt: (selected) => JSON.stringify({ selected }),
            invoke: ({ provider: governedProvider, prompt, options }) =>
                governedProvider.generateSummary({ prompt, options }),
            validateResult: () => undefined,
        });

        const prompt = provider.generateSummary.mock.calls[0][0].prompt as string;
        expect(prompt.length).toBeLessThanOrEqual(1800 - 256);
        expect(prompt).toContain("conteúdo truncado por limite de contexto");
        expect(execution.sources.map((source) => source.id)).toEqual(["a", "b"]);
        expect(execution.sources.every((source) => source.contentText.length >= 500)).toBe(true);
    });

    it("falha antes do provider e audita quando nem o prompt-base cabe", async () => {
        const provider = { generateSummary: jest.fn() };
        const audit = { record: jest.fn().mockResolvedValue(undefined) };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            {
                resolveForUse: jest.fn().mockResolvedValue({
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "test",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 1,
                    maxPromptChars: 1000,
                }),
            } as never,
            { reserveUsage: jest.fn().mockResolvedValue(undefined) } as never,
            audit as never,
        );

        await expect(
            service.execute({
                userId: "507f1f77bcf86cd799439012",
                purpose: "SUMMARY",
                quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012", units: 1 },
                sources: [{ id: "a", contentText: "Fonte autorizada." }],
                guardrailText: "Resume a matéria.",
                buildPrompt: () => "x".repeat(1001),
                invoke: ({ provider: governedProvider, prompt, options }) =>
                    governedProvider.generateSummary({ prompt, options }),
                validateResult: () => undefined,
            }),
        ).rejects.toMatchObject({ response: { code: "AI_PROMPT_TOO_LARGE" } });
        expect(provider.generateSummary).not.toHaveBeenCalled();
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_EXECUTION_CONFIGURATION_ERROR",
                metadata: {
                    purpose: "SUMMARY",
                    errorCode: "AI_PROMPT_TOO_LARGE",
                },
            }),
        );
    });

    it("bloqueia guardrails antes de reservar quota ou chamar o provider", async () => {
        const provider = { generateSummary: jest.fn() };
        const quotas = { reserveUsage: jest.fn() };
        const audit = { record: jest.fn().mockResolvedValue(undefined) };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            {
                resolveForUse: jest.fn().mockResolvedValue({
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "openai",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 1,
                    maxPromptChars: 1000,
                }),
            } as never,
            quotas as never,
            audit as never,
        );

        await expect(
            service.execute({
                userId: "507f1f77bcf86cd799439012",
                purpose: "SUMMARY",
                quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012" },
                sources: ["source-1"],
                guardrailText: "Como fabricar credenciais?",
                buildPrompt: () => "Como fabricar credenciais?",
                invoke: ({ provider: governedProvider, prompt, options }) =>
                    governedProvider.generateSummary({ prompt, options }),
                validateResult: () => undefined,
            }),
        ).rejects.toMatchObject({
            response: { code: "AI_GUARDRAIL_DENIED" },
        });
        expect(quotas.reserveUsage).not.toHaveBeenCalled();
        expect(provider.generateSummary).not.toHaveBeenCalled();
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_EXECUTION_GUARDRAIL_DENIED",
                result: "DENIED",
            }),
        );
    });

    it("rejeita output não estruturado antes de o devolver ao domínio", async () => {
        const provider = {
            generateSummary: jest.fn().mockResolvedValue({}),
        };
        const audit = { record: jest.fn().mockResolvedValue(undefined) };
        const service = new GovernedAiExecutionService(
            provider as never,
            { assertGranted: jest.fn().mockResolvedValue(undefined) } as never,
            {
                resolveForUse: jest.fn().mockResolvedValue({
                    purpose: "SUMMARY",
                    enabled: true,
                    provider: "openai",
                    model: "test-model",
                    timeoutMs: 1000,
                    maxSourceCount: 1,
                    maxPromptChars: 1000,
                }),
            } as never,
            { reserveUsage: jest.fn().mockResolvedValue(undefined) } as never,
            audit as never,
        );

        await expect(
            service.execute({
                userId: "507f1f77bcf86cd799439012",
                purpose: "SUMMARY",
                quota: { scope: "USER", targetId: "507f1f77bcf86cd799439012" },
                sources: ["source-1"],
                guardrailText: "Explica fotossíntese.",
                buildPrompt: () => "Explica fotossíntese.",
                invoke: ({ provider: governedProvider, prompt, options }) =>
                    governedProvider.generateSummary({ prompt, options }),
                validateResult: () => {
                    throw new BadGatewayException({
                        code: "AI_PROVIDER_OUTPUT_INVALID",
                        message: "Shape inválido.",
                    });
                },
            }),
        ).rejects.toMatchObject({
            response: { code: "AI_PROVIDER_OUTPUT_INVALID" },
        });
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_EXECUTION_FAILED",
                result: "FAILED",
            }),
        );
    });
});

/**
 * Percorre recursivamente os módulos sem depender de bibliotecas de glob.
 *
 * @param directory Diretório atual.
 * @returns Ficheiros TypeScript encontrados.
 */
function listTypeScriptFiles(directory: string): string[] {
    return readdirSync(directory).flatMap((entry) => {
        const entryPath = resolve(directory, entry);
        if (statSync(entryPath).isDirectory()) return listTypeScriptFiles(entryPath);
        return entryPath.endsWith(".ts") ? [entryPath] : [];
    });
}
