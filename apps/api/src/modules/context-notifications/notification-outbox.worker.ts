/**
 * Worker leve da outbox de notificações.
 *
 * A base de dados é a fonte de verdade. O timer apenas acorda o processador;
 * leases Mongo permitem que várias instâncias concorram sem entregar o mesmo
 * evento duas vezes.
 */
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { ContextNotificationsService } from "./context-notifications.service.js";

@Injectable()
export class NotificationOutboxWorker implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NotificationOutboxWorker.name);
    private timer?: NodeJS.Timeout;
    private running = false;

    constructor(
        private readonly notificationsService: ContextNotificationsService,
    ) {}

    onModuleInit(): void {
        if (process.env.STUDYFLOW_DISABLE_NOTIFICATION_WORKER === "true") return;
        this.timer = setInterval(() => void this.tick(), 5_000);
        this.timer.unref();
        void this.tick();
    }

    onModuleDestroy(): void {
        if (this.timer) clearInterval(this.timer);
    }

    private async tick(): Promise<void> {
        if (this.running) return;
        this.running = true;
        try {
            await this.notificationsService.processOutboxBatch(20);
        } catch (error) {
            this.logger.error(
                "Falha ao processar a outbox de notificações.",
                error instanceof Error ? error.stack : undefined,
            );
        } finally {
            this.running = false;
        }
    }
}
