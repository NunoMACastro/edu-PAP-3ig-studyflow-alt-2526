/**
 * Regista providers, controllers e schemas necessários ao módulo de salas de estudo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import { RoomAiController } from "./room-ai.controller.js";
import { RoomAiService } from "./room-ai.service.js";
import { RoomSharesController } from "./room-shares.controller.js";
import { RoomSharesService } from "./room-shares.service.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "./schemas/room-ai-interaction.schema.js";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema.js";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema.js";
import { StudyRoomsController } from "./study-rooms.controller.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Módulo acumulativo de salas da MF1.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: RoomAiInteraction.name, schema: RoomAiInteractionSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController, RoomAiController],
    providers: [StudyRoomsService, RoomSharesService, RoomAiService],
    exports: [StudyRoomsService, RoomSharesService],
})
export class StudyRoomsModule {}
