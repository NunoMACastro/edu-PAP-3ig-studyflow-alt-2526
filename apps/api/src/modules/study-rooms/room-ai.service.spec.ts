/**
 * Testa o comportamento de salas de estudo e documenta os cenários de aceitação automatizados.
 */
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { createGovernedAiExecutionFixture } from "../ai/governed-ai-execution.test-fixture.js";
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
        const {
            aiProvider,
            interactionModel,
            roomSharesService,
            service,
            studentProfileService,
        } = makeService();
        roomSharesService.findUsableSharesForRoom.mockResolvedValue([]);

        await expect(
            service.askRoomAi(student, roomId, { question: "O que foi partilhado?" }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateRoomAnswer).not.toHaveBeenCalled();
        expect(interactionModel.create).not.toHaveBeenCalled();
        expect(studentProfileService.getMyProfile).not.toHaveBeenCalled();
    });

    it("inclui contexto pedagógico primário no prompt quando o aluno tem 4.º ano", async () => {
        const { aiProvider, interactionModel, service, studentProfileService } =
            makeService();
        studentProfileService.getMyProfile.mockResolvedValue({
            year: "4.º ano",
        });
        aiProvider.generateRoomAnswer.mockResolvedValue({
            answer: "2 + 2 são 4 porque juntamos dois grupos de dois.",
            sourceShareIds: [shareId],
        });
        interactionModel.create.mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439016",
            ...input,
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00Z") }),
        }));

        await expect(
            service.askRoomAi(student, roomId, { question: "Porque é que 2+2 são 4?" }),
        ).resolves.toMatchObject({
            answer: "2 + 2 são 4 porque juntamos dois grupos de dois.",
            sources: [{ shareId, title: "Apontamentos" }],
        });

        expect(studentProfileService.getMyProfile).toHaveBeenCalledWith(student.id);
        expect(aiProvider.generateRoomAnswer).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining(
                    "Contexto pedagógico interno: 4.º ano (PRIMARY)",
                ),
            }),
        );
        expect(aiProvider.generateRoomAnswer).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining("frases curtas, passos pequenos"),
            }),
        );
        expect(interactionModel.create).toHaveBeenCalledWith(
            expect.not.objectContaining({
                askerPedagogicalContext: expect.anything(),
                year: expect.anything(),
            }),
        );
    });

    it("usa a finalidade ROOM_AI e quota do grupo na fachada governada", async () => {
        const { aiExecution, aiProvider, service } = makeService();
        const execute = jest.spyOn(aiExecution, "execute");
        aiProvider.generateRoomAnswer.mockResolvedValue({
            answer: "Resposta baseada nas fontes.",
            sourceShareIds: [shareId],
        });

        await service.askRoomAi(student, roomId, { question: "Resume isto." });

        expect(execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: student.id,
                purpose: "ROOM_AI",
                quota: { scope: "GROUP", targetId: roomId },
            }),
        );
    });

    it("usa fallback neutro quando o aluno não tem perfil", async () => {
        const { aiProvider, service, studentProfileService } = makeService();
        studentProfileService.getMyProfile.mockResolvedValue(null);
        aiProvider.generateRoomAnswer.mockResolvedValue({
            answer: "Resposta baseada nas fontes.",
            sourceShareIds: [shareId],
        });

        await service.askRoomAi(student, roomId, { question: "Resume isto." });

        expect(aiProvider.generateRoomAnswer).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining(
                    "ano escolar nao indicado ou nao reconhecido (UNKNOWN)",
                ),
            }),
        );
    });

    it("gera orientação avançada para ensino superior", async () => {
        const { aiProvider, service, studentProfileService } = makeService();
        studentProfileService.getMyProfile.mockResolvedValue({
            year: "Licenciatura em Engenharia Informática",
        });
        aiProvider.generateRoomAnswer.mockResolvedValue({
            answer: "Resposta técnica baseada nas fontes.",
            sourceShareIds: [shareId],
        });

        await service.askRoomAi(student, roomId, { question: "Explica a prova." });

        expect(aiProvider.generateRoomAnswer).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining(
                    "Contexto pedagógico interno: ensino superior (HIGHER_EDUCATION)",
                ),
            }),
        );
        expect(aiProvider.generateRoomAnswer).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining("linguagem tecnica, abstracao"),
            }),
        );
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
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const interactionModel = {
        create: jest.fn(async (input) => ({
            _id: "507f1f77bcf86cd799439016",
            ...input,
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00Z") }),
        })),
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
    const studentProfileService = {
        getMyProfile: jest.fn().mockResolvedValue({
            year: "8.º ano",
        }),
    };
    const aiExecution = createGovernedAiExecutionFixture(aiProvider);
    const service = new RoomAiService(
        interactionModel as never,
        aiExecution,
        studyRoomsService as never,
        roomSharesService as never,
        studentProfileService as never,
    );
    return {
        aiExecution,
        aiProvider,
        interactionModel,
        roomSharesService,
        service,
        studyRoomsService,
        studentProfileService,
    };
}
