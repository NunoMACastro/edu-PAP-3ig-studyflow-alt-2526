/**
 * Expõe os endpoints HTTP de mensagens de grupos de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupMessageDto } from "./dto/create-study-group-message.dto.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

/**
 * Endpoints de mensagens e notas coletivas de grupos.
 */
@Controller("api/study-groups/:groupId/messages")
@UseGuards(SessionGuard)
export class StudyGroupMessagesController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param messagesService Service injetado para reutilizar regras de messages sem duplicar validações.
     */
    constructor(private readonly messagesService: StudyGroupMessagesService) {}

    /**
     * Lista o histórico do grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @returns Mensagens e notas.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
    ) {
        return this.messagesService.listMessages(request.user!, groupId);
    }

    /**
     * Cria mensagem ou nota.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @param body Conteúdo validado.
     * @returns Mensagem criada.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
        @Body() body: CreateStudyGroupMessageDto,
    ) {
        return this.messagesService.createMessage(request.user!, groupId, body);
    }
}
