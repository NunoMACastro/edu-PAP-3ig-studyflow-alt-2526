/**
 * Expõe gestão própria de consentimentos IA.
 */
import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";
import { AiConsentPurpose } from "./schemas/ai-consent.schema.js";

@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    /**
     * Recebe as dependências injetadas de AiConsentsController para manter consentimentos de IA testável e separado de detalhes externos.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param consentsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly consentsService: AiConsentsService) {}

    /**
     * Obtém o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.consentsService.list(request.user!);
    }

    /** Devolve versões exigidas e estado efetivo para construir consent gates. */
    @Get("capabilities")
    capabilities(@Req() request: AuthenticatedRequest) {
        return this.consentsService.listCapabilities(request.user!);
    }

    /**
     * Regista o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Put(":purpose")
    grant(
        @Req() request: AuthenticatedRequest,
        @Param("purpose") purpose: AiConsentPurpose,
        @Body() body: UpsertAiConsentDto,
    ) {
        return this.consentsService.grant(request.user!, purpose, body);
    }

    /**
     * Remove o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Delete(":purpose")
    revoke(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}
