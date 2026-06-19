// apps/api/src/modules/ai-quotas/ai-quotas.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiQuotasController } from "./ai-quotas.controller.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { AiQuotaPolicy, AiQuotaPolicySchema } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageSchema } from "./schemas/ai-quota-usage.schema.js";

/**
 * Módulo de quotas e consumo IA.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: AiQuotaPolicy.name, schema: AiQuotaPolicySchema },
            { name: AiQuotaUsage.name, schema: AiQuotaUsageSchema },
        ]),
    ],
    controllers: [AiQuotasController],
    providers: [AiQuotasService],
    exports: [AiQuotasService],
})
export class AiQuotasModule {}