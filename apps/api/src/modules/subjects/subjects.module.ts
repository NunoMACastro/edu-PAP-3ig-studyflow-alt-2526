/**
 * Regista providers, controllers e schemas necessários ao módulo de subjects.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { NotificationOutboxModule } from "../context-notifications/notification-outbox.module.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "../official-tests/schemas/official-test.schema.js";
import { Subject, SubjectSchema } from "./schemas/subject.schema.js";
import { SubjectsController } from "./subjects.controller.js";
import { SubjectsService } from "./subjects.service.js";

/**
 * Módulo de disciplinas oficiais.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        NotificationOutboxModule,
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
            { name: OfficialTest.name, schema: OfficialTestSchema },
        ]),
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService],
})
export class SubjectsModule {}
