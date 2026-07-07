/**
 * Expoe a rota tecnica publica de health-check.
 */
import { Controller, Get } from "@nestjs/common";
import { HealthService, type HealthView } from "./health.service.js";

/**
 * Expoe uma rota tecnica minima para confirmar que a API StudyFlow responde.
 */
@Controller("api/health")
export class HealthController {
    /**
     * Recebe as dependências injetadas de HealthController para manter health check testável e separado de detalhes externos.
     *
     * @param healthService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(private readonly healthService: HealthService) {}

    /**
     * Devolve o estado publico da API.
     *
     * @returns Metadados minimos para deploy, rollback e smoke HTTP.
     */
    @Get()
    describe(): HealthView {
        // A rota e publica para funcionar antes do login, mas nunca devolve dados pessoais.
        return this.healthService.describe();
    }
}
