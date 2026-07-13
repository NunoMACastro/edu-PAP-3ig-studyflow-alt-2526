/**
 * Testa exportação RGPD de dados próprios.
 */
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

const actor: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "student@example.test",
    role: "STUDENT",
};
const requestId = "507f1f77bcf86cd799439011";

describe("PrivacyDataExportsService", () => {
    it("cria pedido próprio e audita a operação", async () => {
        const { auditLogService, service } = makeService();

        await expect(service.requestExport(actor)).resolves.toMatchObject({
            id: requestId,
            status: "READY",
        });
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: actor.id,
                domain: "PRIVACY",
                action: "DATA_EXPORT_REQUESTED",
                resourceId: requestId,
            }),
        );
    });

    it("bloqueia download expirado", async () => {
        const { exportFindOneLean, service } = makeService();
        exportFindOneLean.mockResolvedValueOnce({
            _id: requestId,
            userId: actor.id,
            status: "READY",
            expiresAt: new Date("2020-01-01T00:00:00Z"),
        });

        await expect(service.download(actor, requestId)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("gera attachment completo pelo registry central e audita apenas contagens", async () => {
        const { auditLogService, personalDataRegistry, service } = makeService();

        await expect(service.download(actor, requestId)).resolves.toMatchObject({
            filename: "studyflow-personal-data-2026-07-10.json",
            contentType: "application/json",
            collectionCount: 60,
            recordCount: 12,
            storedFileCount: 1,
        });
        expect(personalDataRegistry.createExportDownload).toHaveBeenCalledWith(
            actor.id,
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "DATA_EXPORT_DOWNLOADED",
                metadata: {
                    collectionCount: 60,
                    recordCount: 12,
                    storedFileCount: 1,
                },
            }),
        );
    });

    it("rejeita pedido inexistente", async () => {
        const { exportFindOneLean, service } = makeService();
        exportFindOneLean.mockResolvedValueOnce(null);

        await expect(service.download(actor, requestId)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("limita a uma exportação simultânea por utilizador e liberta no cleanup", async () => {
        const { personalDataRegistry, service } = makeService();
        const first = await service.download(actor, requestId);

        await expect(service.download(actor, requestId)).rejects.toMatchObject({
            response: expect.objectContaining({ code: "DATA_EXPORT_ALREADY_RUNNING" }),
        });
        await first.cleanup();
        await expect(service.download(actor, requestId)).resolves.toBeDefined();
        expect(personalDataRegistry.createExportDownload).toHaveBeenCalledTimes(2);
    });
});

/**
 * Executa o apoio de teste para exportação de dados pessoais, mantendo o cenário legível e próximo do comportamento real validado.
 * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const exportFindOneLean = jest.fn().mockResolvedValue({
        _id: requestId,
        userId: actor.id,
        status: "READY",
        expiresAt: new Date(Date.now() + 60_000),
    });
    const exportModel = {
        create: jest.fn().mockResolvedValue({
            _id: requestId,
            status: "READY",
            expiresAt: new Date(Date.now() + 60_000),
            /**
             * Transforma o apoio de teste para exportação de dados pessoais, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject() {
                return this;
            },
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: exportFindOneLean,
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const personalDataRegistry = {
        createExportDownload: jest.fn().mockResolvedValue({
            stream: {},
            filename: "studyflow-personal-data-2026-07-10.json",
            contentType: "application/json",
            sizeBytes: 1024,
            collectionCount: 60,
            recordCount: 12,
            storedFileCount: 1,
            cleanup: jest.fn().mockResolvedValue(undefined),
        }),
    };

    return {
        auditLogService,
        exportFindOneLean,
        service: new PrivacyDataExportsService(
            exportModel as never,
            auditLogService as never,
            personalDataRegistry as never,
        ),
        personalDataRegistry,
    };
}
