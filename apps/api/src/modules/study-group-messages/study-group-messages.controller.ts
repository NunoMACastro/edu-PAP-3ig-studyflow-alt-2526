/**
 * Expõe os endpoints HTTP de mensagens de grupos de estudo e delega regras de negócio para o service.
 */
import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
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
        @Query("kind") kind?: string,
    ) {
        if (kind !== undefined && kind !== "MESSAGE" && kind !== "NOTE") {
            throw new BadRequestException({
                code: "STUDY_GROUP_MESSAGE_KIND_INVALID",
                message: "O tipo de histórico é inválido.",
            });
        }
        return kind === undefined
            ? this.messagesService.listMessages(request.user!, groupId)
            : this.messagesService.listMessages(request.user!, groupId, kind);
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

    /** Marca como visíveis as mensagens de outros membros do grupo. */
    @Put("read")
    markRead(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
    ) {
        return this.messagesService.markStudentRead(request.user!, groupId);
    }
}
