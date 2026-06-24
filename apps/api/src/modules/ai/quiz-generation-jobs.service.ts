// apps/api/src/modules/ai/quiz-generation-jobs.service.ts
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import {
    QuizGenerationJob,
    QuizGenerationJobDocument,
    QuizGenerationJobStatus,
} from "./schemas/quiz-generation-job.schema.js";
import { StudyToolsService } from "./study-tools.service.js";

export type QuizGenerationJobView = {
    _id: string;
    studyAreaId: string;
    status: QuizGenerationJobStatus;
    artifactId?: string;
    topic?: string;
    errorMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type QuizGenerationJobLean = QuizGenerationJob & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Porta tipada para o service canónico sem perder o token runtime do NestJS.
 */
export type QuizGenerationStudyToolsPort = Pick<
    StudyToolsService,
    "assertQuizGenerationReady" | "generateStudyTool"
>;

/**
 * Gere jobs persistidos de quizzes sem prender o pedido HTTP à chamada ao provider de IA.
 */
@Injectable()
export class QuizGenerationJobsService {
    private readonly logger = new Logger(QuizGenerationJobsService.name);

    constructor(
        @InjectModel(QuizGenerationJob.name)
        private readonly jobModel: Model<QuizGenerationJobDocument>,
        @Inject(StudyToolsService)
        private readonly studyToolsService: QuizGenerationStudyToolsPort,
    ) {}

    /**
     * Cria um job QUEUED e inicia a geração real do quiz em background.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada onde o quiz será criado.
     * @param input Pedido validado pelo DTO.
     * @returns Job inicial consultável pela UI.
     */
    async createQuizJob(
        userId: string,
        studyAreaId: string,
        input: CreateQuizJobDto,
    ): Promise<QuizGenerationJobView> {
        await this.studyToolsService.assertQuizGenerationReady(userId, studyAreaId);

        const job = await this.jobModel.create({
            userId: this.parseObjectId(userId),
            studyAreaId: this.parseObjectId(studyAreaId),
            status: "QUEUED",
            topic: input.topic,
        });
        const view = this.toView(job.toObject() as QuizGenerationJobLean);

        // A pré-validação já confirmou ownership e fontes; a geração pesada continua fora da resposta HTTP.
        void this.processQuizJob(userId, studyAreaId, view._id, input);

        return view;
    }

    /**
     * Consulta um job que pertence ao aluno autenticado e à área indicada.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada do aluno.
     * @param jobId Job a consultar.
     * @returns Estado público do job.
     */
    async findQuizJob(
        userId: string,
        studyAreaId: string,
        jobId: string,
    ): Promise<QuizGenerationJobView> {
        const job = await this.jobModel
            .findOne({
                _id: this.parseObjectId(jobId),
                userId: this.parseObjectId(userId),
                studyAreaId: this.parseObjectId(studyAreaId),
            })
            .lean();
        if (!job) throw this.notFound();
        return this.toView(job as QuizGenerationJobLean);
    }

    /**
     * Gera o quiz usando o service canónico de ferramentas de estudo.
     *
     * @param userId Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada do aluno.
     * @param jobId Job persistido antes da geração.
     * @param input Pedido inicial do aluno.
     */
    private async processQuizJob(
        userId: string,
        studyAreaId: string,
        jobId: string,
        input: CreateQuizJobDto,
    ): Promise<void> {
        const query = {
            _id: this.parseObjectId(jobId),
            userId: this.parseObjectId(userId),
            studyAreaId: this.parseObjectId(studyAreaId),
        };
        await this.jobModel.findOneAndUpdate(query, {
            $set: { status: "PROCESSING" },
            $unset: { errorMessage: "" },
        });

        try {
            const artifact = await this.studyToolsService.generateStudyTool(
                userId,
                studyAreaId,
                { type: "QUIZ", topic: input.topic },
            );
            await this.jobModel.findOneAndUpdate(query, {
                $set: {
                    status: "DONE",
                    artifactId: this.parseObjectId(artifact._id),
                },
                $unset: { errorMessage: "" },
            });
        } catch (error) {
            this.logger.warn(
                `Falha controlada ao gerar quiz em background para job ${jobId}.`,
            );
            // A mensagem pública evita expor prompts, fontes privadas ou detalhes do provider.
            await this.jobModel.findOneAndUpdate(query, {
                $set: {
                    status: "FAILED",
                    errorMessage: this.toPublicErrorMessage(error),
                },
            });
        }
    }

    /**
     * Valida ObjectId antes de construir queries MongoDB.
     *
     * @param value Valor recebido por rota ou sessão.
     * @returns ObjectId seguro para query.
     */
    private parseObjectId(value: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) throw this.notFound();
        return new Types.ObjectId(value);
    }

    /**
     * Converte o documento interno para contrato público de polling.
     *
     * @param job Documento persistido do job.
     * @returns Vista sem dados privados nem conteúdo do quiz.
     */
    private toView(job: QuizGenerationJobLean): QuizGenerationJobView {
        return {
            _id: String(job._id),
            studyAreaId: String(job.studyAreaId),
            status: job.status,
            artifactId: job.artifactId ? String(job.artifactId) : undefined,
            topic: job.topic,
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    /**
     * Garante que erros internos do provider não expõem prompts ou respostas privadas.
     *
     * @param error Erro recebido da geração.
     * @returns Mensagem pública segura.
     */
    private toPublicErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message.includes("processável")) {
            return error.message;
        }
        return "Não foi possível gerar o quiz neste momento.";
    }

    /**
     * Cria erro uniforme para jobs inexistentes ou fora do ownership do aluno.
     *
     * @returns Nunca retorna; lança exceção.
     */
    private notFound(): never {
        throw new NotFoundException({
            code: "QUIZ_JOB_NOT_FOUND",
            message: "Job de quiz não encontrado.",
        });
    }
}