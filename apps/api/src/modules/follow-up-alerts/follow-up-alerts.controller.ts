/**
 * Expõe alertas docentes de acompanhamento.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

@Controller("api/follow-up-alerts")
@UseGuards(SessionGuard)
export class FollowUpAlertsController {
    /**
     * Recebe as dependências injetadas de FollowUpAlertsController para manter alertas de acompanhamento testável e separado de detalhes externos.
     *
     * @param alertsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly alertsService: FollowUpAlertsService) {}

    /**
     * Obtém o resumo seguro de acompanhamento sem disparar notificações.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Regras com preview legível para a página docente de acompanhamento.
     */
    @Get("summary")
    summary(@Req() request: AuthenticatedRequest) {
        return this.alertsService.summary(request.user!);
    }

    /**
     * Obtém o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.alertsService.list(request.user!);
    }

    /**
     * Cria o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateFollowUpAlertRuleDto) {
        return this.alertsService.create(request.user!, body);
    }

    /**
     * Executa o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param id Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.run(request.user!, id);
    }
}
