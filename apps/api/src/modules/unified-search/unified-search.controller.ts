/**
 * Expõe os endpoints HTTP de pesquisa unificada e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UnifiedSearchDto } from "./dto/unified-search.dto.js";
import { UnifiedSearchService } from "./unified-search.service.js";

/**
 * Endpoint de pesquisa unificada.
 */
@Controller("api/search")
@UseGuards(SessionGuard)
export class UnifiedSearchController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param searchService Service injetado para reutilizar regras de search sem duplicar validações.
     */
    constructor(private readonly searchService: UnifiedSearchService) {}

    /**
     * Pesquisa em jobs autorizados.
     *
     * @param request Pedido autenticado.
     * @param body Query e jobs.
     * @returns Resultados com origem.
     */
    @Post()
    search(@Req() request: AuthenticatedRequest, @Body() body: UnifiedSearchDto) {
        return this.searchService.search(request.user!, body);
    }
}
