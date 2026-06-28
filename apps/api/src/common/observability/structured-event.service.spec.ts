// apps/api/src/common/observability/structured-event.service.spec.ts
import { StructuredEventService } from "./structured-event.service.js";

describe("StructuredEventService", () => {
    const service = new StructuredEventService();

    function recordWith(metadata: Record<string, unknown>) {
        const event = service.record({
            correlationId: " req-123 ",
            domain: "AI",
            action: " CLASS_AI_REQUESTED ",
            result: "FAILED",
            metadata,
        });
        return event;
    }

    it("redige prompts e respostas privadas", () => {
        const event = recordWith({
            prompt: "conteúdo privado",
            answer: "resposta privada",
            sourceCount: 2,
        });

        // Este negativo prova que conteúdo pedagógico privado não entra na evidence.
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

        // Credenciais nunca devem aparecer em logs, mesmo quando entram dentro de metadata técnica.
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
});