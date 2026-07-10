/**
 * Expõe os endpoints HTTP de materiais oficiais e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto.js";
import { OfficialMaterialsService } from "./official-materials.service.js";

/**
 * Controller de materiais oficiais.
 */
@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     */
    constructor(private readonly materialsService: OfficialMaterialsService) {}

    /**
     * Recebe o pedido de criação de materiais oficiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de materiais oficiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialMaterialDto,
    ) {
        return this.materialsService.createOfficialMaterial(
            request.user!,
            subjectId,
            body,
        );
    }

    /**
     * Recebe o pedido de listagem de materiais oficiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de materiais oficiais visível para o contexto autorizado.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.materialsService.listTeacherSubjectMaterials(
            request.user!,
            subjectId,
        );
    }
}
