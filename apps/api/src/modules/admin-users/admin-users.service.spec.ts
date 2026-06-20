/**
 * Testa gestão administrativa de utilizadores e papéis.
 */
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdminUsersService } from "./admin-users.service.js";

const admin: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "admin@example.test",
    role: "ADMIN",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439011",
    email: "teacher@example.test",
    role: "TEACHER",
};
const targetUserId = "507f1f77bcf86cd799439012";

describe("AdminUsersService", () => {
    it("bloqueia listagem para não admins", async () => {
        const { service } = makeService();

        await expect(service.listUsers(teacher)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("protege o último administrador", async () => {
        const { service, userModel } = makeService();
        userModel.findById.mockResolvedValueOnce(makeTargetUser("ADMIN"));
        userModel.countDocuments.mockResolvedValueOnce(1);

        await expect(
            service.changeRole(admin, targetUserId, {
                role: "TEACHER",
                reason: "Reorganização de equipa",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it("altera role real e cria auditoria", async () => {
        const { auditLogService, roleChangeModel, service, userModel } = makeService();
        const target = makeTargetUser("TEACHER");
        userModel.findById.mockResolvedValueOnce(target);
        roleChangeModel.create.mockResolvedValueOnce({ _id: "507f1f77bcf86cd799439099" });

        await expect(
            service.changeRole(admin, targetUserId, {
                role: "ADMIN",
                reason: "Responsável técnico",
            }),
        ).resolves.toMatchObject({
            user: { id: targetUserId, role: "ADMIN" },
        });
        expect(target.save).toHaveBeenCalled();
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: admin.id,
                domain: "ROLES",
                action: "USER_ROLE_CHANGED",
                resourceId: targetUserId,
                result: "SUCCESS",
            }),
        );
    });
});

function makeService() {
    const userModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([]),
                }),
            }),
        }),
        findById: jest.fn(),
        countDocuments: jest.fn(),
        exists: jest.fn(),
    };
    const roleChangeModel = {
        create: jest.fn(),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        auditLogService,
        roleChangeModel,
        service: new AdminUsersService(
            userModel as never,
            roleChangeModel as never,
            auditLogService as never,
        ),
        userModel,
    };
}

function makeTargetUser(role: "STUDENT" | "TEACHER" | "ADMIN") {
    return {
        id: targetUserId,
        email: "target@example.test",
        role,
        authProvider: "local",
        save: jest.fn().mockResolvedValue(undefined),
    };
}
