/**
 * Expõe endpoints RGPD de exportação própria.
 */
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    Res,
    StreamableFile,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

@Controller("api/privacy/data-exports")
@UseGuards(SessionGuard)
export class PrivacyDataExportsController {
    /**
     * Recebe as dependências injetadas de PrivacyDataExportsController para manter exportação de dados pessoais testável e separado de detalhes externos.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param exportsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly exportsService: PrivacyDataExportsService) {}

    /**
     * Cria o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param _body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() _body: RequestDataExportDto) {
        return this.exportsService.requestExport(request.user!);
    }

    /**
     * Obtém o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.exportsService.listMine(request.user!);
    }

    /**
     * Descarrega o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param id Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    @Get(":id/download")
    async download(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<StreamableFile> {
        const download = await this.exportsService.download(request.user!, id);
        response.setHeader("Content-Type", download.contentType);
        response.setHeader("Content-Length", String(download.sizeBytes));
        response.setHeader(
            "Content-Disposition",
            `attachment; filename="${download.filename}"`,
        );
        response.setHeader("Cache-Control", "private, no-store");

        const cleanup = () => {
            void download.cleanup();
        };
        download.stream.once("close", cleanup);
        download.stream.once("error", cleanup);
        request.once("aborted", cleanup);

        return new StreamableFile(download.stream);
    }
}
