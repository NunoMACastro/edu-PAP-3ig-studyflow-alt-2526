/**
 * Regista providers, controllers e schemas necessários ao módulo de revisão docente de conteúdos IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { AiContentReviewsController } from "./ai-content-reviews.controller.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";
import {
    AiContentReview,
    AiContentReviewSchema,
} from "./schemas/ai-content-review.schema.js";

/**
 * Módulo de revisão docente de conteúdo IA.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        OfficialMaterialsModule,
        MongooseModule.forFeature([
            { name: AiContentReview.name, schema: AiContentReviewSchema },
        ]),
    ],
    controllers: [AiContentReviewsController],
    providers: [AiContentReviewsService],
    exports: [AiContentReviewsService],
})
export class AiContentReviewsModule {}
