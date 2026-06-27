/**
 * Regista providers, controllers e schemas necessários ao módulo de materials.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { HistoryModule } from "../study/history.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { MaterialStorageService } from "./material-storage.service.js";
import { MaterialsController } from "./materials.controller.js";
import { MaterialsService } from "./materials.service.js";
import { Material, MaterialSchema } from "./schemas/material.schema.js";

/**
 * Módulo de materiais da MF0.
 */
@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        HistoryModule,
        StudyAreasModule,
        MongooseModule.forFeature([
            { name: Material.name, schema: MaterialSchema },
        ]),
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService, MaterialStorageService],
    exports: [MaterialsService],
})
export class MaterialsModule {}
