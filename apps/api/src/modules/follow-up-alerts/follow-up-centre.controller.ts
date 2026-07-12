/** Endpoints de leitura consolidada do Centro de Acompanhamento docente. */
import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

@Controller("api/follow-up-centre")
@UseGuards(SessionGuard)
export class FollowUpCentreController {
    constructor(private readonly followUpService: FollowUpAlertsService) {}

    /** Devolve factos pedagógicos do aluno sem score oculto nem dados de colegas. */
    @Get("classes/:classId/students/:studentId")
    studentOverview(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Param("studentId") studentId: string,
    ) {
        return this.followUpService.getStudentOverview(
            request.user!,
            classId,
            studentId,
        );
    }
}
