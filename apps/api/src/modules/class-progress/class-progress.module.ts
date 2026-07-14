/**
 * Regista providers, controllers e schemas necessários ao módulo de turma progress.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassPostsModule } from "../class-posts/class-posts.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { ClassProgressController } from "./class-progress.controller.js";
import { ClassProgressService } from "./class-progress.service.js";
import {
    ClassProgressNote,
    ClassProgressNoteSchema,
} from "./schemas/class-progress-note.schema.js";

/**
 * Módulo de painel de progresso da turma.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        ClassPostsModule,
        SubjectsModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        MongooseModule.forFeature([
            { name: ClassProgressNote.name, schema: ClassProgressNoteSchema },
        ]),
    ],
    controllers: [ClassProgressController],
    providers: [ClassProgressService],
    exports: [ClassProgressService],
})
export class ClassProgressModule {}
