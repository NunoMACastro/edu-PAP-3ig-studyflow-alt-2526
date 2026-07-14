/**
 * Testa o comportamento de navegação curricular e documenta os cenários de aceitação automatizados.
 */
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CurriculumNavigationService } from "./curriculum-navigation.service.js";

describe("CurriculumNavigationService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const jobId = "507f1f77bcf86cd799439013";

    it("gera tópicos a partir de jobs autorizados para leitura", async () => {
        const { logModel, materialIndexService, service } = makeService();

        await expect(
            service.load(student, { jobIds: [jobId] }),
        ).resolves.toMatchObject({
            topics: [
                {
                    title: "Funções",
                    materialId: "507f1f77bcf86cd799439014",
                    sections: [{ title: "Funções", locator: "chunk-1" }],
                },
            ],
        });
        expect(materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(logModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ topicCount: 1 }),
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de navegação curricular para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const logModel = { create: jest.fn() };
    const materialIndexService = {
        findReadableDoneJob: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439014",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "Funções afins têm taxa de variação constante.",
                    sourceLabel: "Funções",
                    locator: "chunk-1",
                },
            ],
        }),
    };
    const service = new CurriculumNavigationService(
        logModel as never,
        materialIndexService as never,
    );
    return { logModel, materialIndexService, service };
}
