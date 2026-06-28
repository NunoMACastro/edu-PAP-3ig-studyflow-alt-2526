// apps/api/src/common/health/health.module.ts
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

/**
 * Regista o endpoint técnico de health-check da API.
 */
@Module({
    // Controller e service ficam juntos para o NestJS conseguir expor GET /api/health.
    controllers: [HealthController],
    providers: [HealthService],
})
export class HealthModule {}