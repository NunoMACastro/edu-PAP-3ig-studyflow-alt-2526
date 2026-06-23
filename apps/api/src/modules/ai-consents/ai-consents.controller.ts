/**
 * Expõe gestão própria de consentimentos IA.
 */
import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";
import { AiConsentPurpose } from "./schemas/ai-consent.schema.js";

@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    constructor(private readonly consentsService: AiConsentsService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.consentsService.list(request.user!);
    }

    @Put(":purpose")
    grant(
        @Req() request: AuthenticatedRequest,
        @Param("purpose") purpose: AiConsentPurpose,
        @Body() body: UpsertAiConsentDto,
    ) {
        return this.consentsService.grant(request.user!, purpose, body);
    }

    @Delete(":purpose")
    revoke(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}
