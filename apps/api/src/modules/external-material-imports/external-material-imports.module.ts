/**
 * Regista o modulo RF61 de importacao unidirecional de materiais externos.
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { ExternalMaterialImportsController } from "./external-material-imports.controller.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Modulo MF5 que liga o endpoint RF61 aos contratos de materiais ja existentes.
 */
@Module({
    imports: [AuthModule, MaterialsModule, OfficialMaterialsModule],
    controllers: [ExternalMaterialImportsController],
    providers: [ExternalMaterialImportsService],
})
export class ExternalMaterialImportsModule {}
