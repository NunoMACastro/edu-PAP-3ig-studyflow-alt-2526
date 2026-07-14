/**
 * Expõe os endpoints HTTP de study áreas e delega regras de negócio para o service.
 */
import { Body, Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateStudyAreaVoiceDto } from "./dto/update-study-area-voice.dto.js";
import { StudyAreaVoiceService } from "./study-area-voice.service.js";

/**
 * Controller de configuração de voz da IA por área.
 */
@Controller("api/study-areas/:id/voice")
@UseGuards(SessionGuard)
export class StudyAreaVoiceController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param voiceService Service injetado para reutilizar regras de voice sem duplicar validações.
     */
    constructor(private readonly voiceService: StudyAreaVoiceService) {}

    /**
     * Atualiza tom, detalhe e notas pedagógicas da área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param body Preferências de voz.
     * @returns Área atualizada.
     */
    @Patch()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateStudyAreaVoiceDto,
    ) {
        return this.voiceService.updateVoice(request.user!.id, id, body);
    }
}
