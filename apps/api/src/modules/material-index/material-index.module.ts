/**
 * Regista providers, controllers e schemas necessários ao módulo de indexação textual de materiais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { MaterialIndexController } from "./material-index.controller.js";
import { MaterialIndexService } from "./material-index.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobSchema,
} from "./schemas/material-index-job.schema.js";

/**
 * Módulo de indexação textual básica.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: MaterialIndexJob.name, schema: MaterialIndexJobSchema },
        ]),
    ],
    controllers: [MaterialIndexController],
    providers: [MaterialIndexService],
    exports: [MaterialIndexService],
})
export class MaterialIndexModule {}
