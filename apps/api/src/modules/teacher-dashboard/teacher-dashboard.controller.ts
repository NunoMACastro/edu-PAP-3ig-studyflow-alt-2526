/**
 * Expõe o dashboard inicial do professor autenticado.
 */
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { TeacherDashboardService } from "./teacher-dashboard.service.js";

/**
 * Controller do dashboard docente.
 */
@Controller("api/teacher/dashboard")
@UseGuards(SessionGuard)
export class TeacherDashboardController {
    /**
     * Recebe o service por injeção para manter o controller fino.
     *
     * @param dashboardService Service que agrega a visão docente.
     */
    constructor(private readonly dashboardService: TeacherDashboardService) {}

    /**
     * Obtém o dashboard do professor autenticado.
     *
     * @param request Pedido autenticado; a sessão define o professor real.
     * @returns Resumo agregado do dashboard docente.
     */
    @Get()
    get(@Req() request: AuthenticatedRequest) {
        return this.dashboardService.getDashboard(request.user!);
    }
}
