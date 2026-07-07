/**
 * Regista providers, controllers e schemas necessários ao módulo de study áreas.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { HistoryModule } from "../study/history.module.js";
import {
    StudyArea,
    StudyAreaSchema,
} from "./schemas/study-area.schema.js";
import { StudyAreaVoiceController } from "./study-area-voice.controller.js";
import { StudyAreaVoiceService } from "./study-area-voice.service.js";
import { StudyAreasController } from "./study-areas.controller.js";
import { StudyAreasService } from "./study-areas.service.js";

/**
 * Módulo das áreas de estudo.
 */
@Module({
    imports: [
        AuthModule,
        HistoryModule,
        MongooseModule.forFeature([
            { name: StudyArea.name, schema: StudyAreaSchema },
        ]),
    ],
    controllers: [StudyAreasController, StudyAreaVoiceController],
    providers: [StudyAreasService, StudyAreaVoiceService],
    exports: [StudyAreasService, StudyAreaVoiceService],
})
export class StudyAreasModule {}
