/**
 * Regista exportações RGPD de dados pessoais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { PersonalDataModule } from "../personal-data/personal-data.module.js";
import { PrivacyDataExportsController } from "./privacy-data-exports.controller.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";
import { DataExportRequest, DataExportRequestSchema } from "./schemas/data-export-request.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        PersonalDataModule,
        MongooseModule.forFeature([
            { name: DataExportRequest.name, schema: DataExportRequestSchema },
        ]),
    ],
    controllers: [PrivacyDataExportsController],
    providers: [PrivacyDataExportsService],
})
export class PrivacyDataExportsModule {}
