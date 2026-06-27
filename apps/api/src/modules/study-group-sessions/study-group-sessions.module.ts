/**
 * Regista providers, controllers e schemas necessários ao módulo de sessões de estudo em grupo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "./schemas/study-group-session.schema.js";
import { StudyGroupSessionsController } from "./study-group-sessions.controller.js";
import { StudyGroupSessionsService } from "./study-group-sessions.service.js";

/**
 * Módulo MF3 de sessões coletivas.
 */
@Module({
    imports: [
        AuthModule,
        StudyGroupsModule,
        MongooseModule.forFeature([
            { name: StudyGroupSession.name, schema: StudyGroupSessionSchema },
        ]),
    ],
    controllers: [StudyGroupSessionsController],
    providers: [StudyGroupSessionsService],
    exports: [StudyGroupSessionsService],
})
export class StudyGroupSessionsModule {}
