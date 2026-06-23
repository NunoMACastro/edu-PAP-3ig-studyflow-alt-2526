/**
 * Testa o comportamento de materiais oficiais e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialMaterialsService } from "./official-materials.service.js";

const subjectId = "507f1f77bcf86cd799439015";
const classId = "507f1f77bcf86cd799439014";

describe("OfficialMaterialsService", () => {
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("guarda material TEXT como PROCESSED e fonte usável para IA", async () => {
        const { auditLogService, materialModel, service } = makeService();
        materialModel.create.mockResolvedValue({
            toObject: () => ({
                _id: "507f1f77bcf86cd799439016",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Derivadas",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Derivadas medem taxas de variação.",
            }),
        });

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: " Derivadas ",
                type: "TEXT",
                textContent: " Derivadas medem taxas de variação. ",
            }),
        ).resolves.toMatchObject({
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Derivadas medem taxas de variação.",
        });
        expect(materialModel.create).toHaveBeenCalledWith({
            subjectId: expect.any(Types.ObjectId),
            classId: expect.any(Types.ObjectId),
            teacherId: expect.any(Types.ObjectId),
            title: "Derivadas",
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Derivadas medem taxas de variação.",
            sourceUrl: undefined,
        });
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: teacher.id,
                domain: "MATERIALS",
                action: "OFFICIAL_MATERIAL_CREATED",
                resourceType: "OfficialMaterial",
                result: "SUCCESS",
            }),
        );
    });

    it("guarda material URL como REFERENCE_ONLY", async () => {
        const { materialModel, service } = makeService();
        materialModel.create.mockResolvedValue({
            toObject: () => ({
                _id: "507f1f77bcf86cd799439017",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Artigo",
                type: "URL",
                status: "REFERENCE_ONLY",
                sourceUrl: "https://example.test/artigo",
            }),
        });

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Artigo",
                type: "URL",
                sourceUrl: "https://example.test/artigo",
            }),
        ).resolves.toMatchObject({
            type: "URL",
            status: "REFERENCE_ONLY",
            sourceUrl: "https://example.test/artigo",
        });
    });

    it("bloqueia criação por alunos", async () => {
        const { materialModel, subjectsService, service } = makeService();

        await expect(
            service.createOfficialMaterial(student, subjectId, {
                title: "Derivadas",
                type: "TEXT",
                textContent: "Derivadas medem taxas de variação.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("rejeita URLs oficiais sem protocolo http/https", async () => {
        const { materialModel, service } = makeService();

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Artigo",
                type: "URL",
                sourceUrl: "javascript:alert(1)",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("rejeita material TEXT sem conteúdo útil depois de trim", async () => {
        const { materialModel, service } = makeService();

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Derivadas",
                type: "TEXT",
                textContent: "                        ",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(materialModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de materiais oficiais para manter testes e prompts legíveis.
 * @returns Valor de materiais oficiais no contrato esperado pelo chamador.
 */
function makeService() {
    const materialModel = {
        create: jest.fn(),
        find: jest.fn(),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "Matemática A",
            code: "MAT-A",
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const service = new OfficialMaterialsService(
        materialModel as never,
        subjectsService as never,
        auditLogService as never,
    );
    return { auditLogService, materialModel, service, subjectsService };
}
