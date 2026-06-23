/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateRoomShareDto } from "./dto/create-room-share.dto.js";
import { RoomSharesService } from "./room-shares.service.js";

/**
 * Controller de partilhas da sala.
 */
@Controller("api/study-rooms/:roomId/shares")
@UseGuards(SessionGuard)
export class RoomSharesController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomSharesService Service injetado para reutilizar regras de sala shares sem duplicar validações.
     */
    constructor(private readonly roomSharesService: RoomSharesService) {}

    /**
     * Recebe o pedido de criação de salas de estudo e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de salas de estudo criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: CreateRoomShareDto,
    ) {
        return this.roomSharesService.createShare(request.user!, roomId, body);
    }

    /**
     * Recebe o pedido de listagem de salas de estudo e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @returns Coleção de salas de estudo visível para o contexto autorizado.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("roomId") roomId: string) {
        return this.roomSharesService.listRoomShares(request.user!, roomId);
    }
}
