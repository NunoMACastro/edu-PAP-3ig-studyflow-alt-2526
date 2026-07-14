/**
 * Expõe os endpoints HTTP de turma ai e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassAiService } from "./class-ai.service.js";
import { AskClassAiDto } from "./dto/ask-class-ai.dto.js";

/**
 * Controller da IA limitada da disciplina.
 */
@Controller("api/student/subjects/:subjectId/ai/answers")
@UseGuards(SessionGuard)
export class ClassAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param classAiService Service injetado para reutilizar regras de turma ai sem duplicar validações.
     */
    constructor(private readonly classAiService: ClassAiService) {}

    /**
     * Orquestra uma pergunta de IA em IA da disciplina, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: AskClassAiDto,
    ) {
        return this.classAiService.askClassAi(request.user!, subjectId, body);
    }

    /** Lista respostas anteriores do próprio aluno com cursor opaco. */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limit?: string,
    ) {
        return this.classAiService.listMyAnswers(
            request.user!,
            subjectId,
            cursor,
            limit ? Number(limit) : undefined,
        );
    }
}
