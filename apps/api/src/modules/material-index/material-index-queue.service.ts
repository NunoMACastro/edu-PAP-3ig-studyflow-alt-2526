// apps/api/src/modules/material-index/material-index-queue.service.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "./material-index.service.js";

export type MaterialIndexQueueInput = {
    actor: AuthenticatedUser;
    studyAreaId: string;
    materialId: string;
};

export type MaterialIndexQueuePort = Pick<
    MaterialIndexService,
    "createQueuedPrivateJob" | "processQueuedPrivateJob"
>;

/**
 * Orquestra indexações privadas sem prender o pedido HTTP à extração do ficheiro.
 */
@Injectable()
export class MaterialIndexQueueService {
    private readonly logger = new Logger(MaterialIndexQueueService.name);

    constructor(
        @Inject(MaterialIndexService)
        private readonly materialIndexService: MaterialIndexQueuePort,
    ) {}

    /**
     * Devolve um job QUEUED imediatamente e inicia o processamento em segundo plano.
     *
     * @param input Contexto autenticado e material escolhido pelo aluno.
     * @returns Job persistido antes de a extração pesada começar.
     */
    async enqueuePrivateMaterial(
        input: MaterialIndexQueueInput,
    ): Promise<MaterialIndexJobView> {
        const queuedJob = await this.materialIndexService.createQueuedPrivateJob(
            input.actor,
            input.studyAreaId,
            input.materialId,
        );

        // O processamento corre fora da resposta HTTP; falhas ficam registadas no job e nos logs técnicos.
        void this.runPrivateIndex(input, queuedJob._id);

        return queuedJob;
    }

    /**
     * Atualiza o job em background e evita rejeições não tratadas no processo Node.
     *
     * @param input Contexto original validado no pedido.
     * @param jobId Job persistido antes do processamento.
     */
    private async runPrivateIndex(
        input: MaterialIndexQueueInput,
        jobId: string,
    ): Promise<void> {
        try {
            await this.materialIndexService.processQueuedPrivateJob(
                input.actor,
                input.studyAreaId,
                input.materialId,
                jobId,
            );
        } catch (error) {
            this.logger.error(
                "Falha ao processar indexação privada em background.",
                error instanceof Error ? error.stack : undefined,
            );
        }
    }
}