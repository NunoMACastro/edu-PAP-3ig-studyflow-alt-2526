/**
 * Regista políticas de modelos IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AiModelPoliciesController } from "./ai-model-policies.controller.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { AiModelPolicy, AiModelPolicySchema } from "./schemas/ai-model-policy.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        MongooseModule.forFeature([{ name: AiModelPolicy.name, schema: AiModelPolicySchema }]),
    ],
    controllers: [AiModelPoliciesController],
    providers: [AiModelPoliciesService],
    exports: [AiModelPoliciesService],
})
export class AiModelPoliciesModule {}
