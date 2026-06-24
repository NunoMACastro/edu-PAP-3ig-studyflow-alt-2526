// apps/api/src/common/runtime/runtime.controller.ts
import { Controller, Get } from "@nestjs/common";
import { RuntimeInstanceService } from "./runtime-instance.service.js";

/**
 * Endpoint técnico seguro para verificar se há mais do que uma instância ativa.
 */
@Controller("api/runtime")
export class RuntimeController {
    constructor(private readonly runtime: RuntimeInstanceService) {}

    @Get("instance")
    instance() {
        // A resposta ajuda a validar balanceamento sem revelar sessões ou cookies.
        return this.runtime.describe();
    }
}