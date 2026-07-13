/**
 * Implementa as regras de negócio de navegação curricular e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { CurriculumNavigationDto } from "./dto/curriculum-navigation.dto.js";
import {
    CurriculumNavigationLog,
    CurriculumNavigationLogDocument,
} from "./schemas/curriculum-navigation-log.schema.js";

/**
 * Contrato de navegação curricular que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type CurriculumSection = {
    title: string;
    locator: string;
    excerpt: string;
};

/**
 * Contrato de navegação curricular que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type CurriculumTopic = {
    title: string;
    materialId: string;
    sections: CurriculumSection[];
};

/**
 * Resposta tipada de navegação curricular devolvida pela API ou por um helper frontend.
 */
export type CurriculumNavigationResponse = {
    topics: CurriculumTopic[];
};

/**
 * Serviço de navegação por programa/currículo derivada de chunks indexados.
 */
@Injectable()
export class CurriculumNavigationService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param logModel Modelo Mongoose injetado para ler e persistir navegação curricular.
     * @param materialIndexService Service injetado para reutilizar regras de indexação textual de materiais sem duplicar validações.
     */
    constructor(
        @InjectModel(CurriculumNavigationLog.name)
        private readonly logModel: Model<CurriculumNavigationLogDocument>,
        private readonly materialIndexService: MaterialIndexService,
    ) {}

    /**
     * Cria uma árvore simples de tópicos e secções autorizadas.
     *
     * @param actor Utilizador autenticado.
     * @param input Jobs autorizados.
     * @returns Navegação curricular.
     */
    async load(
        actor: AuthenticatedUser,
        input: CurriculumNavigationDto,
    ): Promise<CurriculumNavigationResponse> {
        const jobs = await Promise.all(
            input.jobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const topics = this.buildTopics(jobs);
        await this.logModel.create({
            actorId: new Types.ObjectId(actor.id),
            jobIds: input.jobIds.map((jobId) => new Types.ObjectId(jobId)),
            topicCount: topics.length,
        });
        return { topics };
    }

    /**
     * Agrupa chunks por material para formar tópicos navegáveis.
     *
     * @param jobs Jobs autorizados.
     * @returns Tópicos curriculares.
     */
    private buildTopics(jobs: MaterialIndexJobView[]): CurriculumTopic[] {
        return jobs.map((job) => ({
            title: this.topicTitle(job),
            materialId: job.materialId,
            sections: job.extractedTextChunks.slice(0, 12).map((chunk) => ({
                title: chunk.sourceLabel,
                locator: chunk.locator,
                excerpt: chunk.text.trim().slice(0, 260),
            })),
        }));
    }

    /**
     * Define título estável sem depender de metadados inexistentes.
     *
     * @param job Job de indexação.
     * @returns Título do tópico.
     */
    private topicTitle(job: MaterialIndexJobView): string {
        const firstChunk = job.extractedTextChunks[0];
        return firstChunk?.sourceLabel ?? `Material ${job.materialId}`;
    }
}
