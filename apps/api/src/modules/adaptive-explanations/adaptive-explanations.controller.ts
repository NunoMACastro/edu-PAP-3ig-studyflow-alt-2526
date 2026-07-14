/**
 * Expõe o endpoint HTTP de explicações adaptadas.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Controller do endpoint `POST /api/ai/adaptive-explanations`.
 */
@Controller("api/ai/adaptive-explanations")
@UseGuards(SessionGuard)
export class AdaptiveExplanationsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param adaptiveExplanationsService Service que aplica regras de domínio.
     */
    constructor(private readonly adaptiveExplanationsService: AdaptiveExplanationsService) {}

    /**
     * Recebe o pedido autenticado e delega a decisão no service.
     *
     * @param request Pedido com utilizador resolvido pela sessão.
     * @param body Payload validado pelo DTO.
     * @returns Explicação adaptada.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskMf3AdaptiveExplanationDto,
    ) {
        // O controller não calcula permissões; mantém transporte separado do domínio.
        return this.adaptiveExplanationsService.ask(request.user!, body);
    }
}
