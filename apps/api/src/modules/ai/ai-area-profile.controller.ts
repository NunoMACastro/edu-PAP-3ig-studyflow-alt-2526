/**
 * Expõe os endpoints HTTP de ai e delega regras de negócio para o service.
 */
import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";

/**
 * Controller do perfil IA por área.
 */
@Controller("api/study-areas/:id/ai-profile")
@UseGuards(SessionGuard)
export class AiAreaProfileController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param profileService Service injetado para reutilizar regras de profile sem duplicar validações.
     */
    constructor(private readonly profileService: AiAreaProfileService) {}

    /**
     * Prepara ou atualiza o perfil IA da área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @returns Estado do perfil IA.
     */
    @Post()
    prepare(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.profileService.prepareProfile(request.user!.id, id);
    }
}
