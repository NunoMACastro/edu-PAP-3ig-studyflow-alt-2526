/**
 * Testa eliminação/anonymização da própria conta.
 */
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AccountDeletionService } from "./account-deletion.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "student@example.test",
    role: "STUDENT",
};
const admin: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439011",
    email: "admin@example.test",
    role: "ADMIN",
};

describe("AccountDeletionService", () => {
    it("exige sessão atual para eliminar conta", async () => {
        const { service } = makeService();

        await expect(service.deleteMine(student)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia eliminação do último admin", async () => {
        const { service, userModel } = makeService();
        userModel.countDocuments.mockResolvedValueOnce(1);

        await expect(service.deleteMine(admin, "session-1")).rejects.toBeInstanceOf(ConflictException);
    });

    it("anonimiza conta, remove dados próprios e revoga sessão", async () => {
        const { auditLogService, sessionService, service, userModel } = makeService();

        await expect(service.deleteMine(student, "session-1")).resolves.toMatchObject({
            deletedCounts: { materials: 2, studyAreas: 1, studyEvents: 3 },
            sessionRevoked: true,
        });
        expect(userModel.updateOne).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $set: expect.objectContaining({
                    email: `deleted-${student.id}@studyflow.local`,
                    passwordHash: "deleted-account",
                }),
            }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                domain: "PRIVACY",
                action: "ACCOUNT_DELETED",
                result: "SUCCESS",
            }),
        );
        expect(sessionService.destroySession).toHaveBeenCalledWith("session-1");
    });
});

function makeService() {
    const deletionModel = {
        create: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439099" }),
    };
    const userModel = {
        countDocuments: jest.fn(),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const studyAreaModel = {
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const materialModel = {
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    };
    const studyEventModel = {
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }),
    };
    const sessionService = {
        destroySession: jest.fn().mockResolvedValue(undefined),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        auditLogService,
        sessionService,
        service: new AccountDeletionService(
            deletionModel as never,
            userModel as never,
            studyAreaModel as never,
            materialModel as never,
            studyEventModel as never,
            sessionService as never,
            auditLogService as never,
        ),
        userModel,
    };
}
