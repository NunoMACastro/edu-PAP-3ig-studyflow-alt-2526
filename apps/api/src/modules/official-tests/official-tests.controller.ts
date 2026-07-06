// apps/api/src/modules/official-tests/official-tests.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { OfficialTestRankingService } from "./official-test-ranking.service.js";
import { OfficialTestsService } from "./official-tests.service.js";

/**
 * Endpoints de testes oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class OfficialTestsController {
    /**
     * @param testsService Service principal de testes oficiais.
     * @param rankingService Service de ranking docente.
     */
    constructor(
        private readonly testsService: OfficialTestsService,
        private readonly rankingService: OfficialTestRankingService,
    ) {}

    /**
     * Cria teste oficial docente.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @param body Dados validados pelo DTO docente.
     * @returns Teste oficial criado.
     */
    @Post("teacher/subjects/:subjectId/tests")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialTestDto,
    ) {
        return this.testsService.create(request.user!, subjectId, body);
    }

    /**
     * Lista testes oficiais para o professor dono.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @returns Testes oficiais da disciplina.
     */
    @Get("teacher/subjects/:subjectId/tests")
    listForTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listForTeacher(request.user!, subjectId);
    }

    /**
     * Lista ranking de um mini-teste oficial para professor autorizado.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina do professor.
     * @param testId Mini-teste oficial.
     * @returns Ranking ordenado e minimizado.
     */
    @Get("teacher/subjects/:subjectId/tests/:testId/ranking")
    listRankingForTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
    ) {
        return this.rankingService.listForTeacher(
            request.user!,
            subjectId,
            testId,
        );
    }

    /**
     * Lista testes publicados para aluno inscrito.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina onde o aluno deve estar inscrito.
     * @returns Testes publicados sem respostas corretas.
     */
    @Get("student/subjects/:subjectId/tests")
    listPublishedForStudent(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listPublishedForStudent(request.user!, subjectId);
    }

    /**
     * Submete tentativa de aluno para teste oficial publicado.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina onde o aluno está inscrito.
     * @param testId Teste oficial publicado.
     * @param body Respostas escolhidas pelo aluno.
     * @returns Tentativa corrigida no backend.
     */
    @Post("student/subjects/:subjectId/tests/:testId/attempts")
    submitAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
        @Body() body: SubmitOfficialTestAttemptDto,
    ) {
        return this.testsService.submitStudentAttempt(
            request.user!,
            subjectId,
            testId,
            body,
        );
    }
}