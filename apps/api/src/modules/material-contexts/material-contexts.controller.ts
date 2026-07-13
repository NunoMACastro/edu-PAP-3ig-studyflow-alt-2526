/**
 * Expõe os endpoints HTTP de material contexts e delega regras de negócio para o service.
 */
import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialContextsService } from "./material-contexts.service.js";

/**
 * Endpoints de contextos separados de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialContextsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param contextsService Service injetado para reutilizar regras de contexts sem duplicar validações.
     */
    constructor(private readonly contextsService: MaterialContextsService) {}

    /**
     * Recebe o pedido de listagem de contextos pedagógicos de materiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @returns Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
     */
    @Get("student/study-areas/:studyAreaId/material-context")
    listPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.contextsService.listPrivateArea(request.user!, studyAreaId);
    }

    /**
     * Recebe o pedido de listagem de contextos pedagógicos de materiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
     */
    @Get("subjects/:subjectId/material-context")
    listOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.contextsService.listOfficialSubject(request.user!, subjectId);
    }
}
