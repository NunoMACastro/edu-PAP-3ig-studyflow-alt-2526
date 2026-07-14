/**
 * Testa partilha read-only e fork privado de respostas IA da sala.
 */
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiSharingService } from "./room-ai-sharing.service.js";
import { RoomAiVisibility } from "./schemas/room-ai-interaction.schema.js";

const roomId = "507f1f77bcf86cd799439014";
const answerId = "507f1f77bcf86cd799439015";
const studentId = "507f1f77bcf86cd799439012";
const otherStudentId = "507f1f77bcf86cd799439013";

describe("RoomAiSharingService", () => {
    const student: AuthenticatedUser = {
        id: studentId,
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("lista respostas partilhadas apenas depois de validar membership", async () => {
        const { interactionModel, listQuery, service, studyRoomsService } =
            makeService();
        listQuery.exec.mockResolvedValue([
            makeInteractionPlain({
                _id: answerId,
                roomId,
                studentId: otherStudentId,
                visibility: "SHARED",
            }),
        ]);

        await expect(service.listSharedAnswers(student, roomId)).resolves.toEqual([
            expect.objectContaining({
                _id: answerId,
                roomId,
                visibility: "SHARED",
            }),
        ]);

        expect(studyRoomsService.ensureMember).toHaveBeenCalledWith(studentId, roomId);
        expect(interactionModel.find).toHaveBeenCalledWith({
            roomId: new Types.ObjectId(roomId),
            visibility: "SHARED",
        });
        expect(listQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(listQuery.limit).toHaveBeenCalledWith(30);
    });

    it("partilha resposta própria em read-only e preserva o conteúdo", async () => {
        const { interactionModel, service } = makeService();
        const ownAnswer = makeInteractionDocument({
            _id: answerId,
            roomId,
            studentId,
            visibility: "PRIVATE",
        });
        interactionModel.findOne.mockReturnValueOnce(makeQuery(ownAnswer));

        const result = await service.shareOrForkAnswer(student, roomId, answerId, {
            mode: "READ_ONLY",
        });

        expect(result.mode).toBe("READ_ONLY");
        expect(result.createdPrivateCopy).toBe(false);
        expect(result.answer.answer).toBe("Resposta validada da sala.");
        expect(ownAnswer.visibility).toBe("SHARED");
        expect(ownAnswer.sharedAt).toBeInstanceOf(Date);
        expect(ownAnswer.save).toHaveBeenCalledTimes(1);
    });

    it("bloqueia partilha de resposta que não pertence ao aluno autenticado", async () => {
        const { interactionModel, service } = makeService();
        interactionModel.findOne.mockReturnValueOnce(makeQuery(null));

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "READ_ONLY",
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("bloqueia aluno fora da sala antes de ler a resposta", async () => {
        const { interactionModel, service, studyRoomsService } = makeService();
        studyRoomsService.ensureMember.mockRejectedValueOnce(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
            }),
        );

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "READ_ONLY",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(interactionModel.findOne).not.toHaveBeenCalled();
    });

    it("cria fork privado de resposta partilhada sem alterar o original", async () => {
        const { interactionModel, service } = makeService();
        const original = makeInteractionPlain({
            _id: answerId,
            roomId,
            studentId: otherStudentId,
            visibility: "SHARED",
        });
        const fork = makeInteractionDocument({
            _id: "507f1f77bcf86cd799439099",
            roomId,
            studentId,
            visibility: "PRIVATE",
            forkedFromInteractionId: answerId,
        });

        interactionModel.findOne.mockReturnValueOnce(makeLeanQuery(original));
        interactionModel.create.mockResolvedValueOnce(fork);

        const result = await service.shareOrForkAnswer(student, roomId, answerId, {
            mode: "PRIVATE_FORK",
        });

        expect(result.mode).toBe("PRIVATE_FORK");
        expect(result.createdPrivateCopy).toBe(true);
        expect(result.answer.studentId).toBe(studentId);
        expect(result.answer.visibility).toBe("PRIVATE");
        expect(result.answer.forkedFromInteractionId).toBe(answerId);
        expect(interactionModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                studentId: new Types.ObjectId(studentId),
                visibility: "PRIVATE",
                forkedFromInteractionId: new Types.ObjectId(answerId),
            }),
        );
        expect(fork.save).not.toHaveBeenCalled();
    });

    it("rejeita fork de resposta que não está partilhada na sala", async () => {
        const { interactionModel, service } = makeService();
        interactionModel.findOne.mockReturnValueOnce(makeLeanQuery(null));

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "PRIVATE_FORK",
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(interactionModel.create).not.toHaveBeenCalled();
    });

    it("rejeita modo inválido antes de ler persistência", async () => {
        const { interactionModel, service, studyRoomsService } = makeService();

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "PUBLIC_EDIT" as never,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(studyRoomsService.ensureMember).not.toHaveBeenCalled();
        expect(interactionModel.findOne).not.toHaveBeenCalled();
    });
});

/**
 * Cria service e dependências falsas para testar regras de domínio.
 *
 * @returns Service e dependências observáveis.
 */
function makeService() {
    const listQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };
    const interactionModel = {
        find: jest.fn().mockReturnValue(listQuery),
        findOne: jest.fn(),
        create: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const service = new RoomAiSharingService(
        interactionModel as never,
        studyRoomsService as never,
    );

    return { interactionModel, listQuery, service, studyRoomsService };
}

/**
 * Cria uma query com `exec`, igual ao padrão usado no service.
 *
 * @param value Valor resolvido pela query.
 * @returns Query mínima para testes unitários.
 */
function makeQuery<T>(value: T) {
    return {
        exec: jest.fn().mockResolvedValue(value),
    };
}

/**
 * Cria uma query com `lean().exec()`.
 *
 * @param value Valor resolvido pela query.
 * @returns Query mínima para testes unitários.
 */
function makeLeanQuery<T>(value: T) {
    return {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(value),
    };
}

/**
 * Cria documento Mongoose mínimo para testes.
 *
 * @param input Campos variáveis do documento.
 * @returns Documento com save e toObject observáveis.
 */
function makeInteractionDocument(input: {
    _id: string;
    roomId: string;
    studentId: string;
    visibility: RoomAiVisibility;
    forkedFromInteractionId?: string;
}) {
    const plain = makeInteractionPlain(input);
    const document = {
        ...plain,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(() => plain),
    };

    return document;
}

/**
 * Cria objeto persistido mínimo para simular resposta IA autorizada.
 *
 * @param input Campos variáveis do objeto.
 * @returns Objeto persistido usado por service e testes.
 */
function makeInteractionPlain(input: {
    _id: string;
    roomId: string;
    studentId: string;
    visibility: RoomAiVisibility;
    forkedFromInteractionId?: string;
}) {
    return {
        _id: new Types.ObjectId(input._id),
        roomId: new Types.ObjectId(input.roomId),
        studentId: new Types.ObjectId(input.studentId),
        question: "Como resumir a matéria?",
        answer: "Resposta validada da sala.",
        sourceShareIds: [new Types.ObjectId("507f1f77bcf86cd799439016")],
        visibility: input.visibility,
        sharedAt:
            input.visibility === "SHARED"
                ? new Date("2026-07-02T10:00:00Z")
                : undefined,
        forkedFromInteractionId: input.forkedFromInteractionId
            ? new Types.ObjectId(input.forkedFromInteractionId)
            : undefined,
        createdAt: new Date("2026-07-02T09:00:00Z"),
    };
}
