/**
 * Expoe a rota tecnica publica de health-check.
 */
import { Controller, Get } from "@nestjs/common";
import {
    HealthService,
    type HealthView,
    type ReadinessView,
} from "./health.service.js";

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
    describe(): Promise<ReadinessView> {
        return this.healthService.readiness();
    }

    /** Devolve apenas liveness do processo, sem depender de serviços externos. */
    @Get("live")
    live(): HealthView {
        return this.healthService.liveness();
    }

    /** Devolve readiness real e responde 503 quando uma dependência falha. */
    @Get("ready")
    ready(): Promise<ReadinessView> {
        return this.healthService.readiness();
    }
}
