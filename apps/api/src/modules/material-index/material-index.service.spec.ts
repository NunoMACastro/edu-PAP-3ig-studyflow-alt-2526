// apps/api/src/modules/material-index/material-index.service.spec.ts
/**
 * Testa o pipeline de indexação de materiais privados e oficiais.
 */
import { Types } from "mongoose";
import { MaterialIndexService } from "./material-index.service.js";

const student = {
    id: "507f1f77bcf86cd799439012",
    email: "student@example.com",
    role: "STUDENT" as const,
};
const studyAreaId = "507f1f77bcf86cd799439011";
const materialId = "507f1f77bcf86cd799439010";

describe("MaterialIndexService", () => {
    it("falha job quando PDF não tem texto legível", async () => {
        const { documentSafety, jobModel, materialsService, service } = makeService({
            title: "PDF vazio",
            type: "PDF",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            storageKey: "private/pdf-vazio.pdf",
        });
        materialsService.readStoredFile.mockResolvedValueOnce(Buffer.from("%PDF-conteudo"));
        documentSafety.runWithTimeout.mockResolvedValueOnce("   ");

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "O material não tem texto legível para estudar.",
        });

        // Texto vazio não pode ser marcado como READY nem alimentar fluxos de IA.
        expect(materialsService.markIndexedText).not.toHaveBeenCalled();
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "FAILED",
                errorMessage: "O material não tem texto legível para estudar.",
            }),
        );
    });

    it("normaliza texto extraído antes de criar chunks", async () => {
        const { jobModel, materialsService, service } = makeService({
            title: "Tópico",
            type: "TOPIC",
            contentText: "  func\u0327a\u0303o quadrática  ",
        });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "DONE",
            extractedTextChunks: [{ order: 1, text: "função quadrática" }],
        });

        expect(materialsService.markIndexedText).toHaveBeenCalledWith(
            student.id,
            materialId,
            "função quadrática",
        );
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "DONE",
                extractedTextChunks: expect.arrayContaining([
                    expect.objectContaining({ text: "função quadrática" }),
                ]),
            }),
        );
    });
});

/**
 * Cria a estrutura auxiliar Mockada para isolar os testes do MaterialIndexService.
 */
function makeService(materialSnapshot: Record<string, unknown>) {
    const jobModel = {
        create: jest.fn().mockImplementation((dto) => Promise.resolve({
            _id: new Types.ObjectId(),
            ...dto,
            toObject: () => ({ _id: new Types.ObjectId(), ...dto }),
        })),
        findById: jest.fn(),
    };

    const materialsService = {
        findOwnedTextMaterial: jest.fn().mockResolvedValue(materialSnapshot),
        readStoredFile: jest.fn(),
        markIndexedText: jest.fn().mockResolvedValue(undefined),
    };

    const officialMaterialsService = {
        findOwnedMaterial: jest.fn(),
        markIndexedText: jest.fn().mockResolvedValue(undefined),
    };

    const subjectsService = {
        findSubjectForStudent: jest.fn(),
    };

    const documentSafety = {
        assertSafeStoredDocument: jest.fn(),
        runWithTimeout: jest.fn(),
    };

    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        jobModel,
        materialsService,
        officialMaterialsService,
        subjectsService,
        documentSafety,
        auditLogService,
        service: new MaterialIndexService(
            jobModel as never,
            materialsService as never,
            officialMaterialsService as never,
            subjectsService as never,
            documentSafety as never,
        ),
    };
}