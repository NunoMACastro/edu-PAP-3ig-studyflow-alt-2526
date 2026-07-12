/**
 * Expõe os endpoints HTTP de study e delega regras de negócio para o service.
 */
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { DEFAULT_HISTORY_LIMIT, HistoryQueryDto } from "./dto/history-query.dto.js";
import { HistoryService } from "./history.service.js";

/**
 * Controller do histórico de estudo do aluno.
 */
@Controller("api/study/history")
@UseGuards(SessionGuard)
export class HistoryController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(private readonly historyService: HistoryService) {}

    /**
     * Lista os eventos do aluno autenticado.
     *
     * @param request Pedido autenticado.
     * @param query Filtros opcionais de listagem.
     * @returns Eventos recentes de estudo.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Query() query: HistoryQueryDto,
    ) {
        return this.historyService.listMyEvents(
            request.user!.id,
            query.limit ?? DEFAULT_HISTORY_LIMIT,
        );
    }
}
