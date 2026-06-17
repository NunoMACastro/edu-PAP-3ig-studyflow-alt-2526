// apps/api/src/modules/context-notifications/context-notifications.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";

/**
 * Endpoints protegidos de notificações internas.
 */
@Controller("api/context-notifications")
@UseGuards(SessionGuard)
export class ContextNotificationsController {
    constructor(private readonly notificationsService: ContextNotificationsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.notificationsService.listMine(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() input: CreateContextNotificationDto) {
        return this.notificationsService.create(request.user!, input);
    }
}