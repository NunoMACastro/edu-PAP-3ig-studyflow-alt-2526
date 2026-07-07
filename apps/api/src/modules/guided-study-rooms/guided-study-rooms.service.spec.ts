/**
 * Testa o comportamento de salas de estudo guiado e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
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
const subjectId = "507f1f77bcf86cd799439016";

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

    it("cria sala com disciplina opcional da mesma turma", async () => {
        const { roomModel, service, subjectsService } = makeService();

        await expect(
            service.create(teacher, classId, {
                title: "Sala guiada",
                description: "Preparação para teste",
                subjectId,
            }),
        ).resolves.toMatchObject({
            _id: roomId,
            classId,
            subjectId,
            title: "Sala guiada",
        });
        expect(subjectsService.findOwnedSubject).toHaveBeenCalledWith(
            teacher.id,
            subjectId,
        );
        expect(roomModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                subjectId: expect.any(Object),
            }),
        );
    });

    it("rejeita disciplina opcional que não pertence à turma da sala", async () => {
        const { roomModel, service, subjectsService } = makeService();
        subjectsService.findOwnedSubject.mockResolvedValueOnce({
            _id: subjectId,
            classId: "507f1f77bcf86cd799439099",
            teacherId: teacher.id,
            name: "Física",
            code: "FIS",
        });

        await expect(
            service.create(teacher, classId, {
                title: "Sala guiada",
                description: "Preparação para teste",
                subjectId,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(roomModel.create).not.toHaveBeenCalled();
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
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const room = {
        _id: roomId,
        classId,
        teacherId: teacher.id,
        title: "Sala guiada",
        description: "Preparação para teste",
        materialIds: ["mat-1"],
        subjectId,
        status: "OPEN",
    };
    const roomModel = {
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve a sala criada no formato simples esperado pelo service em teste.
             *
             * @returns Sala de estudo guiado sem métodos Mongoose reais.
             */
            toObject: () => room,
        }),
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
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
        }),
    };
    const service = new GuidedStudyRoomsService(
        roomModel as never,
        classesService as never,
        subjectsService as never,
    );
    return { classesService, roomModel, service, subjectsService };
}
