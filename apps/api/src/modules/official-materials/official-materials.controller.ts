/**
 * Expõe os endpoints HTTP de materiais oficiais e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { buildSafeContentDisposition } from "../../common/http/content-disposition.js";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialUploadRateLimitGuard } from "../materials/material-upload-rate-limit.guard.js";
import { MATERIAL_UPLOAD_OPTIONS } from "../materials/validators/material-upload.validator.js";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto.js";
import { CreateOfficialFileMaterialDto } from "./dto/create-official-file-material.dto.js";
import { OfficialMaterialsService } from "./official-materials.service.js";

/**
 * Controller de materiais oficiais.
 */
@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     */
    constructor(private readonly materialsService: OfficialMaterialsService) {}

    /**
     * Recebe o pedido de criação de materiais oficiais e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de materiais oficiais criado no formato público esperado pela UI ou pelo teste.
     */
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialMaterialDto,
    ) {
        return this.materialsService.createOfficialMaterial(
            request.user!,
            subjectId,
            body,
        );
    }

    /** Submete PDF ou DOCX oficial sem aceitar ownership no multipart. */
    @Post("file")
    @UseGuards(MaterialUploadRateLimitGuard)
    @UseInterceptors(FileInterceptor("file", MATERIAL_UPLOAD_OPTIONS))
    uploadFile(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateOfficialFileMaterialDto,
    ) {
        return this.materialsService.submitOfficialFile(
            request.user!,
            subjectId,
            file,
            body.title,
        );
    }

    /**
     * Recebe o pedido de listagem de materiais oficiais e usa a sessão para limitar o âmbito.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de materiais oficiais visível para o contexto autorizado.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.materialsService.listTeacherSubjectMaterials(
            request.user!,
            subjectId,
        );
    }
}

/** Entrega binária protegida de materiais oficiais. */
@Controller("api/official-materials")
@UseGuards(SessionGuard)
export class OfficialMaterialFilesController {
    constructor(private readonly materialsService: OfficialMaterialsService) {}

    @Get(":materialId/content")
    async content(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<StreamableFile> {
        const file = await this.materialsService.readAuthorizedOfficialFile(
            request.user!,
            materialId,
        );
        return this.respondWithFile(
            response,
            file,
            file.type === "PDF" ? "inline" : "attachment",
        );
    }

    @Get(":materialId/download")
    async download(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<StreamableFile> {
        const file = await this.materialsService.readAuthorizedOfficialFile(
            request.user!,
            materialId,
        );
        return this.respondWithFile(response, file, "attachment");
    }

    private respondWithFile(
        response: Response,
        file: Awaited<ReturnType<OfficialMaterialsService["readAuthorizedOfficialFile"]>>,
        disposition: "inline" | "attachment",
    ): StreamableFile {
        response.setHeader("Content-Type", file.mimeType);
        response.setHeader("Content-Length", String(file.buffer.byteLength));
        response.setHeader(
            "Content-Disposition",
            buildSafeContentDisposition(disposition, file.originalName),
        );
        response.setHeader("Cache-Control", "private, no-store");
        return new StreamableFile(file.buffer);
    }
}

/** Catálogo de materiais limitado à inscrição atual do aluno. */
@Controller("api/student/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class StudentOfficialMaterialsController {
    constructor(private readonly materialsService: OfficialMaterialsService) {}

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limit?: string,
    ) {
        return this.materialsService.listStudentSubjectMaterials(
            request.user!,
            subjectId,
            cursor,
            limit ? Number(limit) : undefined,
        );
    }

    @Get(":materialId")
    get(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.materialsService.getStudentSubjectMaterial(
            request.user!,
            subjectId,
            materialId,
        );
    }
}
