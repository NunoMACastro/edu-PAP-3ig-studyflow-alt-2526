/**
 * Implementa as regras de negócio de revisão docente de conteúdos IA e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types, type ClientSession, type Connection, type Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    CreateAiContentReviewDto,
    DecideAiContentReviewDto,
    SubmitApprovedAiQuizAttemptDto,
} from "./dto/ai-content-review.dto.js";
import {
    AiContentReview,
    AiContentReviewDocument,
    AiContentReviewStatus,
    AiContentReviewType,
    ApprovedContentOrigin,
} from "./schemas/ai-content-review.schema.js";
import {
    ApprovedAiQuizAttempt,
    ApprovedAiQuizAttemptDocument,
} from "./schemas/approved-ai-quiz-attempt.schema.js";

/**
 * Vista pública de revisão docente de conteúdos IA, sem detalhes internos de Mongoose.
 */
export type AiContentReviewView = {
    _id: string;
    subjectId: string;
    materialId: string;
    teacherId: string;
    contentType: AiContentReviewType;
    contentJson: Record<string, unknown>;
    status: AiContentReviewStatus;
    teacherComment?: string;
    origin?: ApprovedContentOrigin;
    createdAt?: Date;
    materialTitle: string;
    materialStatus: "PROCESSED" | "REFERENCE_ONLY" | "PENDING_PROCESSING";
    decidedAt: Date | null;
};

type ReviewRecord = {
    _id: unknown;
    subjectId: unknown;
    materialId: unknown;
    teacherId: unknown;
    contentType: AiContentReviewType;
    contentJson: Record<string, unknown>;
    status: AiContentReviewStatus;
    teacherComment?: string;
    origin?: ApprovedContentOrigin;
    createdAt?: Date;
    updatedAt?: Date;
};

type NormalizedQuizQuestion = {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    sourceMaterialIds: string[];
};

/**
 * Serviço de curadoria docente de conteúdos IA.
 */
@Injectable()
export class AiContentReviewsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param reviewModel Modelo Mongoose injetado para ler e persistir revisão docente de conteúdos IA.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param officialMaterialsService Service injetado para reutilizar regras de materiais oficiais sem duplicar validações.
     */
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly reviewModel: Model<AiContentReviewDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly auditLogService: AuditLogService,
        @Optional()
        @InjectModel(ApprovedAiQuizAttempt.name)
        private readonly approvedAttemptModel?: Model<ApprovedAiQuizAttemptDocument>,
        @Optional()
        private readonly activityService?: ClassLearningActivityService,
        @Optional()
        private readonly notificationsService?: ContextNotificationsService,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /**
     * Cria revisão docente de conteúdos IA depois de validar permissões, normalizar input e preparar o contrato público.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            input.materialId,
        );
        if (material.subjectId !== subject._id) throw this.notFound();
        if (material.status !== "PROCESSED") {
            throw new BadRequestException({
                code: "AI_REVIEW_REQUIRES_PROCESSED_MATERIAL",
                message: "Escolhe um material oficial já processado.",
            });
        }
        const contentJson = this.normalizeContent(
            input.contentType,
            input.contentJson,
            material._id,
            "create",
        );

        const review = await this.runInTransaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            const document = {
                subjectId: new Types.ObjectId(subject._id),
                materialId: new Types.ObjectId(material._id),
                teacherId: new Types.ObjectId(actor.id),
                contentType: input.contentType,
                contentJson,
                status: "PENDING",
                origin: "TEACHER_AUTHORED",
            } as const;
            const created = session
                ? (await this.reviewModel.create([document], { session }))[0]
                : await this.reviewModel.create(document);
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "AI_CONTENT_REVIEW_CREATED",
                resourceType: "AiContentReview",
                resourceId: String(created._id),
                result: "SUCCESS",
                metadata: {
                    subjectId: subject._id,
                    materialId: material._id,
                    contentType: input.contentType,
                },
            }, session);
            return created;
        });
        return this.toView(review.toObject(), material);
    }

    /**
     * Lista revisão docente de conteúdos IA já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de revisão docente de conteúdos IA visível para o contexto autorizado.
     */
    async listForSubject(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<AiContentReviewView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
            actor.id,
            subjectId,
        );
        const reviews = await this.reviewModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        const materials = await this.officialMaterialsService.listTeacherSubjectMaterials(
            actor,
            subject._id,
        );
        const materialById = new Map(
            materials.map((material) => [material._id, material] as const),
        );
        return reviews.map((review) =>
            this.toView(review, materialById.get(String(review.materialId))),
        );
    }

    /**
     * Executa a operação decide no domínio de revisão docente de conteúdos IA com contrato explícito.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param reviewId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async decide(
        actor: AuthenticatedUser,
        reviewId: string,
        input: DecideAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(reviewId)) throw this.notFound();
        const current = await this.reviewModel
            .findOne({ _id: reviewId, teacherId: new Types.ObjectId(actor.id) })
            .lean();
        if (!current) throw this.notFound();
        if (current.status === input.status) {
            throw new BadRequestException({
                code: "AI_CONTENT_REVIEW_STATUS_UNCHANGED",
                message: "A revisão já tem esse estado.",
            });
        }
        const teacherComment = input.teacherComment?.trim();
        if (
            input.status === "REJECTED" &&
            (!teacherComment || teacherComment.length < 5)
        ) {
            throw new BadRequestException({
                code: "AI_CONTENT_REVIEW_REJECTION_REASON_REQUIRED",
                message: "Indica um motivo com pelo menos 5 caracteres.",
            });
        }
        const contentJson =
            input.status === "APPROVED"
                ? this.normalizeContent(
                      current.contentType,
                      current.contentJson,
                      String(current.materialId),
                      "approve",
                  )
                : current.contentJson;
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            String(current.materialId),
        );
        const decisionSubject = await this.subjectsService.findOwnedSubject(
            actor.id,
            String(current.subjectId),
        );
        const becameVisible = current.status !== "APPROVED" && input.status === "APPROVED";
        const wasWithdrawn = current.status === "APPROVED" && input.status !== "APPROVED";
        const notificationSubject =
            this.notificationsService && (becameVisible || wasWithdrawn)
                ? decisionSubject
                : undefined;
        const review = await this.runInTransaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                decisionSubject.classId,
                decisionSubject._id,
                session,
            );
            const changed = await this.reviewModel
                .findOneAndUpdate(
                    {
                        _id: reviewId,
                        teacherId: new Types.ObjectId(actor.id),
                        status: current.status,
                    },
                    {
                        $set: {
                            status: input.status,
                            teacherComment,
                            contentJson,
                        },
                    },
                    session
                        ? { new: true, runValidators: true, session }
                        : { new: true, runValidators: true },
                )
                .lean();
            if (!changed) {
                const latest = await this.reviewModel
                    .findOne(
                        {
                            _id: reviewId,
                            teacherId: new Types.ObjectId(actor.id),
                        },
                        null,
                        session ? { session } : undefined,
                    )
                    .lean();
                if (!latest) throw this.notFound();
                if (latest.status === input.status) {
                    throw new BadRequestException({
                        code: "AI_CONTENT_REVIEW_STATUS_UNCHANGED",
                        message: "A revisão já tem esse estado.",
                    });
                }
                throw new ConflictException({
                    code: "AI_CONTENT_REVIEW_STATUS_CONFLICT",
                    message: "O estado da revisão mudou em simultâneo. Atualiza e tenta novamente.",
                });
            }
            const auditRecord = {
                actorId: actor.id,
                domain: "AI",
                action: "AI_CONTENT_REVIEW_DECIDED",
                resourceType: "AiContentReview",
                resourceId: String(changed._id),
                result: "SUCCESS",
                metadata: {
                    subjectId: String(changed.subjectId),
                    materialId: String(changed.materialId),
                    previousStatus: current.status,
                    nextStatus: input.status,
                    teacherComment,
                },
            } as const;
            if (session) {
                await this.auditLogService.record(auditRecord, session);
            } else {
                await this.auditLogService.record(auditRecord);
            }
            if (this.notificationsService && notificationSubject) {
                const notification = {
                    classId: notificationSubject.classId,
                    idempotencyKey: `ai-content-review:${String(changed._id)}:${input.status.toLowerCase()}:${(changed as { updatedAt?: Date }).updatedAt?.toISOString() ?? "decision"}`,
                    type: becameVisible
                        ? "AI_CONTENT_APPROVED"
                        : "AI_CONTENT_WITHDRAWN",
                    title: becameVisible
                        ? "Novo conteúdo aprovado"
                        : "Conteúdo aprovado retirado",
                    body: becameVisible
                        ? "O professor aprovou um novo conteúdo de apoio na disciplina."
                        : "Um conteúdo de apoio deixou de estar disponível na disciplina.",
                    targetPath: `/app/disciplinas/${notificationSubject._id}/conteudos-aprovados`,
                } as const;
                if (session) {
                    await this.notificationsService.enqueueClassEvent(
                        actor,
                        notification,
                        session,
                    );
                } else {
                    await this.notificationsService.enqueueClassEvent(
                        actor,
                        notification,
                    );
                }
            }
            return changed;
        });
        return this.toView(review, material);
    }

    /**
     * Lista conteúdo aprovado sem expor decisões internas ou soluções de quiz.
     */
    async listApprovedForStudent(
        actor: AuthenticatedUser,
        subjectId: string,
    ) {
        this.assertStudent(actor);
        const { subject, schoolClass } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        const [reviews, materials] = await Promise.all([
            this.reviewModel
                .find({
                    subjectId: new Types.ObjectId(subject._id),
                    status: "APPROVED",
                })
                .sort({ updatedAt: -1 })
                .lean(),
            this.officialMaterialsService.findProcessedBySubject(subject._id),
        ]);
        const materialById = new Map(
            materials.map((material) => [material._id, material] as const),
        );
        return reviews.flatMap((review) => {
            const material = materialById.get(String(review.materialId));
            const canAttempt = subject.status === "ACTIVE" && schoolClass.status === "ACTIVE";
            return material ? [this.toStudentView(
                review,
                material,
                canAttempt,
                subject.status !== "ACTIVE" ? "SUBJECT_ARCHIVED" : "CLASS_ARCHIVED",
            )] : [];
        });
    }

    /**
     * Corrige e persiste um quiz aprovado sem duplicar a chave de soluções.
     */
    async submitApprovedQuizAttempt(
        actor: AuthenticatedUser,
        subjectId: string,
        reviewId: string,
        input: SubmitApprovedAiQuizAttemptDto,
    ) {
        this.assertStudent(actor);
        const { subject } = await this.subjectsService.findSubjectForStudent(
            actor.id,
            subjectId,
        );
        if (!Types.ObjectId.isValid(reviewId)) throw this.notFound();
        const review = await this.reviewModel.findOne({
            _id: reviewId,
            subjectId: new Types.ObjectId(subject._id),
            status: "APPROVED",
            contentType: "QUIZ",
        }).lean();
        if (!review) throw this.notFound();
        const materials = await this.officialMaterialsService.findProcessedBySubject(
            subject._id,
        );
        if (!materials.some((material) => material._id === String(review.materialId))) {
            throw this.notFound();
        }
        const questions = this.getQuizQuestions(review.contentJson, "attempt");
        if (
            input.selectedOptionIndexes.length !== questions.length ||
            input.selectedOptionIndexes.some(
                (answer) => !Number.isInteger(answer) || answer < 0 || answer > 3,
            )
        ) {
            throw new BadRequestException({
                code: "INVALID_APPROVED_AI_QUIZ_ATTEMPT",
                message: "Responde a todas as perguntas com uma opção válida.",
            });
        }
        const results = questions.map((question, questionIndex) => ({
            questionIndex,
            selectedOptionIndex: input.selectedOptionIndexes[questionIndex],
            correctOptionIndex: question.correctOptionIndex,
            isCorrect:
                input.selectedOptionIndexes[questionIndex] ===
                question.correctOptionIndex,
            explanation: question.explanation,
        }));
        const correctCount = results.filter((result) => result.isCorrect).length;
        const scorePercent = Math.round((correctCount / questions.length) * 100);
        const answeredAt = new Date();
        const attempt = this.approvedAttemptModel
            ? await this.persistApprovedAttempt({
                  reviewId: String(review._id),
                  subjectId: subject._id,
                  classId: subject.classId,
                  studentId: actor.id,
                  selectedOptionIndexes: input.selectedOptionIndexes,
                  correctCount,
                  totalQuestions: questions.length,
                  scorePercent,
                  answeredAt,
              })
            : undefined;
        if (attempt) {
            await this.activityService?.recordBestEffort({
                classId: subject.classId,
                studentId: actor.id,
                subjectId: subject._id,
                type: "APPROVED_AI_QUIZ_ATTEMPT",
                sourceEventKey: `approved-ai-quiz-attempt:${String(attempt._id)}`,
                occurredAt: attempt.answeredAt,
            });
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "APPROVED_AI_QUIZ_ATTEMPT_SUBMITTED",
                resourceType: "ApprovedAiQuizAttempt",
                resourceId: String(attempt._id),
                result: "SUCCESS",
                metadata: {
                    reviewId: String(review._id),
                    subjectId: subject._id,
                    classId: subject.classId,
                    attemptNumber: attempt.attemptNumber,
                    scorePercent,
                },
            });
        }
        return {
            ...(attempt
                ? {
                      attemptId: String(attempt._id),
                      attemptNumber: attempt.attemptNumber,
                  }
                : {}),
            reviewId: String(review._id),
            correctCount,
            totalQuestions: questions.length,
            scorePercent,
            answeredAt: answeredAt.toISOString(),
            results,
        };
    }

    /** Lista apenas as tentativas do aluno autenticado, sem soluções. */
    async listApprovedQuizAttempts(
        actor: AuthenticatedUser,
        subjectId: string,
        reviewId: string,
    ) {
        this.assertStudent(actor);
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        if (!Types.ObjectId.isValid(reviewId)) throw this.notFound();
        const review = await this.reviewModel
            .findOne({
                _id: new Types.ObjectId(reviewId),
                subjectId: new Types.ObjectId(subject._id),
                contentType: "QUIZ",
            })
            .lean();
        if (!review) throw this.notFound();
        if (!this.approvedAttemptModel) return [];
        const attempts = await this.approvedAttemptModel
            .find({
                reviewId: new Types.ObjectId(reviewId),
                studentId: new Types.ObjectId(actor.id),
            })
            .sort({ attemptNumber: -1 })
            .lean();
        return attempts.map((attempt) => ({
            attemptId: String(attempt._id),
            reviewId: String(attempt.reviewId),
            attemptNumber: attempt.attemptNumber,
            selectedOptionIndexes: attempt.selectedOptionIndexes,
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions,
            scorePercent: attempt.scorePercent,
            answeredAt: attempt.answeredAt,
        }));
    }

    /** Persiste uma tentativa com numeração monotónica e retry de corrida. */
    private async persistApprovedAttempt(input: {
        reviewId: string;
        subjectId: string;
        classId: string;
        studentId: string;
        selectedOptionIndexes: number[];
        correctCount: number;
        totalQuestions: number;
        scorePercent: number;
        answeredAt: Date;
    }) {
        if (!this.approvedAttemptModel) {
            throw new Error("ApprovedAiQuizAttempt model não disponível.");
        }
        for (let retry = 0; retry < 3; retry += 1) {
            const attemptNumber =
                (await this.approvedAttemptModel.countDocuments({
                    reviewId: new Types.ObjectId(input.reviewId),
                    studentId: new Types.ObjectId(input.studentId),
                })) + 1;
            try {
                return await this.approvedAttemptModel.create({
                    reviewId: new Types.ObjectId(input.reviewId),
                    subjectId: new Types.ObjectId(input.subjectId),
                    classId: new Types.ObjectId(input.classId),
                    studentId: new Types.ObjectId(input.studentId),
                    attemptNumber,
                    selectedOptionIndexes: input.selectedOptionIndexes,
                    correctCount: input.correctCount,
                    totalQuestions: input.totalQuestions,
                    scorePercent: input.scorePercent,
                    answeredAt: input.answeredAt,
                });
            } catch (error) {
                if (!isMongoDuplicateKeyError(error) || retry === 2) throw error;
            }
        }
        throw new Error("Não foi possível numerar a tentativa aprovada.");
    }

    /**
     * Executa a operação count approved by disciplina ids no domínio de revisão docente de conteúdos IA com contrato explícito.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    async countApprovedBySubjectIds(subjectIds: string[]): Promise<number> {
        return this.countBySubjectIdsAndStatus(subjectIds, "APPROVED");
    }

    /**
     * Conta revisões IA pendentes por disciplinas já autorizadas pelo chamador.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Número de revisões pendentes.
     */
    async countPendingBySubjectIds(subjectIds: string[]): Promise<number> {
        return this.countBySubjectIdsAndStatus(subjectIds, "PENDING");
    }

    /**
     * Conta revisões IA pendentes por disciplina já autorizada pelo chamador.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Mapa subjectId -> número de revisões IA pendentes.
     */
    async countPendingBySubjectIdsGrouped(
        subjectIds: string[],
    ): Promise<Record<string, number>> {
        return this.countBySubjectIdsAndStatusGrouped(subjectIds, "PENDING");
    }

    /**
     * Conta revisões IA por estado sem repetir filtros de Mongoose.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @param status Estado da revisão a contar.
     * @returns Número de revisões no estado pedido.
     */
    private async countBySubjectIdsAndStatus(
        subjectIds: string[],
        status: AiContentReviewStatus,
    ): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.reviewModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status,
        });
    }

    /**
     * Conta revisões IA por estado e por disciplina sem expor conteúdo revisto.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @param status Estado da revisão a contar.
     * @returns Mapa subjectId -> número de revisões no estado pedido.
     */
    private async countBySubjectIdsAndStatusGrouped(
        subjectIds: string[],
        status: AiContentReviewStatus,
    ): Promise<Record<string, number>> {
        if (subjectIds.length === 0) return {};
        const rows = await this.reviewModel.aggregate<{
            _id: Types.ObjectId;
            count: number;
        }>([
            {
                $match: {
                    subjectId: {
                        $in: subjectIds.map((id) => new Types.ObjectId(id)),
                    },
                    status,
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
        return rows.reduce<Record<string, number>>((counts, row) => {
            counts[String(row._id)] = row.count;
            return counts;
        }, {});
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    /** Mantém decisão, auditoria e outbox na mesma unidade de commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /** Valida que o consumo oficial é feito por um aluno autenticado. */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    /**
     * Constrói uma exceção de revisão docente de conteúdos IA com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_CONTENT_REVIEW_NOT_FOUND",
            message: "Revisão de conteúdo não encontrada.",
        });
    }

    /**
     * Mapeia o documento interno de revisão docente de conteúdos IA para uma forma pública estável e simples de consumir.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param review Valor de review usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(
        review: ReviewRecord,
        material?: {
            title: string;
            status: "PROCESSED" | "REFERENCE_ONLY" | "PENDING_PROCESSING";
        },
    ): AiContentReviewView {
        return {
            _id: String(review._id),
            subjectId: String(review.subjectId),
            materialId: String(review.materialId),
            teacherId: String(review.teacherId),
            contentType: review.contentType,
            contentJson: review.contentJson,
            status: review.status,
            teacherComment: review.teacherComment,
            origin: review.origin ?? "TEACHER_AUTHORED",
            createdAt: review.createdAt,
            materialTitle: material?.title ?? "Material indisponível",
            materialStatus: material?.status ?? "REFERENCE_ONLY",
            decidedAt: review.status === "PENDING" ? null : review.updatedAt ?? null,
        };
    }

    /** Normaliza e valida o conteúdo antes de o persistir ou publicar. */
    private normalizeContent(
        contentType: AiContentReviewType,
        contentJson: Record<string, unknown>,
        materialId: string,
        phase: "create" | "approve",
    ): Record<string, unknown> {
        if (contentType === "SUMMARY") {
            const text = typeof contentJson.text === "string"
                ? contentJson.text.trim()
                : "";
            if (text.length < 20 || text.length > 20_000) {
                this.throwInvalidContent(
                    phase,
                    "AI_REVIEW_INVALID_SUMMARY",
                    "O resumo deve ter entre 20 e 20 000 caracteres.",
                );
            }
            return { text };
        }
        const questions = this.getQuizQuestions(contentJson, phase);
        return {
            ...(typeof contentJson.title === "string" && contentJson.title.trim()
                ? { title: contentJson.title.trim() }
                : {}),
            questions: questions.map((question) => ({
                ...question,
                sourceMaterialIds: [materialId],
            })),
        };
    }

    /** Extrai perguntas válidas do formato canónico de quiz. */
    private getQuizQuestions(
        contentJson: Record<string, unknown>,
        phase: "create" | "approve" | "attempt",
    ): NormalizedQuizQuestion[] {
        const rawQuestions = contentJson.questions;
        if (
            !Array.isArray(rawQuestions) ||
            rawQuestions.length < 1 ||
            rawQuestions.length > 60
        ) {
            this.throwInvalidContent(
                phase,
                "AI_REVIEW_INVALID_QUIZ",
                "O quiz deve ter entre 1 e 60 perguntas estruturadas.",
            );
        }
        return rawQuestions.map((rawQuestion) => {
            const question = rawQuestion as Record<string, unknown>;
            const statement =
                typeof question.question === "string"
                    ? question.question.trim()
                    : "";
            const options = Array.isArray(question.options)
                ? question.options.map((option) =>
                      typeof option === "string" ? option.trim() : "",
                  )
                : [];
            const explanation =
                typeof question.explanation === "string"
                    ? question.explanation.trim()
                    : "";
            const correctOptionIndex = question.correctOptionIndex;
            const normalizedOptions = options.map((option) => option.toLowerCase());
            if (
                statement.length < 5 ||
                statement.length > 1000 ||
                options.length !== 4 ||
                options.some((option) => !option) ||
                new Set(normalizedOptions).size !== 4 ||
                !Number.isInteger(correctOptionIndex) ||
                Number(correctOptionIndex) < 0 ||
                Number(correctOptionIndex) > 3 ||
                !explanation
            ) {
                this.throwInvalidContent(
                    phase,
                    "AI_REVIEW_INVALID_QUIZ",
                    "Confirma perguntas, quatro opções únicas, resposta correta e explicação.",
                );
            }
            return {
                question: statement,
                options,
                correctOptionIndex: Number(correctOptionIndex),
                explanation,
                sourceMaterialIds: [],
            };
        });
    }

    /** Devolve erro adequado à criação, publicação ou tentativa. */
    private throwInvalidContent(
        phase: "create" | "approve" | "attempt",
        code: string,
        message: string,
    ): never {
        if (phase === "create") throw new BadRequestException({ code, message });
        throw new UnprocessableEntityException({ code, message });
    }

    /** Remove soluções, explicações e dados internos antes da leitura do aluno. */
    private toStudentView(
        review: ReviewRecord,
        material: { _id: string; title: string },
        canAttempt: boolean,
        unavailableReason: "SUBJECT_ARCHIVED" | "CLASS_ARCHIVED",
    ) {
        const approvedAt = (review.updatedAt ?? review.createdAt ?? new Date()).toISOString();
        if (review.contentType === "SUMMARY") {
            const bullets = Array.isArray(review.contentJson.bullets)
                ? review.contentJson.bullets.filter(
                      (item): item is string => typeof item === "string",
                  )
                : undefined;
            return {
                reviewId: String(review._id),
                subjectId: String(review.subjectId),
                material: { id: material._id, title: material.title },
                contentType: "SUMMARY" as const,
                approvedAt,
                origin: "TEACHER_AUTHORED" as const,
                canAttempt,
                ...(!canAttempt ? { unavailableReason } : {}),
                content: {
                    ...(typeof review.contentJson.title === "string"
                        ? { title: review.contentJson.title }
                        : {}),
                    ...(typeof review.contentJson.text === "string"
                        ? { text: review.contentJson.text }
                        : {}),
                    ...(bullets?.length ? { bullets } : {}),
                },
            };
        }
        const questions = Array.isArray(review.contentJson.questions)
            ? review.contentJson.questions.flatMap((item, questionIndex) => {
                  const question = item as Record<string, unknown>;
                  if (
                      typeof question.question !== "string" ||
                      !Array.isArray(question.options) ||
                      !question.options.every((option) => typeof option === "string")
                  ) return [];
                  return [{
                      questionIndex,
                      question: question.question,
                      options: question.options as string[],
                  }];
              })
            : undefined;
        return {
            reviewId: String(review._id),
            subjectId: String(review.subjectId),
            material: { id: material._id, title: material.title },
            contentType: "QUIZ" as const,
            approvedAt,
            origin: "TEACHER_AUTHORED" as const,
            canAttempt,
            ...(!canAttempt ? { unavailableReason } : {}),
            content: {
                ...(typeof review.contentJson.title === "string"
                    ? { title: review.contentJson.title }
                    : {}),
                ...(typeof review.contentJson.text === "string"
                    ? { text: review.contentJson.text }
                    : {}),
                ...(questions?.length ? { questions } : {}),
            },
        };
    }
}
