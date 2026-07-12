/**
 * Regista providers, controllers e schemas necessários ao módulo de materiais oficiais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import {
    OfficialMaterialFilesController,
    OfficialMaterialsController,
    StudentOfficialMaterialsController,
} from "./official-materials.controller.js";
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
        AuditLogModule,
        SubjectsModule,
        ContextNotificationsModule,
        MaterialsModule,
        MongooseModule.forFeature([
            { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
        ]),
    ],
    controllers: [
        OfficialMaterialsController,
        StudentOfficialMaterialsController,
        OfficialMaterialFilesController,
    ],
    providers: [OfficialMaterialsService],
    exports: [OfficialMaterialsService],
})
export class OfficialMaterialsModule {}
