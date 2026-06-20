/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";

const studyAreaId = "507f1f77bcf86cd799439014";
const materialId = "507f1f77bcf86cd799439015";

describe("AdaptiveLearningService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("não chama a IA quando a área não tem materiais READY com texto", async () => {
        const { aiProvider, explanationModel, materialsService, service } =
            makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.askAdaptiveExplanation(student.id, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateAdaptiveExplanation).not.toHaveBeenCalled();
        expect(explanationModel.create).not.toHaveBeenCalled();
    });

    it("devolve 503 quando o provider devolve fontes fora dos materiais autorizados", async () => {
        const { aiProvider, explanationModel, historyService, service } =
            makeService();
        aiProvider.generateAdaptiveExplanation.mockResolvedValue({
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Rever exemplos."],
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askAdaptiveExplanation(student.id, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(explanationModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });

    it("guarda dificuldades e estilo preferido no perfil adaptativo", async () => {
        const { profileModel, service } = makeService();
        profileModel.findOneAndUpdate.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439016",
                studyAreaId,
                pace: "SLOW",
                level: "BEGINNER",
                difficulties: ["frações", "interpretação de enunciados"],
                preferredExplanationStyle: "Passo a passo com exemplos",
            }),
        );

        const profile = await service.updateLearningProfile(student.id, studyAreaId, {
            pace: "SLOW",
            level: "BEGINNER",
            difficulties: [" frações ", "", "interpretação de enunciados"],
            preferredExplanationStyle: " Passo a passo com exemplos ",
        });

        expect(profileModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                $set: {
                    pace: "SLOW",
                    level: "BEGINNER",
                    difficulties: ["frações", "interpretação de enunciados"],
                    preferredExplanationStyle: "Passo a passo com exemplos",
                },
            }),
            expect.any(Object),
        );
        expect(profile).toMatchObject({
            difficulties: ["frações", "interpretação de enunciados"],
            preferredExplanationStyle: "Passo a passo com exemplos",
        });
    });

    it("inclui dificuldades e estilo preferido no prompt adaptativo", async () => {
        const { aiProvider, explanationModel, historyService, profileModel, service } =
            makeService();
        profileModel.findOne.mockReturnValueOnce(
            leanResult({
                _id: "507f1f77bcf86cd799439016",
                studyAreaId,
                pace: "SLOW",
                level: "BEGINNER",
                difficulties: ["frações"],
                preferredExplanationStyle: "explicações com analogias",
            }),
        );
        aiProvider.generateAdaptiveExplanation.mockResolvedValue({
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Resolver um exercício guiado."],
            sourceMaterialIds: [materialId],
        });
        explanationModel.create.mockResolvedValue({
            _id: "507f1f77bcf86cd799439017",
            question: "Explica funções.",
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Resolver um exercício guiado."],
            toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00.000Z") }),
        });

        await service.askAdaptiveExplanation(student.id, studyAreaId, {
            question: "Explica funções.",
        });

        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Dificuldades declaradas: frações"),
        });
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining(
                "Estilo preferido de explicação: explicações com analogias",
            ),
        });
        expect(historyService.recordEvent).toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de artefactos de IA para manter testes e prompts legíveis.
 * @returns Valor de artefactos de IA no contrato esperado pelo chamador.
 */
function makeService() {
    const profileModel = {
        findOne: jest.fn().mockReturnValue(leanResult(null)),
        findOneAndUpdate: jest.fn(),
    };
    const explanationModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateAdaptiveExplanation: jest.fn(),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: materialId,
                title: "Funções",
                contentText: "Uma função associa elementos de dois conjuntos.",
            },
        ]),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };
    const service = new AdaptiveLearningService(
        profileModel as never,
        explanationModel as never,
        aiProvider as never,
        materialsService as never,
        areasService as never,
        historyService as never,
    );
    return {
        aiProvider,
        areasService,
        explanationModel,
        historyService,
        materialsService,
        profileModel,
        service,
    };
}

/**
 * Executa a operação lean result no domínio de artefactos de IA com contrato explícito.
 *
 * @param value Valor bruto recebido antes de normalização, parsing ou validação.
 * @returns Valor de artefactos de IA no contrato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}
