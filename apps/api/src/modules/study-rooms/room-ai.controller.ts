/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { ShareRoomAiAnswerDto } from "./dto/share-room-ai-answer.dto.js";
import { RoomAiService } from "./room-ai.service.js";
import { RoomAiSharingService } from "./room-ai-sharing.service.js";

/**
 * Controller da IA partilhada da sala.
 */
@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomAiService Service da geração e histórico privado da IA da sala.
     * @param roomAiSharingService Service da partilha e fork privado.
     */
    constructor(
        private readonly roomAiService: RoomAiService,
        private readonly roomAiSharingService: RoomAiSharingService,
    ) {}

    /**
     * Lista respostas IA da sala dentro do scope pedido.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user`.
     * @param roomId Identificador da sala; exige membership no service antes da leitura.
     * @param scope Scope público: `mine` para histórico privado ou `shared` para respostas partilhadas.
     * @returns Lista autorizada de respostas IA.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Query("scope") scope = "mine",
    ) {
        if (scope === "shared") {
            return this.roomAiSharingService.listSharedAnswers(request.user!, roomId);
        }

        if (scope !== "mine") {
            throw new BadRequestException({
                code: "INVALID_ROOM_AI_SCOPE",
                message: "Escolhe mine ou shared.",
            });
        }

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

    /**
     * Partilha uma resposta própria ou cria uma cópia privada de resposta partilhada.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user`.
     * @param roomId Identificador da sala; exige membership antes de ler ou escrever respostas.
     * @param answerId Identificador da resposta IA alvo.
     * @param body Modo de reutilização da resposta.
     * @returns Resultado público da operação.
     */
    @Post(":answerId/share")
    share(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Param("answerId") answerId: string,
        @Body() body: ShareRoomAiAnswerDto,
    ) {
        return this.roomAiSharingService.shareOrForkAnswer(
            request.user!,
            roomId,
            answerId,
            body,
        );
    }
}
