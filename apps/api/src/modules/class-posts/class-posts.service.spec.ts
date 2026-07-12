/**
 * Testa o comportamento de turma posts e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassPostsService } from "./class-posts.service.js";

const classId = "507f1f77bcf86cd799439014";
const postId = "507f1f77bcf86cd799439015";

describe("ClassPostsService", () => {
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

    it("cria publicação apenas depois de validar ownership do professor", async () => {
        const { postModel, service } = makeService();
        postModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para publicações de turma, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: postId,
                classId,
                teacherId: teacher.id,
                type: "NOTICE",
                title: "Teste",
                body: "O teste é amanhã.",
            }),
        });

        await expect(
            service.createPost(teacher, classId, {
                type: "NOTICE",
                title: " Teste ",
                body: " O teste é amanhã. ",
            }),
        ).resolves.toMatchObject({
            _id: postId,
            classId,
            teacherId: teacher.id,
            title: "Teste",
            body: "O teste é amanhã.",
        });
        expect(postModel.create).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
            teacherId: expect.any(Types.ObjectId),
            type: "NOTICE",
            title: "Teste",
            body: "O teste é amanhã.",
        });
    });

    it("usa a mesma sessão para persistir a publicação e enfileirar o evento", async () => {
        const session = { id: "session-class-post" };
        const connection = {
            transaction: jest.fn(
                async (operation: (value: unknown) => Promise<unknown>) =>
                    operation(session),
            ),
        };
        const { notificationsService, postModel, service } = makeService(connection);
        const document = {
            _id: postId,
            classId,
            teacherId: teacher.id,
            type: "NOTICE",
            title: "Teste",
            body: "O teste é amanhã.",
        };
        postModel.create.mockResolvedValueOnce([
            { toObject: () => document },
        ]);

        await service.createPost(teacher, classId, {
            type: "NOTICE",
            title: "Teste",
            body: "O teste é amanhã.",
        });

        expect(postModel.create).toHaveBeenCalledWith(
            [expect.objectContaining({ title: "Teste" })],
            { session },
        );
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                idempotencyKey: `class-post:${postId}:published`,
            }),
            session,
        );
    });

    it("bloqueia criação de publicações por alunos", async () => {
        const { classesService, postModel, service } = makeService();

        await expect(
            service.createPost(student, classId, {
                type: "POST",
                title: "Pergunta",
                body: "Posso publicar?",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
        expect(postModel.create).not.toHaveBeenCalled();
    });

    it("lista publicações para alunos apenas depois de confirmar inscrição", async () => {
        const { classesService, postModel, service } = makeService();
        postModel.find.mockReturnValue(
            sortLeanResult([
                {
                    _id: postId,
                    classId,
                    teacherId: teacher.id,
                    type: "POST",
                    title: "Resumo",
                    body: "Ler páginas 10-12.",
                },
            ]),
        );

        await expect(
            service.listStudentPosts(student, classId),
        ).resolves.toMatchObject([
            {
                _id: postId,
                classId,
                title: "Resumo",
            },
        ]);
        expect(classesService.ensureStudentHistoricalEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
    });

    it("devolve publicações eliminadas como tombstones explícitos", async () => {
        const { postModel, service } = makeService();
        postModel.find.mockReturnValue(
            sortLeanResult([
                {
                    _id: postId,
                    classId,
                    type: "POST",
                    tombstonedAt: new Date("2026-07-10T00:00:00Z"),
                },
            ]),
        );

        await expect(service.listStudentPosts(student, classId)).resolves.toEqual([
            expect.objectContaining({
                title: null,
                body: null,
                tombstoned: true,
            }),
        ]);
        const [post] = await service.listStudentPosts(student, classId);
        expect(post).not.toHaveProperty("teacherId");
    });
});

/**
 * Cria fixture ou estrutura auxiliar de publicações da turma para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(connection?: unknown) {
    const postModel = {
        create: jest.fn(),
        find: jest.fn(),
    };
    const classesService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        ensureStudentEnrollment: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: ["507f1f77bcf86cd799439013"],
        }),
        ensureStudentHistoricalEnrollment: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: ["507f1f77bcf86cd799439013"],
            status: "ACTIVE",
        }),
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
        }),
        findOwnedActiveClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
            status: "ACTIVE",
        }),
    };
    const notificationsService = {
        enqueueClassEvent: jest.fn().mockResolvedValue({ state: "PENDING" }),
    };
    const service = new ClassPostsService(
        postModel as never,
        classesService as never,
        notificationsService as never,
        connection as never,
    );
    return { classesService, notificationsService, postModel, service };
}

/**
 * Executa a operação lean result no domínio de publicações da turma com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Executa a operação sort lean result no domínio de publicações da turma com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function sortLeanResult(value: unknown) {
    return { sort: jest.fn().mockReturnValue(leanResult(value)) };
}
