/**
 * Expõe políticas administrativas de modelos IA.
 */
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";

@Controller("api/admin/ai-model-policies")
@UseGuards(SessionGuard)
export class AiModelPoliciesController {
    constructor(private readonly policiesService: AiModelPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put(":purpose")
    upsert(
        @Req() request: AuthenticatedRequest,
        @Param("purpose") purpose: AiConsentPurpose,
        @Body() body: UpsertAiModelPolicyDto,
    ) {
        return this.policiesService.upsert(request.user!, purpose, body);
    }
}
