/**
 * Regista providers, controllers e schemas necessários ao módulo de preferências de notificação.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationPreferencesController } from "./notification-preferences.controller.js";
import { NotificationPreferencesService } from "./notification-preferences.service.js";
import {
    NotificationPreference,
    NotificationPreferenceSchema,
} from "./schemas/notification-preference.schema.js";

/**
 * Módulo MF3 de preferências de notificação.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: NotificationPreference.name,
                schema: NotificationPreferenceSchema,
            },
        ]),
    ],
    controllers: [NotificationPreferencesController],
    providers: [NotificationPreferencesService],
    exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
