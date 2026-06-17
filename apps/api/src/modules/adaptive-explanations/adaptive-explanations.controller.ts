/**
 * Expõe os endpoints HTTP de adaptive explanations e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Endpoint MF3 de explicações adaptadas ao perfil do aluno.
 */
@Controller("api/ai/adaptive-explanations")
@UseGuards(SessionGuard)
export class AdaptiveExplanationsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param adaptiveExplanationsService Service injetado para reutilizar regras de adaptive explanations sem duplicar validações.
     */
    constructor(private readonly adaptiveExplanationsService: AdaptiveExplanationsService) {}

    /**
     * Delegação para o contrato acumulado de aprendizagem adaptativa.
     *
     * @param request Pedido autenticado.
     * @param body Área e pergunta.
     * @returns Explicação adaptada.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskMf3AdaptiveExplanationDto,
    ) {
        return this.adaptiveExplanationsService.ask(request.user!, body);
    }
}
