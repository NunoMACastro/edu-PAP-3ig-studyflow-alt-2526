// apps/api/src/modules/privacy-data-exports/privacy-data-exports.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { DataExportRequest, DataExportRequestSchema } from "./schemas/data-export-request.schema.js";
import { PrivacyDataExportsController } from "./privacy-data-exports.controller.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

/**
 * Módulo RGPD de exportação de dados pessoais.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([{ name: DataExportRequest.name, schema: DataExportRequestSchema }]),
    ],
    controllers: [PrivacyDataExportsController],
    providers: [PrivacyDataExportsService],
})
export class PrivacyDataExportsModule {}