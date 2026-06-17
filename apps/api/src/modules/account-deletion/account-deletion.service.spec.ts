// apps/api/src/modules/account-deletion/account-deletion.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AccountDeletionService } from "./account-deletion.service.js";
import { ACCOUNT_DELETION_CONFIRMATION } from "./dto/request-account-deletion.dto.js";

describe("AccountDeletionService", () => {
    it("bloqueia eliminação do último administrador", async () => {
        const userModel = {
            findById: jest.fn(() => ({ lean: async () => ({ role: "ADMIN" }) })),
            countDocuments: jest.fn(async () => 0),
        };
        const service = new AccountDeletionService(userModel as never, {} as never, {} as never, {} as never, {} as never);

        await expect(
            service.deleteOwnAccount(
                { id: "507f1f77bcf86cd799439010", email: "admin@studyflow.test", role: "ADMIN" },
                { confirmation: ACCOUNT_DELETION_CONFIRMATION },
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});