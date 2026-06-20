/**
 * Expõe os endpoints HTTP de indexação textual de materiais e delega regras de negócio para o service.
 */
import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
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
     */
    constructor(private readonly indexService: MaterialIndexService) {}

    /**
     * Executa a operação index private no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    @Post("student/study-areas/:studyAreaId/materials/:materialId/index-jobs")
    indexPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexPrivateMaterial(
            request.user!,
            studyAreaId,
            materialId,
        );
    }

    /**
     * Executa a operação index official no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
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
    findDone(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
        return this.indexService.findDoneJob(request.user!, jobId);
    }
}
