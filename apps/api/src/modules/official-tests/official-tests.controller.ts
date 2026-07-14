/**
 * Expõe os endpoints HTTP de testes oficiais e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { ChangeOfficialTestStatusDto } from "./dto/change-official-test-status.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { OfficialTestRankingService } from "./official-test-ranking.service.js";
import { OfficialTestsService } from "./official-tests.service.js";

/**
 * Endpoints docentes e discentes de testes oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class OfficialTestsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param testsService Service principal de testes oficiais.
     * @param rankingService Service de ranking docente.
     */
    constructor(
        private readonly testsService: OfficialTestsService,
        private readonly rankingService: OfficialTestRankingService,
    ) {}

    /**
     * Recebe o pedido de criação de testes oficiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de testes oficiais criado no formato público esperado pela UI ou pelo teste.
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
     * Recebe o pedido de listagem de testes oficiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de testes oficiais visível para o contexto autorizado.
     */
    @Get("teacher/subjects/:subjectId/tests")
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listForTeacher(request.user!, subjectId);
    }

    /**
     * Edita o conteúdo completo de um teste, desde que ainda seja rascunho.
     */
    @Patch("teacher/subjects/:subjectId/tests/:testId")
    updateDraft(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
        @Body() body: CreateOfficialTestDto,
    ) {
        return this.testsService.updateDraft(
            request.user!,
            subjectId,
            testId,
            body,
        );
    }

    /**
     * Avança o teste para publicado ou encerrado sem permitir saltos/reabertura.
     *
     * @param request Pedido autenticado; a sessão identifica o professor real.
     * @param subjectId Disciplina cujo ownership é validado no service.
     * @param testId Teste oficial alvo.
     * @param body Estado de destino validado pelo DTO.
     * @returns Teste depois da comparação-e-troca de estado.
     */
    @Patch("teacher/subjects/:subjectId/tests/:testId/status")
    changeStatus(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
        @Body() body: ChangeOfficialTestStatusDto,
    ) {
        return this.testsService.changeStatus(
            request.user!,
            subjectId,
            testId,
            body,
        );
    }

    /**
     * Publica explicitamente um rascunho sem aceitar o estado no body.
     */
    @Post("teacher/subjects/:subjectId/tests/:testId/publish")
    publish(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
    ) {
        return this.testsService.changeStatus(request.user!, subjectId, testId, {
            status: "PUBLISHED",
        });
    }

    /**
     * Encerra explicitamente um teste publicado sem permitir reabertura.
     */
    @Post("teacher/subjects/:subjectId/tests/:testId/close")
    close(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
    ) {
        return this.testsService.changeStatus(request.user!, subjectId, testId, {
            status: "CLOSED",
        });
    }

    /**
     * Lista ranking de um mini-teste oficial para professor autorizado.
     *
     * @param request Pedido autenticado; a sessão fornece o professor real.
     * @param subjectId Disciplina oficial do professor.
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
     * Lista ao aluno apenas mini-testes publicados da disciplina onde está inscrito.
     *
     * @param request Pedido HTTP autenticado; a sessão fornece o aluno real.
     * @param subjectId Disciplina oficial pedida pelo aluno.
     * @returns Testes publicados sem expor `correctOptionIndex`.
     */
    @Get("student/subjects/:subjectId/tests")
    listForStudent(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listPublishedForStudent(request.user!, subjectId);
    }

    /**
     * Submete uma tentativa oficial e delega a correção no backend.
     *
     * @param request Pedido HTTP autenticado; a sessão fornece o aluno real.
     * @param subjectId Disciplina oficial pedida pelo aluno.
     * @param testId Teste oficial publicado.
     * @param body Respostas escolhidas pelo aluno.
     * @returns Resultado persistido e pontuado da tentativa.
     */
    @Post("student/subjects/:subjectId/tests/:testId/attempts")
    submitAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
        @Body() body: SubmitOfficialTestAttemptDto,
    ) {
        return this.testsService.submitAttempt(
            request.user!,
            subjectId,
            testId,
            body,
        );
    }

    /**
     * Devolve apenas as tentativas do aluno da sessão e aplica a política de soluções.
     */
    @Get("student/subjects/:subjectId/tests/:testId/attempts/me")
    listMyAttempts(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("testId") testId: string,
    ) {
        return this.testsService.listMyAttempts(
            request.user!,
            subjectId,
            testId,
        );
    }
}
