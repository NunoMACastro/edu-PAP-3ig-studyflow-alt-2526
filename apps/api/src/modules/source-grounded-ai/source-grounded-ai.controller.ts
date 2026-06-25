/**
 * Controller HTTP para respostas de IA baseadas em fontes autorizadas.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../auth/session.guard.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

@Controller("ai/source-grounded-answers")
@UseGuards(SessionGuard)
export class SourceGroundedAiController {
    constructor(private readonly sourceGroundedAiService: SourceGroundedAiService) {}

    /**
     * Mantém a autorização ligada à sessão real do utilizador.
     *
     * @param request Pedido autenticado pelo SessionGuard.
     * @param input Pergunta e fontes pedidas pelo cliente.
     * @returns Resposta com citações autorizadas.
     */
    @Post()
    ask(@Req() request: AuthenticatedRequest, @Body() input: AskSourceGroundedAiDto) {
        return this.sourceGroundedAiService.ask(request.user, input);
    }
}