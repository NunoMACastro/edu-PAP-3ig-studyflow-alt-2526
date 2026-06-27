/**
 * Testa o comportamento de salas de estudo guiado e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";

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
const classId = "507f1f77bcf86cd799439014";
const roomId = "507f1f77bcf86cd799439015";

describe("GuidedStudyRoomsService", () => {
    it("cria sala apenas depois de validar ownership da turma", async () => {
        const { classesService, roomModel, service } = makeService();

        await expect(
            service.create(teacher, classId, {
                title: " Sala guiada ",
                description: " Preparação para teste ",
                materialIds: ["mat-1"],
            }),
        ).resolves.toMatchObject({
            _id: roomId,
            classId,
            teacherId: teacher.id,
            title: "Sala guiada",
            status: "OPEN",
        });
        expect(classesService.findOwnedClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(roomModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Sala guiada",
                description: "Preparação para teste",
                materialIds: ["mat-1"],
            }),
        );
    });

    it("bloqueia aluno a criar salas guiadas", async () => {
        const { classesService, service } = makeService();

        await expect(
            service.create(student, classId, {
                title: "Sala",
                description: "Descrição",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
    });

    it("lista para aluno apenas depois de validar inscrição", async () => {
        const { classesService, roomModel, service } = makeService();

        await expect(service.listForStudent(student, classId)).resolves.toHaveLength(1);
        expect(classesService.ensureStudentEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
        expect(roomModel.find).toHaveBeenCalledWith({
            classId: expect.any(Object),
            status: "OPEN",
        });
    });
});

/**
 * Cria fixture ou estrutura auxiliar de salas de estudo guiado para manter testes e prompts legíveis.
 * @returns Valor de salas de estudo guiado no contrato esperado pelo chamador.
 */
function makeService() {
    const room = {
        _id: roomId,
        classId,
        teacherId: teacher.id,
        title: "Sala guiada",
        description: "Preparação para teste",
        materialIds: ["mat-1"],
        status: "OPEN",
    };
    const roomModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => room }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([room]),
            }),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({ _id: classId, name: "12A" }),
        ensureStudentEnrollment: jest
            .fn()
            .mockResolvedValue({ _id: classId, name: "12A" }),
    };
    const service = new GuidedStudyRoomsService(
        roomModel as never,
        classesService as never,
    );
    return { classesService, roomModel, service };
}
