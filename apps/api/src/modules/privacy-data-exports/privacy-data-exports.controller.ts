// apps/api/src/modules/privacy-data-exports/privacy-data-exports.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

/**
 * API de exportação de dados pessoais do próprio utilizador.
 */
@Controller("api/privacy/data-exports")
@UseGuards(SessionGuard)
export class PrivacyDataExportsController {
    constructor(private readonly exportsService: PrivacyDataExportsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.exportsService.listMine(request.user!);
    }

    @Post()
    requestExport(@Req() request: AuthenticatedRequest, @Body() input: RequestDataExportDto) {
        return this.exportsService.requestExport(request.user!, input);
    }

    @Get(":id/download")
    download(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.exportsService.download(request.user!, id);
    }
}