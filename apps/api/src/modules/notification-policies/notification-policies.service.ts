/**
 * Implementa políticas administrativas de canais de notificação.
 */
import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import {
    ContextNotification,
    MANUAL_QUOTA_NOTIFICATION_TYPES,
} from "../context-notifications/schemas/context-notification.schema.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import {
    NotificationChannel,
    NotificationChannelPolicy,
    NotificationChannelPolicyDocument,
} from "./schemas/notification-channel-policy.schema.js";

/**
 * Service de políticas globais de notificação.
 */
@Injectable()
export class NotificationPoliciesService {
    /**
     * Recebe as dependências injetadas de NotificationPoliciesService para manter políticas de notificações testável e separado de detalhes externos.
     *
     * @param policyModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param notificationModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(NotificationChannelPolicy.name)
        private readonly policyModel: Model<NotificationChannelPolicyDocument>,
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotification>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Lista políticas apenas para admin.
     *
     * @param actor Utilizador autenticado.
     * @returns Políticas efetivas.
     */
    async list(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        const policies = await this.policyModel.find({}).sort({ channel: 1 }).lean();
        return ["IN_APP"].map((channel) => {
            const existing = policies.find((policy) => policy.channel === channel);
            return existing ?? this.defaultPolicy(channel as NotificationChannel);
        });
    }

    /**
     * Cria ou atualiza política de canal.
     *
     * @param actor Admin autenticado.
     * @param channel Canal alvo.
     * @param input Dados editáveis.
     * @returns Política persistida.
     */
    async upsert(actor: AuthenticatedUser, channel: NotificationChannel, input: UpsertNotificationPolicyDto) {
        this.assertAdmin(actor);
        if (channel !== "IN_APP") {
            throw new UnprocessableEntityException({
                code: "NOTIFICATION_CHANNEL_NOT_AVAILABLE",
                message: "Nesta versão, apenas o canal in-app está disponível.",
            });
        }
        const policy = await this.policyModel
            .findOneAndUpdate(
                { channel },
                { $set: input, $setOnInsert: { channel } },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "ADMIN",
            action: "NOTIFICATION_POLICY_UPDATED",
            resourceType: "NotificationChannelPolicy",
            resourceId: channel,
            result: "SUCCESS",
            metadata: { ...input },
        });
        return policy;
    }

    /**
     * Valida quota in-app antes de criar notificação.
     *
     * @param recipientIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param contextId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async assertWithinQuota(recipientIds: string[], contextId: string): Promise<void> {
        const policy = await this.getInAppPolicy();
        this.assertPolicyEnabled(policy);

        const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sinceHour = new Date(Date.now() - 60 * 60 * 1000);
        const recipientObjectIds = recipientIds.map((id) => new Types.ObjectId(id));
        const [perContextHour, overQuotaRecipients] = await Promise.all([
            this.notificationModel.countDocuments({
                contextId: new Types.ObjectId(contextId),
                type: { $in: MANUAL_QUOTA_NOTIFICATION_TYPES },
                createdAt: { $gte: sinceHour },
            }),
            recipientObjectIds.length === 0
                ? Promise.resolve([])
                : this.notificationModel.aggregate([
                      {
                          $match: {
                              recipientIds: { $in: recipientObjectIds },
                              type: { $in: MANUAL_QUOTA_NOTIFICATION_TYPES },
                              createdAt: { $gte: sinceDay },
                          },
                      },
                      { $unwind: "$recipientIds" },
                      { $match: { recipientIds: { $in: recipientObjectIds } } },
                      { $group: { _id: "$recipientIds", count: { $sum: 1 } } },
                      { $match: { count: { $gte: policy.maxPerUserPerDay } } },
                      { $limit: 1 },
                  ]),
        ]);

        if (perContextHour >= policy.maxPerContextPerHour || overQuotaRecipients.length > 0) {
            throw new HttpException({
                code: "NOTIFICATION_QUOTA_EXCEEDED",
                message: "A quota de notificações foi excedida.",
            }, HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    /**
     * Valida apenas a disponibilidade global do canal.
     *
     * Eventos automáticos continuam a respeitar o canal e as preferências do
     * destinatário, mas não podem ser perdidos por uma quota anti-spam manual.
     */
    async assertChannelEnabled(): Promise<void> {
        this.assertPolicyEnabled(await this.getInAppPolicy());
    }

    /**
     * Valida a regra de políticas de notificações e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    /** Obtém a política efetiva do único canal suportado nesta versão. */
    private async getInAppPolicy() {
        return (
            (await this.policyModel.findOne({ channel: "IN_APP" }).lean()) ??
            this.defaultPolicy("IN_APP")
        );
    }

    /** Reutiliza a semântica de canal desativado em fluxos manuais e automáticos. */
    private assertPolicyEnabled(policy: { enabled: boolean }): void {
        if (!policy.enabled) {
            throw new ForbiddenException({
                code: "NOTIFICATION_CHANNEL_DISABLED",
                message: "O canal de notificações in-app está desativado.",
            });
        }
    }

    /**
     * Executa default policy no domínio de políticas de notificações, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param channel Valor de channel usado pela função para executar default policy com dados explícitos.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    private defaultPolicy(channel: NotificationChannel) {
        return {
            channel,
            enabled: channel === "IN_APP",
            maxPerUserPerDay: 20,
            maxPerContextPerHour: 50,
        };
    }
}
