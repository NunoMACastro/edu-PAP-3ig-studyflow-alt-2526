/**
 * Expõe políticas administrativas de modelos IA.
 */
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";

@Controller("api/admin/ai-model-policies")
@UseGuards(SessionGuard)
export class AiModelPoliciesController {
    /**
     * Recebe as dependências injetadas de AiModelPoliciesController para manter políticas de modelos de IA testável e separado de detalhes externos.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param policiesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly policiesService: AiModelPoliciesService) {}

    /**
     * Obtém o pedido HTTP de políticas de modelos de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    /**
     * Atualiza o pedido HTTP de políticas de modelos de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Put(":purpose")
    upsert(
        @Req() request: AuthenticatedRequest,
        @Param("purpose") purpose: AiConsentPurpose,
        @Body() body: UpsertAiModelPolicyDto,
    ) {
        return this.policiesService.upsert(request.user!, purpose, body);
    }
}
