/**
 * Expõe consulta administrativa de auditoria.
 */
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditQueryDto } from "./dto/audit-query.dto.js";

@Controller("api/admin/audit-events")
@UseGuards(SessionGuard)
export class AuditLogController {
    /**
     * @param auditLogService Serviço de auditoria.
     */
    constructor(private readonly auditLogService: AuditLogService) {}

    /**
     * @param request Pedido autenticado.
     * @param query Filtros de auditoria.
     * @returns Eventos auditáveis.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest, @Query() query: AuditQueryDto) {
        return this.auditLogService.list(request.user!, query);
    }
}
