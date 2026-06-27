/**
 * Expõe os endpoints HTTP de revisão docente de conteúdos IA e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";
import {
    CreateAiContentReviewDto,
    DecideAiContentReviewDto,
} from "./dto/ai-content-review.dto.js";

/**
 * Endpoints docentes de revisão de conteúdos IA.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class AiContentReviewsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param reviewsService Service injetado para reutilizar regras de reviews sem duplicar validações.
     */
    constructor(private readonly reviewsService: AiContentReviewsService) {}

    /**
     * Recebe o pedido de criação de revisão docente de conteúdos IA e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de revisão docente de conteúdos IA criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/subjects/:subjectId/ai-content-reviews")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateAiContentReviewDto,
    ) {
        return this.reviewsService.create(request.user!, subjectId, body);
    }

    /**
     * Recebe o pedido de listagem de revisão docente de conteúdos IA e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de revisão docente de conteúdos IA visível para o contexto autorizado.
     */
    @Get("teacher/subjects/:subjectId/ai-content-reviews")
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.reviewsService.listForSubject(request.user!, subjectId);
    }

    /**
     * Executa a operação decide no domínio de revisão docente de conteúdos IA com contrato explícito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param reviewId Identificador de review que delimita ownership, membership ou relação de domínio.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Valor de revisão docente de conteúdos IA no contrato esperado pelo chamador.
     */
    @Patch("teacher/ai-content-reviews/:reviewId")
    decide(
        @Req() request: AuthenticatedRequest,
        @Param("reviewId") reviewId: string,
        @Body() body: DecideAiContentReviewDto,
    ) {
        return this.reviewsService.decide(request.user!, reviewId, body);
    }
}
