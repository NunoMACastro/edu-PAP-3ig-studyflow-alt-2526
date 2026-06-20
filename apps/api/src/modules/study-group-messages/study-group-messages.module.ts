/**
 * Regista providers, controllers e schemas necessários ao módulo de mensagens de grupos de estudo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "./schemas/study-group-message.schema.js";
import { StudyGroupMessagesController } from "./study-group-messages.controller.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

/**
 * Módulo MF3 para chat e notas coletivas.
 */
@Module({
    imports: [
        AuthModule,
        StudyGroupsModule,
        MongooseModule.forFeature([
            { name: StudyGroupMessage.name, schema: StudyGroupMessageSchema },
        ]),
    ],
    controllers: [StudyGroupMessagesController],
    providers: [StudyGroupMessagesService],
})
export class StudyGroupMessagesModule {}
