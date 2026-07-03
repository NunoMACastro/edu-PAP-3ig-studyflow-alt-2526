/**
 * Expõe os endpoints HTTP de salas de estudo guiado e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";

/**
 * Endpoints de salas guiadas para professores e alunos.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class GuidedStudyRoomsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomsService Service injetado para reutilizar regras de rooms sem duplicar validações.
     */
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    /**
     * Recebe o pedido de criação de salas de estudo guiado e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de salas de estudo guiado criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("teacher/classes/:classId/guided-study-rooms")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateGuidedStudyRoomDto,
    ) {
        return this.roomsService.create(request.user!, classId, body);
    }

    /**
     * Recebe o pedido de listagem de salas de estudo guiado e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de salas de estudo guiado visível para o contexto autorizado.
     */
    @Get("teacher/classes/:classId/guided-study-rooms")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.roomsService.listForTeacher(request.user!, classId);
    }

    /**
     * Recebe o pedido de listagem de salas de estudo guiado e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de salas de estudo guiado visível para o contexto autorizado.
     */
    @Get("student/classes/:classId/guided-study-rooms")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.roomsService.listForStudent(request.user!, classId);
    }
}
