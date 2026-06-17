// apps/api/src/modules/notification-policies/notification-policies.controller.ts
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";

/**
 * API administrativa de políticas de notificação.
 */
@Controller("api/admin/notification-policies")
@UseGuards(SessionGuard)
export class NotificationPoliciesController {
    constructor(private readonly policiesService: NotificationPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put()
    upsert(@Req() request: AuthenticatedRequest, @Body() input: UpsertNotificationPolicyDto) {
        return this.policiesService.upsert(request.user!, input);
    }
}