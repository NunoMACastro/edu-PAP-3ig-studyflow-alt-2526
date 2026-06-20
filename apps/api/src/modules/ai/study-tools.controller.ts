/**
 * Expõe os endpoints HTTP de ai e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto.js";
import { CreateStudyToolDto } from "./dto/create-study-tool.dto.js";
import { StudyToolsService } from "./study-tools.service.js";

/**
 * Controller de ferramentas de estudo geradas por IA.
 */
@Controller("api/study-areas/:id/study-tools")
@UseGuards(SessionGuard)
export class StudyToolsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param studyToolsService Service injetado para reutilizar regras de study tools sem duplicar validações.
     */
    constructor(private readonly studyToolsService: StudyToolsService) {}

    /**
     * Lista ferramentas já geradas para a área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param type Tipo opcional para filtrar.
     * @returns Artefactos IA da área.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Query("type") type?: string,
    ) {
        return this.studyToolsService.listTools(request.user!.id, id, type);
    }

    /**
     * Gera uma explicação, flashcards ou quiz.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param body Pedido de geração.
     * @returns Artefacto criado.
     */
    @Post()
    generate(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateStudyToolDto,
    ) {
        return this.studyToolsService.generateStudyTool(
            request.user!.id,
            id,
            body,
        );
    }

    /**
     * Regista uma tentativa mínima de quiz para handoff MF1.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param artifactId Identificador do artefacto `QUIZ`.
     * @param body Respostas escolhidas pelo aluno.
     * @returns Resultado calculado da tentativa.
     */
    @Post(":artifactId/quiz-attempts")
    submitQuizAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("artifactId") artifactId: string,
        @Body() body: CreateQuizAttemptDto,
    ) {
        return this.studyToolsService.submitQuizAttempt(
            request.user!.id,
            id,
            artifactId,
            body,
        );
    }
}
