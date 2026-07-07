/**
 * Expõe os endpoints HTTP de indexação textual de materiais e delega regras de negócio para o service.
 */
import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialIndexQueueService } from "./material-index-queue.service.js";
import { MaterialIndexService } from "./material-index.service.js";

/**
 * Endpoints de indexação básica de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialIndexController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param indexService Service injetado para reutilizar regras de index sem duplicar validações.
     * @param queueService Service que separa resposta HTTP e extração privada pesada.
     */
    constructor(
        private readonly indexService: MaterialIndexService,
        private readonly queueService: MaterialIndexQueueService,
    ) {}

    /**
     * Executa a operação index private no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param studyAreaId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post("student/study-areas/:studyAreaId/materials/:materialId/index-jobs")
    indexPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.queueService.enqueuePrivateMaterial({
            // O userId vem da sessão; o body não participa em decisões de ownership.
            actor: request.user!,
            studyAreaId,
            materialId,
        });
    }

    /**
     * Executa a operação index official no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post("teacher/official-materials/:materialId/index-jobs")
    indexOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexOfficialMaterial(request.user!, materialId);
    }

    /**
     * Procura indexação textual de materiais com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
     */
    @Get("material-index-jobs/:jobId")
    findJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
        return this.indexService.findOwnedJob(request.user!, jobId);
    }
}
