/**
 * Expõe políticas administrativas de notificações.
 */
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";
import { NotificationChannel } from "./schemas/notification-channel-policy.schema.js";

@Controller("api/admin/notification-policies")
@UseGuards(SessionGuard)
export class NotificationPoliciesController {
    constructor(private readonly policiesService: NotificationPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put(":channel")
    upsert(
        @Req() request: AuthenticatedRequest,
        @Param("channel") channel: NotificationChannel,
        @Body() body: UpsertNotificationPolicyDto,
    ) {
        return this.policiesService.upsert(request.user!, channel, body);
    }
}
