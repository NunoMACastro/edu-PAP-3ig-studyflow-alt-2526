// apps/api/src/modules/ai-quotas/ai-quotas.controller.ts
import { Body, Controller, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";

/**
 * API administrativa de quotas IA.
 */
@Controller("api/admin/ai-quotas")
@UseGuards(SessionGuard)
export class AiQuotasController {
    constructor(private readonly quotasService: AiQuotasService) {}

    @Put()
    upsertPolicy(@Req() request: AuthenticatedRequest, @Body() input: UpsertAiQuotaPolicyDto) {
        return this.quotasService.upsertPolicy(request.user!, input);
    }
}