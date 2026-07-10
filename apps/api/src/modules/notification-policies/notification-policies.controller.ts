/**
 * Expõe políticas administrativas de notificações.
 */
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";
import { NotificationChannel } from "./schemas/notification-channel-policy.schema.js";

@Controller("api/admin/notification-policies")
@UseGuards(SessionGuard)
export class NotificationPoliciesController {
    /**
     * Recebe as dependências injetadas de NotificationPoliciesController para manter políticas de notificações testável e separado de detalhes externos.
     *
     * @param policiesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly policiesService: NotificationPoliciesService) {}

    /**
     * Obtém o pedido HTTP de políticas de notificações e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    /**
     * Atualiza o pedido HTTP de políticas de notificações e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param channel Valor de channel usado pela função para executar upsert com dados explícitos.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Put(":channel")
    upsert(
        @Req() request: AuthenticatedRequest,
        @Param("channel") channel: NotificationChannel,
        @Body() body: UpsertNotificationPolicyDto,
    ) {
        return this.policiesService.upsert(request.user!, channel, body);
    }
}
