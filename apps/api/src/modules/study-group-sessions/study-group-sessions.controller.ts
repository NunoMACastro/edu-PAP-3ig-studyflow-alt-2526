/**
 * Expõe os endpoints HTTP de sessões de estudo em grupo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupSessionDto } from "./dto/create-study-group-session.dto.js";
import { StudyGroupSessionsService } from "./study-group-sessions.service.js";

/**
 * Endpoints de sessões de estudo coletivo.
 */
@Controller("api/study-groups/:groupId/sessions")
@UseGuards(SessionGuard)
export class StudyGroupSessionsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param sessionsService Service injetado para reutilizar regras de sessions sem duplicar validações.
     */
    constructor(private readonly sessionsService: StudyGroupSessionsService) {}

    /**
     * Lista sessões do grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @returns Sessões acessíveis.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
    ) {
        return this.sessionsService.listGroupSessions(request.user!, groupId);
    }

    /**
     * Agenda uma sessão no grupo.
     *
     * @param request Pedido autenticado.
     * @param groupId Grupo alvo.
     * @param body Dados validados.
     * @returns Sessão criada.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("groupId") groupId: string,
        @Body() body: CreateStudyGroupSessionDto,
    ) {
        return this.sessionsService.createSession(request.user!, groupId, body);
    }
}
