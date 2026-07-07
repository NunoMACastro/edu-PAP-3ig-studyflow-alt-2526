/**
 * Expõe eliminação de conta própria.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SESSION_COOKIE_NAME } from "../auth/session.service.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { DeleteAccountDto } from "./dto/delete-account.dto.js";

@Controller("api/privacy/account-deletion")
@UseGuards(SessionGuard)
export class AccountDeletionController {
    /**
     * Recebe as dependências injetadas de AccountDeletionController para manter eliminação de conta testável e separado de detalhes externos.
     *
     * @param deletionService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly deletionService: AccountDeletionService) {}

    /**
     * Remove o pedido HTTP de eliminação de conta e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param _body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post()
    delete(@Req() request: AuthenticatedRequest, @Body() _body: DeleteAccountDto) {
        return this.deletionService.deleteMine(
            request.user!,
            request.cookies?.[SESSION_COOKIE_NAME],
        );
    }
}
