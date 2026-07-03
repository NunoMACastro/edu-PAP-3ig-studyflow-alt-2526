/**
 * Implementa as regras de negócio de adaptive explanations e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Fachada MF3 para explicações adaptadas.
 *
 * O comportamento principal já foi entregue pela MF1; este service cria o
 * contrato pedido em MF3 sem duplicar validação de fontes, perfil ou persistência.
 */
@Injectable()
export class AdaptiveExplanationsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param adaptiveLearningService Service injetado para reutilizar regras de adaptive learning sem duplicar validações.
     */
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    /**
     * Gera uma explicação com o perfil de aprendizagem do aluno.
     *
     * @param actor Aluno autenticado.
     * @param input Área e pergunta.
     * @returns Explicação produzida pelo contrato herdado.
     */
    async ask(actor: AuthenticatedUser, input: AskMf3AdaptiveExplanationDto) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        return this.adaptiveLearningService.askAdaptiveExplanation(
            actor.id,
            input.studyAreaId,
            { question: input.question },
        );
    }
}
