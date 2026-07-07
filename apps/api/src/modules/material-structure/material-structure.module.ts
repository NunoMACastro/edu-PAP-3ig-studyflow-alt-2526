/**
 * Regista providers, controllers e schemas necessários ao módulo de material structure.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { MaterialStructureController } from "./material-structure.controller.js";
import { MaterialStructureService } from "./material-structure.service.js";
import {
    MaterialStructure,
    MaterialStructureSchema,
} from "./schemas/material-structure.schema.js";

/**
 * Módulo de estruturação de materiais indexados.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            { name: MaterialStructure.name, schema: MaterialStructureSchema },
        ]),
    ],
    controllers: [MaterialStructureController],
    providers: [MaterialStructureService],
})
export class MaterialStructureModule {}
