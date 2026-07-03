// apps/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts
/**
 * Regista a fachada de explicações adaptadas.
 */
import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AdaptiveExplanationsController } from "./adaptive-explanations.controller.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

/**
 * Módulo que liga autenticação, IA e endpoint público de explicações adaptadas.
 */
@Module({
    imports: [AuthModule, AiModule],
    controllers: [AdaptiveExplanationsController],
    providers: [AdaptiveExplanationsService],
})
export class AdaptiveExplanationsModule {}