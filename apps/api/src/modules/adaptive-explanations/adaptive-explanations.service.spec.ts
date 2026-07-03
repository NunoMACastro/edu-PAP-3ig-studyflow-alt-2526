// apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts
/**
 * Testa a fachada de explicações adaptadas.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

describe("AdaptiveExplanationsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const studyAreaId = "507f1f77bcf86cd799439014";

    it("delegada no contrato de IA adaptativa com o aluno autenticado", async () => {
        const { adaptiveLearningService, service } = makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica derivadas devagar.",
            }),
        ).resolves.toMatchObject({ answer: "Explicação adaptada." });

        // Este assert prova que o userId usado vem da sessão autenticada.
        expect(adaptiveLearningService.askAdaptiveExplanation).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
            { question: "Explica derivadas devagar." },
        );
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { service } = makeService();

        await expect(
            service.ask(teacher, {
                studyAreaId,
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});

/**
 * Cria uma fachada com o service de IA adaptativa isolado.
 *
 * @returns Service testado e mock injetado.
 */
function makeService() {
    const adaptiveLearningService = {
        askAdaptiveExplanation: jest.fn().mockResolvedValue({
            answer: "Explicação adaptada.",
            suggestedNextSteps: ["Resolver um exercício guiado."],
            sourceMaterialIds: ["507f1f77bcf86cd799439015"],
        }),
    };
    const service = new AdaptiveExplanationsService(
        adaptiveLearningService as unknown as AdaptiveLearningService,
    );
    return { adaptiveLearningService, service };
}