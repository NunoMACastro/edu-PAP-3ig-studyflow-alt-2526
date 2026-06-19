// apps/api/src/modules/audit-log/audit-log.controller.ts
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditQueryDto } from "./dto/audit-query.dto.js";

/**
 * Consulta administrativa de eventos auditáveis.
 */
@Controller("api/admin/audit-events")
@UseGuards(SessionGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest, @Query() query: AuditQueryDto) {
        return this.auditLogService.list(request.user!, query);
    }
}