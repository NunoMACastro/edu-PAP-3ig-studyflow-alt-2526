/**
 * Expõe os endpoints HTTP de material versions e delega regras de negócio para o service.
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
import { CreateMaterialVersionDto } from "./dto/material-version.dto.js";
import { MaterialVersionsService } from "./material-versions.service.js";

/**
 * Endpoints de versões de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialVersionsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param versionsService Service injetado para reutilizar regras de versions sem duplicar validações.
     */
    constructor(private readonly versionsService: MaterialVersionsService) {}

    /**
     * Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("material-index-jobs/:jobId/versions")
    createFromJob(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
        @Body() input: CreateMaterialVersionDto,
    ) {
        return this.versionsService.createFromJob(request.user!, jobId, input);
    }

    /**
     * Recebe o pedido de listagem de versões de materiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Coleção de versões de materiais visível para o contexto autorizado.
     */
    @Get("material-index-jobs/:jobId/versions")
    listForJob(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
    ) {
        return this.versionsService.listForJob(request.user!, jobId);
    }

    /**
     * Executa a operação restore version no domínio de versões de materiais com contrato explícito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @param versionId Identificador da versão de material a consultar ou restaurar.
     * @returns Valor de versões de materiais no contrato esperado pelo chamador.
     */
    @Patch("material-index-jobs/:jobId/versions/:versionId/restore")
    restoreVersion(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
        @Param("versionId") versionId: string,
    ) {
        return this.versionsService.restoreVersion(
            request.user!,
            jobId,
            versionId,
        );
    }

    /**
     * Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("student/study-areas/:studyAreaId/materials/:materialId/versions")
    createPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.versionsService.createPrivateVersion(
            request.user!,
            studyAreaId,
            materialId,
        );
    }

    /**
     * Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/official-materials/:materialId/versions")
    createOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.versionsService.createOfficialVersion(request.user!, materialId);
    }
}
