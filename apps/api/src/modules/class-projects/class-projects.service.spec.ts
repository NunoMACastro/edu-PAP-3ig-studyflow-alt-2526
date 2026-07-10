/**
 * Testa o comportamento de turma projects e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassProjectsService } from "./class-projects.service.js";

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
const projectId = "507f1f77bcf86cd799439015";

describe("ClassProjectsService", () => {
    it("cria projecto docente em turma validada", async () => {
        const { classesService, projectModel, service } = makeService();

        await expect(
            service.create(teacher, classId, {
                title: " Projecto PAP ",
                brief: " Construir MVP ",
                status: "PUBLISHED",
            }),
        ).resolves.toMatchObject({
            _id: projectId,
            classId,
            teacherId: teacher.id,
            title: "Projecto PAP",
            status: "PUBLISHED",
        });
        expect(classesService.findOwnedClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(projectModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Projecto PAP",
                brief: "Construir MVP",
                status: "PUBLISHED",
            }),
        );
    });

    it("bloqueia aluno a criar projecto docente", async () => {
        const { classesService, service } = makeService();

        await expect(
            service.create(student, classId, {
                title: "Projecto",
                brief: "Brief",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
    });

    it("devolve apenas projecto publicado depois de validar inscrição do aluno", async () => {
        const { classesService, service } = makeService();

        await expect(
            service.findPublishedForStudent(student.id, projectId),
        ).resolves.toMatchObject({
            _id: projectId,
            status: "PUBLISHED",
        });
        expect(classesService.ensureStudentEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
    });

    it("rejeita id invalido sem consultar a base de dados", async () => {
        const { classesService, projectModel, service } = makeService();

        await expect(
            service.findPublishedForStudent(student.id, "id-invalido"),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(projectModel.findOne).not.toHaveBeenCalled();
        expect(classesService.ensureStudentEnrollment).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de projetos da turma para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const project = {
        _id: projectId,
        classId,
        teacherId: teacher.id,
        title: "Projecto PAP",
        brief: "Construir MVP",
        status: "PUBLISHED",
    };
    const projectModel = {
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve o projeto criado no formato simples esperado pelo service em teste.
             *
             * @returns Projeto sem métodos Mongoose reais.
             */
            toObject: () => project,
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([project]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(project),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({ _id: classId }),
        ensureStudentEnrollment: jest.fn().mockResolvedValue({ _id: classId }),
    };
    const service = new ClassProjectsService(
        projectModel as never,
        classesService as never,
    );
    return { classesService, projectModel, service };
}
