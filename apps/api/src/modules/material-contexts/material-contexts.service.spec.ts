/**
 * Testa o comportamento de material contexts e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialContextsService } from "./material-contexts.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "professor@example.test",
    role: "TEACHER",
};
const studyAreaId = "507f1f77bcf86cd799439014";
const subjectId = "507f1f77bcf86cd799439015";
const materialId = "507f1f77bcf86cd799439016";

describe("MaterialContextsService", () => {
    it("persiste contexts da área privada do aluno", async () => {
        const { contextModel, service } = makeService();

        await expect(
            service.listPrivateArea(student, studyAreaId),
        ).resolves.toMatchObject({
            context: "PRIVATE_AREA",
            studyAreaId,
            contexts: [{ scope: "PRIVATE_AREA", source: "student", materialId }],
        });
        expect(contextModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                scope: "PRIVATE_AREA",
                contextId: expect.any(Types.ObjectId),
                materialId: expect.any(Types.ObjectId),
            },
            expect.objectContaining({
                $set: expect.objectContaining({ source: "student" }),
            }),
            { new: true, upsert: true },
        );
    });

    it("persiste contexts oficiais diferentes para aluno e professor", async () => {
        const { service } = makeService();

        await expect(
            service.listOfficialSubject(student, subjectId),
        ).resolves.toMatchObject({
            context: "OFFICIAL_SUBJECT",
            contexts: [{ source: "class", teacherId: teacher.id }],
        });
        await expect(
            service.listOfficialSubject(teacher, subjectId),
        ).resolves.toMatchObject({
            context: "OFFICIAL_SUBJECT",
            contexts: [{ source: "teacher", teacherId: teacher.id }],
        });
    });

    it("bloqueia contexts privados fora do papel STUDENT", async () => {
        const { service } = makeService();

        await expect(
            service.listPrivateArea(teacher, studyAreaId),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de contextos pedagógicos de materiais para manter testes e prompts legíveis.
 * @returns Valor de contextos pedagógicos de materiais no contrato esperado pelo chamador.
 */
function makeService() {
    const contextModel = {
        findOneAndUpdate: jest.fn().mockImplementation((query, update) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439099",
                scope: query.scope,
                contextId: query.contextId,
                materialId: query.materialId,
                title: update.$set.title,
                source: update.$set.source,
                studentId: update.$set.studentId,
                teacherId: update.$set.teacherId,
            }),
        })),
    };
    const materialsService = {
        listByArea: jest.fn().mockResolvedValue([
            { _id: materialId, title: "Limites" },
        ]),
    };
    const officialMaterialsService = {
        findProcessedBySubject: jest.fn().mockResolvedValue([
            { _id: materialId, title: "Limites", teacherId: teacher.id },
        ]),
        listTeacherSubjectMaterials: jest.fn().mockResolvedValue([
            { _id: materialId, title: "Limites", teacherId: teacher.id },
        ]),
    };
    const subjectsService = {
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId },
        }),
        findOwnedSubject: jest.fn().mockResolvedValue({ _id: subjectId }),
    };
    const service = new MaterialContextsService(
        contextModel as never,
        materialsService as never,
        officialMaterialsService as never,
        subjectsService as never,
    );
    return { contextModel, service };
}
