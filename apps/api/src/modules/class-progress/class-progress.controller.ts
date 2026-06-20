/**
 * Expõe os endpoints HTTP de turma progress e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto.js";
import { ClassProgressService } from "./class-progress.service.js";

/**
 * Endpoint de painel docente de progresso da turma.
 */
@Controller("api/teacher/classes/:classId/progress")
@UseGuards(SessionGuard)
export class ClassProgressController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param progressService Service injetado para reutilizar regras de progress sem duplicar validações.
     */
    constructor(private readonly progressService: ClassProgressService) {}

    /**
     * Carrega progresso da turma no formato necessário ao próximo passo do fluxo.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de progresso da turma já filtrada pelo contexto recebido.
     */
    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.progressService.getClassProgress(request.user!, classId);
    }

    /**
     * Recebe o pedido de criação de progresso da turma e entrega ao service mantendo o controller fino.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param classId Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de progresso da turma criado no formato público esperado pela UI ou pelo teste.
     */
    @Post("notes")
    createNote(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() input: CreateClassProgressNoteDto,
    ) {
        return this.progressService.createNote(request.user!, classId, input);
    }
}
