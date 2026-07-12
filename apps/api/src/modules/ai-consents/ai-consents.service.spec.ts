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

    it("renova CLASS_AI na versão própria sem alterar a versão das outras finalidades", async () => {
        const { consentModel, service } = makeService();

        await expect(
            service.grant(student, "CLASS_AI", {}),
        ).resolves.toMatchObject({
            purpose: "CLASS_AI",
            policyVersion: "2026-07-11",
        });
        await expect(
            service.grant(student, "PRIVATE_AREA_AI", {}),
        ).resolves.toMatchObject({
            purpose: "PRIVATE_AREA_AI",
            policyVersion: "2026-07-09",
        });
        expect(consentModel.create).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                purpose: "CLASS_AI",
                policyVersion: "2026-07-11",
            }),
        );
    });

    it("expõe capacidade CURRENT, OUTDATED, REVOKED e MISSING sem versões hard-coded na UI", async () => {
        const { consentFindLean, service } = makeService();
        consentFindLean.mockResolvedValueOnce([
            {
                _id: "507f1f77bcf86cd799439091",
                userId: student.id,
                purpose: "CLASS_AI",
                status: "GRANTED",
                policyVersion: "2026-07-09",
            },
            {
                _id: "507f1f77bcf86cd799439092",
                userId: student.id,
                purpose: "PROJECT_AI",
                status: "REVOKED",
                policyVersion: "2026-07-09",
            },
            {
                _id: "507f1f77bcf86cd799439093",
                userId: student.id,
                purpose: "PRIVATE_AREA_AI",
                status: "GRANTED",
                policyVersion: "2026-07-09",
            },
        ]);

        const capabilities = await service.listCapabilities(student);

        expect(capabilities).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    purpose: "CLASS_AI",
                    requiredVersion: "2026-07-11",
                    state: "OUTDATED",
                    canUse: false,
                }),
                expect.objectContaining({
                    purpose: "PROJECT_AI",
                    state: "REVOKED",
                    canUse: false,
                }),
                expect.objectContaining({
                    purpose: "PRIVATE_AREA_AI",
                    state: "CURRENT",
                    canUse: true,
                }),
                expect.objectContaining({
                    purpose: "GROUP_AI",
                    state: "MISSING",
                    canUse: false,
                }),
            ]),
        );
    });
});

/**
 * Cria fixture de consentimentos IA sem base de dados real.
 *
 * @returns Serviço e mocks relacionados.
 */
function makeService() {
    const consentFindLean = jest.fn().mockResolvedValue([]);
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
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({ lean: consentFindLean }),
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue({ id: "audit-1" }),
    };
    const service = new AiConsentsService(
        consentModel as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        consentFindLean,
        consentFindOneLean,
        consentModel,
        service,
    };
}
