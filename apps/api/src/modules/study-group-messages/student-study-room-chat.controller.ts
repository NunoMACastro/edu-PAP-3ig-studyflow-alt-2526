/** Expõe os contadores bulk do chat das salas do aluno autenticado. */
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

@Controller("api/student/study-room-chat")
@UseGuards(SessionGuard)
export class StudentStudyRoomChatController {
    constructor(private readonly messagesService: StudyGroupMessagesService) {}

    /** Lista unread apenas das salas onde o aluno continua a ser membro. */
    @Get("unread")
    listUnread(@Req() request: AuthenticatedRequest) {
        return this.messagesService.listStudentUnread(request.user!, "STUDY_ROOM");
    }
}
