// apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.spec.ts
import { NotFoundException } from "@nestjs/common";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

describe("PrivacyDataExportsService", () => {
    it("bloqueia download de exportação de outro utilizador", async () => {
        const exportModel = { findOne: jest.fn(() => ({ lean: async () => null })) };
        const service = new PrivacyDataExportsService(exportModel as never, {} as never, {} as never, {} as never, {} as never);

        await expect(
            service.download({ id: "507f1f77bcf86cd799439010", email: "a@studyflow.test", role: "STUDENT" }, "507f1f77bcf86cd799439011"),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});