/**
 * Orquestra jobs de indexação privada sem prender o pedido HTTP à extração pesada.
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "./material-index.service.js";

/**
 * Entrada necessária para enfileirar indexação privada com contexto autenticado.
 */
export type MaterialIndexQueueInput = {
    actor: AuthenticatedUser;
    studyAreaId: string;
    materialId: string;
};

/**
 * Porta mínima usada pela fila; mantém o teste focado sem acoplar ao service completo.
 */
export type MaterialIndexQueuePort = Pick<
    MaterialIndexService,
    "createQueuedPrivateJob" | "processQueuedPrivateJob"
>;

/**
 * Fila simples de indexação privada.
 */
@Injectable()
export class MaterialIndexQueueService {
    private readonly logger = new Logger(MaterialIndexQueueService.name);

    /**
     * Recebe o service canónico por token explícito para preservar injeção NestJS e tipagem da porta.
     *
     * @param materialIndexService Porta de criação/processamento de jobs privados.
     */
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

        // A extração corre fora da resposta HTTP; ownership e material continuam validados no service de domínio.
        void this.runPrivateIndex(input, queuedJob._id);

        return queuedJob;
    }

    /**
     * Atualiza o job em background e evita rejeições não tratadas no processo Node.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @param jobId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
