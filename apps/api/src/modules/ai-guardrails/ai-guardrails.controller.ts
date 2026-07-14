/**
 * Expõe os endpoints HTTP de ai guardrails e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import { CheckAiGuardrailsDto } from "./dto/check-ai-guardrails.dto.js";

/**
 * Endpoint de validação de guardrails antes de pedidos IA.
 */
@Controller("api/ai/guardrails")
@UseGuards(SessionGuard)
export class AiGuardrailsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param guardrailsService Service injetado para reutilizar regras de guardrails sem duplicar validações.
     */
    constructor(private readonly guardrailsService: AiGuardrailsService) {}

    /**
     * Verifica se o contexto informado é seguro para uso de IA.
     *
     * @param request Pedido autenticado por cookie.
     * @param body Dados validados pelo DTO.
     * @returns Decisão de guardrail persistida.
     */
    @Post("check")
    check(
        @Req() request: AuthenticatedRequest,
        @Body() body: CheckAiGuardrailsDto,
    ) {
        return this.guardrailsService.check(request.user!, body);
    }
}
