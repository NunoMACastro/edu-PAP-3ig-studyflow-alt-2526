// apps/api/src/modules/material-index/material-index.controller.ts
import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialIndexQueueService } from "./material-index-queue.service.js";
import { MaterialIndexService } from "./material-index.service.js";

/**
 * Endpoints de indexação básica de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialIndexController {
    constructor(
        private readonly indexService: MaterialIndexService,
        private readonly queueService: MaterialIndexQueueService,
    ) {}

    /**
     * Agenda indexação privada e devolve um job consultável sem bloquear a UI.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param studyAreaId Área privada do aluno.
     * @param materialId Material que pertence à área.
     * @returns Job inicial em estado QUEUED.
     */
    @Post("student/study-areas/:studyAreaId/materials/:materialId/index-jobs")
    indexPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.queueService.enqueuePrivateMaterial({
            // O userId vem da sessão; o body não participa em decisões de ownership.
            actor: request.user!,
            studyAreaId,
            materialId,
        });
    }

    /**
     * Mantém a indexação oficial existente para professores.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param materialId Material oficial da disciplina.
     * @returns Job de indexação oficial.
     */
    @Post("teacher/official-materials/:materialId/index-jobs")
    indexOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexOfficialMaterial(request.user!, materialId);
    }

    /**
 * Consulta jobs autorizados em qualquer estado para a UI acompanhar progresso.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param jobId Job de indexação.
 * @returns Job autorizado com estado QUEUED, PROCESSING, DONE ou FAILED.
 */
@Get("material-index-jobs/:jobId")
findJob(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
    return this.indexService.findOwnedJob(request.user!, jobId);
}
}