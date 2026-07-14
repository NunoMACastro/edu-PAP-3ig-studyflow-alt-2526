/**
 * Implementa mensagens, notas, idempotência e leitura do chat de grupos de
 * estudo, mantendo autorização e identidade derivadas da sessão.
 */
import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudentProfileService } from "../students/student-profile.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    CreateStudyGroupMessageDto,
    StudyGroupMessageKind,
} from "./dto/create-study-group-message.dto.js";
import {
    StudentStudyGroupChatReadState,
    StudentStudyGroupChatReadStateDocument,
} from "./schemas/student-study-group-chat-read-state.schema.js";
import {
    StudyGroupMessage,
    StudyGroupMessageDocument,
} from "./schemas/study-group-message.schema.js";

const HISTORY_LIMIT = 100;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MESSAGES = 10;
const UUID_V4_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Vista pública sem email, client internals ou detalhes de Mongoose. */
export type StudyGroupMessageView = {
    _id: string;
    groupId: string;
    authorStudentId: string | null;
    authorDisplayName: string | null;
    kind: StudyGroupMessageKind;
    text: string | null;
    tombstoned: boolean;
    tombstonedAt?: Date;
    createdAt?: Date;
};

/** Serviço de conversa em tempo real e notas REST do grupo. */
@Injectable()
export class StudyGroupMessagesService {
    /**
     * @param messageModel Mensagens e notas persistidas.
     * @param studyGroupsService Autoridade de membership do grupo.
     * @param readStateModel Cursor pessoal de leitura, opcional em testes unitários antigos.
     * @param studentProfileService Resolução pública de nomes, opcional em fixtures antigas.
     */
    constructor(
        @InjectModel(StudyGroupMessage.name)
        private readonly messageModel: Model<StudyGroupMessageDocument>,
        private readonly studyGroupsService: StudyGroupsService,
        @Optional()
        @InjectModel(StudentStudyGroupChatReadState.name)
        private readonly readStateModel?: Model<StudentStudyGroupChatReadStateDocument>,
        @Optional()
        private readonly studentProfileService?: StudentProfileService,
    ) {}

    /**
     * Mantém o POST REST compatível para mensagens antigas e criação de notas.
     * O frontend novo usa este caminho apenas para `NOTE`.
     */
    async createMessage(
        actor: AuthenticatedUser,
        groupId: string,
        input: CreateStudyGroupMessageDto,
    ): Promise<StudyGroupMessageView> {
        this.assertStudent(actor);
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const message = await this.messageModel.create({
            groupId: new Types.ObjectId(groupId),
            authorStudentId: new Types.ObjectId(actor.id),
            kind: input.kind,
            text: this.validateText(input.text),
        });
        return this.enrichOne(message.toObject());
    }

    /** Lista até 100 itens, com filtro opcional e ordem cronológica. */
    async listMessages(
        actor: AuthenticatedUser,
        groupId: string,
        kind?: StudyGroupMessageKind,
    ): Promise<StudyGroupMessageView[]> {
        this.assertStudent(actor);
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const messages = await this.messageModel
            .find({
                groupId: new Types.ObjectId(groupId),
                ...(kind ? { kind } : {}),
            })
            .sort({ createdAt: -1, _id: -1 })
            .limit(HISTORY_LIMIT)
            .lean();
        return this.enrichMany(messages.reverse());
    }

    /** Confirma role e membership sem revelar a existência de grupos inacessíveis. */
    async assertCanJoin(actor: AuthenticatedUser, groupId: string) {
        this.assertStudent(actor);
        return this.studyGroupsService.ensureMember(actor.id, groupId);
    }

    /** Devolve a room estável e isolada de um grupo. */
    roomName(groupId: string): string {
        return `study-group:${groupId}`;
    }

    /**
     * Persiste uma mensagem de WebSocket de forma idempotente. A consulta da
     * chave acontece antes do rate limit, permitindo retries seguros.
     */
    async sendRealtimeMessage(
        actor: AuthenticatedUser,
        groupId: string,
        text: string,
        clientMessageId: string,
    ): Promise<StudyGroupMessageView> {
        this.assertStudent(actor);
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const cleanText = this.validateText(text);
        const normalizedClientMessageId = this.validateClientMessageId(clientMessageId);
        const idempotencyFilter = {
            groupId: new Types.ObjectId(groupId),
            authorStudentId: new Types.ObjectId(actor.id),
            clientMessageId: normalizedClientMessageId,
        };
        const existing = await this.messageModel.findOne(idempotencyFilter).lean();
        if (existing) return this.enrichOne(existing);

        await this.assertWithinRateLimit(groupId, actor.id);
        try {
            const message = await this.messageModel.create({
                ...idempotencyFilter,
                kind: "MESSAGE",
                text: cleanText,
            });
            return this.enrichOne(message.toObject());
        } catch (error) {
            if (this.isDuplicateKeyError(error)) {
                const collision = await this.messageModel
                    .findOne(idempotencyFilter)
                    .lean();
                if (collision) return this.enrichOne(collision);
            }
            throw error;
        }
    }

    /** Devolve unread apenas nos grupos onde o aluno continua a ser membro. */
    async listStudentUnread(actor: AuthenticatedUser) {
        this.assertStudent(actor);
        if (!this.readStateModel) return [];
        const groups = await this.studyGroupsService.listMyGroups(actor);
        if (groups.length === 0) return [];
        const groupIds = groups.map((group) => new Types.ObjectId(group._id));
        const rows = await this.messageModel.aggregate<{
            _id: Types.ObjectId;
            unreadCount: number;
            lastMessageAt: Date;
        }>([
            {
                $match: {
                    groupId: { $in: groupIds },
                    kind: "MESSAGE",
                    authorStudentId: { $ne: new Types.ObjectId(actor.id) },
                    // `null` cobre documentos antigos que materializaram o
                    // campo e documentos novos onde o campo não existe.
                    tombstonedAt: null,
                },
            },
            {
                $lookup: {
                    from: "student_study_group_chat_read_states",
                    let: { currentGroupId: "$groupId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$groupId", "$$currentGroupId"] },
                                        { $eq: ["$studentId", new Types.ObjectId(actor.id)] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "readState",
                },
            },
            { $unwind: { path: "$readState", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    $expr: {
                        $gt: [
                            "$createdAt",
                            { $ifNull: ["$readState.lastReadAt", new Date(0)] },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$groupId",
                    unreadCount: { $sum: 1 },
                    lastMessageAt: { $max: "$createdAt" },
                },
            },
        ]);
        return rows.map((row) => ({
            groupId: String(row._id),
            unreadCount: row.unreadCount,
            lastMessageAt: row.lastMessageAt,
        }));
    }

    /** Avança o cursor até à mensagem mais recente de outro membro. */
    async markStudentRead(actor: AuthenticatedUser, groupId: string) {
        this.assertStudent(actor);
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        if (!this.readStateModel) return { groupId, unreadCount: 0 };
        const latest = await this.messageModel
            .findOne({
                groupId: new Types.ObjectId(groupId),
                kind: "MESSAGE",
                authorStudentId: { $ne: new Types.ObjectId(actor.id) },
                tombstonedAt: null,
            })
            .sort({ createdAt: -1, _id: -1 })
            .select("_id createdAt")
            .lean();
        const latestRecord = latest as
            | { _id: Types.ObjectId; createdAt?: Date }
            | null;
        await this.readStateModel.findOneAndUpdate(
            {
                studentId: new Types.ObjectId(actor.id),
                groupId: new Types.ObjectId(groupId),
            },
            {
                $set: {
                    lastReadAt: latestRecord?.createdAt ?? new Date(),
                    ...(latestRecord
                        ? { lastReadMessageId: latestRecord._id }
                        : {}),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return { groupId, unreadCount: 0 };
    }

    /** Bloqueia spam por aluno e grupo sem estado volátil em memória. */
    private async assertWithinRateLimit(groupId: string, studentId: string) {
        const recentMessages = await this.messageModel.countDocuments({
            groupId: new Types.ObjectId(groupId),
            authorStudentId: new Types.ObjectId(studentId),
            kind: "MESSAGE",
            createdAt: { $gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
        });
        if (recentMessages >= RATE_LIMIT_MAX_MESSAGES) {
            throw new HttpException(
                {
                    code: "STUDY_GROUP_CHAT_RATE_LIMITED",
                    message: "Aguarda antes de enviares mais mensagens.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    /** Valida texto comum a REST e WebSocket. */
    private validateText(text: string): string {
        const cleanText = String(text ?? "").trim();
        if (!cleanText) {
            throw new BadRequestException({
                code: "STUDY_GROUP_CHAT_EMPTY_MESSAGE",
                message: "Escreve uma mensagem antes de enviar.",
            });
        }
        if (cleanText.length > MAX_MESSAGE_LENGTH) {
            throw new BadRequestException({
                code: "STUDY_GROUP_CHAT_MESSAGE_TOO_LONG",
                message: "A mensagem é demasiado longa.",
            });
        }
        return cleanText;
    }

    /** Valida a chave UUID v4 exigida em cada envio WebSocket. */
    private validateClientMessageId(value: string): string {
        const normalized = String(value ?? "").trim();
        if (!UUID_V4_PATTERN.test(normalized)) {
            throw new BadRequestException({
                code: "STUDY_GROUP_CHAT_CLIENT_MESSAGE_ID_INVALID",
                message: "O identificador idempotente da mensagem é inválido.",
            });
        }
        return normalized;
    }

    /** Impede professores, administradores ou sessões degradadas de usar o chat. */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDY_GROUP_CHAT_ACCESS_DENIED",
                message: "Não tens acesso a este chat de grupo.",
            });
        }
    }

    /** Enriquece documentos em batch para evitar uma query por mensagem. */
    private async enrichMany(
        messages: Array<{
            _id: unknown;
            groupId: unknown;
            authorStudentId?: unknown;
            kind: StudyGroupMessageKind;
            text?: string;
            createdAt?: Date;
            tombstonedAt?: Date;
        }>,
    ): Promise<StudyGroupMessageView[]> {
        const authorIds = messages
            .filter((message) => !message.tombstonedAt && message.authorStudentId)
            .map((message) => String(message.authorStudentId));
        const names = await this.resolveNames(authorIds);
        return messages.map((message) =>
            this.toMessageView(message, names.get(String(message.authorStudentId))),
        );
    }

    /** Enriquece uma mensagem sem persistir o nome resolvido. */
    private async enrichOne(message: {
        _id: unknown;
        groupId: unknown;
        authorStudentId?: unknown;
        kind: StudyGroupMessageKind;
        text?: string;
        createdAt?: Date;
        tombstonedAt?: Date;
    }): Promise<StudyGroupMessageView> {
        if (message.tombstonedAt || !message.authorStudentId) {
            return this.toMessageView(message);
        }
        const authorId = String(message.authorStudentId);
        const names = await this.resolveNames([authorId]);
        return this.toMessageView(message, names.get(authorId));
    }

    /** Usa o serviço público de perfis ou o mesmo fallback seguro em testes isolados. */
    private async resolveNames(userIds: string[]): Promise<Map<string, string>> {
        if (this.studentProfileService) {
            return this.studentProfileService.resolvePublicDisplayNames(userIds);
        }
        return new Map(
            [...new Set(userIds)].map((userId) => [
                userId,
                `Aluno ${userId.slice(-4).toUpperCase()}`,
            ]),
        );
    }

    /** Mapeia persistência para o contrato público e protege tombstones. */
    private toMessageView(
        message: {
            _id: unknown;
            groupId: unknown;
            authorStudentId?: unknown;
            kind: StudyGroupMessageKind;
            text?: string;
            createdAt?: Date;
            tombstonedAt?: Date;
        },
        authorDisplayName?: string,
    ): StudyGroupMessageView {
        const tombstoned = Boolean(message.tombstonedAt);
        return {
            _id: String(message._id),
            groupId: String(message.groupId),
            authorStudentId:
                tombstoned || !message.authorStudentId
                    ? null
                    : String(message.authorStudentId),
            authorDisplayName: tombstoned ? null : authorDisplayName ?? null,
            kind: message.kind,
            text: tombstoned ? null : message.text ?? null,
            tombstoned,
            tombstonedAt: message.tombstonedAt,
            createdAt: message.createdAt,
        };
    }

    /** Reconhece apenas a colisão de índice único usada para idempotência. */
    private isDuplicateKeyError(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === 11000
        );
    }
}
