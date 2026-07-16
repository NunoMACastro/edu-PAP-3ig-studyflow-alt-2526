/**
 * Fachada segura para gerar e apresentar artefactos de áreas pessoais dentro
 * do Assistente, sem duplicar os pipelines governados do domínio de IA.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash } from "node:crypto";
import { Model, Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import {
    QuizGenerationJobsService,
    type QuizGenerationJobView,
} from "../ai/quiz-generation-jobs.service.js";
import {
    AiArtifact,
    type AiArtifactDocument,
} from "../ai/schemas/ai-artifact.schema.js";
import type {
    CreateStudentAssistantArtifactDto,
    ListStudentAssistantArtifactJobsDto,
    ListStudentAssistantArtifactsDto,
    ListStudentAssistantArtifactTargetsDto,
} from "./dto/student-ai-assistant.dto.js";
import {
    StudentAiConversation,
    type StudentAiConversationDocument,
} from "./schemas/student-ai-conversation.schema.js";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";
import { StudentAiArtifactContextService } from "./student-ai-artifact-context.service.js";
import type {
    StudentAssistantArtifactType,
    StudentAssistantArtifactView,
} from "./student-ai-assistant.types.js";

type ConversationRecord = StudentAiConversation & {
    _id: Types.ObjectId;
    createdAt?: Date;
};

type ArtifactRecord = AiArtifact & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

@Injectable()
export class StudentAiAssistantArtifactsService {
    private static readonly GENERATION_LEASE_MS = 120_000;
    private static readonly IDEMPOTENCY_KEY_PATTERN =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    constructor(
        @InjectModel(StudentAiConversation.name)
        private readonly conversationModel: Model<StudentAiConversationDocument>,
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        private readonly contextResolver: StudentAiContextResolverService,
        private readonly artifactContext: StudentAiArtifactContextService,
        private readonly quizJobsService: QuizGenerationJobsService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /** Prepara o painel sem chamar provider, consumir quota ou confiar no browser. */
    async setup(actor: AuthenticatedUser, conversationId: string) {
        const conversation = await this.findOwned(actor, conversationId);
        return this.artifactContext.setup(actor, conversation);
    }

    /** Pesquisa destinos apenas quando o contexto colaborativo exige escolha. */
    async listTargets(
        actor: AuthenticatedUser,
        conversationId: string,
        input: ListStudentAssistantArtifactTargetsDto,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        this.assertWritable(conversation);
        if (
            conversation.contextKind !== "STUDY_GROUP" &&
            conversation.contextKind !== "STUDY_ROOM"
        ) {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_TARGET_FIXED",
                message: "O destino deste material é definido pela conversa.",
            });
        }
        await this.contextResolver.resolve(
            actor,
            conversation.contextKind,
            String(conversation.contextId),
        );
        return this.artifactContext.listTargets(actor, input);
    }

    async list(
        actor: AuthenticatedUser,
        conversationId: string,
        input: ListStudentAssistantArtifactsDto,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        const cursor = this.decodeCursor(input.before);
        const limit = input.limit ?? 20;
        const filter: Record<string, unknown> = {
            userId: new Types.ObjectId(actor.id),
            assistantConversationId: conversation._id,
        };
        if (cursor) {
            filter.$or = [
                { createdAt: { $lt: cursor.createdAt } },
                {
                    createdAt: cursor.createdAt,
                    _id: { $lt: new Types.ObjectId(cursor.id) },
                },
            ];
        }
        const rows = await this.artifactModel
            .find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const page = (hasMore ? rows.slice(0, limit) : rows) as ArtifactRecord[];
        const last = page.at(-1);
        const items = await Promise.all(
            page.map((artifact) => this.toArtifactView(actor.id, artifact, conversation)),
        );
        return {
            items: items.reverse(),
            previousCursor:
                hasMore && last?.createdAt
                    ? this.encodeCursor(last.createdAt, String(last._id))
                    : null,
        };
    }

    async generate(
        actor: AuthenticatedUser,
        conversationId: string,
        input: CreateStudentAssistantArtifactDto,
        idempotencyKey: string | undefined,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        this.assertWritable(conversation);
        const topic = input.topic?.trim() || undefined;
        if (input.type === "SUMMARY" && input.topic !== undefined) {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_TOPIC_NOT_ALLOWED",
                message: "O resumo usa todos os materiais disponíveis e não aceita tópico.",
            });
        }
        const generationKey = this.generationKey(
            actor.id,
            conversationId,
            input.type,
            topic,
            idempotencyKey,
            input.target,
        );

        const replayJob =
            await this.quizJobsService.findAssistantQuizJobByRequestKey(
                actor.id,
                conversationId,
                generationKey,
            );
        if (replayJob) {
            return this.toGenerationResult(conversation, replayJob);
        }

        // Compatibilidade com materiais síncronos criados antes da fila comum.
        const replayArtifact = await this.artifactModel
            .findOne({
                userId: new Types.ObjectId(actor.id),
                assistantConversationId: conversation._id,
                generationKey,
            })
            .lean();
        if (replayArtifact) {
            return {
                status: "DONE" as const,
                artifact: await this.toArtifactView(
                    actor.id,
                    replayArtifact as ArtifactRecord,
                    conversation,
                ),
            };
        }

        const activeJobs = await this.quizJobsService.listAssistantQuizJobs(
            actor.id,
            conversationId,
            true,
            1,
        );
        if (activeJobs.length > 0) {
            throw new ConflictException({
                code: "ASSISTANT_ARTIFACT_GENERATION_IN_PROGRESS",
                message: "Aguarda pela conclusão do material atual.",
            });
        }

        await this.acquireLease(actor.id, conversation);
        try {
            const snapshot = await this.artifactContext.prepareSnapshot(
                actor,
                conversation,
                input.type,
                input.target,
            );
            await this.audit(actor.id, conversation, input.type, "ACCEPTED");
            const job =
                await this.quizJobsService.createArtifactJobForAssistantSnapshot(
                    snapshot,
                    { type: input.type, topic },
                    { conversationId, requestKey: generationKey },
                );
            await this.audit(actor.id, conversation, input.type, "QUEUED");
            return this.toGenerationResult(conversation, job);
        } catch (error) {
            await this.audit(actor.id, conversation, input.type, "FAILED");
            throw error;
        } finally {
            await this.releaseLease(actor.id, conversation._id);
        }
    }

    async listJobs(
        actor: AuthenticatedUser,
        conversationId: string,
        input: ListStudentAssistantArtifactJobsDto,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        const jobs = await this.quizJobsService.listAssistantQuizJobs(
            actor.id,
            conversationId,
            input.status === "ACTIVE",
            input.limit ?? 10,
        );
        return Promise.all(
            jobs.map((job) => this.toJobView(conversation, job)),
        );
    }

    async getJob(
        actor: AuthenticatedUser,
        conversationId: string,
        jobId: string,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        try {
            const job = await this.quizJobsService.findAssistantQuizJob(
                actor.id,
                conversationId,
                jobId,
            );
            return this.toJobView(conversation, job);
        } catch (error) {
            if (error instanceof NotFoundException) throw this.jobNotFound();
            throw error;
        }
    }

    async hasActiveGeneration(studentId: string, conversationId: Types.ObjectId) {
        const now = new Date();
        const [conversation, activeJobs] = await Promise.all([
            this.conversationModel.exists({
                _id: conversationId,
                studentId: new Types.ObjectId(studentId),
                artifactGenerationLeaseExpiresAt: { $gt: now },
            }),
            this.quizJobsService.listAssistantQuizJobs(
                studentId,
                String(conversationId),
                true,
                1,
            ),
        ]);
        return Boolean(conversation) || activeJobs.length > 0;
    }

    async detachConversation(studentId: string, conversationId: Types.ObjectId) {
        const filter = {
            userId: new Types.ObjectId(studentId),
            assistantConversationId: conversationId,
        };
        const preservedArtifactCount = await this.artifactModel.countDocuments(filter);
        await Promise.all([
            this.artifactModel.updateMany(filter, {
                $unset: { assistantConversationId: 1 },
            }),
            this.quizJobsService.detachAssistantConversation(
                studentId,
                String(conversationId),
            ),
        ]);
        return preservedArtifactCount;
    }

    private async toJobView(
        conversation: ConversationRecord,
        job: QuizGenerationJobView,
    ) {
        let artifact: StudentAssistantArtifactView | undefined;
        if (job.artifactId) {
            const row = await this.artifactModel
                .findOne({
                    _id: new Types.ObjectId(job.artifactId),
                    userId: conversation.studentId,
                    assistantConversationId: conversation._id,
                })
                .lean();
            if (row) {
                artifact = await this.toArtifactView(
                    String(conversation.studentId),
                    row as ArtifactRecord,
                    conversation,
                );
            }
        }
        return {
            id: job._id,
            type: job.artifactType,
            status: job.status,
            ...(job.topic ? { topic: job.topic } : {}),
            ...(artifact ? { artifact } : {}),
            ...(job.status === "FAILED" && job.errorMessage
                ? { errorMessage: job.errorMessage }
                : {}),
            createdAt: job.createdAt?.toISOString() ?? new Date(0).toISOString(),
        };
    }

    private async toGenerationResult(
        conversation: ConversationRecord,
        job: QuizGenerationJobView,
    ) {
        if (job.status === "DONE") {
            const view = await this.toJobView(conversation, job);
            if (view.artifact) return { status: "DONE" as const, artifact: view.artifact };
        }
        if (job.status === "FAILED") {
            return {
                status: "FAILED" as const,
                job: await this.toJobView(conversation, job),
            };
        }
        return {
            status: job.status === "PROCESSING" ? "PROCESSING" as const : "QUEUED" as const,
            job: await this.toJobView(conversation, job),
        };
    }

    async toArtifactView(
        studentId: string,
        artifact: ArtifactRecord,
        conversation?: ConversationRecord,
    ): Promise<StudentAssistantArtifactView> {
        const contentTitle = artifact.contentJson?.title;
        const title = typeof contentTitle === "string" && contentTitle.trim()
            ? this.truncateTitle(contentTitle)
            : this.typeLabel(artifact.type);
        const targetKind = artifact.targetKind ?? "STUDY_AREA";
        const targetId = String(
            artifact.targetId ?? artifact.studyAreaId ?? conversation?.contextId,
        );
        const targetLabel =
            artifact.targetLabelSnapshot ??
            conversation?.contextLabelSnapshot ??
            "Contexto removido";
        const access = await this.artifactContext.resolveTargetAccess(
            studentId,
            targetKind,
            targetId,
            targetLabel,
        );
        const state = access.active ? "ACTIVE" as const : "READ_ONLY_ARCHIVED" as const;
        return {
            id: String(artifact._id),
            type: artifact.type,
            title,
            createdAt: artifact.createdAt?.toISOString() ?? new Date(0).toISOString(),
            targetPath: `/app/estudar/materiais/${artifact._id}`,
            target: {
                kind: targetKind,
                id: targetId,
                label: access.label,
                state,
                ...(access.targetPath ? { contextPath: access.targetPath } : {}),
            },
            provenance: {
                snapshotAt:
                    artifact.snapshotAt?.toISOString() ??
                    artifact.createdAt?.toISOString() ??
                    new Date(0).toISOString(),
                snapshotTurnCount: artifact.snapshotTurnCount ?? 0,
                usedTurnCount: artifact.usedTurnCount ?? 0,
                candidateSourceCount:
                    artifact.candidateSourceCount ?? artifact.sourcesJson.length,
                usedSourceCount:
                    artifact.usedSourceCount ?? artifact.sourcesJson.length,
                groundingMode:
                    artifact.groundingMode ??
                    (artifact.sourcesJson.length ? "CHAT_AND_SOURCES" : "CHAT_ONLY"),
            },
            capabilities: {
                canExport: artifact.type === "SUMMARY" || artifact.type === "QUIZ",
                canAttempt: access.active && artifact.type === "QUIZ",
                canRegenerate: access.active && Boolean(artifact.assistantConversationId),
                canDelete: true,
            },
        };
    }

    private typeLabel(type: StudentAssistantArtifactType): string {
        if (type === "SUMMARY") return "Resumo";
        if (type === "EXPLANATION") return "Explicação";
        if (type === "FLASHCARDS") return "Flashcards";
        return "Quiz";
    }

    private truncateTitle(value: string): string {
        const normalized = value
            .replace(/[\u0000-\u001F\u007F]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return normalized.length <= 80
            ? normalized
            : `${normalized.slice(0, 77).trimEnd()}…`;
    }

    private generationKey(
        studentId: string,
        conversationId: string,
        type: StudentAssistantArtifactType,
        topic: string | undefined,
        idempotencyKey: string | undefined,
        target?: { kind: string; id: string },
    ): string {
        if (
            !idempotencyKey ||
            idempotencyKey.length > 64 ||
            !StudentAiAssistantArtifactsService.IDEMPOTENCY_KEY_PATTERN.test(
                idempotencyKey,
            )
        ) {
            throw new BadRequestException({
                code: "ASSISTANT_IDEMPOTENCY_KEY_INVALID",
                message: "Não foi possível validar este pedido. Tenta novamente.",
            });
        }
        const normalizedTopic = topic
            ?.normalize("NFKC")
            .replace(/\s+/gu, " ")
            .toLocaleLowerCase("pt-PT") ?? "";
        return `assistant-artifact:${createHash("sha256")
            .update(
                JSON.stringify({
                    studentId,
                    conversationId,
                    type,
                    topic: normalizedTopic,
                    target: target ? `${target.kind}:${target.id}` : "FIXED",
                    idempotencyKey,
                }),
            )
            .digest("hex")}`;
    }

    private async acquireLease(
        studentId: string,
        conversation: ConversationRecord,
    ): Promise<void> {
        const now = new Date();
        const leased = await this.conversationModel.findOneAndUpdate(
            {
                _id: conversation._id,
                studentId: new Types.ObjectId(studentId),
                status: { $in: ["DRAFT", "ACTIVE"] },
                readOnly: false,
                $or: [
                    { artifactGenerationLeaseExpiresAt: { $exists: false } },
                    { artifactGenerationLeaseExpiresAt: null },
                    { artifactGenerationLeaseExpiresAt: { $lte: now } },
                ],
            },
            {
                $set: {
                    artifactGenerationLeaseExpiresAt: new Date(
                        now.getTime() +
                            StudentAiAssistantArtifactsService.GENERATION_LEASE_MS,
                    ),
                },
            },
            { new: true },
        );
        if (!leased) {
            throw new ConflictException({
                code: "ASSISTANT_ARTIFACT_GENERATION_IN_PROGRESS",
                message: "Já está a ser criado um material nesta conversa.",
            });
        }
    }

    private releaseLease(studentId: string, conversationId: Types.ObjectId) {
        return this.conversationModel.updateOne(
            { _id: conversationId, studentId: new Types.ObjectId(studentId) },
            { $unset: { artifactGenerationLeaseExpiresAt: 1 } },
        );
    }

    private async findOwned(
        actor: AuthenticatedUser,
        conversationId: string,
    ): Promise<ConversationRecord> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(conversationId)) throw this.notFound();
        const row = await this.conversationModel
            .findOne({
                _id: conversationId,
                studentId: new Types.ObjectId(actor.id),
                status: { $ne: "DELETED_RETAINED" },
            })
            .lean();
        if (!row) throw this.notFound();
        return row as ConversationRecord;
    }

    private assertWritable(conversation: ConversationRecord): void {
        if (conversation.readOnly) throw this.readOnly();
        if (conversation.status === "ARCHIVED") {
            throw new ConflictException({
                code: "ASSISTANT_CONVERSATION_ARCHIVED",
                message: "Restaura a conversa antes de criar um material.",
            });
        }
        if (!(["DRAFT", "ACTIVE"] as string[]).includes(conversation.status)) {
            throw this.notFound();
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private encodeCursor(createdAt: Date, id: string): string {
        return Buffer.from(
            JSON.stringify({ createdAt: createdAt.toISOString(), id }),
            "utf8",
        ).toString("base64url");
    }

    private decodeCursor(cursor?: string): { createdAt: Date; id: string } | null {
        if (!cursor) return null;
        try {
            const value = JSON.parse(
                Buffer.from(cursor, "base64url").toString("utf8"),
            ) as { createdAt?: string; id?: string };
            const createdAt = new Date(value.createdAt ?? "");
            if (
                !value.id ||
                !Types.ObjectId.isValid(value.id) ||
                Number.isNaN(createdAt.getTime())
            ) {
                throw new Error("invalid");
            }
            return { createdAt, id: value.id };
        } catch {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_CURSOR_INVALID",
                message: "Cursor de materiais inválido.",
            });
        }
    }

    private async audit(
        actorId: string,
        conversation: ConversationRecord,
        type: StudentAssistantArtifactType,
        result: "ACCEPTED" | "QUEUED" | "SUCCESS" | "FAILED",
    ): Promise<void> {
        await this.auditLogService.record({
            actorId,
            domain: "AI",
            action: "STUDENT_AI_ARTIFACT_GENERATION",
            resourceType: "StudentAiConversation",
            resourceId: String(conversation._id),
            result: result === "FAILED" ? "FAILED" : "SUCCESS",
            metadata: {
                contextKind: conversation.contextKind,
                artifactType: type,
                generationState: result,
            },
        });
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "ASSISTANT_CONVERSATION_NOT_FOUND",
            message: "Conversa não encontrada.",
        });
    }

    private jobNotFound(): NotFoundException {
        return new NotFoundException({
            code: "ASSISTANT_ARTIFACT_JOB_NOT_FOUND",
            message: "Preparação de material não encontrada.",
        });
    }

    private readOnly(message?: string): ConflictException {
        return new ConflictException({
            code: "ASSISTANT_CONVERSATION_READ_ONLY",
            message: message ?? "Esta conversa está disponível apenas para consulta.",
        });
    }
}
