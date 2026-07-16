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
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import {
    ArtifactExportService,
    buildArtifactExportContentDisposition,
} from "./artifact-export.service.js";
import { CreateAiArtifactJobDto } from "./dto/create-ai-artifact-job.dto.js";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto.js";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import { CreateStudyToolDto } from "./dto/create-study-tool.dto.js";
import { QuizGenerationJobsService } from "./quiz-generation-jobs.service.js";
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
     * @param quizJobsService Service de jobs persistidos para materiais IA em background.
     * @param artifactExportService Service de exportação segura de resumos e quizzes.
     */
    constructor(
        private readonly studyToolsService: StudyToolsService,
        private readonly quizJobsService: QuizGenerationJobsService,
        private readonly artifactExportService: ArtifactExportService,
    ) {}

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
     * Inicia a geração recuperável de resumo, explicação, flashcards ou quiz.
     */
    @Post("artifact-jobs")
    createArtifactJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateAiArtifactJobDto,
    ) {
        return this.quizJobsService.createArtifactJob(
            request.user!.id,
            id,
            body,
        );
    }

    /** Consulta um job de material, sempre limitado ao aluno e à área. */
    @Get("artifact-jobs/:jobId")
    getArtifactJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("jobId") jobId: string,
    ) {
        return this.quizJobsService.findArtifactJob(
            request.user!.id,
            id,
            jobId,
        );
    }

    /**
     * Inicia geração de quiz em background para uma área privada do aluno.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param body Pedido opcional com tópico.
     * @returns Job inicial em estado QUEUED.
     */
    @Post("quiz-jobs")
    createQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateQuizJobDto,
    ) {
        // O backend usa request.user.id para impedir acesso cruzado a áreas de outro aluno.
        return this.quizJobsService.createQuizJob(request.user!.id, id, body);
    }

    /**
     * Consulta o estado de um job de quiz da área privada.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param jobId Job a consultar.
     * @returns Estado público do job.
     */
    @Get("quiz-jobs/:jobId")
    getQuizJob(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("jobId") jobId: string,
    ) {
        return this.quizJobsService.findQuizJob(request.user!.id, id, jobId);
    }

    /**
     * Exporta resumo ou quiz autorizado em Markdown ou HTML de impressão.
     *
     * @param request Pedido autenticado.
     * @param id Área privada do aluno.
     * @param artifactId Artefacto IA a exportar.
     * @param format Formato pedido pela query.
     * @param response Resposta HTTP usada para headers de ficheiro.
     * @returns Corpo textual do ficheiro.
     */
    @Get(":artifactId/export")
    async exportArtifact(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Param("artifactId") artifactId: string,
        @Query("format") format: string | undefined,
        @Res({ passthrough: true }) response: Response,
    ): Promise<string> {
        const file = await this.artifactExportService.exportArtifact(
            request.user!.id,
            id,
            artifactId,
            format,
        );
        response.setHeader("Content-Type", file.contentType);
        response.setHeader(
            "Content-Disposition",
            buildArtifactExportContentDisposition(file),
        );
        return file.body;
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
