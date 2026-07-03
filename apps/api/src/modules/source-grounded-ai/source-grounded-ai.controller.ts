// apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts
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
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param sourceGroundedService Service que aplica regras de domínio e segurança.
     */
    constructor(private readonly sourceGroundedService: SourceGroundedAiService) {}

    /**
     * Cria uma resposta limitada aos jobs de indexação autorizados.
     *
     * @param request Pedido autenticado com utilizador resolvido pela sessão.
     * @param body Jobs e pergunta validados pelo DTO.
     * @returns Resposta factual com citações públicas.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskSourceGroundedAiDto,
    ) {
        // O user vem da sessão para impedir que o frontend peça respostas por outro aluno.
        return this.sourceGroundedService.ask(request.user!, body);
    }
}