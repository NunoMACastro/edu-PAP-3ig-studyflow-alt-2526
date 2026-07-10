/**
 * Testa consentimentos IA MF4.
 */
import { ForbiddenException } from "@nestjs/common";
import { AiConsentsService } from "./ai-consents.service.js";

const student = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};

describe("AiConsentsService", () => {
    it("regista consentimento concedido com auditoria", async () => {
        const { auditLogService, consentModel, service } = makeService();

        await expect(
            service.grant(student, "PRIVATE_AREA_AI", { policyVersion: "2026-07-09" }),
        ).resolves.toMatchObject({
            purpose: "PRIVATE_AREA_AI",
            status: "GRANTED",
            policyVersion: "2026-07-09",
        });

        expect(consentModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                purpose: "PRIVATE_AREA_AI",
                status: "GRANTED",
                policyVersion: "2026-07-09",
            }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "AI_CONSENT_GRANTED",
                result: "SUCCESS",
            }),
        );
    });

    it("bloqueia finalidade sem consentimento ativo", async () => {
        const { consentFindOneLean, service } = makeService();
        consentFindOneLean.mockResolvedValueOnce({ status: "REVOKED" });

        await expect(
            service.assertGranted(student.id, "PRIVATE_AREA_AI"),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia consentimento concedido para uma política anterior", async () => {
        const { consentFindOneLean, service } = makeService();
        consentFindOneLean.mockResolvedValueOnce({
            status: "GRANTED",
            policyVersion: "2026-06-16",
        });

        await expect(
            service.assertGranted(student.id, "PRIVATE_AREA_AI"),
        ).rejects.toMatchObject({
            response: { code: "AI_CONSENT_POLICY_OUTDATED" },
        });
    });
});

/**
 * Cria fixture de consentimentos IA sem base de dados real.
 *
 * @returns Serviço e mocks relacionados.
 */
function makeService() {
    const consentFindOneLean = jest.fn().mockResolvedValue({
        status: "GRANTED",
        policyVersion: "2026-07-09",
    });
    const consentModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            /**
             * Transforma o apoio de teste para consentimentos de IA, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439099",
                ...input,
                createdAt: new Date("2026-06-18T00:00:00Z"),
            }),
        })),
        findOne: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: consentFindOneLean,
            }),
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue({ id: "audit-1" }),
    };
    const service = new AiConsentsService(
        consentModel as never,
        auditLogService as never,
    );
    return { auditLogService, consentFindOneLean, consentModel, service };
}
