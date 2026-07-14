/**
 * Publicador de eventos de notificação sem dependências de turmas ou de outros
 * domínios. Esta separação permite que ClassesModule publique eventos sem criar
 * um ciclo com ContextNotificationsModule.
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, type ClientSession, type Model } from "mongoose";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { ContextNotificationType } from "./schemas/context-notification.schema.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventDocument,
} from "./schemas/notification-outbox-event.schema.js";

export type PublishClassNotificationInput = {
    actorId: string;
    classId: string;
    recipientIds: string[];
    idempotencyKey: string;
    type: ContextNotificationType;
    title: string;
    body: string;
    targetPath?: string;
    preferenceContext: NotificationContext;
};

@Injectable()
export class NotificationOutboxPublisher {
    constructor(
        @InjectModel(NotificationOutboxEvent.name)
        private readonly outboxModel: Model<NotificationOutboxEventDocument>,
    ) {}

    /** Regista exatamente um evento para uma alteração de domínio confirmada. */
    async publishClassEvent(
        input: PublishClassNotificationInput,
        session?: ClientSession,
    ) {
        this.assertInput(input);
        return this.outboxModel.findOneAndUpdate(
            { idempotencyKey: input.idempotencyKey },
            {
                $setOnInsert: {
                    idempotencyKey: input.idempotencyKey,
                    actorId: new Types.ObjectId(input.actorId),
                    contextType: "CLASS",
                    contextId: new Types.ObjectId(input.classId),
                    type: input.type,
                    title: input.title.trim(),
                    body: input.body.trim(),
                    targetPath: input.targetPath,
                    recipientIdsSnapshot: Array.from(
                        new Set(input.recipientIds),
                    ).map((id) => new Types.ObjectId(id)),
                    preferenceContext: input.preferenceContext,
                    status: "PENDING",
                    attempts: 0,
                    availableAt: new Date(),
                },
            },
            { new: true, upsert: true, runValidators: true, session },
        );
    }

    private assertInput(input: PublishClassNotificationInput): void {
        const ids = [input.actorId, input.classId, ...input.recipientIds];
        if (ids.some((id) => !Types.ObjectId.isValid(id))) {
            throw new BadRequestException({
                code: "NOTIFICATION_OUTBOX_INVALID_REFERENCE",
                message: "A notificação contém uma referência inválida.",
            });
        }
        if (input.targetPath && !input.targetPath.startsWith("/app/")) {
            throw new BadRequestException({
                code: "NOTIFICATION_TARGET_PATH_INVALID",
                message: "O destino da notificação tem de pertencer à aplicação.",
            });
        }
    }
}
