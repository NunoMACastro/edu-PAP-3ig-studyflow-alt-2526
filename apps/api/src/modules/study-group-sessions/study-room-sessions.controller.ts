/** Expõe sessões das salas sobre o serviço colaborativo partilhado. */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyGroupSessionDto } from "./dto/create-study-group-session.dto.js";
import {
    StudyGroupSessionsService,
    type StudyGroupSessionView,
} from "./study-group-sessions.service.js";

type StudyRoomSessionView = Omit<StudyGroupSessionView, "groupId"> & {
    roomId: string;
};

@Controller("api/study-rooms/:roomId/sessions")
@UseGuards(SessionGuard)
export class StudyRoomSessionsController {
    constructor(private readonly sessionsService: StudyGroupSessionsService) {}

    @Get()
    async list(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
    ): Promise<StudyRoomSessionView[]> {
        const rows = await this.sessionsService.listGroupSessions(
            request.user!,
            roomId,
            "STUDY_ROOM",
        );
        return rows.map((row) => this.toRoomSession(row));
    }

    @Post()
    async create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: CreateStudyGroupSessionDto,
    ): Promise<StudyRoomSessionView> {
        const row = await this.sessionsService.createSession(
            request.user!,
            roomId,
            body,
            "STUDY_ROOM",
        );
        return this.toRoomSession(row);
    }

    private toRoomSession(row: StudyGroupSessionView): StudyRoomSessionView {
        const { groupId, ...session } = row;
        return { ...session, roomId: groupId };
    }
}
