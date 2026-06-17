// apps/api/src/modules/follow-up-alerts/follow-up-alerts.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

/**
 * Endpoints de acompanhamento docente.
 */
@Controller("api/follow-up-alerts")
@UseGuards(SessionGuard)
export class FollowUpAlertsController {
    constructor(private readonly alertsService: FollowUpAlertsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.alertsService.listMine(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() input: CreateFollowUpAlertRuleDto) {
        return this.alertsService.createRule(request.user!, input);
    }

    @Get(":id/preview")
    preview(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.previewInactiveStudents(request.user!, id);
    }

    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.runRule(request.user!, id);
    }
}