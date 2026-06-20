// api/src/modules/external-material-imports/external-material-imports.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ImportExternalMaterialDto } from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Endpoint autenticado para importação unidirecional de materiais externos.
 */
@Controller("api/external-material-imports")
@UseGuards(SessionGuard)
export class ExternalMaterialImportsController {
    /**
     * Recebe o service para manter o controller fino e testável.
     *
     * @param importsService Service que aplica ownership e permissões.
     */
    constructor(private readonly importsService: ExternalMaterialImportsService) {}

    /**
     * Cria um material StudyFlow a partir de um link externo validado.
     *
     * @param request Pedido autenticado com `request.user` preenchido pelo guard.
     * @param body Dados validados pelo DTO.
     * @returns Material privado ou oficial criado pelo service adequado.
     */
    @Post()
    importExternalMaterial(
        @Req() request: AuthenticatedRequest,
        @Body() body: ImportExternalMaterialDto,
    ) {
        // A sessão autenticada é a fonte de identidade, nunca o body enviado pelo browser.
        return this.importsService.importExternalMaterial(request.user!, body);
    }
}