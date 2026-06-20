/**
 * Regista providers, controllers e schemas necessários ao módulo de material versions.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { MaterialVersionsController } from "./material-versions.controller.js";
import { MaterialVersionsService } from "./material-versions.service.js";
import {
    MaterialVersion,
    MaterialVersionSchema,
} from "./schemas/material-version.schema.js";

/**
 * Módulo de versionamento de materiais.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            { name: MaterialVersion.name, schema: MaterialVersionSchema },
        ]),
    ],
    controllers: [MaterialVersionsController],
    providers: [MaterialVersionsService],
})
export class MaterialVersionsModule {}
