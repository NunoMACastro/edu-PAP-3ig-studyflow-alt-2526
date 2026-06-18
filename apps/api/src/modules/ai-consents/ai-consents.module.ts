// apps/api/src/modules/ai-consents/ai-consents.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiConsentsController } from "./ai-consents.controller.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsent, AiConsentSchema } from "./schemas/ai-consent.schema.js";

/**
 * Módulo de consentimentos IA.
 */
@Module({
    imports: [AuthModule, MongooseModule.forFeature([{ name: AiConsent.name, schema: AiConsentSchema }])],
    controllers: [AiConsentsController],
    providers: [AiConsentsService],
    exports: [AiConsentsService],
})
export class AiConsentsModule {}