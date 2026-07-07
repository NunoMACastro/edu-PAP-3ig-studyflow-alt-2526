/**
 * Testa o contrato de logs estruturados da MF7.
 */
import { StructuredEventService } from "./structured-event.service.js";

describe("StructuredEventService", () => {
    const service = new StructuredEventService();

    /**
     * Cria um evento AI com metadata variável para cobrir redacção e normalização.
     *
     * @param metadata Metadados do cenário de teste.
     * @returns Evento estruturado normalizado.
     */
    function recordWith(metadata: Record<string, unknown>) {
        return service.record({
            correlationId: " req-123 ",
            domain: "AI",
            action: " CLASS_AI_REQUESTED ",
            result: "FAILED",
            metadata,
        });
    }

    it("redige prompts e respostas privadas", () => {
        const event = recordWith({
            prompt: "conteudo privado",
            answer: "resposta privada",
            sourceCount: 2,
        });

        // Este negativo prova que conteudo pedagogico privado nao entra na evidence.
        expect(event.metadata).toEqual({
            prompt: "[REDACTED]",
            answer: "[REDACTED]",
            sourceCount: 2,
        });
    });

    it("redige cookies, tokens e passwords", () => {
        const event = recordWith({
            cookie: "sid=privado",
            token: "token-privado",
            password: "nao-guardar",
        });

        // Credenciais nunca devem aparecer em logs, mesmo quando entram como metadata tecnica.
        expect(event.metadata).toEqual({
            cookie: "[REDACTED]",
            token: "[REDACTED]",
            password: "[REDACTED]",
        });
    });

    it("redige segredos operacionais", () => {
        const event = recordWith({
            clientSecret: "segredo-privado",
            retryCount: 1,
        });

        expect(event.metadata).toEqual({
            clientSecret: "[REDACTED]",
            retryCount: 1,
        });
    });

    it("mantem metadados operacionais nao sensiveis", () => {
        const event = recordWith({
            sourceCount: 2,
            retryCount: 1,
        });

        expect(event.metadata).toEqual({
            sourceCount: 2,
            retryCount: 1,
        });
    });

    it("normaliza correlacao e acao para pesquisa operacional", () => {
        const event = recordWith({});

        expect(event.correlationId).toBe("req-123");
        expect(event.action).toBe("CLASS_AI_REQUESTED");
    });

    it("recusa eventos sem correlacao operacional", () => {
        expect(() =>
            service.record({
                correlationId: " ",
                domain: "AI",
                action: "CLASS_AI_REQUESTED",
                result: "FAILED",
            }),
        ).toThrow("correlationId e obrigatorio para logs estruturados.");
    });
});
