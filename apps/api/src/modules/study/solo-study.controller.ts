/**
 * Expõe os endpoints HTTP de study e delega regras de negócio para o service.
 */
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SoloStudyService } from "./solo-study.service.js";

/**
 * Controller do dashboard individual.
 */
@Controller("api/study/solo")
@UseGuards(SessionGuard)
export class SoloStudyController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param soloStudyService Service injetado para reutilizar regras de solo study sem duplicar validações.
     */
    constructor(private readonly soloStudyService: SoloStudyService) {}

    /**
     * Devolve estado inicial do modo individual.
     *
     * @param request Pedido autenticado.
     * @returns Estado do dashboard individual.
     */
    @Get()
    getSoloStudyState(@Req() request: AuthenticatedRequest) {
        return this.soloStudyService.getSoloStudyState(request.user!.id);
    }
}
