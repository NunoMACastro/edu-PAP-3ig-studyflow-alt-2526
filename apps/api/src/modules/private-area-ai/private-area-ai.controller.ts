/**
 * Expõe os endpoints HTTP de private área ai e delega regras de negócio para o service.
 */
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskPrivateAreaAiDto } from "./dto/ask-private-area-ai.dto.js";
import { PrivateAreaAiService } from "./private-area-ai.service.js";// Imports a acrescentar nos quatro services IA.


/**
 * Endpoint do assistente IA privado por área.
 */
@Controller("api/student/study-areas/:studyAreaId/private-ai/answers")
@UseGuards(SessionGuard)
export class PrivateAreaAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param privateAreaAiService Service injetado para reutilizar regras de IA privada da área de estudo sem duplicar validações.
     */
    constructor(private readonly privateAreaAiService: PrivateAreaAiService) {}

    /**
     * Orquestra uma pergunta de IA em IA privada da área de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: AskPrivateAreaAiDto,
    ) {
        return this.privateAreaAiService.ask(request.user!, studyAreaId, body);
    }
}
