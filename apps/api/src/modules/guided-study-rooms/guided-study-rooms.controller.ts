/** Endpoints HTTP das salas guiadas para professor e aluno. */
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskGuidedStudyRoomAiDto } from "./dto/ask-guided-study-room-ai.dto.js";
import { ChangeGuidedStudyRoomStatusDto } from "./dto/change-guided-study-room-status.dto.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import { UpdateGuidedStudyRoomDto } from "./dto/update-guided-study-room.dto.js";
import { GuidedStudyRoomAiService } from "./guided-study-room-ai.service.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";
import { GuidedStudyRoomStatus } from "./schemas/guided-study-room.schema.js";

@Controller("api")
@UseGuards(SessionGuard)
export class GuidedStudyRoomsController {
    constructor(
        private readonly roomsService: GuidedStudyRoomsService,
        private readonly aiService: GuidedStudyRoomAiService,
    ) {}

    @Post("teacher/classes/:classId/guided-study-rooms")
    create(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Body() body: CreateGuidedStudyRoomDto) {
        return this.roomsService.create(request.user!, classId, body);
    }

    @Get("teacher/classes/:classId/guided-study-rooms")
    listTeacher(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.roomsService.listForTeacher(request.user!, classId);
    }

    @Get("teacher/classes/:classId/guided-study-rooms/:roomId")
    getTeacher(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string) {
        return this.roomsService.getForTeacher(request.user!, classId, roomId);
    }

    @Patch("teacher/classes/:classId/guided-study-rooms/:roomId")
    update(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string, @Body() body: UpdateGuidedStudyRoomDto) {
        return this.roomsService.update(request.user!, classId, roomId, body);
    }

    @Patch("teacher/classes/:classId/guided-study-rooms/:roomId/status")
    changeStatus(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string, @Body() body: ChangeGuidedStudyRoomStatusDto) {
        return this.roomsService.changeStatus(request.user!, classId, roomId, body);
    }

    @Get("teacher/classes/:classId/guided-study-rooms/:roomId/progress")
    progress(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string) {
        return this.roomsService.getProgress(request.user!, classId, roomId);
    }

    @Get("teacher/classes/:classId/guided-study-rooms/:roomId/ai/interactions")
    listTeacherAi(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string, @Query("cursor") cursor?: string, @Query("limit") limit?: string, @Query("studentId") studentId?: string) {
        return this.aiService.listForTeacher(request.user!, classId, roomId, {
            cursor,
            limit: limit ? Number(limit) : undefined,
            studentId,
        });
    }

    @Get("student/classes/:classId/guided-study-rooms")
    listStudent(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Query("status") status?: GuidedStudyRoomStatus, @Query("cursor") cursor?: string, @Query("limit") limit?: string) {
        return this.roomsService.listForStudent(
            request.user!,
            classId,
            status ?? "OPEN",
            cursor,
            limit ? Number(limit) : undefined,
        );
    }

    @Get("student/guided-study-rooms")
    listAllStudent(@Req() request: AuthenticatedRequest, @Query("status") status?: GuidedStudyRoomStatus, @Query("cursor") cursor?: string, @Query("limit") limit?: string, @Query("classId") classId?: string) {
        return this.roomsService.listAllForStudent(
            request.user!,
            status ?? "OPEN",
            cursor,
            limit ? Number(limit) : undefined,
            classId,
        );
    }

    @Get("student/classes/:classId/guided-study-rooms/:roomId")
    getStudent(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string) {
        return this.roomsService.getForStudent(request.user!, classId, roomId);
    }

    @Post("student/classes/:classId/guided-study-rooms/:roomId/participation/view")
    viewed(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string) {
        return this.roomsService.markViewed(request.user!, classId, roomId);
    }

    @Post("student/classes/:classId/guided-study-rooms/:roomId/participation/complete")
    complete(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string) {
        return this.roomsService.markCompleted(request.user!, classId, roomId);
    }

    @Post("student/classes/:classId/guided-study-rooms/:roomId/ai/answers")
    askAi(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string, @Body() body: AskGuidedStudyRoomAiDto) {
        return this.aiService.ask(request.user!, classId, roomId, body);
    }

    @Get("student/classes/:classId/guided-study-rooms/:roomId/ai/answers")
    listStudentAi(@Req() request: AuthenticatedRequest, @Param("classId") classId: string, @Param("roomId") roomId: string, @Query("cursor") cursor?: string, @Query("limit") limit?: string) {
        return this.aiService.listForStudent(request.user!, classId, roomId, cursor, limit ? Number(limit) : undefined);
    }
}
