/**
 * Expõe os endpoints HTTP de voz da IA docente e delega regras de negócio para o service.
 */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

/**
 * Controller da voz textual da IA docente.
 */
@Controller("api/teacher")
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
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param classId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    @Put("classes/:classId/ai-voice")
    updateClassVoice(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: UpdateTeacherAiVoiceDto,
    ) {
        return this.voiceService.updateClassTeacherVoice(
            request.user!,
            classId,
            body,
        );
    }

    /**
     * Carrega voz base da IA docente para uma turma.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user`.
     * @param classId Identificador da turma validado pelo service.
     * @returns Entidade de voz da turma já filtrada pelo professor autenticado.
     */
    @Get("classes/:classId/ai-voice")
    getClassVoice(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.voiceService.getClassTeacherVoice(request.user!, classId);
    }

    /**
     * Atualiza o override de voz da IA docente de uma disciplina.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de voz da IA docente atualizado e normalizado para consumo externo.
     */
    @Put("subjects/:subjectId/ai-voice")
    updateSubjectVoice(
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
    @Get("subjects/:subjectId/ai-voice")
    getSubjectVoice(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.voiceService.getTeacherVoice(request.user!, subjectId);
    }

    /**
     * Remove o override de voz da disciplina e devolve a voz efetiva herdada.
     *
     * @param request Pedido HTTP autenticado.
     * @param subjectId Identificador da disciplina.
     * @returns Voz efetiva depois da remoção do override.
     */
    @Delete("subjects/:subjectId/ai-voice")
    deleteSubjectVoice(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.voiceService.deleteSubjectTeacherVoice(
            request.user!,
            subjectId,
        );
    }
}
