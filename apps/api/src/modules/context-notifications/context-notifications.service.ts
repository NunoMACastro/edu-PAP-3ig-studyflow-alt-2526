/**
 * Implementa notificações internas para turmas e grupos.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { NotificationPoliciesService } from "../notification-policies/notification-policies.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";
import { ContextNotification, ContextNotificationDocument } from "./schemas/context-notification.schema.js";

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
    createdAt?: Date;
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
    ) {}

    /**
     * Cria uma notificação e calcula destinatários no backend.
     *
     * @param actor Utilizador autenticado.
     * @param input Dados da notificação.
     * @returns Notificação persistida.
     */
    async create(actor: AuthenticatedUser, input: CreateContextNotificationDto) {
        const recipientIds = await this.resolveRecipients(actor, input);
        return this.createForResolvedRecipients(actor, input, recipientIds);
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

        return this.createForResolvedRecipients(actor, input, uniqueRecipientIds);
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
        input: CreateContextNotificationDto,
        recipientIds: string[],
    ) {
        const context = input.contextType === "CLASS" ? NotificationContext.STUDY_GOAL : NotificationContext.GROUP_SESSION;
        const enabledPairs = await Promise.all(
            recipientIds.map(async (id) => ({
                id,
                enabled: await this.preferencesService.isInAppEnabled(id, context),
            })),
        );
        const finalRecipients = enabledPairs.filter((pair) => pair.enabled).map((pair) => pair.id);
        const suppressed = enabledPairs.filter((pair) => !pair.enabled).map((pair) => pair.id);
        await this.policiesService.assertWithinQuota(finalRecipients, input.contextId);

        const notification = await this.notificationModel.create({
            contextType: input.contextType,
            contextId: new Types.ObjectId(input.contextId),
            actorId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
            body: input.body.trim(),
            recipientIds: finalRecipients.map((id) => new Types.ObjectId(id)),
            suppressedRecipientIds: suppressed.map((id) => new Types.ObjectId(id)),
        });

        await this.auditLogService.record({
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
        });
        return this.toView(notification.toObject());
    }

    /**
     * Lista notificações visíveis ao utilizador autenticado.
     *
     * @param actor Utilizador autenticado.
     * @returns Notificações recebidas ou criadas.
     */
    async list(actor: AuthenticatedUser) {
        const actorId = new Types.ObjectId(actor.id);
        const notifications = await this.notificationModel
            .find({ $or: [{ actorId }, { recipientIds: actorId }] })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return notifications.map((notification) => this.toView(notification));
    }

    /**
     * Resolve resolve recipients no domínio de notificações contextuais, aplicando validações, autorização e persistência de forma coesa.
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
            const schoolClass = await this.classesService.findOwnedClass(actor.id, input.contextId);
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
            createdAt: notification.createdAt,
        };
    }
}
