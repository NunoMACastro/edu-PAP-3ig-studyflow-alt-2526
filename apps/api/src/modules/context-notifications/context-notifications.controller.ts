/**
 * Expõe notificações contextuais in-app.
 */
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";

@Controller("api/context-notifications")
@UseGuards(SessionGuard)
export class ContextNotificationsController {
    /**
     * Recebe as dependências injetadas de ContextNotificationsController para manter notificações contextuais testável e separado de detalhes externos.
     *
     * @param notificationsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly notificationsService: ContextNotificationsService) {}

    /**
     * Cria o pedido HTTP de notificações contextuais e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateContextNotificationDto) {
        return this.notificationsService.create(request.user!, body);
    }

    /**
     * Obtém o pedido HTTP de notificações contextuais e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.notificationsService.list(request.user!);
    }
}
