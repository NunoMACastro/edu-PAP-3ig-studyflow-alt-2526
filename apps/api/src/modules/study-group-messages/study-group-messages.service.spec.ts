/**
 * Testa o comportamento de mensagens de grupos de estudo e documenta os cenários de aceitação automatizados.
 */
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
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
                text: null,
                tombstoned: true,
            }),
        ]);
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
    };
    const studyGroupsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: groupId }),
    };
    const service = new StudyGroupMessagesService(
        messageModel as never,
        studyGroupsService as never,
    );
    return { messageModel, service, studyGroupsService };
}
