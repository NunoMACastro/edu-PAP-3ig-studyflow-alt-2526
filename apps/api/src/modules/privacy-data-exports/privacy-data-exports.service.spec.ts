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

    it("gera bundle minimizado sem selecionar passwordHash", async () => {
        const { service, userSelect } = makeService();

        await expect(service.download(actor, requestId)).resolves.toMatchObject({
            user: { email: actor.email },
            studyAreas: [],
            materials: [],
            notificationPreferences: [],
        });
        expect(userSelect).toHaveBeenCalledWith("_id email role authProvider createdAt updatedAt");
    });

    it("rejeita pedido inexistente", async () => {
        const { exportFindOneLean, service } = makeService();
        exportFindOneLean.mockResolvedValueOnce(null);

        await expect(service.download(actor, requestId)).rejects.toBeInstanceOf(NotFoundException);
    });
});

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
    const userSelect = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
            _id: actor.id,
            email: actor.email,
            role: actor.role,
            authProvider: "local",
        }),
    });
    const userModel = {
        findById: jest.fn().mockReturnValue({ select: userSelect }),
    };
    const makeFindModel = () => ({
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
    });
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        auditLogService,
        exportFindOneLean,
        service: new PrivacyDataExportsService(
            exportModel as never,
            userModel as never,
            makeFindModel() as never,
            makeFindModel() as never,
            makeFindModel() as never,
            auditLogService as never,
        ),
        userSelect,
    };
}
