/**
 * Regista providers, controllers e schemas necessários ao módulo de navegação curricular.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { CurriculumNavigationController } from "./curriculum-navigation.controller.js";
import { CurriculumNavigationService } from "./curriculum-navigation.service.js";
import {
    CurriculumNavigationLog,
    CurriculumNavigationLogSchema,
} from "./schemas/curriculum-navigation-log.schema.js";

/**
 * Módulo MF3 de navegação curricular.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            {
                name: CurriculumNavigationLog.name,
                schema: CurriculumNavigationLogSchema,
            },
        ]),
    ],
    controllers: [CurriculumNavigationController],
    providers: [CurriculumNavigationService],
})
export class CurriculumNavigationModule {}
