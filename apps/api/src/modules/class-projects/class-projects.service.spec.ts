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
            }),
        ).resolves.toMatchObject({
            _id: projectId,
            classId,
            teacherId: teacher.id,
            title: "Projecto PAP",
            status: "DRAFT",
        });
        expect(classesService.findOwnedActiveClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(projectModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Projecto PAP",
                brief: "Construir MVP",
                status: "DRAFT",
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

    it("publica explicitamente o rascunho e enfileira uma única notificação", async () => {
        const { notificationsService, projectModel, service } = makeService();

        await expect(
            service.publish(teacher, classId, projectId),
        ).resolves.toMatchObject({ status: "PUBLISHED" });
        expect(projectModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ status: "DRAFT" }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "PUBLISHED" }),
            }),
            { new: true, runValidators: true },
        );
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                idempotencyKey: `class-project:${projectId}:published`,
                type: "CLASS_PROJECT_PUBLISHED",
            }),
        );
    });

    it("usa a mesma sessão na publicação e no enqueue", async () => {
        const session = { id: "session-class-project" };
        const connection = {
            transaction: jest.fn(
                async (operation: (value: unknown) => Promise<unknown>) =>
                    operation(session),
            ),
        };
        const { notificationsService, projectModel, service } = makeService(connection);

        await service.publish(teacher, classId, projectId);

        expect(projectModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ status: "DRAFT" }),
            expect.any(Object),
            expect.objectContaining({ session }),
        );
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                idempotencyKey: `class-project:${projectId}:published`,
            }),
            session,
        );
    });

    it("repara idempotentemente a outbox de um projeto legacy já publicado", async () => {
        const { notificationsService, projectModel, service } = makeService();
        projectModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: projectId,
                classId,
                teacherId: teacher.id,
                title: "Projecto PAP",
                brief: "Construir MVP",
                status: "PUBLISHED",
            }),
        });
        projectModel.findOneAndUpdate.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.publish(teacher, classId, projectId),
        ).resolves.toMatchObject({ status: "PUBLISHED" });
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                idempotencyKey: `class-project:${projectId}:published`,
            }),
        );
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

    it("atualiza o progresso privado e permite reabrir um projeto", async () => {
        const { service, studentStateModel } = makeService();
        studentStateModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                projectId,
                status: "IN_PROGRESS",
            }),
        });

        await expect(
            service.updateStudentProgress(student, projectId, "IN_PROGRESS"),
        ).resolves.toMatchObject({ myProgress: "IN_PROGRESS" });
        expect(studentStateModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ projectId: expect.anything() }),
            expect.objectContaining({ $set: expect.objectContaining({ status: "IN_PROGRESS" }) }),
            expect.objectContaining({ upsert: true }),
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de projetos da turma para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(connection?: unknown) {
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
            toObject: () => ({ ...project, status: "DRAFT" }),
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([project]),
            }),
        }),
        findOne: jest.fn().mockImplementation((query) => ({
            lean: jest.fn().mockResolvedValue(
                query?.status === "PUBLISHED"
                    ? project
                    : { ...project, status: "DRAFT" },
            ),
        })),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(project),
        }),
    };
    const classesService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedClass: jest.fn().mockResolvedValue({ _id: classId }),
        findOwnedActiveClass: jest.fn().mockResolvedValue({ _id: classId }),
        ensureStudentEnrollment: jest.fn().mockResolvedValue({ _id: classId }),
        ensureStudentHistoricalEnrollment: jest
            .fn()
            .mockResolvedValue({ _id: classId }),
    };
    const subjectsService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedSubject: jest.fn(),
    };
    const notificationsService = {
        enqueueClassEvent: jest.fn().mockResolvedValue({ state: "PENDING" }),
    };
    const studentStateModel = {
        find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
        findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
        findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ClassProjectsService(
        projectModel as never,
        classesService as never,
        subjectsService as never,
        notificationsService as never,
        connection as never,
        studentStateModel as never,
    );
    return {
        classesService,
        notificationsService,
        projectModel,
        service,
        subjectsService,
        studentStateModel,
    };
}
