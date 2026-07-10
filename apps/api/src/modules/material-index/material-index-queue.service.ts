/**
 * Runner Mongo recuperável de indexação privada.
 */
import {
    Inject,
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    ClaimedMaterialIndexJob,
    MaterialIndexJobView,
    MaterialIndexService,
} from "./material-index.service.js";

const DEFAULT_POLL_MS = 1_000;
const DEFAULT_LEASE_MS = 30_000;
const MATERIAL_INDEX_CONCURRENCY = 2;

export type MaterialIndexQueueInput = {
    actor: AuthenticatedUser;
    studyAreaId: string;
    materialId: string;
};

export type MaterialIndexQueuePort = Pick<
    MaterialIndexService,
    | "createQueuedPrivateJob"
    | "claimNextPrivateJob"
    | "processClaimedPrivateJob"
>;

/**
 * Não conserva actor/payload em memória. O job Mongo contém todos os IDs
 * necessários, e leases expirados voltam a ser reclamáveis após restart.
 */
@Injectable()
export class MaterialIndexQueueService
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(MaterialIndexQueueService.name);
    private readonly workerId = `material-index-${randomUUID()}`;
    private readonly active = new Set<Promise<void>>();
    private timer?: NodeJS.Timeout;
    private started = false;
    private shuttingDown = false;
    private cycleRunning = false;

    constructor(
        @Inject(MaterialIndexService)
        private readonly materialIndexService: MaterialIndexQueuePort,
    ) {}

    onApplicationBootstrap(): void {
        this.shuttingDown = false;
        this.started = true;
        this.timer = setInterval(() => void this.runCycle(), this.pollMs());
        this.timer.unref();
        void this.runCycle();
    }

    async onApplicationShutdown(): Promise<void> {
        this.shuttingDown = true;
        this.started = false;
        if (this.timer) clearInterval(this.timer);
        await Promise.allSettled([...this.active]);
    }

    /** Confirma que o runner iniciou e ainda aceita trabalho. */
    checkReady(): void {
        if (!this.started || this.shuttingDown) {
            throw new Error("Material index job runner is not ready.");
        }
    }

    async enqueuePrivateMaterial(
        input: MaterialIndexQueueInput,
    ): Promise<MaterialIndexJobView> {
        const queued = await this.materialIndexService.createQueuedPrivateJob(
            input.actor,
            input.studyAreaId,
            input.materialId,
        );
        if (this.started) void this.runCycle();
        return queued;
    }

    /**
     * Helper determinístico para testes e operação focada.
     */
    async runUntilIdle(maxJobs = 100): Promise<number> {
        let processed = 0;
        while (processed < maxJobs) {
            const claimed = await this.materialIndexService.claimNextPrivateJob(
                this.workerId,
                new Date(),
                this.leaseMs(),
            );
            if (!claimed) break;
            await this.materialIndexService.processClaimedPrivateJob(claimed);
            processed += 1;
        }
        return processed;
    }

    private async runCycle(): Promise<void> {
        if (!this.started || this.cycleRunning) return;
        this.cycleRunning = true;
        try {
            while (this.active.size < MATERIAL_INDEX_CONCURRENCY) {
                const claimed = await this.materialIndexService.claimNextPrivateJob(
                    this.workerId,
                    new Date(),
                    this.leaseMs(),
                );
                if (!claimed) break;
                this.startClaimed(claimed);
            }
        } catch {
            this.logger.error("Falha controlada no runner Mongo de indexação.");
        } finally {
            this.cycleRunning = false;
        }
    }

    private startClaimed(claimed: ClaimedMaterialIndexJob): void {
        const work = this.materialIndexService
            .processClaimedPrivateJob(claimed)
            .catch(() => {
                this.logger.error("Job reclamado terminou com falha controlada.");
            })
            .finally(() => {
                this.active.delete(work);
                if (this.started) void this.runCycle();
            });
        this.active.add(work);
    }

    private pollMs(): number {
        return this.readPositiveInteger(
            "MATERIAL_INDEX_JOB_POLL_MS",
            DEFAULT_POLL_MS,
        );
    }

    private leaseMs(): number {
        return this.readPositiveInteger(
            "MATERIAL_INDEX_JOB_LEASE_MS",
            DEFAULT_LEASE_MS,
        );
    }

    private readPositiveInteger(name: string, fallback: number): number {
        const raw = process.env[name];
        const value = raw === undefined ? fallback : Number(raw);
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error(`${name} deve ser um inteiro positivo.`);
        }
        return value;
    }
}
