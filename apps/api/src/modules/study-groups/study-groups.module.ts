/**
 * Regista providers, controllers e schemas necessários ao módulo de grupos de estudo.
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { StudyGroupsController } from "./study-groups.controller.js";
import { StudyGroupsService } from "./study-groups.service.js";

/**
 * Módulo MF3 de grupos de estudo.
 */
@Module({
    imports: [AuthModule, StudyRoomsModule],
    controllers: [StudyGroupsController],
    providers: [StudyGroupsService],
    exports: [StudyGroupsService],
})
export class StudyGroupsModule {}
