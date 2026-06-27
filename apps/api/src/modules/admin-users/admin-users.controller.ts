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
     * @param adminUsersService Serviço administrativo.
     */
    constructor(private readonly adminUsersService: AdminUsersService) {}

    /**
     * @param request Pedido autenticado.
     * @returns Utilizadores públicos.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.adminUsersService.listUsers(request.user!);
    }

    /**
     * @param request Pedido autenticado.
     * @param id Utilizador alvo.
     * @param body Novo papel e motivo.
     * @returns Utilizador atualizado.
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
