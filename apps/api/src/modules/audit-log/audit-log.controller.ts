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
     * Recebe as dependências injetadas de AuditLogController para manter auditoria administrativa testável e separado de detalhes externos.
     *
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly auditLogService: AuditLogService) {}

    /**
     * Obtém o pedido HTTP de auditoria administrativa e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param query Valor de query usado pela função para executar list com dados explícitos.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest, @Query() query: AuditQueryDto) {
        return this.auditLogService.list(request.user!, query);
    }
}
