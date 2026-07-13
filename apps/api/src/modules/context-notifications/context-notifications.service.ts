/**
 * Implementa notificações internas para turmas e grupos.
 */
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "node:crypto";
import {
    Types,
    type ClientSession,
    type Connection,
    type Model,
} from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { NotificationPoliciesService } from "../notification-policies/notification-policies.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";
import { ContextNotification, ContextNotificationDocument } from "./schemas/context-notification.schema.js";
import {
    ContextNotificationRecipient,
    ContextNotificationRecipientDocument,
} from "./schemas/context-notification-recipient.schema.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventDocument,
} from "./schemas/notification-outbox-event.schema.js";

/**
 * DTO público mínimo de uma notificação contextual.
 *
 * Não inclui identificadores individuais de destinatários nem de utilizadores
 * suprimidos; apenas os totais necessários para feedback operacional ao autor.
 */
export type ContextNotificationView = {
    id: string;
    contextType: string;
    contextId: string;
    type: string;
    title: string;
    body: string;
    recipientCount: number;
    suppressedRecipientCount: number;
    targetPath?: string;
    createdAt?: Date;
};

/** Item minimizado da inbox do destinatário autenticado. */
export type NotificationInboxItemView = {
    id: string;
    contextType: string;
    contextId: string;
    type: string;
    title: string;
    body: string;
    targetPath?: string;
    createdAt?: Date;
    readAt: Date | null;
};

/** Página por cursor da inbox; o badge usa apenas `unreadCount`. */
export type NotificationInboxPage = {
    items: NotificationInboxItemView[];
    unreadCount: number;
    nextCursor: string | null;
};

/**
 * Tipos que um utilizador pode criar diretamente no endpoint genérico.
 * Eventos de lifecycle/publicação pertencem aos services de domínio e à outbox.
 */
const MANUAL_CONTEXT_NOTIFICATION_TYPES = new Set<
    CreateContextNotificationDto["type"]
>(["NEW_MATERIAL", "FEEDBACK", "TASK"]);

/** Envio dirigido usado exclusivamente pelo Centro de Acompanhamento. */
const TARGETED_MANUAL_NOTIFICATION_TYPES = new Set<
    CreateContextNotificationDto["type"]
>(["FOLLOW_UP"]);

/** Opções explícitas que distinguem envios manuais de eventos automáticos. */
type ResolvedNotificationOptions = {
    preferenceContext?: NotificationContext;
    sourceEventKey?: string;
    enforceQuota: boolean;
};

/**
 * Service de notificações contextuais.
 */
@Injectable()
export class ContextNotificationsService {
    /**
     * Recebe as dependências injetadas de ContextNotificationsService para manter notificações contextuais testável e separado de detalhes externos.
     *
     * @param notificationModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param classesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param groupsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param preferencesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param policiesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
        private readonly classesService: ClassesService,
        private readonly groupsService: StudyGroupsService,
        private readonly preferencesService: NotificationPreferencesService,
        private readonly policiesService: NotificationPoliciesService,
        private readonly auditLogService: AuditLogService,
        @Optional()
        @InjectModel(ContextNotificationRecipient.name)
        private readonly recipientModel?: Model<ContextNotificationRecipientDocument>,
        @Optional()
        @InjectModel(NotificationOutboxEvent.name)
        private readonly outboxModel?: Model<NotificationOutboxEventDocument>,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /**
     * Cria uma notificação e calcula destinatários no backend.
     *
     * @param actor Utilizador autenticado.
     * @param input Dados da notificação.
     * @returns Notificação persistida.
     */
    async create(actor: AuthenticatedUser, input: CreateContextNotificationDto) {
        this.assertManualCreateAllowed(actor, input);
        const recipientIds = await this.resolveRecipients(actor, input);
        const targetPath = input.type === "TASK" || input.type === "FOLLOW_UP"
            ? this.resolveTeacherDestination(input)
            : undefined;
        return this.createForResolvedRecipients(actor, { ...input, targetPath }, recipientIds, {
            enforceQuota: true,
        });
    }

    /** Constrói destinos fechados sem aceitar caminhos arbitrários do browser. */
    private resolveTeacherDestination(input: CreateContextNotificationDto): string {
        if (input.contextType !== "CLASS" || !input.destination || input.destination === "TODAY") {
            return "/app/hoje";
        }
        const base = `/app/turmas/${input.contextId}`;
        if (input.destination === "CLASS_POSTS") return `${base}/publicacoes`;
        if (input.destination === "CLASS_PROJECTS") return `${base}/projectos`;
        return `${base}/disciplinas`;
    }

    /**
     * Cria a notificação canónica de uma sala guiada sem aceitar destinatários
     * ou destinos arbitrários do cliente.
     */
    async createForGuidedRoom(
        actor: AuthenticatedUser,
        input: { classId: string; roomId: string; title: string; startsAt?: Date },
    ) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Só professores podem notificar uma turma.",
            });
        }
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            input.classId,
        );
        const schedule = input.startsAt
            ? ` Início previsto: ${input.startsAt.toISOString()}.`
            : "";
        return this.createForResolvedRecipients(
            actor,
            {
                contextType: "CLASS",
                contextId: schoolClass._id,
                type: "GUIDED_ROOM_OPENED",
                title: `Sala guiada: ${input.title}`,
                body: `Está disponível uma nova sala guiada.${schedule}`,
                targetPath: `/app/turmas/${schoolClass._id}/salas-guiadas/${input.roomId}`,
            },
            schoolClass.studentIds,
            {
                preferenceContext: NotificationContext.GUIDED_ROOM,
                sourceEventKey: `guided-room:${input.roomId}:opened`,
                enforceQuota: false,
            },
        );
    }

    /**
     * Regista uma alteração docente de turma numa outbox durável.
     *
     * Quando a outbox ainda não está disponível (por exemplo, num unit test
     * legado), executa a entrega síncrona sem perder a validação de contexto.
     */
    async enqueueClassEvent(
        actor: AuthenticatedUser,
        input: {
            classId: string;
            idempotencyKey: string;
            type: CreateContextNotificationDto["type"];
            title: string;
            body: string;
            targetPath?: string;
            preferenceContext?: NotificationContext;
        },
        session?: ClientSession,
    ) {
        if (actor.role !== "TEACHER" && actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Só professores podem notificar uma turma.",
            });
        }
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            input.classId,
        );
        const recipientIds = schoolClass.studentIds;
        const preferenceContext =
            input.preferenceContext ?? this.preferenceContextForType(input.type);

        if (!this.outboxModel) {
            const notification = await this.createForResolvedRecipients(
                actor,
                {
                    contextType: "CLASS",
                    contextId: schoolClass._id,
                    type: input.type,
                    title: input.title,
                    body: input.body,
                    targetPath: input.targetPath,
                },
                recipientIds,
                {
                    preferenceContext,
                    sourceEventKey: input.idempotencyKey,
                    enforceQuota: false,
                },
                session,
            );
            return { eventId: input.idempotencyKey, state: "DELIVERED", notification };
        }

        const event = await this.outboxModel.findOneAndUpdate(
            { idempotencyKey: input.idempotencyKey },
            {
                $setOnInsert: {
                    idempotencyKey: input.idempotencyKey,
                    actorId: new Types.ObjectId(actor.id),
                    contextType: "CLASS",
                    contextId: new Types.ObjectId(schoolClass._id),
                    type: input.type,
                    title: input.title.trim(),
                    body: input.body.trim(),
                    targetPath: input.targetPath,
                    recipientIdsSnapshot: recipientIds.map(
                        (id) => new Types.ObjectId(id),
                    ),
                    preferenceContext,
                    status: "PENDING",
                    attempts: 0,
                    availableAt: new Date(),
                },
            },
            { new: true, upsert: true, runValidators: true, session },
        );
        return { eventId: String(event._id), state: event.status };
    }

    /** Processa um lote pequeno da outbox com lease e retry exponencial. */
    async processOutboxBatch(limit = 20): Promise<number> {
        if (!this.outboxModel) return 0;
        let processed = 0;
        const safeLimit = Math.max(1, Math.min(50, limit));

        for (let index = 0; index < safeLimit; index += 1) {
            const now = new Date();
            const leaseToken = randomUUID();
            const event = await this.outboxModel.findOneAndUpdate(
                {
                    $or: [
                        { status: "PENDING", availableAt: { $lte: now } },
                        {
                            status: "PROCESSING",
                            leaseExpiresAt: { $lte: now },
                        },
                    ],
                },
                {
                    $set: {
                        status: "PROCESSING",
                        leaseToken,
                        leaseExpiresAt: new Date(now.getTime() + 30_000),
                    },
                    $inc: { attempts: 1 },
                },
                { new: true, sort: { availableAt: 1, _id: 1 } },
            );
            if (!event) break;

            try {
                await this.deliverOutboxEvent(event);
                await this.outboxModel.updateOne(
                    { _id: event._id, leaseToken },
                    {
                        $set: {
                            status: "DELIVERED",
                            completedAt: new Date(),
                        },
                        $unset: {
                            leaseToken: "",
                            leaseExpiresAt: "",
                            lastErrorCode: "",
                        },
                    },
                );
                processed += 1;
            } catch (error) {
                const attempts = Number(event.attempts ?? 1);
                const failed = attempts >= 6;
                const errorCode = this.publicErrorCode(error);
                await this.outboxModel.updateOne(
                    { _id: event._id, leaseToken },
                    {
                        $set: {
                            status: failed ? "FAILED" : "PENDING",
                            availableAt: new Date(
                                Date.now() + this.retryDelayMs(attempts),
                            ),
                            lastErrorCode: errorCode,
                        },
                        $unset: { leaseToken: "", leaseExpiresAt: "" },
                    },
                );
                await this.auditLogService.record({
                    actorId: String(event.actorId),
                    domain: "NOTIFICATIONS",
                    action: "NOTIFICATION_OUTBOX_DELIVERY_FAILED",
                    resourceType: "NotificationOutboxEvent",
                    resourceId: String(event._id),
                    result: "FAILED",
                    metadata: { attempts, final: failed, errorCode },
                });
            }
        }
        return processed;
    }

    /**
     * Cria uma notificação para destinatários já filtrados por um fluxo backend.
     *
     * @param actor Utilizador autenticado.
     * @param input Dados da notificação.
     * @param recipientIds Destinatários calculados por outro service, nunca vindos do cliente HTTP.
     * @returns Notificação persistida.
     */
    async createForRecipients(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto,
        recipientIds: string[],
    ) {
        this.assertTargetedManualCreateAllowed(actor, input);
        const allowedRecipientIds = await this.resolveRecipients(actor, input);
        const allowed = new Set(allowedRecipientIds);
        const uniqueRecipientIds = Array.from(new Set(recipientIds));
        const hasOutOfContextRecipient = uniqueRecipientIds.some((id) => !allowed.has(id));
        if (hasOutOfContextRecipient) {
            throw new ForbiddenException({
                code: "RECIPIENT_OUT_OF_CONTEXT",
                message: "A notificação só pode ser enviada a membros do contexto validado.",
            });
        }

        return this.runInTransaction(async (session) => {
            await this.classesService.reserveActiveChildMutation(
                actor.id,
                input.contextId,
                session,
            );
            return this.createForResolvedRecipients(
                actor,
                input,
                uniqueRecipientIds,
                { enforceQuota: true },
                session,
            );
        });
    }

    /**
     * Reserva o POST genérico aos tipos manuais previstos para turmas e grupos.
     * Um evento automático nunca pode ser fabricado pelo cliente HTTP.
     */
    private assertManualCreateAllowed(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto,
    ): void {
        const roleMatchesContext =
            (input.contextType === "CLASS" && actor.role === "TEACHER") ||
            (input.contextType === "GROUP" && actor.role === "STUDENT");
        if (
            !roleMatchesContext ||
            !MANUAL_CONTEXT_NOTIFICATION_TYPES.has(input.type)
        ) {
            throw this.manualTypeDenied();
        }
    }

    /**
     * Limita o envio dirigido a acompanhamentos docentes. Chamadores de eventos
     * automáticos devem usar a outbox, mesmo sendo services internos.
     */
    private assertTargetedManualCreateAllowed(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto,
    ): void {
        if (
            actor.role !== "TEACHER" ||
            input.contextType !== "CLASS" ||
            !TARGETED_MANUAL_NOTIFICATION_TYPES.has(input.type)
        ) {
            throw this.manualTypeDenied();
        }
    }

    private manualTypeDenied(): ForbiddenException {
        return new ForbiddenException({
            code: "CONTEXT_NOTIFICATION_AUTOMATIC_TYPE_FORBIDDEN",
            message:
                "Este tipo de notificação só pode ser criado pela alteração de domínio correspondente.",
        });
    }

    /**
     * Cria create for resolved recipients no domínio de notificações contextuais, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @param recipientIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    private async createForResolvedRecipients(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto & { targetPath?: string },
        recipientIds: string[],
        options: ResolvedNotificationOptions,
        session?: ClientSession,
    ) {
        const { preferenceContext, sourceEventKey, enforceQuota } = options;
        const context =
            preferenceContext ??
            (input.contextType === "CLASS"
                ? this.preferenceContextForType(input.type)
                : NotificationContext.GROUP_SESSION);
        const enabledPairs = await Promise.all(
            recipientIds.map(async (id) => ({
                id,
                enabled: await this.preferencesService.isInAppEnabled(id, context),
            })),
        );
        const finalRecipients = enabledPairs.filter((pair) => pair.enabled).map((pair) => pair.id);
        const suppressed = enabledPairs.filter((pair) => !pair.enabled).map((pair) => pair.id);
        if (enforceQuota) {
            await this.policiesService.assertWithinQuota(
                finalRecipients,
                input.contextId,
            );
        } else {
            await this.policiesService.assertChannelEnabled();
        }

        if (sourceEventKey) {
            const existingQuery = this.notificationModel.findOne({
                sourceEventKey,
            });
            if (session) existingQuery.session(session);
            const existing = await existingQuery.lean();
            if (existing) {
                const refreshed = await this.notificationModel
                    .findOneAndUpdate(
                        { _id: existing._id, sourceEventKey },
                        {
                            $set: {
                                recipientIds: finalRecipients.map(
                                    (id) => new Types.ObjectId(id),
                                ),
                                suppressedRecipientIds: suppressed.map(
                                    (id) => new Types.ObjectId(id),
                                ),
                            },
                        },
                        session ? { new: true, session } : { new: true },
                    )
                    .lean();
                const current = refreshed ?? existing;
                await this.reconcileRecipientRows(
                    String(current._id),
                    finalRecipients,
                    suppressed,
                    session,
                );
                return this.toView(current);
            }
        }

        const document = {
            contextType: input.contextType,
            contextId: new Types.ObjectId(input.contextId),
            actorId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
            body: input.body.trim(),
            recipientIds: finalRecipients.map((id) => new Types.ObjectId(id)),
            suppressedRecipientIds: suppressed.map((id) => new Types.ObjectId(id)),
            targetPath: "targetPath" in input ? input.targetPath : undefined,
            sourceEventKey,
        };
        const notification = session
            ? (await this.notificationModel.create([document], { session }))[0]
            : await this.notificationModel.create(document);

        await this.ensureRecipientRows(
            String(notification._id),
            finalRecipients,
            suppressed,
            session,
        );

        const auditRecord = {
            actorId: actor.id,
            domain: "NOTIFICATIONS",
            action: "CONTEXT_NOTIFICATION_CREATED",
            resourceType: "ContextNotification",
            resourceId: String(notification._id),
            result: "SUCCESS",
            metadata: {
                contextType: input.contextType,
                type: input.type,
                recipientCount: finalRecipients.length,
                suppressedCount: suppressed.length,
            },
        } as const;
        if (session) {
            await this.auditLogService.record(auditRecord, session);
        } else {
            await this.auditLogService.record(auditRecord);
        }
        return this.toView(notification.toObject());
    }

    /**
     * Lista notificações visíveis ao utilizador autenticado.
     *
     * @param actor Utilizador autenticado.
     * @returns Notificações recebidas ou criadas.
     */
    async list(actor: AuthenticatedUser) {
        if (actor.role === "STUDENT") {
            return (await this.listInbox(actor, { limit: 50 })).items;
        }
        return this.listSent(actor);
    }

    /** Lista apenas notificações recebidas, paginadas e com estado de leitura. */
    async listInbox(
        actor: AuthenticatedUser,
        input: { cursor?: string; limit?: number; unreadOnly?: boolean } = {},
    ): Promise<NotificationInboxPage> {
        const limit = Math.max(1, Math.min(50, Number(input.limit) || 20));
        const recipientId = new Types.ObjectId(actor.id);

        if (!this.recipientModel) {
            const notifications = await this.notificationModel
                .find({ recipientIds: recipientId })
                .sort({ createdAt: -1, _id: -1 })
                .limit(limit)
                .lean();
            return {
                items: notifications.map((notification) => ({
                    ...this.toInboxItem(notification, null),
                })),
                unreadCount: notifications.length,
                nextCursor: null,
            };
        }

        const filter: Record<string, unknown> = {
            recipientId,
            status: "DELIVERED",
            archivedAt: { $exists: false },
        };
        if (input.unreadOnly) filter.readAt = { $exists: false };
        if (input.cursor && Types.ObjectId.isValid(input.cursor)) {
            filter._id = { $lt: new Types.ObjectId(input.cursor) };
        }

        const rows = await this.recipientModel
            .find(filter)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const pageRows = rows.slice(0, limit);
        const notificationIds = pageRows.map((row) => row.notificationId);
        const notifications = notificationIds.length
            ? await this.notificationModel
                  .find({ _id: { $in: notificationIds } })
                  .lean()
            : [];
        const byId = new Map(
            notifications.map((notification) => [String(notification._id), notification]),
        );
        const items = pageRows.flatMap((row) => {
            const notification = byId.get(String(row.notificationId));
            return notification
                ? [this.toInboxItem(notification, row.readAt ?? null)]
                : [];
        });
        const unreadCount = await this.recipientModel.countDocuments({
            recipientId,
            status: "DELIVERED",
            archivedAt: { $exists: false },
            readAt: { $exists: false },
        });

        return {
            items,
            unreadCount,
            nextCursor:
                rows.length > limit && pageRows.length > 0
                    ? String(pageRows[pageRows.length - 1]!._id)
                    : null,
        };
    }

    /** Marca uma notificação recebida como lida sem confiar no destinatário do body. */
    async markRead(actor: AuthenticatedUser, notificationId: string) {
        return this.updateRecipientState(actor, notificationId, {
            $set: { readAt: new Date() },
        });
    }

    /** Remove uma notificação da inbox ativa, preservando-a para auditoria/export. */
    async archive(actor: AuthenticatedUser, notificationId: string) {
        return this.updateRecipientState(actor, notificationId, {
            $set: { archivedAt: new Date(), readAt: new Date() },
        });
    }

    /** Marca em lote todas as notificações entregues e não arquivadas como lidas. */
    async markAllRead(actor: AuthenticatedUser) {
        if (!this.recipientModel) return { updatedCount: 0 };
        const result = await this.recipientModel.updateMany(
            {
                recipientId: new Types.ObjectId(actor.id),
                status: "DELIVERED",
                archivedAt: { $exists: false },
                readAt: { $exists: false },
            },
            { $set: { readAt: new Date() } },
        );
        return { updatedCount: result.modifiedCount };
    }

    /** Lista envelopes criados pelo professor, incluindo apenas totais operacionais. */
    async listSent(actor: AuthenticatedUser) {
        const notifications = await this.notificationModel
            .find({ actorId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1, _id: -1 })
            .limit(100)
            .lean();
        return notifications.map((notification) => this.toView(notification));
    }

    /**
     * Entrega um evento já autorizado. O snapshot preserva a intenção original,
     * mas é intersectado com as memberships atuais para não divulgar mudanças
     * académicas a quem entretanto perdeu acesso.
     */
    private async deliverOutboxEvent(
        event: NotificationOutboxEventDocument,
    ): Promise<void> {
        const preferenceContext = Object.values(NotificationContext).includes(
            event.preferenceContext as NotificationContext,
        )
            ? (event.preferenceContext as NotificationContext)
            : this.preferenceContextForType(event.type);
        const recipientIds = await this.resolveCurrentOutboxRecipients(event);
        await this.createForResolvedRecipients(
            {
                id: String(event.actorId),
                email: "notification-outbox@internal.invalid",
                role: "TEACHER",
            },
            {
                contextType: event.contextType,
                contextId: String(event.contextId),
                type: event.type,
                title: event.title,
                body: event.body,
                targetPath: event.targetPath,
            },
            recipientIds,
            {
                preferenceContext,
                sourceEventKey: event.idempotencyKey,
                enforceQuota: false,
            },
        );
    }

    /** Revalida destinatários no momento da entrega sem aceitar IDs do cliente. */
    private async resolveCurrentOutboxRecipients(
        event: NotificationOutboxEventDocument,
    ): Promise<string[]> {
        const snapshot = Array.from(
            new Set(event.recipientIdsSnapshot.map(String)),
        );
        if (event.contextType === "CLASS") {
            const schoolClass = await this.classesService.findOwnedClass(
                String(event.actorId),
                String(event.contextId),
            );
            const activeIds = new Set(schoolClass.studentIds);
            if (event.type === "CLASS_MEMBERSHIP_REMOVED") {
                // Uma remoção só é entregue se o destinatário continuar fora da
                // turma. Assim, um evento atrasado não contradiz uma reinscrição.
                return snapshot.filter((recipientId) => !activeIds.has(recipientId));
            }
            return snapshot.filter((recipientId) => activeIds.has(recipientId));
        }

        const group = await this.groupsService.ensureMember(
            String(event.actorId),
            String(event.contextId),
        );
        const activeIds = new Set(
            group.memberIds.filter((recipientId) => recipientId !== String(event.actorId)),
        );
        return snapshot.filter((recipientId) => activeIds.has(recipientId));
    }

    /** Materializa estados por destinatário de forma idempotente. */
    private async ensureRecipientRows(
        notificationId: string,
        deliveredIds: string[],
        suppressedIds: string[],
        session?: ClientSession,
    ): Promise<void> {
        if (!this.recipientModel) return;
        const now = new Date();
        const operations = [
            ...deliveredIds.map((recipientId) => ({
                updateOne: {
                    filter: {
                        notificationId: new Types.ObjectId(notificationId),
                        recipientId: new Types.ObjectId(recipientId),
                    },
                    update: {
                        $setOnInsert: {
                            notificationId: new Types.ObjectId(notificationId),
                            recipientId: new Types.ObjectId(recipientId),
                            status: "DELIVERED",
                            deliveredAt: now,
                            migratedAsRead: false,
                        },
                    },
                    upsert: true,
                },
            })),
            ...suppressedIds.map((recipientId) => ({
                updateOne: {
                    filter: {
                        notificationId: new Types.ObjectId(notificationId),
                        recipientId: new Types.ObjectId(recipientId),
                    },
                    update: {
                        $setOnInsert: {
                            notificationId: new Types.ObjectId(notificationId),
                            recipientId: new Types.ObjectId(recipientId),
                            status: "SUPPRESSED",
                            migratedAsRead: false,
                        },
                    },
                    upsert: true,
                },
            })),
        ];
        if (operations.length > 0) {
            await this.recipientModel.bulkWrite(operations as never, {
                ordered: false,
                ...(session ? { session } : {}),
            });
        }
    }

    /**
     * Reaplica a audiência validada num retry de outbox. Um envelope criado
     * antes de uma falha parcial nunca materializa posteriormente linhas para
     * destinatários cuja membership entretanto deixou de ser válida.
     */
    private async reconcileRecipientRows(
        notificationId: string,
        deliveredIds: string[],
        suppressedIds: string[],
        session?: ClientSession,
    ): Promise<void> {
        if (!this.recipientModel) return;
        const retainedIds = [...deliveredIds, ...suppressedIds].map(
            (recipientId) => new Types.ObjectId(recipientId),
        );
        await this.recipientModel.deleteMany(
            {
                notificationId: new Types.ObjectId(notificationId),
                ...(retainedIds.length > 0
                    ? { recipientId: { $nin: retainedIds } }
                    : {}),
            },
            session ? { session } : undefined,
        );
        await this.ensureRecipientRows(
            notificationId,
            deliveredIds,
            suppressedIds,
            session,
        );
    }

    /** Atualiza apenas a linha pertencente ao utilizador autenticado. */
    private async updateRecipientState(
        actor: AuthenticatedUser,
        notificationId: string,
        update: Record<string, unknown>,
    ): Promise<NotificationInboxItemView> {
        if (!this.recipientModel || !Types.ObjectId.isValid(notificationId)) {
            throw this.notificationNotFound();
        }
        const row = await this.recipientModel
            .findOneAndUpdate(
                {
                    notificationId: new Types.ObjectId(notificationId),
                    recipientId: new Types.ObjectId(actor.id),
                    status: "DELIVERED",
                },
                update,
                { new: true },
            )
            .lean();
        if (!row) throw this.notificationNotFound();
        const notification = await this.notificationModel
            .findById(row.notificationId)
            .lean();
        if (!notification) throw this.notificationNotFound();
        return this.toInboxItem(notification, row.readAt ?? new Date());
    }

    /** Converte envelope e estado individual no contrato seguro da inbox. */
    private toInboxItem(
        notification: {
            _id?: unknown;
            contextType: string;
            contextId: unknown;
            type: string;
            title: string;
            body: string;
            targetPath?: string;
            createdAt?: Date;
        },
        readAt: Date | null,
    ): NotificationInboxItemView {
        return {
            id: String(notification._id),
            contextType: notification.contextType,
            contextId: String(notification.contextId),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            targetPath: notification.targetPath,
            createdAt: notification.createdAt,
            readAt,
        };
    }

    /** Mapeia o evento docente para a preferência apresentada ao aluno. */
    private preferenceContextForType(
        type: CreateContextNotificationDto["type"],
    ): NotificationContext {
        if (type === "FOLLOW_UP" || type === "FEEDBACK") {
            return NotificationContext.FOLLOW_UP;
        }
        if (type.startsWith("GUIDED_ROOM")) {
            return NotificationContext.GUIDED_ROOM;
        }
        if (
            type === "CLASS_PROJECT_PUBLISHED" ||
            type === "OFFICIAL_TEST_PUBLISHED" ||
            type === "OFFICIAL_TEST_CLOSED" ||
            type === "TASK"
        ) {
            return NotificationContext.ASSESSMENT;
        }
        if (
            type === "NEW_MATERIAL" ||
            type === "OFFICIAL_MATERIAL_AVAILABLE" ||
            type === "OFFICIAL_MATERIAL_UPDATED" ||
            type === "CLASS_POST_PUBLISHED" ||
            type === "AI_CONTENT_APPROVED" ||
            type === "AI_CONTENT_WITHDRAWN"
        ) {
            return NotificationContext.LEARNING_CONTENT;
        }
        return NotificationContext.CLASS_UPDATES;
    }

    /** Extrai apenas um código técnico seguro para observabilidade. */
    private publicErrorCode(error: unknown): string {
        const response = (error as { response?: { code?: unknown } })?.response;
        return typeof response?.code === "string"
            ? response.code.slice(0, 160)
            : error instanceof Error
              ? error.name.slice(0, 160)
              : "NOTIFICATION_DELIVERY_FAILED";
    }

    /** Backoff limitado: 5 s, 30 s, 2 min, 10 min e 1 h. */
    private retryDelayMs(attempts: number): number {
        const schedule = [5_000, 30_000, 120_000, 600_000, 3_600_000];
        return schedule[Math.min(schedule.length - 1, Math.max(0, attempts - 1))]!;
    }

    /** Mantém o fence académico e a entrega manual na mesma unidade de commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
    }

    private notificationNotFound(): NotFoundException {
        return new NotFoundException({
            code: "CONTEXT_NOTIFICATION_NOT_FOUND",
            message: "Notificação não encontrada.",
        });
    }

    /**
     * Resolve recipients no domínio de notificações contextuais, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async resolveRecipients(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<string[]> {
        if (input.contextType === "CLASS") {
            if (actor.role !== "TEACHER" && actor.role !== "ADMIN") {
                throw new ForbiddenException({
                    code: "TEACHER_ROLE_REQUIRED",
                    message: "Só professores podem notificar uma turma.",
                });
            }
            const schoolClass = await this.classesService.findOwnedActiveClass(
                actor.id,
                input.contextId,
            );
            return schoolClass.studentIds;
        }

        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Só alunos membros podem notificar um grupo.",
            });
        }
        const group = await this.groupsService.ensureMember(actor.id, input.contextId);
        return group.memberIds.filter((id) => id !== actor.id);
    }

    /**
     * Transforma o documento interno de notificações contextuais num contrato público, removendo detalhes de persistência antes de responder à UI.
     *
     * @param notification Valor de notification usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(notification: {
        _id?: unknown;
        contextType: string;
        contextId: unknown;
        actorId: unknown;
        type: string;
        title: string;
        body: string;
        recipientIds?: unknown[];
        suppressedRecipientIds?: unknown[];
        targetPath?: string;
        createdAt?: Date;
    }): ContextNotificationView {
        return {
            id: String(notification._id),
            contextType: notification.contextType,
            contextId: String(notification.contextId),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            recipientCount: notification.recipientIds?.length ?? 0,
            suppressedRecipientCount:
                notification.suppressedRecipientIds?.length ?? 0,
            targetPath: notification.targetPath,
            createdAt: notification.createdAt,
        };
    }
}
