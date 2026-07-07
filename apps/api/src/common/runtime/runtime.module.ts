/**
 * Regista providers e controllers de diagnóstico operacional.
 */
import { Module } from "@nestjs/common";
import { RuntimeController } from "./runtime.controller.js";
import { RuntimeInstanceService } from "./runtime-instance.service.js";

/**
 * Módulo técnico sem dependências de domínio, usado por smoke tests.
 */
@Module({
    controllers: [RuntimeController],
    providers: [RuntimeInstanceService],
})
export class RuntimeModule {}
