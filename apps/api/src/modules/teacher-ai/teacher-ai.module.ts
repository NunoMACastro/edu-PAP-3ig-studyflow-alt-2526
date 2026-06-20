/**
 * Regista providers, controllers e schemas necessários ao módulo de voz da IA docente.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import {
    TeacherAiVoice,
    TeacherAiVoiceSchema,
} from "./schemas/teacher-ai-voice.schema.js";
import { TeacherAiVoiceController } from "./teacher-ai-voice.controller.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

/**
 * Módulo da voz IA docente.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: TeacherAiVoice.name, schema: TeacherAiVoiceSchema },
        ]),
    ],
    controllers: [TeacherAiVoiceController],
    providers: [TeacherAiVoiceService],
    exports: [TeacherAiVoiceService],
})
export class TeacherAiModule {}
