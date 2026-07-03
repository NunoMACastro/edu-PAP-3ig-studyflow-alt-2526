/**
 * Regista quotas e consumo IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AiQuotasController } from "./ai-quotas.controller.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { AiQuotaPolicy, AiQuotaPolicySchema } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageSchema } from "./schemas/ai-quota-usage.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
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
