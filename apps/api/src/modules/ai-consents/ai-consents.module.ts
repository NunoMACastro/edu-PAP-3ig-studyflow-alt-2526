/**
 * Regista consentimentos IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AiConsentsController } from "./ai-consents.controller.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsent, AiConsentSchema } from "./schemas/ai-consent.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        MongooseModule.forFeature([{ name: AiConsent.name, schema: AiConsentSchema }]),
    ],
    controllers: [AiConsentsController],
    providers: [AiConsentsService],
    exports: [AiConsentsService],
})
export class AiConsentsModule {}
