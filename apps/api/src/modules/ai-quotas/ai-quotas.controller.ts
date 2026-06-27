/**
 * Expõe quotas administrativas de IA.
 */
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";

@Controller("api/admin")
@UseGuards(SessionGuard)
export class AiQuotasController {
    constructor(private readonly quotasService: AiQuotasService) {}

    @Get("ai-quotas")
    listPolicies(@Req() request: AuthenticatedRequest) {
        return this.quotasService.listPolicies(request.user!);
    }

    @Put("ai-quotas")
    upsertPolicy(@Req() request: AuthenticatedRequest, @Body() body: UpsertAiQuotaPolicyDto) {
        return this.quotasService.upsertPolicy(request.user!, body);
    }

    @Get("ai-usage")
    listUsage(@Req() request: AuthenticatedRequest) {
        return this.quotasService.listUsage(request.user!);
    }
}
