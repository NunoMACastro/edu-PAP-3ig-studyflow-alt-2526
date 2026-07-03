/**
 * Expõe os endpoints HTTP de navegação curricular e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CurriculumNavigationService } from "./curriculum-navigation.service.js";
import { CurriculumNavigationDto } from "./dto/curriculum-navigation.dto.js";

/**
 * Endpoint de navegação por programa/currículo.
 */
@Controller("api/curriculum/navigation")
@UseGuards(SessionGuard)
export class CurriculumNavigationController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param navigationService Service injetado para reutilizar regras de navigation sem duplicar validações.
     */
    constructor(private readonly navigationService: CurriculumNavigationService) {}

    /**
     * Carrega tópicos e secções a partir de jobs autorizados.
     *
     * @param request Pedido autenticado.
     * @param body Jobs alvo.
     * @returns Navegação curricular.
     */
    @Post()
    load(
        @Req() request: AuthenticatedRequest,
        @Body() body: CurriculumNavigationDto,
    ) {
        return this.navigationService.load(request.user!, body);
    }
}
