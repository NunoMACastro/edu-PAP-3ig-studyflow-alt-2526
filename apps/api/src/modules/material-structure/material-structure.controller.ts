/**
 * Expõe os endpoints HTTP de material structure e delega regras de negócio para o service.
 */
import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialStructureService } from "./material-structure.service.js";

/**
 * Endpoints de estruturação de materiais.
 */
@Controller("api/material-index-jobs/:jobId/structure")
@UseGuards(SessionGuard)
export class MaterialStructureController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param structureService Service injetado para reutilizar regras de structure sem duplicar validações.
     */
    constructor(private readonly structureService: MaterialStructureService) {}

    /**
     * Recebe o pedido de criação de estrutura de materiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Registo de estrutura de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
        return this.structureService.createFromJob(request.user!, jobId);
    }
}
