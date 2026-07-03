/**
 * Expõe os endpoints HTTP de IA com conhecimento externo limitado e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskExternalKnowledgeAiDto } from "./dto/ask-external-knowledge-ai.dto.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";

/**
 * Endpoint de conhecimento externo limitado.
 */
@Controller("api/ai/external-knowledge-answers")
@UseGuards(SessionGuard)
export class ExternalKnowledgeAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param externalKnowledgeService Service injetado para reutilizar regras de external knowledge sem duplicar validações.
     */
    constructor(private readonly externalKnowledgeService: ExternalKnowledgeAiService) {}

    /**
     * Cria resposta com fontes internas e nota externa opcional.
     *
     * @param request Pedido autenticado.
     * @param body Dados validados.
     * @returns Resposta persistida.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskExternalKnowledgeAiDto,
    ) {
        return this.externalKnowledgeService.ask(request.user!, body);
    }
}
