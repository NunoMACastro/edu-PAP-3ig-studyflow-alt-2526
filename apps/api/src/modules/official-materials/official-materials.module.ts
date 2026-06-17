/**
 * Regista providers, controllers e schemas necessários ao módulo de materiais oficiais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialMaterialsController } from "./official-materials.controller.js";
import { OfficialMaterialsService } from "./official-materials.service.js";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "./schemas/official-material.schema.js";

/**
 * Módulo de materiais oficiais de disciplina.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
        ]),
    ],
    controllers: [OfficialMaterialsController],
    providers: [OfficialMaterialsService],
    exports: [OfficialMaterialsService],
})
export class OfficialMaterialsModule {}
