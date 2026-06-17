/**
 * Expõe os endpoints HTTP de voz da IA docente e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

/**
 * Controller da voz textual da IA docente.
 */
@Controller("api/teacher/subjects/:subjectId/ai-voice")
@UseGuards(SessionGuard)
export class TeacherAiVoiceController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param voiceService Service injetado para reutilizar regras de voice sem duplicar validações.
     */
    constructor(private readonly voiceService: TeacherAiVoiceService) {}

    /**
     * Atualiza voz da IA docente sem alterar a semântica pública do endpoint ou componente.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de voz da IA docente atualizado e normalizado para consumo externo.
     */
    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: UpdateTeacherAiVoiceDto,
    ) {
        return this.voiceService.updateTeacherVoice(request.user!, subjectId, body);
    }

    /**
     * Carrega voz da IA docente no formato necessário ao próximo passo do fluxo.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de voz da IA docente já filtrada pelo contexto recebido.
     */
    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.voiceService.getTeacherVoice(request.user!, subjectId);
    }
}
