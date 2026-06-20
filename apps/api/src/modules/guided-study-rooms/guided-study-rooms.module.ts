/**
 * Regista providers, controllers e schemas necessários ao módulo de salas de estudo guiado.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { GuidedStudyRoomsController } from "./guided-study-rooms.controller.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "./schemas/guided-study-room.schema.js";

/**
 * Módulo das salas de estudo guiado da MF2.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        MongooseModule.forFeature([
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
        ]),
    ],
    controllers: [GuidedStudyRoomsController],
    providers: [GuidedStudyRoomsService],
    exports: [GuidedStudyRoomsService],
})
export class GuidedStudyRoomsModule {}
