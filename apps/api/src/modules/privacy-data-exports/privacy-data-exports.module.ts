/**
 * Regista exportações RGPD de dados pessoais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import {
    NotificationPreference,
    NotificationPreferenceSchema,
} from "../notification-preferences/schemas/notification-preference.schema.js";
import { StudyArea, StudyAreaSchema } from "../study-areas/schemas/study-area.schema.js";
import { PrivacyDataExportsController } from "./privacy-data-exports.controller.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";
import { DataExportRequest, DataExportRequestSchema } from "./schemas/data-export-request.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        MongooseModule.forFeature([
            { name: DataExportRequest.name, schema: DataExportRequestSchema },
            { name: User.name, schema: UserSchema },
            { name: StudyArea.name, schema: StudyAreaSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
        ]),
    ],
    controllers: [PrivacyDataExportsController],
    providers: [PrivacyDataExportsService],
})
export class PrivacyDataExportsModule {}
