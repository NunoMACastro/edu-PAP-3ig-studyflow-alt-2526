/**
 * Implementa as regras de negócio de preferências de notificação e concentra validações do domínio.
 */
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    NotificationContext,
    UpdateNotificationPreferencesDto,
} from "./dto/update-notification-preferences.dto.js";
import {
    NotificationPreference,
    NotificationPreferenceDocument,
} from "./schemas/notification-preference.schema.js";

/**
 * Vista pública de preferências de notificação, sem detalhes internos de Mongoose.
 */
export type NotificationPreferenceView = {
    _id?: string;
    context: NotificationContext;
    email: boolean;
    push: boolean;
    inApp: boolean;
    updatedAt?: Date;
};

const DEFAULT_CHANNELS = {
    email: false,
    push: false,
    inApp: true,
};

/**
 * Serviço de preferências de notificação por contexto.
 */
@Injectable()
export class NotificationPreferencesService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param preferenceModel Modelo Mongoose injetado para ler e persistir preferências de notificação.
     */
    constructor(
        @InjectModel(NotificationPreference.name)
        private readonly preferenceModel: Model<NotificationPreferenceDocument>,
    ) {}

    /**
     * Lista preferências efetivas, preenchendo defaults dos contextos ausentes.
     *
     * @param userId Utilizador autenticado.
     * @returns Preferências por contexto.
     */
    async listEffective(userId: string): Promise<NotificationPreferenceView[]> {
        const preferences = await this.preferenceModel
            .find({ userId: new Types.ObjectId(userId) })
            .lean();
        const byContext = new Map(
            preferences.map((preference) => [preference.context, preference]),
        );
        return Object.values(NotificationContext).map((context) => {
            const existing = byContext.get(context);
            return existing
                ? this.toPreferenceView(existing)
                : { context, ...DEFAULT_CHANNELS };
        });
    }

    /**
     * Atualiza ou cria uma preferência do utilizador autenticado.
     *
     * @param userId Utilizador autenticado.
     * @param input Canais por contexto.
     * @returns Preferência persistida.
     */
    async upsert(
        userId: string,
        input: UpdateNotificationPreferencesDto,
    ): Promise<NotificationPreferenceView> {
        if (input.email || input.push) {
            throw new UnprocessableEntityException({
                code: "NOTIFICATION_CHANNEL_NOT_AVAILABLE",
                message: "Nesta versão, apenas as notificações dentro da aplicação estão disponíveis.",
            });
        }
        const preference = await this.preferenceModel
            .findOneAndUpdate(
                {
                    userId: new Types.ObjectId(userId),
                    context: input.context,
                },
                {
                    $set: {
                        email: false,
                        push: false,
                        inApp: input.inApp,
                    },
                    $setOnInsert: {
                        userId: new Types.ObjectId(userId),
                        context: input.context,
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toPreferenceView(preference);
    }

    /**
     * Indica se um alerta in-app deve ser mostrado para o contexto.
     *
     * @param userId Utilizador autenticado.
     * @param context Contexto consultado.
     * @returns `true` quando o canal app está ativo.
     */
    async isInAppEnabled(
        userId: string,
        context: NotificationContext,
    ): Promise<boolean> {
        const preference = await this.preferenceModel
            .findOne({ userId: new Types.ObjectId(userId), context })
            .lean();
        return preference?.inApp ?? DEFAULT_CHANNELS.inApp;
    }

    /**
     * Remove campos internos da preferência.
     *
     * @param preference Documento ou objeto lean.
     * @returns Preferência pública.
     */
    private toPreferenceView(preference: {
        _id?: unknown;
        context: NotificationContext;
        email: boolean;
        push: boolean;
        inApp: boolean;
        updatedAt?: Date;
    }): NotificationPreferenceView {
        return {
            _id: preference._id ? String(preference._id) : undefined,
            context: preference.context,
            email: preference.email,
            push: preference.push,
            inApp: preference.inApp,
            updatedAt: preference.updatedAt,
        };
    }
}
