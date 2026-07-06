/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { RoomAiService } from "./room-ai.service.js";

/**
 * Controller da IA partilhada da sala.
 */
@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomAiService Service injetado para reutilizar regras de sala ai sem duplicar validações.
     */
    constructor(private readonly roomAiService: RoomAiService) {}

    /**
     * Lista as respostas privadas da IA da sala criadas pelo aluno autenticado.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user`.
     * @param roomId Identificador da sala; exige membership no service antes da leitura.
     * @returns Histórico privado da IA da sala.
     */
    @Get()
    listMine(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
    ) {
        return this.roomAiService.listMyRoomAiHistory(request.user!, roomId);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: AskRoomAiDto,
    ) {
        return this.roomAiService.askRoomAi(request.user!, roomId, body);
    }
}