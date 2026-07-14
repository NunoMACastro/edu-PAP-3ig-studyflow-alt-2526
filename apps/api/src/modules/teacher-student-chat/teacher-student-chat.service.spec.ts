/**
 * Testa regras de autorização, persistência e limites do chat professor-aluno.
 */
import {
    BadRequestException,
    ForbiddenException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { TeacherStudentChatService } from "./teacher-student-chat.service.js";

const teacherId = "507f1f77bcf86cd799439011";
const studentId = "507f1f77bcf86cd799439012";
const subjectId = "507f1f77bcf86cd799439013";
const classId = "507f1f77bcf86cd799439014";
const threadId = "507f1f77bcf86cd799439015";
const messageId = "507f1f77bcf86cd799439016";
const messageCreatedAt = new Date("2026-07-02T09:00:00.000Z");

describe("TeacherStudentChatService", () => {
    const teacher: AuthenticatedUser = {
        id: teacherId,
        email: "professor@example.test",
        role: "TEACHER",
    };
    const student: AuthenticatedUser = {
        id: studentId,
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const admin: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439099",
        email: "admin@example.test",
        role: "ADMIN",
    };

    it("lista histórico para aluno inscrito sem criar thread em GET", async () => {
        const { service, subjectsService, threadModel, messageModel } = makeService();

        await expect(
            service.listStudentMessages(student, subjectId),
        ).resolves.toMatchObject([
            {
                _id: messageId,
                subjectId,
                authorRole: "TEACHER",
                text: "Bem-vindos.",
            },
        ]);
        expect(subjectsService.findSubjectForStudentHistory).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
        expect(threadModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(messageModel.find).toHaveBeenCalledWith({
            threadId: expect.any(Types.ObjectId),
        });
    });

    it("lista histórico para professor dono da disciplina", async () => {
        const { service, subjectsService } = makeService();

        await expect(
            service.listTeacherMessages(teacher, subjectId),
        ).resolves.toHaveLength(1);
        expect(subjectsService.findOwnedSubjectForHistory).toHaveBeenCalledWith(
            teacher.id,
            subjectId,
        );
    });

    it("cria mensagem derivando autor e papel da sessão", async () => {
        const { classLearningActivityService, messageModel, service } = makeService();

        await expect(
            service.sendMessage(student, subjectId, " Olá professor. "),
        ).resolves.toMatchObject({
            subjectId,
            classId,
            authorUserId: student.id,
            authorRole: "STUDENT",
            authorDisplayName: "Leonor Martins",
            text: "Olá professor.",
        });
        expect(messageModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                authorUserId: expect.any(Types.ObjectId),
                authorRole: "STUDENT",
                text: "Olá professor.",
            }),
        );
        expect(JSON.stringify(messageModel.create.mock.calls[0][0])).not.toContain(
            "professor@example.test",
        );
        expect(classLearningActivityService.recordBestEffort).toHaveBeenCalledWith({
            classId,
            studentId,
            subjectId,
            type: "OFFICIAL_CHAT_MESSAGE",
            sourceEventKey: `official-chat-message:${messageId}`,
            occurredAt: messageCreatedAt,
        });
    });

    it("rejeita mensagem vazia ou demasiado longa antes de persistir", async () => {
        const { messageModel, service } = makeService();

        await expect(
            service.sendMessage(student, subjectId, "   "),
        ).rejects.toBeInstanceOf(BadRequestException);
        await expect(
            service.sendMessage(student, subjectId, "x".repeat(4001)),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(messageModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia role fora do MVP", async () => {
        const { messageModel, service } = makeService();

        await expect(
            service.sendMessage(admin, subjectId, "Posso entrar?"),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(messageModel.create).not.toHaveBeenCalled();
    });

    it("aplica rate limit por utilizador e thread", async () => {
        const { messageModel, service } = makeService();
        messageModel.countDocuments.mockResolvedValue(10);

        await expect(
            service.sendMessage(student, subjectId, "Mais uma mensagem."),
        ).rejects.toMatchObject({
            response: {
                code: "SUBJECT_CHAT_RATE_LIMITED",
            },
        });
        expect(messageModel.create).not.toHaveBeenCalled();
        expect(messageModel.countDocuments).toHaveBeenCalledWith(
            expect.objectContaining({
                threadId: expect.any(Types.ObjectId),
                authorUserId: expect.any(Types.ObjectId),
            }),
        );
    });

    it("devolve mensagem eliminada como tombstone sem identidade ou texto", async () => {
        const { messageModel, service } = makeService();
        messageModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: messageId,
                            threadId,
                            subjectId,
                            classId,
                            tombstonedAt: new Date("2026-07-10T00:00:00Z"),
                        },
                    ]),
                }),
            }),
        });

        await expect(
            service.listStudentMessages(student, subjectId),
        ).resolves.toEqual([
            expect.objectContaining({
                authorUserId: null,
                authorRole: null,
                text: null,
                tombstoned: true,
            }),
        ]);
    });

    it("reutiliza a mensagem persistida num retry com a mesma chave", async () => {
        const { messageModel, service } = makeService();
        const clientMessageId = "123e4567-e89b-42d3-a456-426614174000";
        messageModel.findOne.mockReturnValueOnce(
            leanResult({
                _id: messageId,
                threadId,
                subjectId,
                classId,
                authorUserId: studentId,
                authorRole: "STUDENT",
                text: "Olá professor.",
                clientMessageId,
            }),
        );

        await expect(
            service.sendMessage(
                student,
                subjectId,
                "Olá professor.",
                clientMessageId,
            ),
        ).resolves.toMatchObject({ _id: messageId, text: "Olá professor." });
        expect(messageModel.create).not.toHaveBeenCalled();
        expect(messageModel.countDocuments).not.toHaveBeenCalled();
    });

    it("devolve contadores bulk apenas para mensagens docentes não lidas", async () => {
        const { messageModel, service } = makeService();
        messageModel.aggregate.mockResolvedValue([{
            _id: subjectId,
            unreadCount: 2,
            lastMessageAt: messageCreatedAt,
        }]);

        await expect(service.listStudentUnread(student)).resolves.toEqual([{
            subjectId,
            unreadCount: 2,
            lastMessageAt: messageCreatedAt,
        }]);
    });
});

/**
 * Cria fixtures do serviço para manter testes focados no domínio.
 *
 * @returns Service e mocks.
 */
function makeService() {
    const storedMessage = {
        _id: messageId,
        threadId,
        subjectId,
        classId,
        authorUserId: teacherId,
        authorRole: "TEACHER" as const,
        text: "Bem-vindos.",
    };
    const threadModel = {
        findOne: jest.fn().mockReturnValue(leanResult({ _id: threadId, subjectId })),
        findOneAndUpdate: jest.fn().mockResolvedValue({ _id: threadId, subjectId }),
    };
    const messageModel = {
        aggregate: jest.fn().mockResolvedValue([]),
        countDocuments: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(async (input) => ({
            /**
             * Devolve a forma Mongoose esperada pelo service.
             *
             * @returns Documento simples para teste.
             */
            toObject: () => ({ _id: messageId, ...input, createdAt: messageCreatedAt }),
        })),
        findOne: jest.fn().mockReturnValue(leanResult(null)),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([storedMessage]),
                }),
            }),
        }),
    };
    const subjectsService = {
        findOwnedSubjectForHistory: jest.fn().mockResolvedValue(subjectView()),
        findOwnedSubject: jest.fn().mockResolvedValue(subjectView()),
        findSubjectForStudentHistory: jest.fn().mockResolvedValue({
            subject: subjectView(),
            schoolClass: { _id: classId, status: "ARCHIVED" },
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: subjectView(),
            schoolClass: { _id: classId },
        }),
    };
    const classLearningActivityService = {
        recordBestEffort: jest.fn().mockResolvedValue(true),
    };
    const readStateModel = {
        findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
    };
    const classesService = {
        listStudentClasses: jest.fn().mockResolvedValue([{ _id: classId }]),
    };
    Object.assign(subjectsService, {
        listStudentClassSubjects: jest.fn().mockResolvedValue([subjectView()]),
    });
    const studentProfileService = {
        resolvePublicDisplayNames: jest.fn().mockImplementation(async (ids: string[]) =>
            new Map(ids.map((id) => [id, "Leonor Martins"])),
        ),
    };
    const service = new TeacherStudentChatService(
        threadModel as never,
        messageModel as never,
        subjectsService as never,
        classLearningActivityService as never,
        readStateModel as never,
        classesService as never,
        studentProfileService as never,
    );

    return {
        classLearningActivityService,
        messageModel,
        service,
        subjectsService,
        threadModel,
    };
}

/**
 * Cria uma disciplina pública autorizada.
 *
 * @returns Disciplina usada nos testes.
 */
function subjectView() {
    return {
        _id: subjectId,
        classId,
        teacherId,
        name: "Matemática A",
        code: "MAT-A",
    };
}

/**
 * Simula uma chamada Mongoose com `lean`.
 *
 * @param value Valor resolvido.
 * @returns Query parcial.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}
