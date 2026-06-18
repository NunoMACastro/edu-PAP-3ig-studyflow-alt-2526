// apps/api/src/modules/ai-consents/ai-consents.controller.ts
import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsentPurpose, UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";

/**
 * API de consentimentos IA do próprio utilizador.
 */
@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    constructor(private readonly consentsService: AiConsentsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.consentsService.listMine(request.user!);
    }

    @Put(":purpose")
    grant(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose, @Body() input: UpsertAiConsentDto) {
        return this.consentsService.grant(request.user!, { ...input, purpose });
    }

    @Delete(":purpose")
    revoke(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}