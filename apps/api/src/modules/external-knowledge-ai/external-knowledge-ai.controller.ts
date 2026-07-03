// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts
/**
 * Expõe o endpoint HTTP de IA com conhecimento externo limitado.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskExternalKnowledgeAiDto } from "./dto/ask-external-knowledge-ai.dto.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";

/**
 * Controller do contrato `POST /api/ai/external-knowledge-answers`.
 */
@Controller("api/ai/external-knowledge-answers")
@UseGuards(SessionGuard)
export class ExternalKnowledgeAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param externalKnowledgeService Service que contém regras de domínio, ownership e provider.
     */
    constructor(private readonly externalKnowledgeService: ExternalKnowledgeAiService) {}

    /**
     * Cria uma resposta com citações internas e nota externa opcional.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param body Dados validados pelo DTO.
     * @returns Resposta persistida e pronta para a UI.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskExternalKnowledgeAiDto,
    ) {
        // O userId vem da sessão; aceitar userId no body permitiria acesso cruzado.
        return this.externalKnowledgeService.ask(request.user!, body);
    }
}