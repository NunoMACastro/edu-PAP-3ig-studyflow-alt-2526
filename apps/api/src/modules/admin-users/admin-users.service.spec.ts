// apps/api/src/modules/admin-users/admin-users.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service.js";

describe("AdminUsersService", () => {
    it("impede rebaixar o último administrador", async () => {
        const userModel = {
            findById: jest.fn(() => ({ lean: async () => ({ _id: "507f1f77bcf86cd799439010", email: "admin@studyflow.test", role: "ADMIN" }) })),
            countDocuments: jest.fn(async () => 0),
        };
        const service = new AdminUsersService(userModel as never, {} as never);

        await expect(
            service.changeRole(
                { id: "507f1f77bcf86cd799439011", email: "root@studyflow.test", role: "ADMIN" },
                "507f1f77bcf86cd799439010",
                { nextRole: "TEACHER", reason: "Teste de segurança." },
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});