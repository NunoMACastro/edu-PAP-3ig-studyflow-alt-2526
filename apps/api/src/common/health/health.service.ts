/**
 * Calcula a resposta publica minima do health-check da API.
 */
import { Injectable } from "@nestjs/common";
import type { AvailabilityBudgetResult } from "../operations/availability-budget.js";
import { evaluateAvailabilityBudget } from "../operations/availability-budget.js";

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
 * Calcula a resposta publica de saude da API StudyFlow.
 */
@Injectable()
export class HealthService {
    /**
     * Devolve metadados minimos para smoke tests de deploy e rollback.
     *
     * @returns Estado tecnico seguro da API.
     */
    describe(): HealthView {
        return this.getStatus();
    }

    /**
     * Junta o estado de runtime com o orcamento mensal de disponibilidade.
     *
     * @returns Estado publico da API, sem dados pessoais nem segredos.
     */
    getStatus(): HealthView {
        const releaseVersion = process.env.STUDYFLOW_RELEASE_VERSION?.trim();
        const downtimeMinutes = readMonthlyDowntimeMinutes(
            process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES,
        );
        const availability = evaluateAvailabilityBudget(downtimeMinutes);

        // O estado fica agregado: ajuda a operacao sem mostrar alunos, turmas, materiais ou configuracao interna.
        return {
            status: availability.status === "BREACHED" ? "degraded" : "ok",
            uptimeSeconds: Math.floor(process.uptime()),
            version:
                releaseVersion && releaseVersion.length > 0
                    ? releaseVersion
                    : DEFAULT_RELEASE_VERSION,
            availability,
        };
    }
}

/**
 * Le o downtime mensal vindo do ambiente de execucao.
 *
 * @param rawValue Valor textual opcional com minutos mensais de downtime.
 * @returns Minutos validos para `evaluateAvailabilityBudget(...)`.
 */
function readMonthlyDowntimeMinutes(rawValue: string | undefined): number {
    if (!rawValue || rawValue.trim().length === 0) {
        return DEFAULT_DOWNTIME_MINUTES;
    }

    const parsedValue = Number(rawValue);
    // Uma configuracao invalida nunca deve aparecer na resposta publica do health-check.
    return Number.isFinite(parsedValue) && parsedValue >= 0
        ? parsedValue
        : DEFAULT_DOWNTIME_MINUTES;
}
