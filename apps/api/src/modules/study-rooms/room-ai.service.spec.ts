/**
 * Testa o comportamento de salas de estudo e documenta os cenários de aceitação automatizados.
 */
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiService } from "./room-ai.service.js";

const roomId = "507f1f77bcf86cd799439014";
const shareId = "507f1f77bcf86cd799439015";

describe("RoomAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("não chama o provider quando a sala não tem fontes processáveis", async () => {
        const { aiProvider, interactionModel, roomSharesService, service } =
            makeService();
        roomSharesService.findUsableSharesForRoom.mockResolvedValue([]);

        await expect(
            service.askRoomAi(student, roomId, { question: "O que foi partilhado?" }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateRoomAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("devolve 503 quando o provider inventa fontes da sala", async () => {
        const { aiProvider, interactionModel, service } = makeService();
        aiProvider.generateRoomAnswer.mockResolvedValue({
            answer: "Resumo da sala.",
            sourceShareIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askRoomAi(student, roomId, { question: "O que foi partilhado?" }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(interactionModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de salas de estudo para manter testes e prompts legíveis.
 * @returns Valor de salas de estudo no contrato esperado pelo chamador.
 */
function makeService() {
    const interactionModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateRoomAnswer: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const roomSharesService = {
        findUsableSharesForRoom: jest.fn().mockResolvedValue([
            {
                shareId,
                title: "Apontamentos",
                contentText: "Conteúdo partilhado na sala.",
            },
        ]),
    };
    const service = new RoomAiService(
        interactionModel as never,
        aiProvider as never,
        studyRoomsService as never,
        roomSharesService as never,
    );
    return {
        aiProvider,
        interactionModel,
        roomSharesService,
        service,
        studyRoomsService,
    };
}
