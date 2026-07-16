/**
 * Regista providers, controllers e schemas necessários ao módulo de classes.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { NotificationOutboxModule } from "../context-notifications/notification-outbox.module.js";
import { StudentsModule } from "../students/students.module.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "../official-tests/schemas/official-test.schema.js";
import { ClassesController } from "./classes.controller.js";
import { ClassesService } from "./classes.service.js";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "./schemas/class-membership.schema.js";
import { SchoolClass, SchoolClassSchema } from "./schemas/school-class.schema.js";

/**
 * Módulo de turmas oficiais da MF1.
 */
@Module({
    imports: [
        AuthModule,
        NotificationOutboxModule,
        StudentsModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: SchoolClass.name, schema: SchoolClassSchema },
            { name: ClassMembership.name, schema: ClassMembershipSchema },
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
            { name: OfficialTest.name, schema: OfficialTestSchema },
        ]),
    ],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule {}
