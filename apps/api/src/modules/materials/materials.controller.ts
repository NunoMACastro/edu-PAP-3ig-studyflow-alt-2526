/**
 * Expõe os endpoints HTTP de materials e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
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
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { UpdateMarkdownMaterialDto } from "./dto/update-markdown-material.dto.js";
import { MaterialsService } from "./materials.service.js";
import { MaterialUploadRateLimitGuard } from "./material-upload-rate-limit.guard.js";
import { MATERIAL_UPLOAD_OPTIONS } from "./validators/material-upload.validator.js";

/**
 * Controller de materiais associados a uma área de estudo.
 */
@Controller("api/study-areas/:studyAreaId/materials")
@UseGuards(SessionGuard)
export class MaterialsController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     */
    constructor(private readonly materialsService: MaterialsService) {}

    /**
     * Lista materiais de uma área do aluno.
     *
     * @param request Pedido autenticado.
     * @param studyAreaId Identificador da área.
     * @returns Materiais da área.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.materialsService.listByArea(request.user!.id, studyAreaId);
    }

    /**
     * Submete PDF ou DOCX via multipart.
     *
     * @param request Pedido autenticado.
     * @param studyAreaId Identificador da área.
     * @param file Ficheiro enviado no campo `file`.
     * @param title Título opcional do material.
     * @returns Material criado.
     */
    @Post("file")
    @UseGuards(MaterialUploadRateLimitGuard)
    @UseInterceptors(FileInterceptor("file", MATERIAL_UPLOAD_OPTIONS))
    uploadFile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body("title") title?: string,
    ) {
        return this.materialsService.submitFile(
            request.user!.id,
            studyAreaId,
            file,
            title,
        );
    }

    /**
     * Submete URL ou tópico via JSON.
     *
     * @param request Pedido autenticado.
     * @param studyAreaId Identificador da área.
     * @param body Dados do material textual.
     * @returns Material criado.
     */
    @Post()
    submitText(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: CreateMaterialDto,
    ) {
        return this.materialsService.submitTextMaterial(
            request.user!.id,
            studyAreaId,
            body,
        );
    }

    /** Entrega o detalhe depois de validar ownership da área e do material. */
    @Get(":materialId")
    get(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.materialsService.getPrivateMaterial(
            request.user!.id,
            studyAreaId,
            materialId,
        );
    }

    /** Guarda uma revisão Markdown com controlo otimista de concorrência. */
    @Patch(":materialId/markdown")
    updateMarkdown(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
        @Body() body: UpdateMarkdownMaterialDto,
    ) {
        return this.materialsService.updatePrivateMarkdown(
            request.user!.id,
            studyAreaId,
            materialId,
            body,
        );
    }

    /** Descarrega a fonte Markdown canónica sem expor storage interno. */
    @Get(":materialId/download")
    async downloadMarkdown(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<StreamableFile> {
        const file = await this.materialsService.readPrivateMarkdown(
            request.user!.id,
            studyAreaId,
            materialId,
        );
        response.setHeader("Content-Type", file.mimeType);
        response.setHeader("Content-Length", String(file.buffer.byteLength));
        response.setHeader(
            "Content-Disposition",
            buildSafeContentDisposition("attachment", file.originalName),
        );
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        return new StreamableFile(file.buffer);
    }
}
