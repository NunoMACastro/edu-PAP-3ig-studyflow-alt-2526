// apps/api/src/modules/ai/adaptive-learning.service.spec.ts
/**
 * Testa perfil, fontes e provider das explicações adaptativas.
 */
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";

const studentId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439014";
const materialId = "507f1f77bcf86cd799439015";

describe("AdaptiveLearningService - RNF36", () => {
    it("não chama a IA quando a área não tem materiais processáveis", async () => {
        const { aiProvider, explanationModel, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.askAdaptiveExplanation(studentId, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);

        expect(aiProvider.generateAdaptiveExplanation).not.toHaveBeenCalled();
        expect(explanationModel.create).not.toHaveBeenCalled();
    });

    it("usa defaults seguros quando o perfil ainda não existe", async () => {
        const { aiProvider, explanationModel, profileModel, service } = makeService();
        profileModel.findOne.mockReturnValueOnce(leanResult(null));
        aiProvider.generateAdaptiveExplanation.mockResolvedValue(validProviderResult());
        explanationModel.create.mockResolvedValue(savedExplanation());

        await service.askAdaptiveExplanation(studentId, studyAreaId, {
            question: "Explica funções.",
        });

        // Sem perfil persistido, a explicação usa BALANCED/INTERMEDIATE em vez de inventar nível.
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Ritmo: BALANCED"),
        });
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Nível: INTERMEDIATE"),
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
        aiProvider.generateAdaptiveExplanation.mockResolvedValue(validProviderResult());
        explanationModel.create.mockResolvedValue(savedExplanation());

        await service.askAdaptiveExplanation(studentId, studyAreaId, {
            question: "Explica funções.",
        });

        // O prompt mostra a adaptação pedagógica sem aceitar estes valores do frontend.
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Nível: BEGINNER"),
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

    it("não persiste resposta quando o provider devolve fontes não autorizadas", async () => {
        const { aiProvider, explanationModel, historyService, service } = makeService();
        aiProvider.generateAdaptiveExplanation.mockResolvedValue({
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Rever exemplos."],
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askAdaptiveExplanation(studentId, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        expect(explanationModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });
});

/**
 * Cria o service com dependências isoladas.
 *
 * @returns Service real e mocks controlados.
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
 * Simula o resultado de `.lean()` usado pelos models Mongoose.
 *
 * @param value Valor devolvido pela query.
 * @returns Objeto com função lean controlada.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Devolve uma resposta válida do provider.
 *
 * @returns Resultado compatível com as fontes autorizadas.
 */
function validProviderResult() {
    return {
        answer: "Uma função relaciona valores.",
        suggestedNextSteps: ["Resolver um exercício guiado."],
        sourceMaterialIds: [materialId],
    };
}

/**
 * Devolve uma explicação persistida pelo model.
 *
 * @returns Documento mínimo usado pelo service depois de guardar.
 */
function savedExplanation() {
    return {
        _id: "507f1f77bcf86cd799439017",
        question: "Explica funções.",
        answer: "Uma função relaciona valores.",
        suggestedNextSteps: ["Resolver um exercício guiado."],
        toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00.000Z") }),
    };
}