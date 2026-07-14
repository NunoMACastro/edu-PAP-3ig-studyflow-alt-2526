/**
 * Expõe quotas administrativas de IA.
 */
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";

@Controller("api/admin")
@UseGuards(SessionGuard)
export class AiQuotasController {
    /**
     * Recebe as dependências injetadas de AiQuotasController para manter quotas de IA testável e separado de detalhes externos.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param quotasService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly quotasService: AiQuotasService) {}

    /**
     * Obtém o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get("ai-quotas")
    listPolicies(@Req() request: AuthenticatedRequest) {
        return this.quotasService.listPolicies(request.user!);
    }

    /**
     * Atualiza o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Put("ai-quotas")
    upsertPolicy(@Req() request: AuthenticatedRequest, @Body() body: UpsertAiQuotaPolicyDto) {
        return this.quotasService.upsertPolicy(request.user!, body);
    }

    /**
     * Obtém o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get("ai-usage")
    listUsage(@Req() request: AuthenticatedRequest) {
        return this.quotasService.listUsage(request.user!);
    }
}
