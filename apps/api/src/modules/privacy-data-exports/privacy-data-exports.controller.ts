/**
 * Expõe endpoints RGPD de exportação própria.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

@Controller("api/privacy/data-exports")
@UseGuards(SessionGuard)
export class PrivacyDataExportsController {
    constructor(private readonly exportsService: PrivacyDataExportsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() _body: RequestDataExportDto) {
        return this.exportsService.requestExport(request.user!);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.exportsService.listMine(request.user!);
    }

    @Get(":id/download")
    download(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
    ): Promise<Record<string, unknown>> {
        return this.exportsService.download(request.user!, id);
    }
}
