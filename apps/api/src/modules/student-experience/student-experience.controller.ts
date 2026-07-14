/** Endpoints da experiência orientada a tarefas do aluno. */
import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateRecentContextDto } from "./dto/update-recent-context.dto.js";
import { StudentSearchDto } from "./dto/student-search.dto.js";
import { StudentExperienceService } from "./student-experience.service.js";

@Controller("api")
@UseGuards(SessionGuard)
export class StudentExperienceController {
    constructor(private readonly experienceService: StudentExperienceService) {}

    @Get("student/today")
    today(@Req() request: AuthenticatedRequest) {
        return this.experienceService.getToday(request.user!);
    }

    @Get("student/subjects/:subjectId/overview")
    subjectOverview(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.experienceService.getSubjectOverview(request.user!, subjectId);
    }

    @Post("student/search")
    search(
        @Req() request: AuthenticatedRequest,
        @Body() body: StudentSearchDto,
    ) {
        return this.experienceService.search(request.user!, body);
    }

    @Put("students/me/recent-context")
    updateRecentContext(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateRecentContextDto,
    ) {
        return this.experienceService.updateRecentContext(request.user!, body);
    }
}
