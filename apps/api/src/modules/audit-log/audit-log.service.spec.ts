/**
 * Testa auditoria MF4 e redacção de metadata sensível.
 */
import { ForbiddenException } from "@nestjs/common";
import { StructuredEventService } from "../../common/observability/structured-event.service.js";
import { AuditLogService } from "./audit-log.service.js";

const admin = {
    id: "507f1f77bcf86cd799439012",
    email: "admin@example.test",
    role: "ADMIN" as const,
};

const student = {
    id: "507f1f77bcf86cd799439013",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};

describe("AuditLogService", () => {
    it("redige chaves sensíveis antes de persistir eventos", async () => {
        const { auditModel, service } = makeService();

        await expect(
            service.record({
                actorId: admin.id,
                domain: "AI",
                action: "AI_CALLED",
                resourceType: "AiRequest",
                result: "SUCCESS",
                metadata: {
                    prompt: "texto privado",
                    apiKey: "secret-key",
                    safeValue: "x".repeat(305),
                },
            }),
        ).resolves.toMatchObject({
            action: "AI_CALLED",
            metadata: {
                correlationId: "AI:AiRequest:sem-recurso",
                observedAt: expect.any(String),
                resourceType: "AiRequest",
                resourceId: "sem-recurso",
                prompt: "[REDACTED]",
                apiKey: "[REDACTED]",
                safeValue: `${"x".repeat(300)}...`,
            },
        });

        expect(auditModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: {
                    correlationId: "AI:AiRequest:sem-recurso",
                    observedAt: expect.any(String),
                    resourceType: "AiRequest",
                    resourceId: "sem-recurso",
                    prompt: "[REDACTED]",
                    apiKey: "[REDACTED]",
                    safeValue: `${"x".repeat(300)}...`,
                },
            }),
        );
    });

    it("bloqueia listagem de auditoria para utilizadores não admin", async () => {
        const { auditModel, service } = makeService();

        await expect(service.list(student)).rejects.toBeInstanceOf(ForbiddenException);
        expect(auditModel.find).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture de auditoria sem base de dados real.
 *
 * @returns Serviço e modelo mockado.
 */
function makeService() {
    const auditModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            /**
             * Transforma o apoio de teste para auditoria administrativa, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439099",
                ...input,
                createdAt: new Date("2026-06-18T00:00:00Z"),
            }),
        })),
        find: jest.fn(),
    };
    const service = new AuditLogService(auditModel as never, new StructuredEventService());
    return { auditModel, service };
}
