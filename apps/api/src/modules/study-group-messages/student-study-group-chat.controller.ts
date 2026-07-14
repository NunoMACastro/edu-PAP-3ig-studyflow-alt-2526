/** Expõe os contadores bulk do chat de grupos para o aluno autenticado. */
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

@Controller("api/student/study-group-chat")
@UseGuards(SessionGuard)
export class StudentStudyGroupChatController {
    constructor(private readonly messagesService: StudyGroupMessagesService) {}

    /** Lista unread apenas dos grupos onde o aluno ainda é membro. */
    @Get("unread")
    listUnread(@Req() request: AuthenticatedRequest) {
        return this.messagesService.listStudentUnread(request.user!);
    }
}
