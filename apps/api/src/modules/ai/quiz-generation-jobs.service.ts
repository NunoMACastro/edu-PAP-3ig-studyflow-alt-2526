/**
 * Fila Mongo recuperável para geração de quizzes privados.
 */
import {
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash, randomUUID } from "node:crypto";
import { Model, Types } from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import {
    executeWithMongoLeaseHeartbeat,
    MongoLeaseLostError,
} from "../../common/reliability/mongo-lease-heartbeat.js";
import { CreateQuizJobDto } from "./dto/create-quiz-job.dto.js";
import {
    QuizGenerationJob,
    QuizGenerationJobDocument,
    QuizGenerationJobStatus,
} from "./schemas/quiz-generation-job.schema.js";
import { StudyToolsService } from "./study-tools.service.js";
import { UsersService } from "../users/users.service.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import {
    StudentAiConversation,
    StudentAiConversationDocument,
} from "../student-ai-assistant/schemas/student-ai-conversation.schema.js";
import {
    StudentAiArtifactGenerationSnapshot,
    type StudentAiArtifactGenerationSnapshotDocument,
} from "../student-ai-assistant/schemas/student-ai-artifact-generation-snapshot.schema.js";
import type { AssistantArtifactGenerationSnapshot } from "./ai-artifact-generation.types.js";

const DEFAULT_LEASE_MS = 30_000;
const DEFAULT_POLL_MS = 1_000;
const QUIZ_JOB_CONCURRENCY = 2;

export type QuizGenerationJobView = {
    _id: string;
    studyAreaId?: string;
    targetKind?: "STUDY_AREA" | "SUBJECT" | "CLASS";
    targetId?: string;
    targetLabel?: string;
    status: QuizGenerationJobStatus;
    artifactId?: string;
    topic?: string;
    errorMessage?: string;
    attempts?: number;
    maxAttempts?: number;
    createdAt?: Date;
    updatedAt?: Date;
};

type QuizGenerationJobLean = QuizGenerationJob & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

export type QuizGenerationStudyToolsPort = Pick<
    StudyToolsService,
    "assertQuizGenerationReady" | "generateStudyTool"
> &
    Partial<
        Pick<StudyToolsService, "generateStudyToolFromAssistantSnapshot">
    >;

/**
 * Cada instância reclama trabalho por lease; um restart permite a outra instância
 * recuperar PROCESSING expirados. Heartbeat e updates terminais exigem o mesmo
 * `leaseOwner`, token de fencing monotónico e lease ainda válido.
 */
@Injectable()
export class QuizGenerationJobsService
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(QuizGenerationJobsService.name);
    private readonly workerId = `quiz-${randomUUID()}`;
    private readonly active = new Set<Promise<void>>();
    private timer?: NodeJS.Timeout;
    private started = false;
    private shuttingDown = false;
    private cycleRunning = false;

    constructor(
        @InjectModel(QuizGenerationJob.name)
        private readonly jobModel: Model<QuizGenerationJobDocument>,
        @Inject(StudyToolsService)
        private readonly studyToolsService: QuizGenerationStudyToolsPort,
        private readonly accountLifecycleBarrier: AccountLifecycleBarrierService,
        private readonly usersService: UsersService,
        @Optional()
        @InjectModel(StudentAiConversation.name)
        private readonly conversationModel?: Model<StudentAiConversationDocument>,
        @Optional()
        private readonly auditLogService?: AuditLogService,
        @Optional()
        @InjectModel(StudentAiArtifactGenerationSnapshot.name)
        private readonly snapshotModel?: Model<StudentAiArtifactGenerationSnapshotDocument>,
    ) {}

    onApplicationBootstrap(): void {
        this.shuttingDown = false;
        this.started = true;
        this.timer = setInterval(() => void this.runCycle(), this.pollMs());
        this.timer.unref();
        void this.runCycle();
    }

    async onApplicationShutdown(): Promise<void> {
        this.shuttingDown = true;
        this.started = false;
        if (this.timer) clearInterval(this.timer);
        await Promise.allSettled([...this.active]);
    }

    /** Confirma que o runner iniciou e ainda aceita trabalho. */
    checkReady(): void {
        if (!this.started || this.shuttingDown) {
            throw new Error("Quiz generation job runner is not ready.");
        }
    }

    async createQuizJob(
        userId: string,
        studyAreaId: string,
        input: CreateQuizJobDto,
    ): Promise<QuizGenerationJobView> {
        return this.createQuizJobInternal(userId, studyAreaId, input);
    }

    /** Cria um job idempotente associado exclusivamente a uma conversa. */
    async createQuizJobForAssistant(
        userId: string,
        studyAreaId: string,
        input: CreateQuizJobDto,
        options: { conversationId: string; requestKey: string },
    ): Promise<QuizGenerationJobView> {
        return this.createQuizJobInternal(userId, studyAreaId, input, options);
    }

    /**
     * Persiste snapshot e job numa única transação Mongo. Não existe fallback
     * não transacional para este caminho novo.
     */
    async createQuizJobForAssistantSnapshot(
        snapshot: AssistantArtifactGenerationSnapshot,
        input: CreateQuizJobDto,
        options: { conversationId: string; requestKey: string },
    ): Promise<QuizGenerationJobView> {
        if (!this.snapshotModel || !this.jobModel.db) {
            throw new Error("ASSISTANT_ARTIFACT_SNAPSHOT_MODEL_UNAVAILABLE");
        }
        const replay = await this.jobModel
            .findOne({
                userId: this.parseObjectId(snapshot.userId),
                assistantConversationId: this.parseObjectId(options.conversationId),
                assistantRequestKey: options.requestKey,
            })
            .lean();
        if (replay) return this.toView(replay as QuizGenerationJobLean);

        const topic = input.topic?.trim() || undefined;
        const activeKey = this.activeKey(
            snapshot.userId,
            snapshot.target.id,
            topic,
            options.conversationId,
        );
        const session = await this.jobModel.db.startSession();
        let created: QuizGenerationJobDocument | undefined;
        try {
            await session.withTransaction(async () => {
                const concurrent = await this.jobModel
                    .findOne({
                        $or: [
                            { assistantRequestKey: options.requestKey },
                            { activeKey, status: { $in: ["QUEUED", "PROCESSING"] } },
                        ],
                    })
                    .session(session)
                    .lean();
                if (concurrent) {
                    created = concurrent as unknown as QuizGenerationJobDocument;
                    return;
                }
                const [snapshotDocument] = await this.snapshotModel!.create(
                    [{
                        userId: this.parseObjectId(snapshot.userId),
                        conversationId: this.parseObjectId(options.conversationId),
                        sourceContextKind: snapshot.sourceContextKind,
                        sourceContextId: this.parseObjectId(snapshot.sourceContextId),
                        contextLabel: snapshot.contextLabel,
                        targetKind: snapshot.target.kind,
                        targetId: this.parseObjectId(snapshot.target.id),
                        targetLabel: snapshot.target.label,
                        sources: snapshot.sources.map((source) => ({ ...source })),
                        candidateSourceCount: snapshot.candidateSourceCount,
                        conversationTurns: snapshot.conversationTurns.map((turn) => ({ ...turn })),
                        snapshotTurnCount: snapshot.snapshotTurnCount,
                        groundingMode: snapshot.groundingMode,
                        snapshotDigest: snapshot.snapshotDigest,
                        voiceTone: snapshot.voiceTone,
                        snapshotAt: snapshot.snapshotAt,
                        purgeAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    }],
                    { session },
                );
                [created] = await this.jobModel.create(
                    [{
                        userId: this.parseObjectId(snapshot.userId),
                        ...(snapshot.target.kind === "STUDY_AREA"
                            ? { studyAreaId: this.parseObjectId(snapshot.target.id) }
                            : {}),
                        targetKind: snapshot.target.kind,
                        targetId: this.parseObjectId(snapshot.target.id),
                        targetLabelSnapshot: snapshot.target.label,
                        sourceContextKind: snapshot.sourceContextKind,
                        status: "QUEUED",
                        topic,
                        attempts: 0,
                        maxAttempts: 3,
                        availableAt: new Date(),
                        activeKey,
                        leaseToken: 0,
                        assistantConversationId: this.parseObjectId(options.conversationId),
                        assistantRequestKey: options.requestKey,
                        assistantSnapshotId: snapshotDocument._id,
                    }],
                    { session },
                );
            });
        } catch (error) {
            if (!this.isDuplicateKey(error)) throw error;
            const concurrent = await this.jobModel
                .findOne({
                    $or: [
                        { assistantRequestKey: options.requestKey },
                        {
                            activeKey,
                            status: { $in: ["QUEUED", "PROCESSING"] },
                        },
                    ],
                })
                .lean();
            if (!concurrent) throw error;
            return this.toView(concurrent as QuizGenerationJobLean);
        } finally {
            await session.endSession();
        }
        if (!created) throw new Error("ASSISTANT_ARTIFACT_JOB_NOT_CREATED");
        if (this.started) void this.runCycle();
        const value = typeof created.toObject === "function"
            ? created.toObject()
            : created;
        return this.toView(value as QuizGenerationJobLean);
    }

    private async createQuizJobInternal(
        userId: string,
        studyAreaId: string,
        input: CreateQuizJobDto,
        assistant?: { conversationId: string; requestKey: string },
    ): Promise<QuizGenerationJobView> {
        await this.studyToolsService.assertQuizGenerationReady(userId, studyAreaId);
        const topic = input.topic?.trim() || undefined;
        if (assistant) {
            const replay = await this.jobModel
                .findOne({
                    userId: this.parseObjectId(userId),
                    assistantConversationId: this.parseObjectId(
                        assistant.conversationId,
                    ),
                    assistantRequestKey: assistant.requestKey,
                })
                .lean();
            if (replay) return this.toView(replay as QuizGenerationJobLean);
        }
        const activeKey = this.activeKey(
            userId,
            studyAreaId,
            topic,
            assistant?.conversationId,
        );
        const activeJob = await this.jobModel
            .findOne({ activeKey, status: { $in: ["QUEUED", "PROCESSING"] } })
            .sort({ createdAt: -1 })
            .lean();
        if (activeJob) return this.toView(activeJob as QuizGenerationJobLean);

        let job: QuizGenerationJobDocument;
        try {
            job = await this.jobModel.create({
                userId: this.parseObjectId(userId),
                studyAreaId: this.parseObjectId(studyAreaId),
                targetKind: "STUDY_AREA",
                targetId: this.parseObjectId(studyAreaId),
                status: "QUEUED",
                topic,
                attempts: 0,
                maxAttempts: 3,
                availableAt: new Date(),
                activeKey,
                leaseToken: 0,
                ...(assistant
                    ? {
                          assistantConversationId: this.parseObjectId(
                              assistant.conversationId,
                          ),
                          assistantRequestKey: assistant.requestKey,
                      }
                    : {}),
            });
        } catch (error) {
            if (!this.isDuplicateKey(error)) throw error;
            const concurrent = await this.jobModel
                .findOne({
                    activeKey,
                    status: { $in: ["QUEUED", "PROCESSING"] },
                })
                .lean();
            if (!concurrent) throw error;
            return this.toView(concurrent as QuizGenerationJobLean);
        }
        if (this.started) void this.runCycle();
        return this.toView(job.toObject() as QuizGenerationJobLean);
    }

    /** Lista jobs desta conversa sem aceitar área ou ownership do cliente. */
    async listAssistantQuizJobs(
        userId: string,
        conversationId: string,
        activeOnly: boolean,
        limit: number,
    ): Promise<QuizGenerationJobView[]> {
        const rows = await this.jobModel
            .find({
                userId: this.parseObjectId(userId),
                assistantConversationId: this.parseObjectId(conversationId),
                ...(activeOnly
                    ? { status: { $in: ["QUEUED", "PROCESSING"] } }
                    : {}),
            })
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .lean();
        return rows.map((row) => this.toView(row as QuizGenerationJobLean));
    }

    /** Obtém um job pela conversa e pelo aluno, impedindo enumeração cruzada. */
    async findAssistantQuizJob(
        userId: string,
        conversationId: string,
        jobId: string,
    ): Promise<QuizGenerationJobView> {
        const row = await this.jobModel
            .findOne({
                _id: this.parseObjectId(jobId),
                userId: this.parseObjectId(userId),
                assistantConversationId: this.parseObjectId(conversationId),
            })
            .lean();
        if (!row) throw this.notFound();
        return this.toView(row as QuizGenerationJobLean);
    }

    /** Procura uma repetição exata sem criar novo trabalho. */
    async findAssistantQuizJobByRequestKey(
        userId: string,
        conversationId: string,
        requestKey: string,
    ): Promise<QuizGenerationJobView | null> {
        const row = await this.jobModel
            .findOne({
                userId: this.parseObjectId(userId),
                assistantConversationId: this.parseObjectId(conversationId),
                assistantRequestKey: requestKey,
            })
            .lean();
        return row ? this.toView(row as QuizGenerationJobLean) : null;
    }

    /** Remove apenas a associação ao Assistente; o job e o artefacto permanecem. */
    async detachAssistantConversation(
        userId: string,
        conversationId: string,
    ): Promise<void> {
        const terminalJobs = await this.jobModel
            .find({
                userId: this.parseObjectId(userId),
                assistantConversationId: this.parseObjectId(conversationId),
                status: { $in: ["DONE", "FAILED"] },
            })
            .select({ assistantSnapshotId: 1 })
            .lean();
        await this.jobModel.updateMany(
            {
                userId: this.parseObjectId(userId),
                assistantConversationId: this.parseObjectId(conversationId),
                status: { $in: ["DONE", "FAILED"] },
            },
            {
                $unset: {
                    assistantConversationId: 1,
                    assistantRequestKey: 1,
                },
            },
        );
        if (this.snapshotModel) {
            const snapshotIds = terminalJobs
                .map((job) => job.assistantSnapshotId)
                .filter((id): id is Types.ObjectId => Boolean(id));
            if (snapshotIds.length) {
                await this.snapshotModel.deleteMany({ _id: { $in: snapshotIds } });
            }
        }
    }

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
     * Helper determinístico de testes/ops: consome até `maxJobs` sem timers.
     */
    async runUntilIdle(maxJobs = 100): Promise<number> {
        let processed = 0;
        while (processed < maxJobs) {
            const claimed = await this.claimNext();
            if (!claimed) break;
            await this.processClaimed(claimed);
            processed += 1;
        }
        return processed;
    }

    private async runCycle(): Promise<void> {
        if (!this.started || this.cycleRunning) return;
        this.cycleRunning = true;
        try {
            while (this.active.size < QUIZ_JOB_CONCURRENCY) {
                const claimed = await this.claimNext();
                if (!claimed) break;
                const work = this.processClaimed(claimed).finally(() => {
                    this.active.delete(work);
                    if (this.started) void this.runCycle();
                });
                this.active.add(work);
            }
        } catch {
            this.logger.error("Falha controlada no runner Mongo de quizzes.");
        } finally {
            this.cycleRunning = false;
        }
    }

    private async claimNext(): Promise<QuizGenerationJobLean | null> {
        const now = new Date();
        // Um processo pode cair já na última tentativa. Sem esta recuperação o
        // lease expirava, mas o `$lt` do claim deixava o job preso em PROCESSING.
        await this.jobModel.updateMany(
            {
                $expr: { $gte: ["$attempts", "$maxAttempts"] },
                $or: [
                    { status: "QUEUED" },
                    {
                        status: "PROCESSING",
                        leaseExpiresAt: { $lte: now },
                    },
                ],
            },
            {
                $set: {
                    status: "FAILED",
                    errorMessage:
                        "Não foi possível gerar o quiz neste momento.",
                    completedAt: now,
                },
                $unset: {
                    leaseOwner: "",
                    leaseExpiresAt: "",
                    activeKey: "",
                },
            },
        );
        const claimed = await this.jobModel
            .findOneAndUpdate(
                {
                    $expr: { $lt: ["$attempts", "$maxAttempts"] },
                    $or: [
                        {
                            status: "QUEUED",
                            availableAt: { $lte: now },
                        },
                        {
                            status: "PROCESSING",
                            leaseExpiresAt: { $lte: now },
                        },
                    ],
                },
                {
                    $set: {
                        status: "PROCESSING",
                        leaseOwner: this.workerId,
                        leaseExpiresAt: new Date(now.getTime() + this.leaseMs()),
                    },
                    $inc: { attempts: 1, leaseToken: 1 },
                    $unset: { errorMessage: "" },
                },
                { new: true, sort: { createdAt: 1 } },
            )
            .lean();
        return (claimed as QuizGenerationJobLean | null) ?? null;
    }

    private async processClaimed(job: QuizGenerationJobLean): Promise<void> {
        let releaseMutation: (() => void) | undefined;
        try {
            const userId = String(job.userId);
            // O runner é uma mutação da conta tal como um POST autenticado. A
            // lease é adquirida antes do primeiro await para que account deletion
            // espere também por providers já iniciados e pela persistência final.
            releaseMutation = this.accountLifecycleBarrier.enterMutation(userId);
            const activeAccount = await this.usersService.findSessionUser(userId);
            if (!activeAccount) {
                throw new Error("QUIZ_JOB_ACCOUNT_NOT_ACTIVE");
            }

            const leaseMs = this.leaseMs();
            const artifact = await executeWithMongoLeaseHeartbeat({
                leaseMs,
                heartbeat: () => this.renewLease(job, leaseMs),
                operation: async () => {
                    if (job.assistantSnapshotId) {
                        const snapshot = await this.loadAssistantSnapshot(job);
                        const generateFromSnapshot =
                            this.studyToolsService
                                .generateStudyToolFromAssistantSnapshot;
                        if (!generateFromSnapshot) {
                            throw new Error(
                                "ASSISTANT_ARTIFACT_GENERATOR_UNAVAILABLE",
                            );
                        }
                        return generateFromSnapshot.call(
                            this.studyToolsService,
                            snapshot,
                            { type: "QUIZ", topic: job.topic },
                            `quiz-job:${String(job._id)}`,
                        );
                    }
                    return job.assistantConversationId
                        ? this.studyToolsService.generateStudyTool(
                              String(job.userId),
                              String(job.studyAreaId),
                              { type: "QUIZ", topic: job.topic },
                              `quiz-job:${String(job._id)}`,
                              String(job.assistantConversationId),
                          )
                        : this.studyToolsService.generateStudyTool(
                              String(job.userId),
                              String(job.studyAreaId),
                              { type: "QUIZ", topic: job.topic },
                              `quiz-job:${String(job._id)}`,
                          );
                },
            });
            const completedAt = new Date();
            const completed = await this.jobModel.updateOne(
                this.leaseFilter(job, completedAt),
                {
                    $set: {
                        status: "DONE",
                        artifactId: this.parseObjectId(artifact._id),
                        completedAt: new Date(),
                    },
                    $unset: {
                        errorMessage: "",
                        leaseOwner: "",
                        leaseExpiresAt: "",
                        activeKey: "",
                    },
                },
            );
            if (completed.modifiedCount !== 1) {
                this.logger.warn(
                    "Resultado de quiz descartado porque o fencing token mudou.",
                );
            }
            if (completed.modifiedCount === 1 && job.assistantConversationId) {
                await this.scheduleSnapshotPurge(job);
                await this.promoteAssistantConversation(job, completedAt);
                await this.auditAssistantJob(job, "SUCCESS");
            }
        } catch (error) {
            if (error instanceof MongoLeaseLostError) {
                this.logger.warn(
                    "Processamento de quiz interrompido após perda do lease.",
                );
                return;
            }
            const exhausted = (job.attempts ?? 1) >= (job.maxAttempts ?? 3);
            const transitionAt = new Date();
            const transitioned = await this.jobModel.updateOne(
                this.leaseFilter(job, transitionAt),
                exhausted
                    ? {
                          $set: {
                              status: "FAILED",
                              errorMessage: this.toPublicErrorMessage(error),
                              completedAt: new Date(),
                          },
                          $unset: {
                              leaseOwner: "",
                              leaseExpiresAt: "",
                              activeKey: "",
                          },
                      }
                    : {
                          $set: {
                              status: "QUEUED",
                              errorMessage: this.toPublicErrorMessage(error),
                              availableAt: new Date(
                                  Date.now() + this.retryDelayMs(job.attempts ?? 1),
                              ),
                          },
                          $unset: { leaseOwner: "", leaseExpiresAt: "" },
                      },
            );
            if (transitioned.modifiedCount !== 1) {
                this.logger.warn(
                    "Falha de quiz não reagendada porque o fencing token mudou.",
                );
            }
            if (
                transitioned.modifiedCount === 1 &&
                exhausted &&
                job.assistantConversationId
            ) {
                await this.scheduleSnapshotPurge(job);
                await this.auditAssistantJob(job, "FAILED");
            }
        } finally {
            releaseMutation?.();
        }
    }

    private retryDelayMs(attempt: number): number {
        return [1_000, 5_000, 30_000][Math.min(Math.max(attempt - 1, 0), 2)];
    }

    /** Renova apenas o claim atual e nunca ressuscita um lease já expirado. */
    private async renewLease(
        job: QuizGenerationJobLean,
        leaseMs: number,
    ): Promise<boolean> {
        const now = new Date();
        const result = await this.jobModel.updateOne(
            this.leaseFilter(job, now),
            { $set: { leaseExpiresAt: new Date(now.getTime() + leaseMs) } },
        );
        return (result.matchedCount ?? result.modifiedCount) === 1;
    }

    /** Filtro CAS partilhado por heartbeat, sucesso e falha. */
    private leaseFilter(job: QuizGenerationJobLean, now: Date) {
        return {
            _id: job._id,
            status: "PROCESSING",
            leaseOwner: this.workerId,
            leaseToken: job.leaseToken,
            leaseExpiresAt: { $gt: now },
        };
    }

    private leaseMs(): number {
        return this.readPositiveInteger("QUIZ_JOB_LEASE_MS", DEFAULT_LEASE_MS);
    }

    private pollMs(): number {
        return this.readPositiveInteger("QUIZ_JOB_POLL_MS", DEFAULT_POLL_MS);
    }

    private readPositiveInteger(name: string, fallback: number): number {
        const raw = process.env[name];
        const value = raw === undefined ? fallback : Number(raw);
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error(`${name} deve ser um inteiro positivo.`);
        }
        return value;
    }

    private parseObjectId(value: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) throw this.notFound();
        return new Types.ObjectId(value);
    }

    private toView(job: QuizGenerationJobLean): QuizGenerationJobView {
        return {
            _id: String(job._id),
            ...(job.studyAreaId ? { studyAreaId: String(job.studyAreaId) } : {}),
            ...(job.targetKind ? { targetKind: job.targetKind } : {}),
            ...(job.targetId ? { targetId: String(job.targetId) } : {}),
            ...(job.targetLabelSnapshot
                ? { targetLabel: job.targetLabelSnapshot }
                : {}),
            status: job.status,
            artifactId: job.artifactId ? String(job.artifactId) : undefined,
            topic: job.topic,
            errorMessage: job.errorMessage,
            attempts: job.attempts,
            maxAttempts: job.maxAttempts,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    private toPublicErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message.includes("processável")) {
            return error.message;
        }
        return "Não foi possível gerar o quiz neste momento.";
    }

    /** Chave sem tópico em claro para deduplicar apenas pedidos equivalentes. */
    private activeKey(
        userId: string,
        studyAreaId: string,
        topic?: string,
        conversationId?: string,
    ): string {
        const normalizedTopic =
            topic
                ?.normalize("NFKC")
                .replace(/\s+/gu, " ")
                .toLocaleLowerCase("pt-PT") ?? "";
        const topicDigest = createHash("sha256").update(normalizedTopic).digest("hex");
        return conversationId
            ? `quiz-assistant:${userId}:${conversationId}:${studyAreaId}:${topicDigest}`
            : `quiz:${userId}:${studyAreaId}:${topicDigest}`;
    }

    private async promoteAssistantConversation(
        job: QuizGenerationJobLean,
        completedAt: Date,
    ): Promise<void> {
        if (!this.conversationModel || !job.assistantConversationId) return;
        const label = job.topic?.trim()
            ? `Quiz — ${job.topic.trim()}`
            : `Quiz — ${job.targetLabelSnapshot ?? "material de estudo"}`;
        const title = label.length <= 80 ? label : `${label.slice(0, 77).trimEnd()}…`;
        await this.conversationModel.updateOne(
            {
                _id: job.assistantConversationId,
                studentId: job.userId,
                status: { $in: ["DRAFT", "ACTIVE"] },
            },
            {
                $set: {
                    status: "ACTIVE",
                    lastMessageAt: completedAt,
                },
                $unset: { draftExpiresAt: 1 },
            },
        );
        await this.conversationModel.updateOne(
            {
                _id: job.assistantConversationId,
                studentId: job.userId,
                title: "Nova conversa",
            },
            { $set: { title } },
        );
    }

    private async auditAssistantJob(
        job: QuizGenerationJobLean,
        result: "SUCCESS" | "FAILED",
    ): Promise<void> {
        if (!this.auditLogService || !job.assistantConversationId) return;
        await this.auditLogService.record({
            actorId: String(job.userId),
            domain: "AI",
            action: "STUDENT_AI_ARTIFACT_GENERATION",
            resourceType: "StudentAiConversation",
            resourceId: String(job.assistantConversationId),
            result,
            metadata: {
                contextKind: job.sourceContextKind ?? "STUDY_AREA",
                artifactType: "QUIZ",
                generationState: result,
            },
        });
    }

    /** Reconstitui o contrato imutável e rejeita snapshots de outro job/aluno. */
    private async loadAssistantSnapshot(
        job: QuizGenerationJobLean,
    ): Promise<AssistantArtifactGenerationSnapshot> {
        if (!this.snapshotModel || !job.assistantSnapshotId || !job.assistantConversationId) {
            throw new Error("ASSISTANT_ARTIFACT_SNAPSHOT_UNAVAILABLE");
        }
        const row = await this.snapshotModel
            .findOne({
                _id: job.assistantSnapshotId,
                userId: job.userId,
                conversationId: job.assistantConversationId,
                purgeAt: { $gt: new Date() },
            })
            .lean();
        if (!row) throw new Error("ASSISTANT_ARTIFACT_SNAPSHOT_EXPIRED");
        return Object.freeze({
            userId: String(row.userId),
            conversationId: String(row.conversationId),
            sourceContextKind: row.sourceContextKind as AssistantArtifactGenerationSnapshot["sourceContextKind"],
            sourceContextId: String(row.sourceContextId),
            contextLabel: row.contextLabel,
            target: Object.freeze({
                kind: row.targetKind,
                id: String(row.targetId),
                label: row.targetLabel,
            }),
            sources: Object.freeze(row.sources.map((source) => Object.freeze({ ...source }))),
            candidateSourceCount: row.candidateSourceCount,
            conversationTurns: Object.freeze(
                row.conversationTurns.map((turn) => Object.freeze({ ...turn })),
            ),
            snapshotAt: row.snapshotAt,
            snapshotTurnCount: row.snapshotTurnCount,
            groundingMode: row.groundingMode,
            snapshotDigest: row.snapshotDigest,
            ...(row.voiceTone ? { voiceTone: row.voiceTone } : {}),
        });
    }

    private async scheduleSnapshotPurge(job: QuizGenerationJobLean): Promise<void> {
        if (!this.snapshotModel || !job.assistantSnapshotId) return;
        await this.snapshotModel.updateOne(
            { _id: job.assistantSnapshotId, userId: job.userId },
            { $set: { purgeAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
        );
    }

    private isDuplicateKey(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === 11000
        );
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "QUIZ_JOB_NOT_FOUND",
            message: "Job de quiz não encontrado.",
        });
    }
}
