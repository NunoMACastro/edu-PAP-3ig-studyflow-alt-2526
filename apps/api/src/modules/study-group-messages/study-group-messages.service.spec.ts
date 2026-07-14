/**
 * Testa o comportamento de mensagens de grupos de estudo e documenta os cenários de aceitação automatizados.
 */
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ForbiddenException } from "@nestjs/common";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

const groupId = "507f1f77bcf86cd799439013";

describe("StudyGroupMessagesService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    it("cria mensagem apenas depois de validar membership", async () => {
        const { messageModel, service, studyGroupsService } = makeService();

        await expect(
            service.createMessage(student, groupId, {
                kind: "MESSAGE",
                text: " Vamos estudar funções. ",
            }),
        ).resolves.toMatchObject({
            groupId,
            authorStudentId: student.id,
            text: "Vamos estudar funções.",
        });
        expect(studyGroupsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
        );
        expect(messageModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Vamos estudar funções." }),
        );
    });

    it("lista mensagens apenas para membros do grupo", async () => {
        const { service, studyGroupsService } = makeService();

        await expect(service.listMessages(student, groupId)).resolves.toHaveLength(1);
        expect(studyGroupsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
        );
    });

    it("devolve tombstone explícito sem reconstruir autor ou conteúdo", async () => {
        const { messageModel, service } = makeService();
        messageModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: "507f1f77bcf86cd799439099",
                            groupId,
                            kind: "MESSAGE",
                            tombstonedAt: new Date("2026-07-10T00:00:00Z"),
                        },
                    ]),
                }),
            }),
        });

        await expect(service.listMessages(student, groupId)).resolves.toEqual([
            expect.objectContaining({
                authorStudentId: null,
                authorDisplayName: null,
                text: null,
                tombstoned: true,
            }),
        ]);
    });

    it("rejeita roles diferentes de STUDENT antes de consultar membership", async () => {
        const { messageModel, service, studyGroupsService } = makeService();
        await expect(service.listMessages({ ...student, role: "TEACHER" }, groupId))
            .rejects.toBeInstanceOf(ForbiddenException);
        expect(studyGroupsService.ensureMember).not.toHaveBeenCalled();
        expect(messageModel.find).not.toHaveBeenCalled();
    });

    it("reutiliza retry idempotente antes do rate limit", async () => {
        const { messageModel, service } = makeService();
        const clientMessageId = "123e4567-e89b-42d3-a456-426614174000";
        messageModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439099",
                groupId,
                authorStudentId: student.id,
                kind: "MESSAGE",
                text: "Olá grupo.",
                clientMessageId,
            }),
        });

        await expect(service.sendRealtimeMessage(
            student,
            groupId,
            "Olá grupo.",
            clientMessageId,
        )).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439099",
            authorDisplayName: "Leonor Martins",
        });
        expect(messageModel.countDocuments).not.toHaveBeenCalled();
        expect(messageModel.create).not.toHaveBeenCalled();
    });

    it("persiste MESSAGE, aplica rate limit por aluno/grupo e valida UUID v4", async () => {
        const { messageModel, service } = makeService();
        const clientMessageId = "123e4567-e89b-42d3-a456-426614174000";

        await expect(service.sendRealtimeMessage(
            student,
            groupId,
            " Em direto ",
            clientMessageId,
        )).resolves.toMatchObject({ kind: "MESSAGE", text: "Em direto" });
        expect(messageModel.countDocuments).toHaveBeenCalledWith(expect.objectContaining({
            groupId: expect.anything(),
            authorStudentId: expect.anything(),
            kind: "MESSAGE",
        }));
        await expect(service.sendRealtimeMessage(student, groupId, "Outra", "inválido"))
            .rejects.toMatchObject({ response: { code: "STUDY_GROUP_CHAT_CLIENT_MESSAGE_ID_INVALID" } });
    });

    it("rejeita vazio, texto acima de 4000 e o 11.º envio da janela", async () => {
        const validId = "123e4567-e89b-42d3-a456-426614174000";
        const first = makeService();
        await expect(first.service.sendRealtimeMessage(student, groupId, "   ", validId))
            .rejects.toMatchObject({ response: { code: "STUDY_GROUP_CHAT_EMPTY_MESSAGE" } });
        await expect(first.service.sendRealtimeMessage(student, groupId, "x".repeat(4001), validId))
            .rejects.toMatchObject({ response: { code: "STUDY_GROUP_CHAT_MESSAGE_TOO_LONG" } });
        first.messageModel.countDocuments.mockResolvedValue(10);
        await expect(first.service.sendRealtimeMessage(student, groupId, "Mais uma", validId))
            .rejects.toMatchObject({ response: { code: "STUDY_GROUP_CHAT_RATE_LIMITED" } });
        expect(first.messageModel.create).not.toHaveBeenCalled();
    });

    it("resolve colisão concorrente do índice sem duplicar o documento", async () => {
        const { messageModel, service } = makeService();
        const validId = "123e4567-e89b-42d3-a456-426614174000";
        const persisted = {
            _id: "507f1f77bcf86cd799439099",
            groupId,
            authorStudentId: student.id,
            kind: "MESSAGE" as const,
            text: "Concorrente",
        };
        messageModel.create.mockRejectedValueOnce({ code: 11000 });
        messageModel.findOne
            .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) })
            .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(persisted) });
        await expect(service.sendRealtimeMessage(student, groupId, "Concorrente", validId))
            .resolves.toMatchObject({ _id: persisted._id, text: "Concorrente" });
        expect(messageModel.create).toHaveBeenCalledTimes(1);
    });

    it("devolve unread agregado apenas para grupos atuais", async () => {
        const { messageModel, service, studyGroupsService } = makeService();
        studyGroupsService.listMyGroups.mockResolvedValue([{ _id: groupId }]);
        messageModel.aggregate.mockResolvedValue([{
            _id: groupId,
            unreadCount: 2,
            lastMessageAt: new Date("2026-07-14T10:00:00Z"),
        }]);
        await expect(service.listStudentUnread(student)).resolves.toEqual([{
            groupId,
            unreadCount: 2,
            lastMessageAt: new Date("2026-07-14T10:00:00Z"),
        }]);
    });

    it("reutiliza o serviço para salas sem consultar membership de grupos", async () => {
        const { messageModel, service, studyGroupsService, studyRoomsService } = makeService();

        await expect(service.sendRealtimeMessage(
            student,
            groupId,
            "Mensagem da sala",
            "123e4567-e89b-42d3-a456-426614174000",
            "STUDY_ROOM",
        )).resolves.toMatchObject({ groupId, text: "Mensagem da sala" });

        expect(studyRoomsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
            "STUDY_ROOM",
        );
        expect(studyGroupsService.ensureMember).not.toHaveBeenCalled();
        expect(messageModel.create).toHaveBeenCalledWith(expect.objectContaining({
            collaborationKind: "STUDY_ROOM",
        }));
    });
});

/**
 * Cria fixture ou estrutura auxiliar de mensagens do grupo de estudo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const storedMessage = {
        _id: "507f1f77bcf86cd799439099",
        groupId,
        authorStudentId: "507f1f77bcf86cd799439012",
        kind: "MESSAGE" as const,
        text: "Vamos estudar funções.",
    };
    const messageModel = {
        aggregate: jest.fn().mockResolvedValue([]),
        countDocuments: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(async (input) => ({
            /**
             * Transforma o apoio de teste para study group messages, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439099",
                ...input,
            }),
        })),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([storedMessage]),
                }),
            }),
        }),
        findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    };
    const studyGroupsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: groupId }),
        listMyGroups: jest.fn().mockResolvedValue([]),
    };
    const readStateModel = { findOneAndUpdate: jest.fn() };
    const studentProfileService = {
        resolvePublicDisplayNames: jest.fn().mockImplementation(async (ids: string[]) =>
            new Map(ids.map((id) => [id, "Leonor Martins"])),
        ),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: groupId }),
        listMyRooms: jest.fn().mockResolvedValue([]),
    };
    const service = new StudyGroupMessagesService(
        messageModel as never,
        studyGroupsService as never,
        readStateModel as never,
        studentProfileService as never,
        studyRoomsService as never,
    );
    return { messageModel, readStateModel, service, studyGroupsService, studyRoomsService };
}
