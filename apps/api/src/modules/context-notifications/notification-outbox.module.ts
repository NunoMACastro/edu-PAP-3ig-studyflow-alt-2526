/** Módulo independente usado por domínios que apenas publicam eventos. */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationOutboxPublisher } from "./notification-outbox-publisher.service.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventSchema,
} from "./schemas/notification-outbox-event.schema.js";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: NotificationOutboxEvent.name,
                schema: NotificationOutboxEventSchema,
            },
        ]),
    ],
    providers: [NotificationOutboxPublisher],
    exports: [NotificationOutboxPublisher, MongooseModule],
})
export class NotificationOutboxModule {}
