/**
 * Implementa as regras do chat professor-aluno por disciplina.
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
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { SubjectView, SubjectsService } from "../subjects/subjects.service.js";
import { StudentProfileService } from "../students/student-profile.service.js";
import {
    TeacherStudentChatAuthorRole,
    TeacherStudentChatMessage,
    TeacherStudentChatMessageDocument,
} from "./schemas/teacher-student-chat-message.schema.js";
import {
    TeacherStudentChatThread,
    TeacherStudentChatThreadDocument,
} from "./schemas/teacher-student-chat-thread.schema.js";
import { StudentSubjectChatReadState, StudentSubjectChatReadStateDocument } from "./schemas/student-subject-chat-read-state.schema.js";

const HISTORY_LIMIT = 100;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MESSAGES = 10;

/**
 * Contrato público de mensagem devolvido ao REST e WebSocket.
 */
export type TeacherStudentChatMessageView = {
    _id: string;
    threadId: string;
    subjectId: string;
    classId: string;
    authorUserId: string | null;
    authorRole: TeacherStudentChatAuthorRole | null;
    authorDisplayName: string | null;
    text: string | null;
    tombstoned: boolean;
    tombstonedAt?: Date;
    createdAt?: Date;
};

type SubjectChatAccess = {
    subjectId: string;
    classId: string;
    teacherId: string;
};

/**
 * Serviço do chat da disciplina.
 *
 * Mantém a autorização no backend e deriva autor/papel a partir da sessão,
 * evitando que o cliente consiga fazer spoofing de identidade.
 */
@Injectable()
export class TeacherStudentChatService {
    /**
     * Recebe modelos e services necessários para persistência e autorização.
     *
     * @param threadModel Modelo de threads por disciplina.
     * @param messageModel Modelo de mensagens do chat.
     * @param subjectsService Service canónico para ownership docente e inscrição discente.
     */
    constructor(
        @InjectModel(TeacherStudentChatThread.name)
        private readonly threadModel: Model<TeacherStudentChatThreadDocument>,
        @InjectModel(TeacherStudentChatMessage.name)
        private readonly messageModel: Model<TeacherStudentChatMessageDocument>,
        private readonly subjectsService: SubjectsService,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
        @Optional()
        @InjectModel(StudentSubjectChatReadState.name)
        private readonly readStateModel?: Model<StudentSubjectChatReadStateDocument>,
        @Optional()
        private readonly classesService?: ClassesService,
        @Optional()
        private readonly studentProfileService?: StudentProfileService,
    ) {}

    /**
     * Lista o histórico visível a um aluno inscrito na disciplina.
     *
     * @param actor Utilizador autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Últimas mensagens em ordem cronológica.
     */
    async listStudentMessages(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<TeacherStudentChatMessageView[]> {
        this.assertRole(actor, "STUDENT");
        const access = await this.resolveStudentHistoricalAccess(
            actor.id,
            subjectId,
        );
        return this.listMessagesForAccess(access);
    }

    /** Devolve contadores bulk apenas para disciplinas ativas autorizadas. */
    async listStudentUnread(actor: AuthenticatedUser) {
        this.assertRole(actor, "STUDENT");
        if (!this.readStateModel || !this.classesService) return [];
        const classes = await this.classesService.listStudentClasses(actor, "ACTIVE");
        const subjects = (await Promise.all(classes.map((schoolClass) =>
            this.subjectsService.listStudentClassSubjects(actor, schoolClass._id, "ACTIVE"),
        ))).flat();
        if (subjects.length === 0) return [];
        const subjectIds = subjects.map((subject) => new Types.ObjectId(subject._id));
        const rows = await this.messageModel.aggregate<{
            _id: Types.ObjectId;
            unreadCount: number;
            lastMessageAt: Date;
        }>([
            { $match: { subjectId: { $in: subjectIds }, authorRole: "TEACHER", tombstonedAt: { $exists: false } } },
            { $lookup: {
                from: "student_subject_chat_read_states",
                let: { currentSubjectId: "$subjectId" },
                pipeline: [{ $match: { $expr: { $and: [
                    { $eq: ["$subjectId", "$$currentSubjectId"] },
                    { $eq: ["$studentId", new Types.ObjectId(actor.id)] },
                ] } } }],
                as: "readState",
            } },
            { $unwind: { path: "$readState", preserveNullAndEmptyArrays: true } },
            { $match: { $expr: { $gt: ["$createdAt", { $ifNull: ["$readState.lastReadAt", new Date(0)] }] } } },
            { $group: { _id: "$subjectId", unreadCount: { $sum: 1 }, lastMessageAt: { $max: "$createdAt" } } },
        ]);
        return rows.map((row) => ({
            subjectId: String(row._id),
            unreadCount: row.unreadCount,
            lastMessageAt: row.lastMessageAt,
        }));
    }

    /** Avança o cursor até à última mensagem docente que já ficou visível. */
    async markStudentRead(actor: AuthenticatedUser, subjectId: string) {
        this.assertRole(actor, "STUDENT");
        const access = await this.resolveStudentHistoricalAccess(actor.id, subjectId);
        if (!this.readStateModel) return { subjectId: access.subjectId, unreadCount: 0 };
        const latest = await this.messageModel.findOne({
            subjectId: new Types.ObjectId(access.subjectId),
            authorRole: "TEACHER",
            tombstonedAt: { $exists: false },
        }).sort({ createdAt: -1, _id: -1 }).select("_id createdAt").lean();
        const latestRecord = latest as { _id: Types.ObjectId; createdAt?: Date } | null;
        const lastReadAt = latestRecord?.createdAt ?? new Date();
        await this.readStateModel.findOneAndUpdate(
            { studentId: new Types.ObjectId(actor.id), subjectId: new Types.ObjectId(access.subjectId) },
            { $set: {
                classId: new Types.ObjectId(access.classId),
                lastReadAt,
                ...(latestRecord ? { lastReadMessageId: latestRecord._id } : {}),
            } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return { subjectId: access.subjectId, unreadCount: 0 };
    }

    /**
     * Lista o histórico visível ao professor responsável pela disciplina.
     *
     * @param actor Utilizador autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Últimas mensagens em ordem cronológica.
     */
    async listTeacherMessages(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<TeacherStudentChatMessageView[]> {
        this.assertRole(actor, "TEACHER");
        const access = await this.resolveTeacherHistoricalAccess(
            actor.id,
            subjectId,
        );
        return this.listMessagesForAccess(access);
    }

    /**
     * Valida se o utilizador pode entrar no canal WebSocket da disciplina.
     *
     * @param actor Utilizador autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Contexto autorizado para construir a room.
     */
    async assertCanJoin(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        return this.resolveAccess(actor, subjectId);
    }

    /**
     * Cria uma mensagem depois de autenticar, autorizar, validar e aplicar rate limit.
     *
     * @param actor Utilizador autenticado.
     * @param subjectId Disciplina alvo.
     * @param text Texto recebido do WebSocket.
     * @returns Mensagem persistida no contrato público.
     */
    async sendMessage(
        actor: AuthenticatedUser,
        subjectId: string,
        text: string,
        clientMessageId?: string,
    ): Promise<TeacherStudentChatMessageView> {
        const access = await this.resolveAccess(actor, subjectId);
        const cleanText = this.validateText(text);
        const thread = await this.findOrCreateThread(access);
        const threadId = String(thread._id);
        const normalizedClientMessageId = this.validateClientMessageId(
            clientMessageId,
        );
        if (normalizedClientMessageId) {
            const existing = await this.messageModel
                .findOne({
                    threadId: new Types.ObjectId(threadId),
                    authorUserId: new Types.ObjectId(actor.id),
                    clientMessageId: normalizedClientMessageId,
                })
                .lean();
            if (existing) {
                const view = await this.enrichMessage(existing);
                await this.recordStudentMessageActivity(actor, view);
                return view;
            }
        }
        await this.assertWithinRateLimit(threadId, actor.id);

        let message;
        try {
            message = await this.messageModel.create({
                threadId: new Types.ObjectId(threadId),
                subjectId: new Types.ObjectId(access.subjectId),
                classId: new Types.ObjectId(access.classId),
                authorUserId: new Types.ObjectId(actor.id),
                authorRole: actor.role,
                text: cleanText,
                clientMessageId: normalizedClientMessageId,
            });
        } catch (error) {
            if (
                normalizedClientMessageId &&
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: unknown }).code === 11000
            ) {
                const existing = await this.messageModel
                    .findOne({
                        threadId: new Types.ObjectId(threadId),
                        authorUserId: new Types.ObjectId(actor.id),
                        clientMessageId: normalizedClientMessageId,
                    })
                    .lean();
                if (existing) {
                    const view = await this.enrichMessage(existing);
                    await this.recordStudentMessageActivity(actor, view);
                    return view;
                }
            }
            throw error;
        }
        const view = await this.enrichMessage(message.toObject());
        await this.recordStudentMessageActivity(actor, view);
        return view;
    }

    /** Conta apenas mensagens enviadas pelo aluno em chat oficial da turma. */
    private async recordStudentMessageActivity(
        actor: AuthenticatedUser,
        message: TeacherStudentChatMessageView,
    ): Promise<void> {
        if (actor.role !== "STUDENT") return;
        await this.classLearningActivityService?.recordBestEffort({
            classId: message.classId,
            studentId: actor.id,
            subjectId: message.subjectId,
            type: "OFFICIAL_CHAT_MESSAGE",
            sourceEventKey: `official-chat-message:${message._id}`,
            occurredAt: message.createdAt,
        });
    }

    /** Valida a chave opaca usada para tornar retries WebSocket idempotentes. */
    private validateClientMessageId(value?: string): string | undefined {
        if (value === undefined) return undefined;
        const normalized = value.trim();
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
            throw new BadRequestException({
                code: "SUBJECT_CHAT_CLIENT_MESSAGE_ID_INVALID",
                message: "O identificador idempotente da mensagem é inválido.",
            });
        }
        return normalized;
    }

    /**
     * Devolve o nome da room Socket.IO de uma disciplina autorizada.
     *
     * @param subjectId Disciplina autorizada.
     * @returns Nome estável da room.
     */
    roomName(subjectId: string): string {
        return `subject:${subjectId}`;
    }

    /**
     * Resolve autorização conforme papel da sessão.
     *
     * @param actor Utilizador autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Contexto autorizado.
     */
    private async resolveAccess(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        if (actor.role === "STUDENT") {
            return this.resolveStudentAccess(actor.id, subjectId);
        }

        if (actor.role === "TEACHER") {
            return this.resolveTeacherAccess(actor.id, subjectId);
        }

        throw new ForbiddenException({
            code: "SUBJECT_CHAT_ROLE_DENIED",
            message: "Este chat está disponível apenas para alunos e professores.",
        });
    }

    /**
     * Resolve uma disciplina acessível ao aluno inscrito na turma.
     *
     * @param studentId Aluno autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Contexto autorizado.
     */
    private async resolveStudentAccess(
        studentId: string,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        const { subject } = await this.subjectsService.findSubjectForStudent(
            studentId,
            subjectId,
        );
        return this.toAccess(subject);
    }

    /**
     * Resolve uma disciplina pertencente ao professor autenticado.
     *
     * @param teacherId Professor autenticado.
     * @param subjectId Disciplina alvo.
     * @returns Contexto autorizado.
     */
    private async resolveTeacherAccess(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        const subject = await this.subjectsService.findOwnedSubject(
            teacherId,
            subjectId,
        );
        return this.toAccess(subject);
    }

    /** Resolve leitura histórica do aluno sem reabrir o envio em arquivo. */
    private async resolveStudentHistoricalAccess(
        studentId: string,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            studentId,
            subjectId,
        );
        return this.toAccess(subject);
    }

    /** Resolve leitura histórica docente, mantendo join/send limitados a ACTIVE. */
    private async resolveTeacherHistoricalAccess(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectChatAccess> {
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
            teacherId,
            subjectId,
        );
        return this.toAccess(subject);
    }

    /**
     * Lista mensagens da thread, devolvendo vazio quando ainda não existe conversa.
     *
     * @param access Contexto de disciplina já autorizado.
     * @returns Últimas mensagens em ordem cronológica.
     */
    private async listMessagesForAccess(
        access: SubjectChatAccess,
    ): Promise<TeacherStudentChatMessageView[]> {
        const thread = await this.threadModel
            .findOne({ subjectId: new Types.ObjectId(access.subjectId) })
            .lean();
        if (!thread) return [];

        const messages = await this.messageModel
            .find({ threadId: new Types.ObjectId(String(thread._id)) })
            .sort({ createdAt: -1 })
            .limit(HISTORY_LIMIT)
            .lean();

        return this.enrichMessages(messages.reverse());
    }

    /**
     * Cria a thread sob procura, sem fazer side effects nos pedidos GET.
     *
     * @param access Contexto de disciplina já autorizado.
     * @returns Thread aberta da disciplina.
     */
    private async findOrCreateThread(access: SubjectChatAccess) {
        return this.threadModel.findOneAndUpdate(
            { subjectId: new Types.ObjectId(access.subjectId) },
            {
                $setOnInsert: {
                    subjectId: new Types.ObjectId(access.subjectId),
                    classId: new Types.ObjectId(access.classId),
                    teacherId: new Types.ObjectId(access.teacherId),
                    status: "OPEN",
                },
            },
            { new: true, upsert: true, runValidators: true },
        );
    }

    /**
     * Bloqueia spam básico sem depender de estado em memória.
     *
     * @param threadId Thread alvo.
     * @param userId Autor autenticado.
     * @returns Nada quando o envio está dentro do limite.
     */
    private async assertWithinRateLimit(
        threadId: string,
        userId: string,
    ): Promise<void> {
        const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
        const recentMessages = await this.messageModel.countDocuments({
            threadId: new Types.ObjectId(threadId),
            authorUserId: new Types.ObjectId(userId),
            createdAt: { $gte: since },
        });

        if (recentMessages >= RATE_LIMIT_MAX_MESSAGES) {
            throw new HttpException(
                {
                    code: "SUBJECT_CHAT_RATE_LIMITED",
                    message: "Aguarda antes de enviares mais mensagens.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    /**
     * Normaliza e valida texto recebido do cliente.
     *
     * @param text Valor bruto recebido.
     * @returns Texto seguro para persistir.
     */
    private validateText(text: string): string {
        const cleanText = String(text ?? "").trim();
        if (cleanText.length === 0) {
            throw new BadRequestException({
                code: "SUBJECT_CHAT_EMPTY_MESSAGE",
                message: "Escreve uma mensagem antes de enviar.",
            });
        }

        if (cleanText.length > MAX_MESSAGE_LENGTH) {
            throw new BadRequestException({
                code: "SUBJECT_CHAT_MESSAGE_TOO_LONG",
                message: "A mensagem é demasiado longa.",
            });
        }

        return cleanText;
    }

    /**
     * Valida papel esperado antes de delegar autorização de domínio.
     *
     * @param actor Utilizador autenticado.
     * @param role Papel exigido pelo endpoint REST.
     * @returns Nada quando o papel é aceite.
     */
    private assertRole(
        actor: AuthenticatedUser,
        role: TeacherStudentChatAuthorRole,
    ): void {
        if (actor.role !== role) {
            throw new ForbiddenException({
                code: `${role}_ROLE_REQUIRED`,
                message:
                    role === "STUDENT"
                        ? "Esta funcionalidade é exclusiva de alunos."
                        : "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Mapeia a disciplina para o contexto mínimo usado pelo chat.
     *
     * @param subject Disciplina já autorizada.
     * @returns Identificadores públicos necessários ao chat.
     */
    private toAccess(subject: SubjectView): SubjectChatAccess {
        return {
            subjectId: subject._id,
            classId: subject.classId,
            teacherId: subject.teacherId,
        };
    }

    /**
     * Mapeia documento interno para contrato público sem dados sensíveis.
     *
     * @param message Documento ou objeto lean de mensagem.
     * @returns Mensagem pública.
     */
    private async enrichMessages(messages: Array<{
        _id: unknown;
        threadId: unknown;
        subjectId: unknown;
        classId: unknown;
        authorUserId?: unknown;
        authorRole?: TeacherStudentChatAuthorRole;
        text?: string;
        createdAt?: Date;
        tombstonedAt?: Date;
    }>): Promise<TeacherStudentChatMessageView[]> {
        const studentIds = messages
            .filter((message) =>
                !message.tombstonedAt &&
                message.authorRole === "STUDENT" &&
                message.authorUserId,
            )
            .map((message) => String(message.authorUserId));
        const names = await this.resolveStudentNames(studentIds);
        return messages.map((message) =>
            this.toMessageView(
                message,
                message.authorRole === "TEACHER"
                    ? "Professor"
                    : names.get(String(message.authorUserId)),
            ),
        );
    }

    /** Resolve a identidade pública de uma mensagem sem a guardar no documento. */
    private async enrichMessage(message: {
        _id: unknown;
        threadId: unknown;
        subjectId: unknown;
        classId: unknown;
        authorUserId?: unknown;
        authorRole?: TeacherStudentChatAuthorRole;
        text?: string;
        createdAt?: Date;
        tombstonedAt?: Date;
    }): Promise<TeacherStudentChatMessageView> {
        if (message.tombstonedAt) return this.toMessageView(message);
        if (message.authorRole === "TEACHER") {
            return this.toMessageView(message, "Professor");
        }
        const authorId = String(message.authorUserId ?? "");
        const names = await this.resolveStudentNames([authorId]);
        return this.toMessageView(message, names.get(authorId));
    }

    /** Usa perfis públicos em batch e mantém fallback seguro em testes isolados. */
    private async resolveStudentNames(userIds: string[]): Promise<Map<string, string>> {
        if (this.studentProfileService) {
            return this.studentProfileService.resolvePublicDisplayNames(userIds);
        }
        return new Map(
            [...new Set(userIds.filter(Boolean))].map((userId) => [
                userId,
                `Aluno ${userId.slice(-4).toUpperCase()}`,
            ]),
        );
    }

    private toMessageView(message: {
        _id: unknown;
        threadId: unknown;
        subjectId: unknown;
        classId: unknown;
        authorUserId?: unknown;
        authorRole?: TeacherStudentChatAuthorRole;
        text?: string;
        createdAt?: Date;
        tombstonedAt?: Date;
    }, authorDisplayName?: string): TeacherStudentChatMessageView {
        const tombstoned = Boolean(message.tombstonedAt);
        return {
            _id: String(message._id),
            threadId: String(message.threadId),
            subjectId: String(message.subjectId),
            classId: String(message.classId),
            authorUserId: tombstoned || !message.authorUserId ? null : String(message.authorUserId),
            authorRole: tombstoned ? null : message.authorRole ?? null,
            authorDisplayName: tombstoned ? null : authorDisplayName ?? null,
            text: tombstoned ? null : message.text ?? null,
            tombstoned,
            tombstonedAt: message.tombstonedAt,
            createdAt: message.createdAt,
        };
    }
}
