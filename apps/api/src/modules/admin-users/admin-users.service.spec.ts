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
        userModel.findOneAndUpdate.mockResolvedValueOnce({
            ...target,
            role: "ADMIN",
        });
        roleChangeModel.create.mockResolvedValueOnce([
            { _id: "507f1f77bcf86cd799439099" },
        ]);

        await expect(
            service.changeRole(admin, targetUserId, {
                role: "ADMIN",
                reason: "Responsável técnico",
            }),
        ).resolves.toMatchObject({
            user: { id: targetUserId, role: "ADMIN" },
        });
        expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: target._id }),
            expect.objectContaining({
                $set: { role: "ADMIN" },
                $inc: { sessionVersion: 1 },
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: admin.id,
                domain: "ROLES",
                action: "USER_ROLE_CHANGED",
                resourceId: targetUserId,
                result: "SUCCESS",
            }),
            expect.anything(),
        );
    });
});

/**
 * Executa o apoio de teste para administração de utilizadores, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
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
        findOneAndUpdate: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
        countDocuments: jest.fn(),
    };
    const roleChangeModel = {
        create: jest.fn(),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const session = { id: "transaction-session" };
    const connection = {
        collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        }),
        transaction: jest.fn(async (work) => work(session)),
    };

    return {
        auditLogService,
        roleChangeModel,
        service: new AdminUsersService(
            userModel as never,
            roleChangeModel as never,
            auditLogService as never,
            connection as never,
        ),
        userModel,
    };
}

/**
 * Executa o apoio de teste para administração de utilizadores, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param role Papel funcional que define permissões e comportamento autorizado dentro da aplicação.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeTargetUser(role: "STUDENT" | "TEACHER" | "ADMIN") {
    return {
        _id: targetUserId,
        id: targetUserId,
        email: "target@example.test",
        role,
        authProvider: "local",
        accountStatus: "ACTIVE",
    };
}
