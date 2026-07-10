/**
 * Implementa a fachada de explicações adaptadas e concentra a regra de role.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Service de explicações adaptadas para o endpoint público da MF8.
 */
@Injectable()
export class AdaptiveExplanationsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param adaptiveLearningService Service que valida área, perfil, fontes e provider.
     */
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    /**
     * Gera uma explicação adaptada para o aluno autenticado.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Área privada e pergunta do aluno.
     * @returns Explicação adaptada persistida pelo contrato de IA.
     */
    async ask(actor: AuthenticatedUser, input: AskMf3AdaptiveExplanationDto) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // O userId vem da sessão; isto impede que o frontend peça explicações como outro aluno.
        return this.adaptiveLearningService.askAdaptiveExplanation(
            actor.id,
            input.studyAreaId,
            { question: input.question },
        );
    }
}
