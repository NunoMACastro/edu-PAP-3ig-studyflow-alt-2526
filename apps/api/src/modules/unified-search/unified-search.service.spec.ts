/**
 * Testa o comportamento de pesquisa unificada e documenta os cenários de aceitação automatizados.
 */
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UnifiedSearchService } from "./unified-search.service.js";

describe("UnifiedSearchService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const jobId = "507f1f77bcf86cd799439013";

    it("pesquisa apenas jobs autorizados para leitura pedagógica", async () => {
        const { logModel, materialIndexService, service } = makeService();

        await expect(
            service.search(student, {
                query: "derivadas",
                jobIds: [jobId],
            }),
        ).resolves.toMatchObject({
            query: "derivadas",
            results: [
                {
                    jobId,
                    materialId: "507f1f77bcf86cd799439014",
                    sourceLabel: "Derivadas",
                    locator: "chunk-1",
                },
            ],
        });
        expect(materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(logModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ query: "derivadas", resultCount: 1 }),
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de pesquisa unificada para manter testes e prompts legíveis.
 * @returns Valor de pesquisa unificada no contrato esperado pelo chamador.
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
                    text: "As derivadas medem a taxa de variacao instantanea.",
                    sourceLabel: "Derivadas",
                    locator: "chunk-1",
                },
            ],
        }),
    };
    const service = new UnifiedSearchService(
        logModel as never,
        materialIndexService as never,
    );
    return { logModel, materialIndexService, service };
}
