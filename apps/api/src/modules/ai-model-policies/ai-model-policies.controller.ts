// apps/api/src/modules/ai-model-policies/ai-model-policies.controller.ts
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";

/**
 * API administrativa de políticas IA.
 */
@Controller("api/admin/ai-model-policies")
@UseGuards(SessionGuard)
export class AiModelPoliciesController {
    constructor(private readonly policiesService: AiModelPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put()
    upsert(@Req() request: AuthenticatedRequest, @Body() input: UpsertAiModelPolicyDto) {
        return this.policiesService.upsert(request.user!, input);
    }
}