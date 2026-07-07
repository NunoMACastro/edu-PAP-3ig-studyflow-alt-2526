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
        expect(classesService.ensureStudentEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de publicações da turma para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const postModel = {
        create: jest.fn(),
        find: jest.fn(),
    };
    const classesService = {
        ensureStudentEnrollment: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: ["507f1f77bcf86cd799439013"],
        }),
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
        }),
    };
    const service = new ClassPostsService(postModel as never, classesService as never);
    return { classesService, postModel, service };
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
