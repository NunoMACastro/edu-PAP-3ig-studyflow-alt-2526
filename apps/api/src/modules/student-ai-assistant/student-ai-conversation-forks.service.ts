/**
 * Implementa convites e snapshots independentes de conversas IA colaborativas.
 * Este serviço nunca chama o provider nem altera consentimento, quota ou prompts.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import {
    Types,
    type ClientSession,
    type Connection,
    type Model,
} from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { User, type UserDocument } from "../auth/schemas/user.schema.js";
import {
    StudyGroupAiAnswer,
    type StudyGroupAiAnswerDocument,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    RoomAiInteraction,
    type RoomAiInteractionDocument,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import type {
    CreateStudentAiForkInvitationDto,
    ListStudentAiForkInvitationsDto,
    ListStudentAiForkRecipientsDto,
} from "./dto/student-ai-assistant.dto.js";
import {
    StudentAiConversationForkInvitation,
    type StudentAiConversationForkInvitationDocument,
    type StudentAiForkContextKind,
} from "./schemas/student-ai-conversation-fork-invitation.schema.js";
import {
    StudentAiConversation,
    type StudentAiConversationDocument,
} from "./schemas/student-ai-conversation.schema.js";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TERMINAL_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FORK_TURNS = 200;
const MAX_FORK_CHARACTERS = 500_000;
const MAX_PENDING_PER_CONVERSATION = 10;
const MAX_PENDING_PER_SENDER = 20;

type ForkableConversation = StudentAiConversation & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

type ForkTurn = {
    _id: Types.ObjectId;
    question: string;
    answer: string;
    createdAt?: Date;
    updatedAt?: Date;
    sources?: Array<{ shareId: string; title: string }>;
    sourceShareIds?: Types.ObjectId[];
    citationSnapshots?: Array<{ label: string; kind: string }>;
};

type ForkInvitationRecord = StudentAiConversationForkInvitation & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

/** Serviço de domínio exclusivo de forks completos do Assistente. */
@Injectable()
export class StudentAiConversationForksService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(StudentAiConversation.name)
        private readonly conversationModel: Model<StudentAiConversationDocument>,
        @InjectModel(StudentAiConversationForkInvitation.name)
        private readonly invitationModel: Model<StudentAiConversationForkInvitationDocument>,
        @InjectModel(StudyGroupAiAnswer.name)
        private readonly groupAnswerModel: Model<StudyGroupAiAnswerDocument>,
        @InjectModel(RoomAiInteraction.name)
        private readonly roomInteractionModel: Model<RoomAiInteractionDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly groupsService: StudyGroupsService,
        private readonly roomsService: StudyRoomsService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /** Lista membros ativos do mesmo contexto, sem permitir enumeração global. */
    async listRecipients(
        actor: AuthenticatedUser,
        conversationId: string,
        input: ListStudentAiForkRecipientsDto,
    ) {
        const conversation = await this.findForkableOwnedConversation(actor, conversationId);
        const context = await this.ensureMember(
            conversation.contextKind as StudentAiForkContextKind,
            actor.id,
            String(conversation.contextId),
        );
        const query = input.query?.trim().toLocaleLowerCase("pt-PT") ?? "";
        const users = await this.userModel
            .find({
                _id: {
                    $in: context.memberIds
                        .filter((id) => id !== actor.id)
                        .map((id) => new Types.ObjectId(id)),
                },
                role: "STUDENT",
                accountStatus: "ACTIVE",
                ...(query ? { email: { $regex: this.escapeRegex(query), $options: "i" } } : {}),
            })
            .select({ email: 1 })
            .sort({ email: 1, _id: 1 })
            .lean();
        const offset = this.decodeOffset(input.cursor);
        const limit = input.limit ?? 20;
        const items = users.slice(offset, offset + limit).map((user) => ({
            id: String(user._id),
            email: user.email,
        }));
        return {
            items,
            nextCursor:
                offset + items.length < users.length
                    ? this.encodeOffset(offset + items.length)
                    : null,
        };
    }

    /** Congela o cutoff atual e cria um convite sem duplicar conteúdo. */
    async createInvitation(
        actor: AuthenticatedUser,
        conversationId: string,
        input: CreateStudentAiForkInvitationDto,
    ) {
        try {
            return await this.createInvitationInternal(actor, conversationId, input);
        } catch (error) {
            await this.auditFailure(
                actor,
                "STUDENT_AI_FORK_INVITE_FAILED",
                "StudentAiConversation",
                conversationId,
                error,
            );
            throw error;
        }
    }

    private async createInvitationInternal(
        actor: AuthenticatedUser,
        conversationId: string,
        input: CreateStudentAiForkInvitationDto,
    ) {
        const conversation = await this.findForkableOwnedConversation(actor, conversationId);
        await this.expireInvitationsVisibleTo(actor, "sent");
        if (input.recipientId === actor.id) throw this.invalidRecipient();
        const kind = conversation.contextKind as StudentAiForkContextKind;
        const contextId = String(conversation.contextId);
        const context = await this.ensureMember(kind, actor.id, contextId);
        if (!context.memberIds.includes(input.recipientId)) throw this.invalidRecipient();
        const recipient = await this.userModel
            .findOne({
                _id: input.recipientId,
                role: "STUDENT",
                accountStatus: "ACTIVE",
            })
            .select({ email: 1 })
            .lean();
        if (!recipient) throw this.invalidRecipient();

        const snapshot = await this.loadSnapshot(conversation, actor.id);
        const [conversationPending, senderPending] = await Promise.all([
            this.invitationModel.countDocuments({
                sourceConversationId: conversation._id,
                status: "PENDING",
                expiresAt: { $gt: new Date() },
            }),
            this.invitationModel.countDocuments({
                sourceStudentId: new Types.ObjectId(actor.id),
                status: "PENDING",
                expiresAt: { $gt: new Date() },
            }),
        ]);
        if (
            conversationPending >= MAX_PENDING_PER_CONVERSATION ||
            senderPending >= MAX_PENDING_PER_SENDER
        ) {
            throw new ConflictException({
                code: "ASSISTANT_FORK_INVITATION_LIMIT",
                message: "Atingiste o limite de convites pendentes.",
            });
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);
        try {
            const created = await this.connection.transaction(async (session) => {
                const rows = await this.invitationModel.create(
                    [
                        {
                            sourceConversationId: conversation._id,
                            sourceStudentId: new Types.ObjectId(actor.id),
                            recipientStudentId: new Types.ObjectId(input.recipientId),
                            contextKind: kind,
                            contextId: conversation.contextId,
                            snapshotLastTurnId: snapshot.lastTurnId,
                            snapshotTurnCount: snapshot.turnCount,
                            snapshotCharacterCount: snapshot.characterCount,
                            status: "PENDING",
                            expiresAt,
                            purgeAt: new Date(expiresAt.getTime() + TERMINAL_RETENTION_MS),
                        },
                    ],
                    { session },
                );
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: "STUDENT_AI_FORK_INVITED",
                        resourceType: "StudentAiConversationForkInvitation",
                        resourceId: String(rows[0]._id),
                        result: "SUCCESS",
                        metadata: { contextKind: kind, turnCount: snapshot.turnCount },
                    },
                    session,
                );
                return rows[0].toObject() as ForkInvitationRecord;
            });
            return this.toInvitationView(created, conversation, {
                sourceEmail: actor.email,
                recipientEmail: recipient.email,
            });
        } catch (error) {
            if ((error as { code?: number }).code === 11_000) {
                throw new ConflictException({
                    code: "ASSISTANT_FORK_INVITATION_EXISTS",
                    message: "Já existe um convite pendente para este aluno.",
                });
            }
            throw this.normalizeTransactionError(error);
        }
    }

    /** Lista convites pendentes recebidos ou enviados, sem conteúdo do chat. */
    async listInvitations(
        actor: AuthenticatedUser,
        input: ListStudentAiForkInvitationsDto,
    ) {
        this.assertStudent(actor);
        await this.expireInvitationsVisibleTo(actor, input.direction);
        const limit = input.limit ?? 20;
        const cursor = this.decodeIdCursor(input.cursor);
        const ownerField = input.direction === "received"
            ? "recipientStudentId"
            : "sourceStudentId";
        const filter: Record<string, unknown> = {
            [ownerField]: new Types.ObjectId(actor.id),
            status: "PENDING",
            expiresAt: { $gt: new Date() },
            ...(input.conversationId
                ? { sourceConversationId: new Types.ObjectId(input.conversationId) }
                : {}),
            ...(cursor ? { _id: { $lt: cursor } } : {}),
        };
        const rows = await this.invitationModel
            .find(filter)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = (hasMore ? rows.slice(0, limit) : rows) as ForkInvitationRecord[];
        const conversationIds = pageRows.map((row) => row.sourceConversationId);
        const userIds = pageRows.flatMap((row) => [row.sourceStudentId, row.recipientStudentId]);
        const [conversations, users] = await Promise.all([
            this.conversationModel.find({ _id: { $in: conversationIds } }).lean(),
            this.userModel.find({ _id: { $in: userIds } }).select({ email: 1 }).lean(),
        ]);
        const conversationById = new Map(
            conversations.map((row) => [String(row._id), row as ForkableConversation]),
        );
        const emailById = new Map(users.map((row) => [String(row._id), row.email]));
        const items = pageRows.flatMap((row) => {
            const source = conversationById.get(String(row.sourceConversationId));
            if (!source) return [];
            return [
                this.toInvitationView(row, source, {
                    sourceEmail: emailById.get(String(row.sourceStudentId)) ?? "Conta removida",
                    recipientEmail:
                        emailById.get(String(row.recipientStudentId)) ?? "Conta removida",
                }),
            ];
        });
        return {
            items,
            nextCursor: hasMore ? this.encodeIdCursor(pageRows.at(-1)!._id) : null,
        };
    }

    /** Aceita uma vez e devolve sempre a mesma conversa em retries autorizados. */
    async accept(actor: AuthenticatedUser, invitationId: string): Promise<string> {
        try {
            return await this.acceptInternal(actor, invitationId);
        } catch (error) {
            await this.auditFailure(
                actor,
                "STUDENT_AI_FORK_ACCEPT_FAILED",
                "StudentAiConversationForkInvitation",
                invitationId,
                error,
            );
            throw error;
        }
    }

    private async acceptInternal(
        actor: AuthenticatedUser,
        invitationId: string,
    ): Promise<string> {
        this.assertStudent(actor);
        const id = this.toObjectId(invitationId);
        const existing = await this.invitationModel
            .findOne({ _id: id, recipientStudentId: new Types.ObjectId(actor.id) })
            .lean() as ForkInvitationRecord | null;
        if (!existing) throw this.invitationNotFound();
        if (existing.status === "ACCEPTED" && existing.acceptedConversationId) {
            return String(existing.acceptedConversationId);
        }
        if (existing.status !== "PENDING") throw this.invitationNotFound();
        if (existing.expiresAt.getTime() <= Date.now()) {
            await this.connection.transaction(async (session) => {
                const expired = await this.markExpired(existing._id, session);
                if (!expired) return;
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: "STUDENT_AI_FORK_EXPIRED",
                        resourceType: "StudentAiConversationForkInvitation",
                        resourceId: String(existing._id),
                        result: "SUCCESS",
                        metadata: { contextKind: existing.contextKind },
                    },
                    session,
                );
            });
            throw new ConflictException({
                code: "ASSISTANT_FORK_INVITATION_EXPIRED",
                message: "Este convite expirou.",
            });
        }
        try {
            return await this.connection.transaction(async (session) => {
                const invitation = await this.invitationModel
                    .findOne({ _id: id, recipientStudentId: new Types.ObjectId(actor.id) })
                    .session(session)
                    .lean() as ForkInvitationRecord | null;
                if (!invitation) throw this.invitationNotFound();
                if (invitation.status === "ACCEPTED" && invitation.acceptedConversationId) {
                    return String(invitation.acceptedConversationId);
                }
                if (invitation.status !== "PENDING") throw this.invitationNotFound();
                if (invitation.expiresAt.getTime() <= Date.now()) {
                    throw new ConflictException({
                        code: "ASSISTANT_FORK_INVITATION_EXPIRED",
                        message: "Este convite expirou.",
                    });
                }

                const now = new Date();
                const destinationId = new Types.ObjectId();
                const claimed = await this.invitationModel.findOneAndUpdate(
                    { _id: invitation._id, status: "PENDING" },
                    {
                        $set: {
                            status: "ACCEPTED",
                            acceptedConversationId: destinationId,
                            actedAt: now,
                            purgeAt: new Date(now.getTime() + TERMINAL_RETENTION_MS),
                        },
                    },
                    { new: true, session, runValidators: true },
                );
                if (!claimed) {
                    const current = await this.invitationModel
                        .findById(invitation._id)
                        .session(session)
                        .lean();
                    if (current?.status === "ACCEPTED" && current.acceptedConversationId) {
                        return String(current.acceptedConversationId);
                    }
                    throw new ConflictException({
                        code: "ASSISTANT_FORK_ACCEPT_CONFLICT",
                        message: "O convite já foi processado.",
                    });
                }

                const source = await this.conversationModel
                    .findOne({
                        _id: invitation.sourceConversationId,
                        studentId: invitation.sourceStudentId,
                        status: { $ne: "DELETED_RETAINED" },
                    })
                    .session(session)
                    .lean() as ForkableConversation | null;
                if (!source) throw this.invitationNotFound();
                await this.ensureMember(
                    invitation.contextKind,
                    String(invitation.sourceStudentId),
                    String(invitation.contextId),
                );
                await this.ensureMember(
                    invitation.contextKind,
                    actor.id,
                    String(invitation.contextId),
                );
                const recipient = await this.userModel
                    .findOne({ _id: actor.id, role: "STUDENT", accountStatus: "ACTIVE" })
                    .session(session)
                    .lean();
                if (!recipient) throw this.invitationNotFound();

                const turns = await this.loadSnapshotRows(
                    source,
                    String(invitation.sourceStudentId),
                    invitation.snapshotLastTurnId,
                    session,
                );
                const characterCount = this.characterCount(turns);
                if (
                    turns.length !== invitation.snapshotTurnCount ||
                    characterCount !== invitation.snapshotCharacterCount
                ) {
                    throw new ConflictException({
                        code: "ASSISTANT_FORK_SNAPSHOT_CHANGED",
                        message: "O snapshot deixou de estar disponível.",
                    });
                }

                const rootId = source.forkRootConversationId ?? source._id;
                await this.conversationModel.create(
                    [
                        {
                            _id: destinationId,
                            studentId: new Types.ObjectId(actor.id),
                            contextKind: source.contextKind,
                            contextId: source.contextId,
                            contextLabelSnapshot: source.contextLabelSnapshot,
                            contextSecondaryLabelSnapshot: source.contextSecondaryLabelSnapshot,
                            title: this.forkTitle(source.title),
                            status: "ACTIVE",
                            origin: "FORK",
                            readOnly: false,
                            lastMessageAt: now,
                            forkedFromConversationId: source._id,
                            forkRootConversationId: rootId,
                            forkDepth: (source.forkDepth ?? 0) + 1,
                            inheritedTurnCount: turns.length,
                            forkedAt: now,
                        },
                    ],
                    { session },
                );
                await this.insertInheritedTurns(
                    invitation.contextKind,
                    invitation.contextId,
                    new Types.ObjectId(actor.id),
                    destinationId,
                    turns,
                    session,
                );
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: "STUDENT_AI_FORK_ACCEPTED",
                        resourceType: "StudentAiConversation",
                        resourceId: String(destinationId),
                        result: "SUCCESS",
                        metadata: {
                            contextKind: invitation.contextKind,
                            turnCount: turns.length,
                            forkDepth: (source.forkDepth ?? 0) + 1,
                        },
                    },
                    session,
                );
                return String(destinationId);
            });
        } catch (error) {
            throw this.normalizeTransactionError(error);
        }
    }

    /** Recusa um convite recebido ainda pendente. */
    async decline(actor: AuthenticatedUser, invitationId: string) {
        return this.finishInvitation(actor, invitationId, "DECLINED", "recipientStudentId");
    }

    /** Cancela um convite enviado ainda pendente. */
    async cancel(actor: AuthenticatedUser, invitationId: string) {
        return this.finishInvitation(actor, invitationId, "CANCELLED", "sourceStudentId");
    }

    private async finishInvitation(
        actor: AuthenticatedUser,
        invitationId: string,
        status: "DECLINED" | "CANCELLED",
        ownerField: "recipientStudentId" | "sourceStudentId",
    ) {
        this.assertStudent(actor);
        const id = this.toObjectId(invitationId);
        const now = new Date();
        try {
            return await this.connection.transaction(async (session) => {
                const row = await this.invitationModel.findOneAndUpdate(
                    {
                        _id: id,
                        [ownerField]: new Types.ObjectId(actor.id),
                        status: "PENDING",
                    },
                    {
                        $set: {
                            status,
                            actedAt: now,
                            purgeAt: new Date(now.getTime() + TERMINAL_RETENTION_MS),
                        },
                    },
                    { new: true, session, runValidators: true },
                );
                if (!row) {
                    const current = await this.invitationModel
                        .findOne({
                            _id: id,
                            [ownerField]: new Types.ObjectId(actor.id),
                        })
                        .session(session)
                        .lean();
                    if (current?.status === status) {
                        return { id: String(current._id), status };
                    }
                    throw this.invitationNotFound();
                }
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: `STUDENT_AI_FORK_${status}`,
                        resourceType: "StudentAiConversationForkInvitation",
                        resourceId: String(row._id),
                        result: "SUCCESS",
                        metadata: { contextKind: row.contextKind },
                    },
                    session,
                );
                return { id: String(row._id), status };
            });
        } catch (error) {
            const normalized = this.normalizeTransactionError(error);
            await this.auditFailure(
                actor,
                `STUDENT_AI_FORK_${status}_FAILED`,
                "StudentAiConversationForkInvitation",
                invitationId,
                normalized,
            );
            throw normalized;
        }
    }

    private async findForkableOwnedConversation(
        actor: AuthenticatedUser,
        conversationId: string,
    ): Promise<ForkableConversation> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(conversationId)) throw this.conversationNotFound();
        const conversation = await this.conversationModel
            .findOne({
                _id: conversationId,
                studentId: new Types.ObjectId(actor.id),
                status: "ACTIVE",
                readOnly: false,
                contextKind: { $in: ["STUDY_GROUP", "STUDY_ROOM"] },
                lastMessageAt: { $exists: true },
            })
            .lean();
        if (!conversation) throw this.conversationNotFound();
        await this.ensureMember(
            conversation.contextKind as StudentAiForkContextKind,
            actor.id,
            String(conversation.contextId),
        );
        return conversation as ForkableConversation;
    }

    private async ensureMember(
        kind: StudentAiForkContextKind,
        studentId: string,
        contextId: string,
    ): Promise<{ memberIds: string[] }> {
        if (kind === "STUDY_GROUP") {
            return this.groupsService.ensureMember(studentId, contextId);
        }
        return this.roomsService.ensureMember(studentId, contextId, "STUDY_ROOM");
    }

    private async loadSnapshot(conversation: ForkableConversation, studentId: string) {
        const turns = await this.loadSnapshotRows(conversation, studentId);
        if (turns.length === 0) {
            throw new UnprocessableEntityException({
                code: "ASSISTANT_FORK_EMPTY_CONVERSATION",
                message: "A conversa ainda não tem respostas para partilhar.",
            });
        }
        if (turns.length > MAX_FORK_TURNS) throw this.snapshotTooLarge();
        const characterCount = this.characterCount(turns);
        if (characterCount > MAX_FORK_CHARACTERS) throw this.snapshotTooLarge();
        return {
            lastTurnId: turns.at(-1)!._id,
            turnCount: turns.length,
            characterCount,
        };
    }

    private async loadSnapshotRows(
        conversation: ForkableConversation,
        studentId: string,
        cutoff?: Types.ObjectId,
        session?: ClientSession,
    ): Promise<ForkTurn[]> {
        const filter = {
            conversationId: conversation._id,
            studentId: new Types.ObjectId(studentId),
            ...(cutoff ? { _id: { $lte: cutoff } } : {}),
        };
        if (conversation.contextKind === "STUDY_GROUP") {
            const query = this.groupAnswerModel
                .find(filter)
                .sort({ _id: 1 })
                .limit(MAX_FORK_TURNS + 1);
            if (session) query.session(session);
            return query.lean() as unknown as Promise<ForkTurn[]>;
        }
        const query = this.roomInteractionModel
            .find(filter)
            .sort({ _id: 1 })
            .limit(MAX_FORK_TURNS + 1);
        if (session) query.session(session);
        return query.lean() as unknown as Promise<ForkTurn[]>;
    }

    private async insertInheritedTurns(
        kind: StudentAiForkContextKind,
        contextId: Types.ObjectId,
        studentId: Types.ObjectId,
        conversationId: Types.ObjectId,
        turns: ForkTurn[],
        session: ClientSession,
    ): Promise<void> {
        if (kind === "STUDY_GROUP") {
            await this.groupAnswerModel.insertMany(
                turns.map((turn) => ({
                    groupId: contextId,
                    studentId,
                    question: turn.question,
                    answer: turn.answer,
                    sources: turn.sources ?? [],
                    conversationId,
                    citationSnapshots: turn.citationSnapshots ?? [],
                    inheritedFromFork: true,
                    createdAt: turn.createdAt,
                    updatedAt: turn.updatedAt,
                })),
                { session },
            );
            return;
        }
        await this.roomInteractionModel.insertMany(
            turns.map((turn) => ({
                roomId: contextId,
                studentId,
                question: turn.question,
                answer: turn.answer,
                sourceShareIds: turn.sourceShareIds ?? [],
                visibility: "PRIVATE",
                conversationId,
                citationSnapshots: turn.citationSnapshots ?? [],
                inheritedFromFork: true,
                createdAt: turn.createdAt,
                updatedAt: turn.updatedAt,
            })),
            { session },
        );
    }

    private toInvitationView(
        invitation: ForkInvitationRecord,
        conversation: ForkableConversation,
        emails: { sourceEmail: string; recipientEmail: string },
    ) {
        return {
            id: String(invitation._id),
            status: invitation.status,
            conversationTitle: conversation.title,
            context: {
                kind: invitation.contextKind,
                id: String(invitation.contextId),
                label: conversation.contextLabelSnapshot,
            },
            sender: { id: String(invitation.sourceStudentId), email: emails.sourceEmail },
            recipient: {
                id: String(invitation.recipientStudentId),
                email: emails.recipientEmail,
            },
            turnCount: invitation.snapshotTurnCount,
            expiresAt: invitation.expiresAt.toISOString(),
            createdAt: invitation.createdAt?.toISOString(),
        };
    }

    private async markExpired(
        id: Types.ObjectId,
        session: ClientSession,
    ): Promise<boolean> {
        const now = new Date();
        const result = await this.invitationModel.updateOne(
            { _id: id, status: "PENDING" },
            {
                $set: {
                    status: "EXPIRED",
                    actedAt: now,
                    purgeAt: new Date(now.getTime() + TERMINAL_RETENTION_MS),
                },
            },
            { session },
        );
        return result.modifiedCount === 1;
    }

    /** Materializa expirados quando um dos intervenientes consulta a caixa de convites. */
    private async expireInvitationsVisibleTo(
        actor: AuthenticatedUser,
        direction: "received" | "sent",
    ): Promise<void> {
        const ownerField = direction === "received"
            ? "recipientStudentId"
            : "sourceStudentId";
        const rows = await this.invitationModel
            .find({
                [ownerField]: new Types.ObjectId(actor.id),
                status: "PENDING",
                expiresAt: { $lte: new Date() },
            })
            .select({ contextKind: 1 })
            .lean() as ForkInvitationRecord[];
        if (!rows.length) return;
        await this.connection.transaction(async (session) => {
            for (const row of rows) {
                const expired = await this.markExpired(row._id, session);
                if (!expired) continue;
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: "STUDENT_AI_FORK_EXPIRED",
                        resourceType: "StudentAiConversationForkInvitation",
                        resourceId: String(row._id),
                        result: "SUCCESS",
                        metadata: { contextKind: row.contextKind },
                    },
                    session,
                );
            }
        });
    }

    /**
     * Regista negações e falhas sem conteúdo, títulos, emails ou IDs de terceiros.
     * A auditoria é best effort para nunca substituir o erro de domínio original.
     */
    private async auditFailure(
        actor: AuthenticatedUser,
        action: string,
        resourceType: string,
        resourceId: string,
        error: unknown,
    ): Promise<void> {
        if (!Types.ObjectId.isValid(actor.id)) return;
        const result = error instanceof HttpException && error.getStatus() < 500
            ? "DENIED"
            : "FAILED";
        const response = error instanceof HttpException ? error.getResponse() : undefined;
        const errorCode =
            typeof response === "object" && response !== null && "code" in response
                ? String((response as { code?: unknown }).code ?? "UNKNOWN")
                : "UNKNOWN";
        try {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action,
                resourceType,
                resourceId: Types.ObjectId.isValid(resourceId) ? resourceId : undefined,
                result,
                metadata: { errorCode },
            });
        } catch {
            // O erro funcional original mantém precedência sobre uma falha de observabilidade.
        }
    }

    private characterCount(turns: ForkTurn[]): number {
        return turns.reduce(
            (total, turn) => total + turn.question.length + turn.answer.length,
            0,
        );
    }

    private forkTitle(title: string): string {
        const value = `Fork — ${title}`.replace(/\s+/g, " ").trim();
        return value.length <= 80 ? value : `${value.slice(0, 79).trimEnd()}…`;
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    private encodeOffset(offset: number): string {
        return Buffer.from(String(offset), "utf8").toString("base64url");
    }

    private decodeOffset(cursor?: string): number {
        if (!cursor) return 0;
        const value = Number(Buffer.from(cursor, "base64url").toString("utf8"));
        if (!Number.isInteger(value) || value < 0) throw this.invalidCursor();
        return value;
    }

    private encodeIdCursor(id: Types.ObjectId): string {
        return Buffer.from(String(id), "utf8").toString("base64url");
    }

    private decodeIdCursor(cursor?: string): Types.ObjectId | null {
        if (!cursor) return null;
        const value = Buffer.from(cursor, "base64url").toString("utf8");
        if (!Types.ObjectId.isValid(value)) throw this.invalidCursor();
        return new Types.ObjectId(value);
    }

    private toObjectId(value: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) throw this.invitationNotFound();
        return new Types.ObjectId(value);
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private normalizeTransactionError(error: unknown): Error {
        if (error instanceof HttpException) return error;
        return new ServiceUnavailableException({
            code: "ASSISTANT_FORK_TRANSACTION_FAILED",
            message: "Não foi possível concluir o fork em segurança.",
        });
    }

    private conversationNotFound(): NotFoundException {
        return new NotFoundException({
            code: "ASSISTANT_CONVERSATION_NOT_FOUND",
            message: "Conversa não encontrada.",
        });
    }

    private invitationNotFound(): NotFoundException {
        return new NotFoundException({
            code: "ASSISTANT_FORK_INVITATION_NOT_FOUND",
            message: "Convite não encontrado.",
        });
    }

    private invalidRecipient(): BadRequestException {
        return new BadRequestException({
            code: "ASSISTANT_FORK_RECIPIENT_INVALID",
            message: "Não foi possível selecionar esse destinatário.",
        });
    }

    private snapshotTooLarge(): UnprocessableEntityException {
        return new UnprocessableEntityException({
            code: "ASSISTANT_FORK_LIMIT_EXCEEDED",
            message: "A conversa excede o limite seguro para criar um fork.",
        });
    }

    private invalidCursor(): BadRequestException {
        return new BadRequestException({
            code: "ASSISTANT_FORK_CURSOR_INVALID",
            message: "Cursor de forks inválido.",
        });
    }
}
