// apps/api/src/modules/account-deletion/account-deletion.controller.ts
import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SESSION_COOKIE_NAME, SessionService } from "../auth/session.service.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { RequestAccountDeletionDto } from "./dto/request-account-deletion.dto.js";

/**
 * Endpoint de eliminação da própria conta.
 */
@Controller("api/privacy/account-deletion")
@UseGuards(SessionGuard)
export class AccountDeletionController {
    constructor(
        private readonly deletionService: AccountDeletionService,
        private readonly sessionService: SessionService,
    ) {}

    @Post()
    async deleteOwnAccount(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response, @Body() input: RequestAccountDeletionDto) {
        const result = await this.deletionService.deleteOwnAccount(request.user!, input);
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
        if (sessionId) await this.sessionService.destroySession(sessionId);
        response.clearCookie(SESSION_COOKIE_NAME);
        return result;
    }
}