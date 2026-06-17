/**
 * Expõe os endpoints HTTP de materials e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { MaterialsService } from "./materials.service.js";
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
}
