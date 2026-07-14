/**
 * Expõe os endpoints HTTP de ai e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto.js";

/**
 * Controller do BK-MF1-01 para aprendizagem adaptativa.
 */
@Controller("api/study-areas/:studyAreaId")
@UseGuards(SessionGuard)
export class AdaptiveLearningController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param adaptiveLearningService Service injetado para reutilizar regras de adaptive learning sem duplicar validações.
     */
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    /**
     * Carrega artefactos de IA no formato necessário ao próximo passo do fluxo.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @returns Entidade de artefactos de IA já filtrada pelo contexto recebido.
     */
    @Get("learning-profile")
    getProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.adaptiveLearningService.getLearningProfile(
            request.user!.id,
            studyAreaId,
        );
    }

    /**
     * Atualiza artefactos de IA sem alterar a semântica pública do endpoint ou componente.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Registo de artefactos de IA atualizado e normalizado para consumo externo.
     */
    @Put("learning-profile")
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: UpdateLearningProfileDto,
    ) {
        return this.adaptiveLearningService.updateLearningProfile(
            request.user!.id,
            studyAreaId,
            body,
        );
    }

    /**
     * Orquestra uma pergunta de IA em artefactos de IA, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    @Post("adaptive-explanations")
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: AskAdaptiveExplanationDto,
    ) {
        return this.adaptiveLearningService.askAdaptiveExplanation(
            request.user!.id,
            studyAreaId,
            body,
        );
    }
}
