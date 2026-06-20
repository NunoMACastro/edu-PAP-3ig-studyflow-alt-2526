/**
 * Regista providers, controllers e schemas necessários ao módulo de material contexts.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { MaterialContextsController } from "./material-contexts.controller.js";
import { MaterialContextsService } from "./material-contexts.service.js";
import {
    MaterialContext,
    MaterialContextSchema,
} from "./schemas/material-context.schema.js";

/**
 * Módulo de contextos autorizados de materiais.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: MaterialContext.name, schema: MaterialContextSchema },
        ]),
    ],
    controllers: [MaterialContextsController],
    providers: [MaterialContextsService],
})
export class MaterialContextsModule {}
