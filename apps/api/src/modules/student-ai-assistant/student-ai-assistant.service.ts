/**
 * Fachada transacional do Assistente: organiza conversas e delega cada
 * execução no serviço de domínio que já protege fontes, quota e consentimento.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import type {
    GovernedAiConversationTurn,
    StudentAiCitationKind,
} from "../ai/student-ai-conversation-context.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassAiService } from "../class-ai/class-ai.service.js";
import {
    ClassAiInteraction,
    type ClassAiInteractionDocument,
} from "../class-ai/schemas/class-ai-interaction.schema.js";
import { GuidedStudyRoomAiService } from "../guided-study-rooms/guided-study-room-ai.service.js";
import {
    GuidedStudyRoomAiInteraction,
    type GuidedStudyRoomAiInteractionDocument,
} from "../guided-study-rooms/schemas/guided-study-room-ai-interaction.schema.js";
import { PrivateAreaAiService } from "../private-area-ai/private-area-ai.service.js";
import {
    PrivateAreaAiAnswer,
    type PrivateAreaAiAnswerDocument,
} from "../private-area-ai/schemas/private-area-ai-answer.schema.js";
import {
    StudyGroupAiAnswer,
    type StudyGroupAiAnswerDocument,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import { StudyGroupAiService } from "../study-group-ai/study-group-ai.service.js";
import { RoomAiService } from "../study-rooms/room-ai.service.js";
import {
    RoomAiInteraction,
    type RoomAiInteractionDocument,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import type {
    AskStudentAiAssistantDto,
    CreateStudentAiConversationDto,
    ListStudentAiConversationsDto,
    ListStudentAiMessagesDto,
    UpdateStudentAiConversationDto,
} from "./dto/student-ai-assistant.dto.js";
import {
    StudentAiConversation,
    type StudentAiConversationDocument,
} from "./schemas/student-ai-conversation.schema.js";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";
import { StudentAiAssistantArtifactsService } from "./student-ai-assistant-artifacts.service.js";
import type {
    ResolvedStudentAssistantContext,
    StudentAssistantContextKind,
} from "./student-ai-assistant.types.js";

type ConversationRecord = StudentAiConversation & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

type TurnRecord = {
    _id: unknown;
    question: string;
    answer: string;
    createdAt?: Date;
    sourceMaterialIds?: unknown[];
    sourceShareIds?: unknown[];
    sources?: Array<{ title: string }>;
    citationSnapshots?: Array<{ label: string; kind: StudentAiCitationKind }>;
    visibility?: "PRIVATE" | "SHARED";
    inheritedFromFork?: boolean;
    voiceSource?: "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";
};

@Injectable()
export class StudentAiAssistantService {
    private static readonly REPLY_LEASE_MS = 120_000;

    constructor(
        @InjectModel(StudentAiConversation.name)
        private readonly conversationModel: Model<StudentAiConversationDocument>,
        @InjectModel(ClassAiInteraction.name)
        private readonly classInteractionModel: Model<ClassAiInteractionDocument>,
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly privateAnswerModel: Model<PrivateAreaAiAnswerDocument>,
        @InjectModel(StudyGroupAiAnswer.name)
        private readonly groupAnswerModel: Model<StudyGroupAiAnswerDocument>,
        @InjectModel(RoomAiInteraction.name)
        private readonly roomInteractionModel: Model<RoomAiInteractionDocument>,
        @InjectModel(GuidedStudyRoomAiInteraction.name)
        private readonly guidedInteractionModel: Model<GuidedStudyRoomAiInteractionDocument>,
        private readonly contextResolver: StudentAiContextResolverService,
        private readonly classAiService: ClassAiService,
        private readonly privateAiService: PrivateAreaAiService,
        private readonly groupAiService: StudyGroupAiService,
        private readonly roomAiService: RoomAiService,
        private readonly guidedAiService: GuidedStudyRoomAiService,
        private readonly auditLogService: AuditLogService,
        @Optional()
        private readonly artifactsService?: StudentAiAssistantArtifactsService,
    ) {}

    async create(actor: AuthenticatedUser, input: CreateStudentAiConversationDto) {
        this.assertStudent(actor);
        let context: ResolvedStudentAssistantContext;
        try {
            context = await this.contextResolver.resolve(
                actor,
                input.context.kind,
                input.context.id,
            );
        } catch (error) {
            await this.auditAccessDenied(
                actor.id,
                "STUDENT_AI_CONTEXT_ACCESS_DENIED",
                input.context.id,
                input.context.kind,
            );
            throw error;
        }
        if (!context.canAsk) {
            throw new ForbiddenException({
                code: "ASSISTANT_CONTEXT_FORBIDDEN",
                message: context.unavailableReason ?? "Este contexto não aceita novas perguntas.",
            });
        }
        const now = new Date();
        const conversation = await this.conversationModel.create({
            studentId: new Types.ObjectId(actor.id),
            contextKind: context.kind,
            contextId: new Types.ObjectId(context.id),
            contextLabelSnapshot: context.label,
            contextSecondaryLabelSnapshot: context.secondaryLabel,
            title: "Nova conversa",
            status: "DRAFT",
            origin: "NATIVE",
            readOnly: false,
            draftExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        });
        await this.audit("STUDENT_AI_CONVERSATION_CREATED", actor.id, conversation, "SUCCESS");
        return this.toConversationView(
            actor,
            conversation.toObject() as ConversationRecord,
            context,
        );
    }

    async list(actor: AuthenticatedUser, input: ListStudentAiConversationsDto) {
        this.assertStudent(actor);
        const limit = input.limit ?? 20;
        const cursor = this.decodeConversationCursor(input.cursor);
        const filter: Record<string, unknown> = {
            studentId: new Types.ObjectId(actor.id),
            status: input.status ?? "ACTIVE",
            ...(input.contextKind ? { contextKind: input.contextKind } : {}),
            ...(input.contextId
                ? { contextId: new Types.ObjectId(input.contextId) }
                : {}),
        };
        if (cursor) {
            filter.$or = [
                { lastMessageAt: { $lt: cursor.lastMessageAt } },
                {
                    lastMessageAt: cursor.lastMessageAt,
                    _id: { $lt: new Types.ObjectId(cursor.id) },
                },
            ];
        }
        const rows = await this.conversationModel
            .find(filter)
            .sort({ lastMessageAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = (hasMore ? rows.slice(0, limit) : rows) as ConversationRecord[];
        const currentContexts = await this.contextResolver.listCurrentContextMap(actor);
        const items = await Promise.all(
            pageRows.map((row) =>
                this.toConversationView(
                    actor,
                    row,
                    currentContexts.get(
                        this.contextResolver.contextKey(
                            row.contextKind,
                            String(row.contextId),
                        ),
                    ) ?? null,
                ),
            ),
        );
        const last = pageRows.at(-1);
        return {
            items,
            nextCursor:
                hasMore && last?.lastMessageAt
                    ? this.encodeConversationCursor(last.lastMessageAt, String(last._id))
                    : null,
        };
    }

    async get(actor: AuthenticatedUser, conversationId: string) {
        const row = await this.findOwned(actor, conversationId);
        return this.toConversationView(actor, row);
    }

    async update(
        actor: AuthenticatedUser,
        conversationId: string,
        input: UpdateStudentAiConversationDto,
    ) {
        const current = await this.findOwned(actor, conversationId);
        if (input.title === undefined && input.status === undefined) {
            throw new BadRequestException({
                code: "ASSISTANT_CONVERSATION_UPDATE_EMPTY",
                message: "Indica o que pretendes alterar.",
            });
        }
        const title = input.title === undefined ? undefined : this.normalizeTitle(input.title);
        if (
            input.status === "ARCHIVED" &&
            this.artifactsService &&
            (await this.artifactsService.hasActiveGeneration(actor.id, current._id))
        ) {
            throw this.artifactGenerationInProgress();
        }
        const updated = await this.conversationModel.findOneAndUpdate(
            {
                _id: current._id,
                studentId: new Types.ObjectId(actor.id),
                status: { $ne: "DELETED_RETAINED" },
            },
            {
                $set: {
                    ...(title ? { title } : {}),
                    ...(input.status ? { status: input.status } : {}),
                },
            },
            { new: true, runValidators: true },
        );
        if (!updated) throw this.notFound();
        await this.audit("STUDENT_AI_CONVERSATION_UPDATED", actor.id, updated, "SUCCESS");
        return this.toConversationView(actor, updated.toObject() as ConversationRecord);
    }

    async listMessages(
        actor: AuthenticatedUser,
        conversationId: string,
        input: ListStudentAiMessagesDto,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        if (input.before && !Types.ObjectId.isValid(input.before)) {
            throw new BadRequestException({
                code: "ASSISTANT_MESSAGES_CURSOR_INVALID",
                message: "Cursor de mensagens inválido.",
            });
        }
        const limit = input.limit ?? 30;
        const rows = await this.findTurns(
            conversation,
            actor.id,
            input.before,
            limit + 1,
        );
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        const hasAccess = await this.contextResolver.hasCurrentAccess(
            actor,
            conversation.contextKind,
            String(conversation.contextId),
        );
        return {
            items: pageRows
                .map((row) => this.toTurnView(conversation, row, hasAccess))
                .reverse(),
            previousCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    async ask(
        actor: AuthenticatedUser,
        conversationId: string,
        input: AskStudentAiAssistantDto,
    ) {
        const conversation = await this.findOwned(actor, conversationId);
        if (conversation.readOnly) throw this.readOnly();
        if (conversation.status === "ARCHIVED") throw this.archived();
        if (conversation.status !== "DRAFT" && conversation.status !== "ACTIVE") {
            throw this.notFound();
        }
        const context = await this.contextResolver.resolve(
            actor,
            conversation.contextKind,
            String(conversation.contextId),
        );
        if (!context.canAsk) throw this.readOnly(context.unavailableReason);

        const now = new Date();
        const lease = await this.conversationModel.findOneAndUpdate(
            {
                _id: conversation._id,
                studentId: new Types.ObjectId(actor.id),
                status: { $in: ["DRAFT", "ACTIVE"] },
                readOnly: false,
                $or: [
                    { replyLeaseExpiresAt: { $exists: false } },
                    { replyLeaseExpiresAt: null },
                    { replyLeaseExpiresAt: { $lte: now } },
                ],
            },
            {
                $set: {
                    replyLeaseExpiresAt: new Date(
                        now.getTime() + StudentAiAssistantService.REPLY_LEASE_MS,
                    ),
                },
            },
            { new: true },
        );
        if (!lease) {
            throw new ConflictException({
                code: "ASSISTANT_REPLY_IN_PROGRESS",
                message: "Já está a ser preparada uma resposta nesta conversa.",
            });
        }

        try {
            const turns = await this.loadConversationMemory(conversation, actor.id);
            const executionContext = {
                conversationId: String(conversation._id),
                turns,
            } as const;
            const result = await this.dispatchAsk(
                actor,
                conversation.contextKind,
                String(conversation.contextId),
                context.classId,
                input.question.trim(),
                executionContext,
            );
            const messageAt = result.createdAt ?? new Date();
            const promoted = await this.conversationModel.findOneAndUpdate(
                { _id: conversation._id, studentId: new Types.ObjectId(actor.id) },
                {
                    $set: {
                        status: "ACTIVE",
                        lastMessageAt: messageAt,
                        ...(conversation.status === "DRAFT"
                            ? { title: this.deriveTitle(input.question) }
                            : {}),
                    },
                    $unset: { draftExpiresAt: 1, replyLeaseExpiresAt: 1 },
                },
                { new: true, runValidators: true },
            );
            if (!promoted) throw this.notFound();
            await this.audit("STUDENT_AI_MESSAGE_SENT", actor.id, conversation, "SUCCESS");
            const row = await this.findTurnById(
                conversation,
                actor.id,
                result.id,
            );
            return this.toTurnView(conversation, row, true);
        } catch (error) {
            await this.audit("STUDENT_AI_MESSAGE_SENT", actor.id, conversation, "FAILED");
            throw error;
        } finally {
            await this.conversationModel.updateOne(
                { _id: conversation._id, studentId: new Types.ObjectId(actor.id) },
                { $unset: { replyLeaseExpiresAt: 1 } },
            );
        }
    }

    async delete(actor: AuthenticatedUser, conversationId: string) {
        const conversation = await this.findOwned(actor, conversationId);
        if (
            this.artifactsService &&
            (await this.artifactsService.hasActiveGeneration(actor.id, conversation._id))
        ) {
            throw this.artifactGenerationInProgress();
        }
        const preservedArtifactCount = this.artifactsService
            ? await this.artifactsService.detachConversation(actor.id, conversation._id)
            : 0;
        let retainedTurnCount = 0;
        const retentionReasons: Array<"SHARED" | "FORK_REFERENCE" | "SUPERVISED"> = [];

        if (conversation.contextKind === "SUBJECT") {
            await this.classInteractionModel.deleteMany(this.turnFilter(conversation, actor.id));
        } else if (conversation.contextKind === "STUDY_AREA") {
            await this.privateAnswerModel.deleteMany(this.turnFilter(conversation, actor.id));
        } else if (conversation.contextKind === "STUDY_GROUP") {
            await this.groupAnswerModel.deleteMany(this.turnFilter(conversation, actor.id));
        } else if (conversation.contextKind === "GUIDED_ROOM") {
            retainedTurnCount = await this.guidedInteractionModel.countDocuments(
                this.turnFilter(conversation, actor.id),
            );
            if (retainedTurnCount > 0) retentionReasons.push("SUPERVISED");
        } else {
            const rows = await this.roomInteractionModel
                .find(this.turnFilter(conversation, actor.id))
                .lean();
            const ids = rows.map((row) => row._id);
            const referenced = ids.length
                ? await this.roomInteractionModel.distinct("forkedFromInteractionId", {
                    forkedFromInteractionId: { $in: ids },
                })
                : [];
            const referencedIds = new Set(referenced.map(String));
            const retainedIds = rows
                .filter((row) => row.visibility === "SHARED" || referencedIds.has(String(row._id)))
                .map((row) => row._id);
            if (rows.some((row) => row.visibility === "SHARED")) retentionReasons.push("SHARED");
            if (referencedIds.size > 0) retentionReasons.push("FORK_REFERENCE");
            retainedTurnCount = retainedIds.length;
            await this.roomInteractionModel.deleteMany({
                ...this.turnFilter(conversation, actor.id),
                ...(retainedIds.length ? { _id: { $nin: retainedIds } } : {}),
            });
        }

        if (retainedTurnCount > 0) {
            await this.conversationModel.updateOne(
                { _id: conversation._id, studentId: new Types.ObjectId(actor.id) },
                {
                    $set: {
                        status: "DELETED_RETAINED",
                        title: "Conversa removida",
                        deletedAt: new Date(),
                        readOnly: true,
                    },
                    $unset: {
                        replyLeaseExpiresAt: 1,
                        artifactGenerationLeaseExpiresAt: 1,
                        draftExpiresAt: 1,
                        contextSecondaryLabelSnapshot: 1,
                    },
                },
            );
        } else {
            await this.conversationModel.deleteOne({
                _id: conversation._id,
                studentId: new Types.ObjectId(actor.id),
            });
        }
        await this.audit("STUDENT_AI_CONVERSATION_DELETED", actor.id, conversation, "SUCCESS", {
            retainedTurnCount,
            retentionReasons,
            preservedArtifactCount,
        });
        return {
            deleted: true,
            retainedTurnCount,
            retentionReasons,
            preservedArtifactCount,
        };
    }

    private async dispatchAsk(
        actor: AuthenticatedUser,
        kind: StudentAssistantContextKind,
        contextId: string,
        classId: string | undefined,
        question: string,
        assistantContext: { conversationId: string; turns: readonly GovernedAiConversationTurn[] },
    ): Promise<{ id: string; createdAt?: Date }> {
        let result: { _id: string; createdAt?: Date };
        if (kind === "SUBJECT") {
            result = await this.classAiService.askClassAi(
                actor,
                contextId,
                { question },
                assistantContext,
            );
        } else if (kind === "STUDY_AREA") {
            result = await this.privateAiService.ask(
                actor,
                contextId,
                { question },
                assistantContext,
            );
        } else if (kind === "STUDY_GROUP") {
            result = await this.groupAiService.ask(
                actor,
                contextId,
                { question },
                assistantContext,
            );
        } else if (kind === "STUDY_ROOM") {
            result = await this.roomAiService.askRoomAi(
                actor,
                contextId,
                { question },
                assistantContext,
            );
        } else {
            if (!classId) throw new ForbiddenException({
                code: "ASSISTANT_CONTEXT_FORBIDDEN",
                message: "Não tens acesso a esta sala guiada.",
            });
            result = await this.guidedAiService.ask(
                actor,
                classId,
                contextId,
                { question },
                assistantContext,
            );
        }
        return { id: result._id, createdAt: result.createdAt };
    }

    private async loadConversationMemory(
        conversation: ConversationRecord,
        studentId: string,
    ): Promise<GovernedAiConversationTurn[]> {
        const rows = await this.findTurns(conversation, studentId, undefined, 6);
        return rows.reverse().map((row) => ({
            question: row.question,
            answer: row.answer,
        }));
    }

    private async findTurns(
        conversation: ConversationRecord,
        studentId: string,
        before: string | undefined,
        limit: number,
    ): Promise<TurnRecord[]> {
        const filter = {
            ...this.turnFilter(conversation, studentId),
            ...(before ? { _id: { $lt: new Types.ObjectId(before) } } : {}),
        };
        if (conversation.contextKind === "SUBJECT") {
            return this.classInteractionModel.find(filter).sort({ _id: -1 }).limit(limit).lean() as unknown as TurnRecord[];
        }
        if (conversation.contextKind === "STUDY_AREA") {
            return this.privateAnswerModel.find(filter).sort({ _id: -1 }).limit(limit).lean() as unknown as TurnRecord[];
        }
        if (conversation.contextKind === "STUDY_GROUP") {
            return this.groupAnswerModel.find(filter).sort({ _id: -1 }).limit(limit).lean() as unknown as TurnRecord[];
        }
        if (conversation.contextKind === "STUDY_ROOM") {
            return this.roomInteractionModel.find(filter).sort({ _id: -1 }).limit(limit).lean() as unknown as TurnRecord[];
        }
        return this.guidedInteractionModel.find(filter).sort({ _id: -1 }).limit(limit).lean() as unknown as TurnRecord[];
    }

    private async findTurnById(
        conversation: ConversationRecord,
        studentId: string,
        turnId: string,
    ): Promise<TurnRecord> {
        const rows = await this.findTurns(conversation, studentId, undefined, 1);
        const row = rows.find((candidate) => String(candidate._id) === turnId) ?? rows[0];
        if (!row) throw this.notFound();
        return row;
    }

    private turnFilter(conversation: ConversationRecord, studentId: string) {
        return {
            conversationId: conversation._id,
            studentId: new Types.ObjectId(studentId),
        };
    }

    private toTurnView(
        conversation: ConversationRecord,
        row: TurnRecord,
        hasCurrentAccess: boolean,
    ) {
        const snapshots = row.citationSnapshots?.length
            ? row.citationSnapshots
            : row.sources?.length
                ? row.sources.map((source) => ({
                    label: source.title,
                    kind: "GROUP_RESOURCE" as const,
                }))
                : [];
        const sourceIds = row.sourceMaterialIds ?? row.sourceShareIds ?? [];
        return {
            id: String(row._id),
            question: row.question,
            answer: row.answer,
            citations: snapshots.map((snapshot, index) => ({
                label: snapshot.label,
                kind: snapshot.kind,
                ...(hasCurrentAccess
                    ? this.citationTarget(conversation, sourceIds[index])
                    : {}),
            })),
            createdAt: row.createdAt?.toISOString() ?? new Date(0).toISOString(),
            ...(row.visibility ? { visibility: row.visibility } : {}),
            inherited: Boolean(row.inheritedFromFork),
            ...(
                conversation.contextKind === "SUBJECT"
                || conversation.contextKind === "GUIDED_ROOM"
            ? { teacherVoiceApplied: Boolean(row.voiceSource && row.voiceSource !== "DEFAULT") }
            : {}),
        };
    }

    private citationTarget(conversation: ConversationRecord, sourceId: unknown) {
        if (conversation.contextKind === "SUBJECT" && sourceId) {
            return {
                targetPath: `/app/disciplinas/${conversation.contextId}/materiais/${String(sourceId)}`,
            };
        }
        if (conversation.contextKind === "STUDY_AREA") {
            return { targetPath: `/app/areas/${conversation.contextId}/materiais` };
        }
        return {};
    }

    private async findOwned(
        actor: AuthenticatedUser,
        conversationId: string,
    ): Promise<ConversationRecord> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(conversationId)) {
            await this.auditAccessDenied(
                actor.id,
                "STUDENT_AI_CONVERSATION_ACCESS_DENIED",
            );
            throw this.notFound();
        }
        const row = await this.conversationModel
            .findOne({
                _id: conversationId,
                studentId: new Types.ObjectId(actor.id),
                status: { $ne: "DELETED_RETAINED" },
            })
            .lean();
        if (!row) {
            await this.auditAccessDenied(
                actor.id,
                "STUDENT_AI_CONVERSATION_ACCESS_DENIED",
                conversationId,
            );
            throw this.notFound();
        }
        return row as ConversationRecord;
    }

    private async toConversationView(
        actor: AuthenticatedUser,
        row: ConversationRecord,
        resolvedContext?: ResolvedStudentAssistantContext | null,
    ) {
        const currentContext = resolvedContext === undefined
            ? await this.resolveCurrentContext(actor, row)
            : resolvedContext;
        const access = currentContext !== null;
        return {
            id: String(row._id),
            title: row.title,
            status: row.status,
            origin: row.origin,
            ...(row.origin === "FORK" && row.inheritedTurnCount && row.forkedAt
                ? {
                    fork: {
                        inheritedTurnCount: row.inheritedTurnCount,
                        forkedAt: row.forkedAt.toISOString(),
                    },
                }
                : {}),
            context: {
                kind: row.contextKind,
                id: String(row.contextId),
                label: row.contextLabelSnapshot,
                secondaryLabel: row.contextSecondaryLabelSnapshot,
                access: access ? "ACTIVE" : "REVOKED",
                ...(currentContext ? { targetPath: currentContext.targetPath } : {}),
            },
            readOnly: row.readOnly || !access,
            readOnlyReason: row.readOnlyReason ?? (!access ? "ACCESS_REVOKED" : undefined),
            capabilities: {
                canCreateArtifact:
                    access &&
                    !row.readOnly &&
                    row.status === "ACTIVE" &&
                    Boolean(row.lastMessageAt) &&
                    !(
                        row.artifactGenerationLeaseExpiresAt &&
                        row.artifactGenerationLeaseExpiresAt > new Date()
                    ),
                canInviteFork:
                    access &&
                    !row.readOnly &&
                    row.status === "ACTIVE" &&
                    Boolean(row.lastMessageAt) &&
                    (row.contextKind === "STUDY_GROUP" || row.contextKind === "STUDY_ROOM"),
            },
            lastMessageAt: row.lastMessageAt?.toISOString(),
            createdAt: row.createdAt?.toISOString(),
        };
    }

    /** Revalida o contexto sem transformar uma revogação numa fuga de dados. */
    private async resolveCurrentContext(
        actor: AuthenticatedUser,
        row: ConversationRecord,
    ): Promise<ResolvedStudentAssistantContext | null> {
        try {
            return await this.contextResolver.resolve(
                actor,
                row.contextKind,
                String(row.contextId),
            );
        } catch {
            return null;
        }
    }

    private deriveTitle(question: string): string {
        const normalized = question.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
        return normalized.length <= 80 ? normalized : `${normalized.slice(0, 77).trimEnd()}…`;
    }

    private normalizeTitle(title: string): string {
        const normalized = title.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
        if (!normalized) {
            throw new BadRequestException({
                code: "ASSISTANT_CONVERSATION_TITLE_INVALID",
                message: "Indica um título válido.",
            });
        }
        return normalized;
    }

    private encodeConversationCursor(lastMessageAt: Date, id: string): string {
        return Buffer.from(JSON.stringify({ lastMessageAt: lastMessageAt.toISOString(), id }), "utf8").toString("base64url");
    }

    private decodeConversationCursor(cursor?: string): { lastMessageAt: Date; id: string } | null {
        if (!cursor) return null;
        try {
            const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { lastMessageAt?: string; id?: string };
            const date = new Date(value.lastMessageAt ?? "");
            if (!value.id || !Types.ObjectId.isValid(value.id) || Number.isNaN(date.getTime())) throw new Error("invalid");
            return { lastMessageAt: date, id: value.id };
        } catch {
            throw new BadRequestException({
                code: "ASSISTANT_CONVERSATION_CURSOR_INVALID",
                message: "Cursor de conversas inválido.",
            });
        }
    }

    private async audit(
        action: string,
        actorId: string,
        conversation: Pick<StudentAiConversation, "contextKind"> & { _id: unknown },
        result: "SUCCESS" | "DENIED" | "FAILED",
        metadata: Record<string, unknown> = {},
    ): Promise<void> {
        await this.auditLogService.record({
            actorId,
            domain: "AI",
            action,
            resourceType: "StudentAiConversation",
            resourceId: String(conversation._id),
            result,
            metadata: { contextKind: conversation.contextKind, ...metadata },
        });
    }

    /** Audita negações sem perguntas, respostas, labels livres ou IDs inválidos. */
    private async auditAccessDenied(
        actorId: string,
        action: string,
        resourceId?: string,
        contextKind?: StudentAssistantContextKind,
    ): Promise<void> {
        await this.auditLogService.record({
            actorId,
            domain: "AI",
            action,
            resourceType: "StudentAiConversation",
            ...(resourceId && Types.ObjectId.isValid(resourceId) ? { resourceId } : {}),
            result: "DENIED",
            metadata: contextKind ? { contextKind } : {},
        });
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "ASSISTANT_CONVERSATION_NOT_FOUND",
            message: "Conversa não encontrada.",
        });
    }

    private readOnly(message?: string): ConflictException {
        return new ConflictException({
            code: "ASSISTANT_CONVERSATION_READ_ONLY",
            message: message ?? "Esta conversa está disponível apenas para consulta.",
        });
    }

    private archived(): ConflictException {
        return new ConflictException({
            code: "ASSISTANT_CONVERSATION_ARCHIVED",
            message: "Restaura a conversa antes de fazer uma nova pergunta.",
        });
    }

    private artifactGenerationInProgress(): ConflictException {
        return new ConflictException({
            code: "ASSISTANT_ARTIFACT_GENERATION_IN_PROGRESS",
            message: "Aguarda pela conclusão do material antes de organizar a conversa.",
        });
    }
}
