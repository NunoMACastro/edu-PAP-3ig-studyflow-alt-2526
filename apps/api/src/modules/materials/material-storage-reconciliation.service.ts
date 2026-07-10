/**
 * Reconcilia o volume local de materiais com as referências MongoDB.
 */
import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Material, MaterialDocument } from "./schemas/material.schema.js";
import {
    MaterialStorageReconcileSummary,
    MaterialStorageService,
} from "./material-storage.service.js";

const DEFAULT_RECONCILE_INTERVAL_MS = 60_000;

/**
 * Runner single-instance. A limitação é intencional para o ambiente PAP local;
 * hosting horizontal deve substituir este storage por object storage partilhado.
 */
@Injectable()
export class MaterialStorageReconciliationService
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(
        MaterialStorageReconciliationService.name,
    );
    private timer?: NodeJS.Timeout;
    private running?: Promise<MaterialStorageReconcileSummary>;

    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly storage: MaterialStorageService,
    ) {}

    onApplicationBootstrap(): void {
        void this.runOnce().catch(() => undefined);
        const intervalMs = this.readInterval();
        this.timer = setInterval(() => {
            void this.runOnce().catch(() => undefined);
        }, intervalMs);
        this.timer.unref();
    }

    async onApplicationShutdown(): Promise<void> {
        if (this.timer) clearInterval(this.timer);
        await this.running?.catch(() => undefined);
    }

    /**
     * Executa uma passagem idempotente; chamadas sobrepostas partilham a mesma
     * Promise para não competir sobre ficheiros/outbox.
     */
    runOnce(): Promise<MaterialStorageReconcileSummary> {
        if (this.running) return this.running;
        this.running = this.reconcile().finally(() => {
            this.running = undefined;
        });
        return this.running;
    }

    private async reconcile(): Promise<MaterialStorageReconcileSummary> {
        const materials = await this.materialModel
            .find({ storageKey: { $exists: true, $ne: "" } })
            .select("storageKey")
            .lean();
        const summary = await this.storage.reconcile(
            materials
                .map((material) => material.storageKey)
                .filter((key): key is string => typeof key === "string"),
        );
        if (
            summary.committed > 0 ||
            summary.deleted > 0 ||
            summary.aborted > 0 ||
            summary.orphanFilesDeleted > 0 ||
            summary.staleStagingFilesDeleted > 0
        ) {
            this.logger.log(
                JSON.stringify({ event: "MATERIAL_STORAGE_RECONCILED", ...summary }),
            );
        }
        if (summary.invalidOutboxEntries > 0) {
            this.logger.error(
                JSON.stringify({
                    event: "MATERIAL_STORAGE_OUTBOX_INVALID",
                    count: summary.invalidOutboxEntries,
                }),
            );
        }
        return summary;
    }

    private readInterval(): number {
        const raw = process.env.MATERIALS_STORAGE_RECONCILE_INTERVAL_MS;
        const value = raw === undefined ? DEFAULT_RECONCILE_INTERVAL_MS : Number(raw);
        if (!Number.isSafeInteger(value) || value < 1_000) {
            throw new Error(
                "MATERIALS_STORAGE_RECONCILE_INTERVAL_MS deve ser inteiro >= 1000.",
            );
        }
        return value;
    }
}
