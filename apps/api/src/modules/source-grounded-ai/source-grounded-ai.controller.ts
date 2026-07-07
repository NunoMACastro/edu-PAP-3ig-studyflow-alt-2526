/**
 * Expõe os endpoints HTTP de IA com fontes obrigatórias e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

/**
 * Endpoint de respostas com citações obrigatórias.
 */
@Controller("api/ai/source-grounded-answers")
@UseGuards(SessionGuard)
export class SourceGroundedAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param sourceGroundedService Service injetado para reutilizar regras de source grounded sem duplicar validações.
     */
    constructor(private readonly sourceGroundedService: SourceGroundedAiService) {}

    /**
     * Cria uma resposta limitada ao job de indexação autorizado.
     *
     * @param request Pedido autenticado.
     * @param body Job e pergunta.
     * @returns Resposta com citações.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskSourceGroundedAiDto,
    ) {
        return this.sourceGroundedService.ask(request.user!, body);
    }
}
