/**
 * Expõe os endpoints REST de histórico do chat professor-aluno por disciplina.
 */
import { Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { TeacherStudentChatService } from "./teacher-student-chat.service.js";

/**
 * Controller REST para carregamento inicial do histórico.
 *
 * O envio de mensagens fica exclusivo do WebSocket; REST só lê histórico já
 * persistido para suportar refresh e fallback visual quando a socket falha.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class TeacherStudentChatController {
    /**
     * Recebe dependências do domínio de chat por disciplina.
     *
     * @param chatService Service com autorização, leitura e persistência.
     */
    constructor(private readonly chatService: TeacherStudentChatService) {}

    /**
     * Lista histórico do chat para aluno inscrito na disciplina.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Últimas mensagens autorizadas.
     */
    @Get("student/subjects/:subjectId/chat/messages")
    listStudentMessages(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.chatService.listStudentMessages(request.user!, subjectId);
    }

    @Get("student/subject-chat/unread")
    listStudentUnread(@Req() request: AuthenticatedRequest) {
        return this.chatService.listStudentUnread(request.user!);
    }

    @Put("student/subjects/:subjectId/chat/read")
    markStudentRead(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.chatService.markStudentRead(request.user!, subjectId);
    }

    /**
     * Lista histórico do chat para o professor responsável pela disciplina.
     *
     * @param request Pedido autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Últimas mensagens autorizadas.
     */
    @Get("teacher/subjects/:subjectId/chat/messages")
    listTeacherMessages(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.chatService.listTeacherMessages(request.user!, subjectId);
    }
}
