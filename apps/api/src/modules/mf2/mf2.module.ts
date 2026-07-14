/**
 * Regista providers, controllers e schemas necessários ao módulo de mf2.
 */
import { Module } from "@nestjs/common";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module.js";
import { ClassProgressModule } from "../class-progress/class-progress.module.js";
import { ClassProjectsModule } from "../class-projects/class-projects.module.js";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module.js";
import { MaterialContextsModule } from "../material-contexts/material-contexts.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { MaterialStructureModule } from "../material-structure/material-structure.module.js";
import { MaterialVersionsModule } from "../material-versions/material-versions.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { PrivateAreaAiModule } from "../private-area-ai/private-area-ai.module.js";
import { ProjectAiModule } from "../project-ai/project-ai.module.js";

/**
 * Módulo agregador dos BKs da MF2.
 */
@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        ClassProgressModule,
        MaterialIndexModule,
        MaterialStructureModule,
        MaterialVersionsModule,
        MaterialContextsModule,
        PrivateAreaAiModule,
    ],
})
export class Mf2Module {}
