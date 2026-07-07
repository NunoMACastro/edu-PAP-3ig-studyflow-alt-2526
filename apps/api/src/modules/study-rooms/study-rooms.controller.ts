/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AddRoomMemberDto } from "./dto/add-room-member.dto.js";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Controller das salas de estudo.
 */
@Controller("api/study-rooms")
@UseGuards(SessionGuard)
export class StudyRoomsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param studyRoomsService Service injetado para reutilizar regras de salas de estudo sem duplicar validações.
     */
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    /**
     * Recebe o pedido de criação de salas de estudo e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de salas de estudo criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateStudyRoomDto) {
        return this.studyRoomsService.createRoom(request.user!, body);
    }

    /**
     * Recebe o pedido de listagem de salas de estudo e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @returns Coleção de salas de estudo visível para o contexto autorizado.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyRoomsService.listMyRooms(request.user!);
    }

    /**
     * Executa a operação add member no domínio de salas de estudo com contrato explícito.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param roomId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post(":roomId/members")
    addMember(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: AddRoomMemberDto,
    ) {
        return this.studyRoomsService.addMember(request.user!, roomId, body);
    }
}
