/**
 * Expõe gestão administrativa de utilizadores.
 */
import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdminUsersService } from "./admin-users.service.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";

@Controller("api/admin/users")
@UseGuards(SessionGuard)
export class AdminUsersController {
    /**
     * Recebe as dependências injetadas de AdminUsersController para manter administração de utilizadores testável e separado de detalhes externos.
     *
     * @param adminUsersService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly adminUsersService: AdminUsersService) {}

    /**
     * Obtém o pedido HTTP de administração de utilizadores e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.adminUsersService.listUsers(request.user!);
    }

    /**
     * Executa o pedido HTTP de administração de utilizadores e delega no service a aplicação das regras de autenticação, validação e domínio.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param id Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Patch(":id/role")
    changeRole(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: ChangeUserRoleDto,
    ) {
        return this.adminUsersService.changeRole(request.user!, id, body);
    }
}
