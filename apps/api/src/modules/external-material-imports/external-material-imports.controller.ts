/**
 * Expoe o endpoint RF61 para importar links externos como materiais StudyFlow.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ImportExternalMaterialDto } from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Controller autenticado de importacao unidirecional Google Drive/OneDrive.
 */
@Controller("api/external-material-imports")
@UseGuards(SessionGuard)
export class ExternalMaterialImportsController {
    /**
     * Recebe o service RF61 mantendo o controller sem regras de dominio.
     *
     * @param importsService Service que valida provider e delega no destino correto.
     */
    constructor(
        private readonly importsService: ExternalMaterialImportsService,
    ) {}

    /**
     * Importa um link externo para area privada ou disciplina oficial.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param body Payload RF61 validado pelo `ValidationPipe`.
     * @returns Material publico criado.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: ImportExternalMaterialDto,
    ) {
        return this.importsService.importExternalMaterial(request.user!, body);
    }
}
