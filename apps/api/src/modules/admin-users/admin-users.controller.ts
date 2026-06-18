// apps/api/src/modules/admin-users/admin-users.controller.ts
import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdminUsersService } from "./admin-users.service.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";

/**
 * Endpoints administrativos de utilizadores.
 */
@Controller("api/admin/users")
@UseGuards(SessionGuard)
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) {}

    @Get()
    listUsers(@Req() request: AuthenticatedRequest) {
        return this.adminUsersService.listUsers(request.user!);
    }

    @Patch(":id/role")
    changeRole(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() input: ChangeUserRoleDto) {
        return this.adminUsersService.changeRole(request.user!, id, input);
    }
}