// apps/api/src/common/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { HealthService, HealthView } from "./health.service.js";

/**
 * Expõe uma rota técnica mínima para confirmar que a API StudyFlow responde.
 */
@Controller("api/health")
export class HealthController {
    /**
     * @param healthService Service que produz a resposta pública segura.
     */
    constructor(private readonly healthService: HealthService) {}

    /**
     * Devolve o estado público da API.
     *
     * @returns Metadados mínimos para deploy, rollback e smoke HTTP.
     */
    @Get()
    describe(): HealthView {
        // A rota é pública para funcionar antes do login, mas nunca devolve dados pessoais.
        return this.healthService.describe();
    }
}