/**
 * Calcula a resposta publica minima do health-check da API.
 */
import {
    Inject,
    Injectable,
    Optional,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import {
    SESSION_REDIS,
} from "../../modules/auth/session.service.js";
import type { SessionStore } from "../../modules/auth/session-store.js";
import { MaterialStorageService } from "../../modules/materials/material-storage.service.js";
import { QuizGenerationJobsService } from "../../modules/ai/quiz-generation-jobs.service.js";
import { MaterialIndexQueueService } from "../../modules/material-index/material-index-queue.service.js";
import type { AvailabilityBudgetResult } from "../operations/availability-budget.js";
import { evaluateAvailabilityBudget } from "../operations/availability-budget.js";
import { PersistenceIntegrityService } from "../persistence/persistence-integrity.service.js";

export type HealthStatus = "ok" | "degraded";

export type HealthView = {
    service: "studyflow-api";
    status: HealthStatus;
    uptimeSeconds: number;
    version: string;
    availability: AvailabilityBudgetResult;
};

export type ReadinessView = HealthView & {
    status: "ok";
    dependencies: {
        mongodb: "ok";
        redis: "ok";
        storage: "ok";
        jobs: "ok";
    };
};

const DEFAULT_RELEASE_VERSION = "dev";
const DEFAULT_DOWNTIME_MINUTES = 0;

/**
 * Calcula a resposta publica de saude da API StudyFlow.
 */
@Injectable()
export class HealthService {
    constructor(
        @Optional() @InjectConnection() private readonly connection?: Connection,
        @Optional()
        @Inject(SESSION_REDIS)
        private readonly redis?: SessionStore,
        @Optional()
        private readonly materialStorage?: MaterialStorageService,
        @Optional()
        private readonly materialIndexQueue?: MaterialIndexQueueService,
        @Optional()
        private readonly quizGenerationJobs?: QuizGenerationJobsService,
        @Optional()
        private readonly persistenceIntegrity?: PersistenceIntegrityService,
    ) {}

    /**
     * Devolve metadados minimos para smoke tests de deploy e rollback.
     *
     * @returns Estado tecnico seguro da API.
     */
    liveness(): HealthView {
        return this.getStatus();
    }

    /**
     * Executa probes reais com timeout curto e falha fechada para o processo de
     * release local e para o Playwright.
     */
    async readiness(): Promise<ReadinessView> {
        if (
            !this.connection?.db ||
            !this.redis ||
            !this.materialStorage ||
            !this.materialIndexQueue ||
            !this.quizGenerationJobs ||
            !this.persistenceIntegrity
        ) {
            throw this.notReady(["dependency-not-injected"]);
        }
        const probes = await Promise.allSettled([
            withTimeout(this.connection.db.command({ ping: 1 }), 1_500),
            withTimeout(this.redis.ping(), 1_500),
            withTimeout(this.materialStorage.checkReady(), 1_500),
            Promise.resolve().then(() => this.materialIndexQueue?.checkReady()),
            Promise.resolve().then(() => this.quizGenerationJobs?.checkReady()),
            Promise.resolve().then(() => this.persistenceIntegrity?.checkReady()),
        ]);
        const failed = ["mongodb", "redis", "storage", "material-jobs", "quiz-jobs", "mongodb-integrity"].filter(
            (_name, index) => probes[index].status === "rejected",
        );
        if (failed.length > 0) throw this.notReady(failed);

        return {
            ...this.getStatus(),
            status: "ok",
            dependencies: {
                mongodb: "ok",
                redis: "ok",
                storage: "ok",
                jobs: "ok",
            },
        };
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
            service: "studyflow-api",
            status: availability.status === "BREACHED" ? "degraded" : "ok",
            uptimeSeconds: Math.floor(process.uptime()),
            version:
                releaseVersion && releaseVersion.length > 0
                    ? releaseVersion
                    : DEFAULT_RELEASE_VERSION,
            availability,
        };
    }

    private notReady(failed: string[]): ServiceUnavailableException {
        return new ServiceUnavailableException({
            service: "studyflow-api",
            status: "not_ready",
            failed,
        });
    }
}

/** Aplica um orçamento estrito a probes que não aceitam AbortSignal. */
async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
        return await Promise.race([
            operation,
            new Promise<never>((_resolve, reject) => {
                timer = setTimeout(
                    () => reject(new Error("READINESS_TIMEOUT")),
                    timeoutMs,
                );
                timer.unref();
            }),
        ]);
    } finally {
        if (timer) clearTimeout(timer);
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
