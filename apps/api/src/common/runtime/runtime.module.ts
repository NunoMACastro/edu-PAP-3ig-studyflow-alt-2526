// apps/api/src/common/runtime/runtime.module.ts
import { Module } from "@nestjs/common";
import { RuntimeController } from "./runtime.controller.js";
import { RuntimeInstanceService } from "./runtime-instance.service.js";

/**
 * Agrupa o endpoint técnico de runtime sem misturar regras de domínio StudyFlow.
 */
@Module({
    controllers: [RuntimeController],
    providers: [RuntimeInstanceService],
})
export class RuntimeModule {}