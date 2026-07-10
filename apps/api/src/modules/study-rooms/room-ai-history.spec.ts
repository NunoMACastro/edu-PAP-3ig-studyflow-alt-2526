/**
 * Testa a leitura privada do histórico da IA da sala.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiService } from "./room-ai.service.js";
import { createGovernedAiExecutionFixture } from "../ai/governed-ai-execution.test-fixture.js";

const roomId = "507f1f77bcf86cd799439014";
const otherRoomId = "507f1f77bcf86cd799439099";
const studentId = "507f1f77bcf86cd799439012";
const otherStudentId = "507f1f77bcf86cd799439013";

const student: AuthenticatedUser = {
    id: studentId,
    email: "aluno@example.test",
    role: "STUDENT",
};

describe("RoomAiService history", () => {
    it("devolve apenas histórico da sala e do aluno autenticado", async () => {
        const { historyQuery, interactionModel, service } = makeService();
        historyQuery.exec.mockResolvedValue([
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439111",
                roomId,
                studentId,
                question: "O que estudámos?",
                answer: "Estudámos equações.",
            }),
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439112",
                roomId,
                studentId: otherStudentId,
                question: "Pergunta de outro aluno",
                answer: "Resposta privada de outro aluno.",
            }),
        ]);

        const result = await service.listMyRoomAiHistory(student, roomId);

        expect(interactionModel.find).toHaveBeenCalledWith({
            roomId: new Types.ObjectId(roomId),
            studentId: new Types.ObjectId(studentId),
        });
        expect(historyQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(historyQuery.limit).toHaveBeenCalledWith(30);
        expect(result).toEqual([
            {
                _id: "507f1f77bcf86cd799439111",
                roomId,
                question: "O que estudámos?",
                answer: "Estudámos equações.",
                createdAt: new Date("2026-07-02T10:00:00.000Z"),
            },
        ]);
    });

    it("rejeita aluno que não pertence à sala antes da query", async () => {
        const { historyQuery, interactionModel, service, studyRoomsService } =
            makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_MEMBERSHIP_REQUIRED",
                message: "Não pertences a esta sala.",
            }),
        );

        await expect(service.listMyRoomAiHistory(student, roomId)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(interactionModel.find).not.toHaveBeenCalled();
        expect(historyQuery.exec).not.toHaveBeenCalled();
    });

    it("rejeita identificador de sala inválido", async () => {
        const { interactionModel, service, studyRoomsService } = makeService();

        await expect(
            service.listMyRoomAiHistory(student, "sala-invalida"),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(studyRoomsService.ensureMember).not.toHaveBeenCalled();
        expect(interactionModel.find).not.toHaveBeenCalled();
    });

    it("não devolve interações de outra sala mesmo que uma fixture venha misturada", async () => {
        const { historyQuery, service } = makeService();
        historyQuery.exec.mockResolvedValue([
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439121",
                roomId: otherRoomId,
                studentId,
                question: "Pergunta noutra sala",
                answer: "Resposta privada noutra sala.",
            }),
        ]);

        await expect(service.listMyRoomAiHistory(student, roomId)).resolves.toEqual([]);
    });

    it("não chama o provider de IA para listar histórico", async () => {
        const { aiProvider, historyQuery, service } = makeService();
        historyQuery.exec.mockResolvedValue([]);

        await service.listMyRoomAiHistory(student, roomId);

        expect(aiProvider.generateRoomAnswer).not.toHaveBeenCalled();
    });
});

/**
 * Cria uma instância testável do service com dependências substituídas por mocks.
 *
 * @returns Service e mocks necessários para verificar o comportamento do histórico.
 */
function makeService() {
    const historyQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };
    const interactionModel = {
        create: jest.fn(),
        find: jest.fn().mockReturnValue(historyQuery),
    };
    const aiProvider = {
        generateRoomAnswer: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const roomSharesService = {
        findUsableSharesForRoom: jest.fn(),
    };
    const studentProfileService = {
        getMyProfile: jest.fn(),
    };
    const service = new RoomAiService(
        interactionModel as never,
        createGovernedAiExecutionFixture(aiProvider),
        studyRoomsService as never,
        roomSharesService as never,
        studentProfileService as never,
    );

    return {
        aiProvider,
        historyQuery,
        interactionModel,
        roomSharesService,
        service,
        studentProfileService,
        studyRoomsService,
    };
}

/**
 * Cria um documento Mongoose mínimo para testar o mapeamento do histórico.
 *
 * @param input Dados essenciais da interação IA.
 * @returns Objeto com o contrato consumido por `RoomAiService`.
 */
function makeInteractionDocument(input: {
    id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
}) {
    return {
        _id: new Types.ObjectId(input.id),
        roomId: new Types.ObjectId(input.roomId),
        studentId: new Types.ObjectId(input.studentId),
        question: input.question,
        answer: input.answer,
        sourceShareIds: [],
        createdAt: new Date("2026-07-02T10:00:00.000Z"),
    };
}
