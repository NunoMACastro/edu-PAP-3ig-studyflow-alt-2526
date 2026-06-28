// apps/api/src/common/health/health.service.ts
import { Injectable } from "@nestjs/common";
import {
    AvailabilityBudgetResult,
    evaluateAvailabilityBudget,
} from "../operations/availability-budget.js";

export type HealthStatus = "ok" | "degraded";

export type HealthView = {
    status: HealthStatus;
    uptimeSeconds: number;
    version: string;
    availability: AvailabilityBudgetResult;
};

const DEFAULT_RELEASE_VERSION = "dev";
const DEFAULT_DOWNTIME_MINUTES = 0;

/**
 * Calcula a resposta pública de saúde da API StudyFlow.
 */
@Injectable()
export class HealthService {
    /**
     * Devolve metadados mínimos para smoke tests de deploy e rollback.
     *
     * @returns Estado técnico seguro da API.
     */
    describe(): HealthView {
        return this.getStatus();
    }

    /**
     * Junta o estado de runtime com o orçamento mensal de disponibilidade.
     *
     * @returns Estado público da API, sem dados pessoais nem segredos.
     */
    getStatus(): HealthView {
        const releaseVersion = process.env.STUDYFLOW_RELEASE_VERSION?.trim();
        const downtimeMinutes = readMonthlyDowntimeMinutes(
            process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES,
        );
        const availability = evaluateAvailabilityBudget(downtimeMinutes);

        // O estado fica agregado: ajuda a operação sem mostrar alunos, turmas, materiais ou configuração interna.
        return {
            status: availability.status === "BREACHED" ? "degraded" : "ok",
            uptimeSeconds: Math.floor(process.uptime()),
            // A versão pública ajuda a defender que release está ativa sem mostrar variáveis internas.
            version:
                releaseVersion && releaseVersion.length > 0
                    ? releaseVersion
                    : DEFAULT_RELEASE_VERSION,
            availability,
        };
    }
}

/**
 * Lê o downtime mensal vindo do ambiente de execução.
 *
 * @param rawValue Valor textual opcional com minutos mensais de downtime.
 * @returns Minutos válidos para `evaluateAvailabilityBudget(...)`.
 */
function readMonthlyDowntimeMinutes(rawValue: string | undefined): number {
    if (!rawValue || rawValue.trim().length === 0) {
        return DEFAULT_DOWNTIME_MINUTES;
    }

    const parsedValue = Number(rawValue);
    // Uma configuração inválida nunca deve aparecer na resposta pública do health-check.
    return Number.isFinite(parsedValue) && parsedValue >= 0
        ? parsedValue
        : DEFAULT_DOWNTIME_MINUTES;
}