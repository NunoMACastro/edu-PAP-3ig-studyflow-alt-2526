// real_dev/api/src/modules/external-material-imports/external-material-imports.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { ExternalMaterialImportsController } from "./external-material-imports.controller.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Regista a importação externa RF61 e reutiliza os módulos de materiais já existentes.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
    ],
    controllers: [ExternalMaterialImportsController],
    providers: [ExternalMaterialImportsService],
})
export class ExternalMaterialImportsModule {}