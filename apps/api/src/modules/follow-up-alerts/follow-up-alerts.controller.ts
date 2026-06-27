/**
 * Expõe alertas docentes de acompanhamento.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

@Controller("api/follow-up-alerts")
@UseGuards(SessionGuard)
export class FollowUpAlertsController {
    constructor(private readonly alertsService: FollowUpAlertsService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.alertsService.list(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateFollowUpAlertRuleDto) {
        return this.alertsService.create(request.user!, body);
    }

    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.run(request.user!, id);
    }
}
