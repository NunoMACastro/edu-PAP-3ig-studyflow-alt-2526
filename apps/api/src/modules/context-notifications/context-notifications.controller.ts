/**
 * Expõe notificações contextuais in-app.
 */
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";

@Controller("api/context-notifications")
@UseGuards(SessionGuard)
export class ContextNotificationsController {
    constructor(private readonly notificationsService: ContextNotificationsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateContextNotificationDto) {
        return this.notificationsService.create(request.user!, body);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.notificationsService.list(request.user!);
    }
}
