/** Verifica o contrato HTTP seguro do download RGPD. */
import { StreamableFile } from "@nestjs/common";
import { Readable } from "node:stream";
import { PrivacyDataExportsController } from "./privacy-data-exports.controller.js";

describe("PrivacyDataExportsController", () => {
    it("devolve attachment JSON privado com tamanho explícito", async () => {
        const stream = Readable.from([Buffer.from("{}")]);
        const cleanup = jest.fn().mockResolvedValue(undefined);
        const exportsService = {
            download: jest.fn().mockResolvedValue({
                stream,
                filename: "studyflow-personal-data-2026-07-10.json",
                contentType: "application/json",
                sizeBytes: 2,
                collectionCount: 60,
                recordCount: 1,
                storedFileCount: 0,
                cleanup,
            }),
        };
        const controller = new PrivacyDataExportsController(
            exportsService as never,
        );
        const request = {
            user: {
                id: "507f1f77bcf86cd799439010",
                email: "student@example.test",
                role: "STUDENT",
            },
            once: jest.fn(),
        };
        const response = { setHeader: jest.fn() };

        const result = await controller.download(
            request as never,
            "507f1f77bcf86cd799439011",
            response as never,
        );

        expect(result).toBeInstanceOf(StreamableFile);
        expect(response.setHeader).toHaveBeenCalledWith(
            "Content-Disposition",
            'attachment; filename="studyflow-personal-data-2026-07-10.json"',
        );
        expect(response.setHeader).toHaveBeenCalledWith(
            "Cache-Control",
            "private, no-store",
        );
        expect(response.setHeader).toHaveBeenCalledWith("Content-Length", "2");
        expect(request.once).toHaveBeenCalledWith(
            "aborted",
            expect.any(Function),
        );
    });
});
