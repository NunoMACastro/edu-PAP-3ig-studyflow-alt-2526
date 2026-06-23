/**
 * Expõe eliminação de conta própria.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SESSION_COOKIE_NAME } from "../auth/session.service.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { DeleteAccountDto } from "./dto/delete-account.dto.js";

@Controller("api/privacy/account-deletion")
@UseGuards(SessionGuard)
export class AccountDeletionController {
    constructor(private readonly deletionService: AccountDeletionService) {}

    @Post()
    delete(@Req() request: AuthenticatedRequest, @Body() _body: DeleteAccountDto) {
        return this.deletionService.deleteMine(
            request.user!,
            request.cookies?.[SESSION_COOKIE_NAME],
        );
    }
}
