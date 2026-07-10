/**
 * Expõe os endpoints HTTP de preferências de notificação e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "./notification-preferences.service.js";

/**
 * Endpoints de preferências de notificação.
 */
@Controller("api/notification-preferences")
@UseGuards(SessionGuard)
export class NotificationPreferencesController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param preferencesService Service injetado para reutilizar regras de preferences sem duplicar validações.
     */
    constructor(
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Lista preferências efetivas do utilizador.
     *
     * @param request Pedido autenticado.
     * @returns Preferências por contexto.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.preferencesService.listEffective(request.user!.id);
    }

    /**
     * Atualiza uma preferência.
     *
     * @param request Pedido autenticado.
     * @param body Contexto e canais.
     * @returns Preferência persistida.
     */
    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateNotificationPreferencesDto,
    ) {
        return this.preferencesService.upsert(request.user!.id, body);
    }
}
