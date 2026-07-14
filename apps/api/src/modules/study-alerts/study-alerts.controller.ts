/**
 * Expõe os endpoints HTTP de alertas de estudo e delega regras de negócio para o service.
 */
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { StudyAlertsQueryDto } from "./dto/study-alerts-query.dto.js";
import { StudyAlertsService } from "./study-alerts.service.js";

/**
 * Endpoint de alertas internos de estudo.
 */
@Controller("api/study-alerts")
@UseGuards(SessionGuard)
export class StudyAlertsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param alertsService Service injetado para reutilizar regras de alerts sem duplicar validações.
     */
    constructor(private readonly alertsService: StudyAlertsService) {}

    /**
     * Lista alertas in-app derivados dos contratos existentes.
     *
     * @param request Pedido autenticado.
     * @param query Filtro opcional.
     * @returns Alertas visíveis.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Query() query: StudyAlertsQueryDto,
    ) {
        return this.alertsService.listAlerts(request.user!, query);
    }
}
