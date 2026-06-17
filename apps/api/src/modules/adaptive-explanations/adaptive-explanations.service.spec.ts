/**
 * Testa o comportamento de adaptive explanations e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
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

    it("delegada no contrato MF1 com o aluno autenticado", async () => {
        const { adaptiveLearningService, service } = makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica derivadas devagar.",
            }),
        ).resolves.toMatchObject({ answer: "Explicação adaptada." });
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
                question: "Explica.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de explicações adaptativas para manter testes e prompts legíveis.
 * @returns Valor de explicações adaptativas no contrato esperado pelo chamador.
 */
function makeService() {
    const adaptiveLearningService = {
        askAdaptiveExplanation: jest
            .fn()
            .mockResolvedValue({ answer: "Explicação adaptada." }),
    };
    const service = new AdaptiveExplanationsService(
        adaptiveLearningService as never,
    );
    return { adaptiveLearningService, service };
}
