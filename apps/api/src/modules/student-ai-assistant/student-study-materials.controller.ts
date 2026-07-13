/** Endpoints do arquivo privado transversal de materiais do aluno. */
import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { buildArtifactExportContentDisposition } from "../ai/artifact-export.service.js";
import { CreateQuizAttemptDto } from "../ai/dto/create-quiz-attempt.dto.js";
import { ListStudentStudyMaterialsDto } from "./dto/student-ai-assistant.dto.js";
import { StudentStudyMaterialsService } from "./student-study-materials.service.js";

@Controller("api/student/study-materials")
@UseGuards(SessionGuard)
export class StudentStudyMaterialsController {
    constructor(private readonly materialsService: StudentStudyMaterialsService) {}

    @Get()
    @Header("Cache-Control", "private, no-store")
    list(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListStudentStudyMaterialsDto,
    ) {
        return this.materialsService.list(request.user!, query);
    }

    @Get(":artifactId")
    @Header("Cache-Control", "private, no-store")
    get(
        @Req() request: AuthenticatedRequest,
        @Param("artifactId") artifactId: string,
    ) {
        return this.materialsService.get(request.user!, artifactId);
    }

    @Delete(":artifactId")
    delete(
        @Req() request: AuthenticatedRequest,
        @Param("artifactId") artifactId: string,
    ) {
        return this.materialsService.delete(request.user!, artifactId);
    }

    @Get(":artifactId/export")
    async export(
        @Req() request: AuthenticatedRequest,
        @Param("artifactId") artifactId: string,
        @Query("format") format: string | undefined,
        @Res({ passthrough: true }) response: Response,
    ): Promise<string> {
        const file = await this.materialsService.export(
            request.user!,
            artifactId,
            format,
        );
        response.setHeader("Content-Type", file.contentType);
        response.setHeader(
            "Content-Disposition",
            buildArtifactExportContentDisposition(file),
        );
        response.setHeader("Cache-Control", "private, no-store");
        return file.body;
    }

    @Post(":artifactId/quiz-attempts")
    submitQuizAttempt(
        @Req() request: AuthenticatedRequest,
        @Param("artifactId") artifactId: string,
        @Body() body: CreateQuizAttemptDto,
    ) {
        return this.materialsService.submitQuizAttempt(
            request.user!,
            artifactId,
            body,
        );
    }
}
