/**
 * Regista providers, controllers e schemas necessários ao módulo de adaptive explanations.
 */
import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AdaptiveExplanationsController } from "./adaptive-explanations.controller.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

/**
 * Módulo MF3 que expõe o endpoint recomendado para explicações adaptadas.
 */
@Module({
    imports: [AuthModule, AiModule],
    controllers: [AdaptiveExplanationsController],
    providers: [AdaptiveExplanationsService],
})
export class AdaptiveExplanationsModule {}
