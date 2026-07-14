/** Expõe conversa persistente da sala reutilizando as regras colaborativas existentes. */
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupMessageDto } from "./dto/create-study-group-message.dto.js";
import {
    StudyGroupMessagesService,
    type StudyGroupMessageView,
} from "./study-group-messages.service.js";

/** Contrato público de mensagem de sala, sem nomenclatura legada de grupo. */
type StudyRoomMessageView = Omit<StudyGroupMessageView, "groupId"> & {
    roomId: string;
};

@Controller("api/study-rooms/:roomId/messages")
@UseGuards(SessionGuard)
export class StudyRoomMessagesController {
    constructor(private readonly messagesService: StudyGroupMessagesService) {}

    /** Lista apenas conversa; as notas da sala continuam em `RoomShare/NOTE`. */
    @Get()
    async list(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
    ): Promise<StudyRoomMessageView[]> {
        const rows = await this.messagesService.listMessages(
            request.user!,
            roomId,
            "MESSAGE",
            "STUDY_ROOM",
        );
        return rows.map((row) => this.toRoomMessage(row));
    }

    /** Mantém um fallback REST seguro para clientes sem WebSocket. */
    @Post()
    async create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: CreateStudyGroupMessageDto,
    ): Promise<StudyRoomMessageView> {
        if (body.kind !== "MESSAGE") {
            throw new BadRequestException({
                code: "STUDY_ROOM_MESSAGE_KIND_INVALID",
                message: "As notas da sala devem ser criadas no separador Notas.",
            });
        }
        const row = await this.messagesService.createMessage(
            request.user!,
            roomId,
            body,
            "STUDY_ROOM",
        );
        return this.toRoomMessage(row);
    }

    /** Avança o cursor pessoal de leitura da conversa da sala. */
    @Put("read")
    markRead(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
    ) {
        return this.messagesService.markStudentRead(
            request.user!,
            roomId,
            "STUDY_ROOM",
        );
    }

    private toRoomMessage(row: StudyGroupMessageView): StudyRoomMessageView {
        const { groupId, ...message } = row;
        return { ...message, roomId: groupId };
    }
}
