/**
 * Expõe os endpoints HTTP de IA coletiva do grupo e delega regras de negócio para o service.
 */
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskStudyGroupAiDto } from "./dto/ask-study-group-ai.dto.js";
import { StudyGroupAiService } from "./study-group-ai.service.js";

/**
 * Endpoint de IA coletiva para grupos.
 */
@Controller("api/study-groups/:groupId/group-ai/questions")
@UseGuards(SessionGuard)
export class StudyGroupAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param groupAiService Service injetado para reutilizar regras de group ai sem duplicar validações.
     */
    constructor(private readonly groupAiService: StudyGroupAiService) {}

    /**
     * Responde com base nas fontes partilhadas do grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @param body Pergunta e fontes opcionais.
     * @returns Resposta coletiva.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
        @Body() body: AskStudyGroupAiDto,
    ) {
        return this.groupAiService.ask(request.user!, groupId, body);
    }
}
