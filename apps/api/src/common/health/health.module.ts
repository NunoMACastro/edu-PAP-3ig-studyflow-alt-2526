/**
 * Regista o modulo tecnico de health-check da API.
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "../../modules/auth/auth.module.js";
import { MaterialsModule } from "../../modules/materials/materials.module.js";
import { AiModule } from "../../modules/ai/ai.module.js";
import { MaterialIndexModule } from "../../modules/material-index/material-index.module.js";
import { PersistenceIntegrityModule } from "../persistence/persistence-integrity.module.js";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

/**
 * Regista o endpoint tecnico de health-check da API.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        AiModule,
        MaterialIndexModule,
        PersistenceIntegrityModule,
    ],
    // Controller e service ficam juntos para o NestJS conseguir expor GET /api/health.
    controllers: [HealthController],
    providers: [HealthService],
})
export class HealthModule {}
