// apps/api/src/modules/ai-consents/ai-consents.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import {
    AiConsentPurpose,
    UpsertAiConsentDto,
} from "./dto/upsert-ai-consent.dto.js";

/**
 * API de consentimentos IA do próprio utilizador.
 */
@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    constructor(private readonly consentsService: AiConsentsService) {}

    /**
     * Lista o histórico de decisões IA do utilizador autenticado.
     */
    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        // O utilizador vem da sessão validada pelo SessionGuard, não do body.
        return this.consentsService.listMine(request.user!);
    }

    /**
     * Concede consentimento para a finalidade indicada no URL.
     */
    @Put(":purpose")
    grant(
        @Req() request: AuthenticatedRequest,
        @Param("purpose", new ParseEnumPipe(AiConsentPurpose))
        purpose: AiConsentPurpose,
        @Body() input: UpsertAiConsentDto,
    ) {
        // O purpose do URL prevalece para evitar divergência entre URL e body.
        return this.consentsService.grant(request.user!, { ...input, purpose });
    }

    /**
     * Revoga consentimento para a finalidade indicada no URL.
     */
    @Delete(":purpose")
    revoke(
        @Req() request: AuthenticatedRequest,
        @Param("purpose", new ParseEnumPipe(AiConsentPurpose))
        purpose: AiConsentPurpose,
    ) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}