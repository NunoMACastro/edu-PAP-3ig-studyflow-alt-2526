/**
 * Verifica no arranque os pré-requisitos necessários às transações e índices.
 */
import {
    Injectable,
    OnApplicationBootstrap,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection, Model } from "mongoose";

const INDEX_BUILD_CONCURRENCY = 4;

@Injectable()
export class PersistenceIntegrityService implements OnApplicationBootstrap {
    private ready = false;

    constructor(
        @InjectConnection() private readonly connection: Connection,
    ) {}

    /** Falha o arranque num Mongo standalone e materializa índices declarados. */
    async onApplicationBootstrap(): Promise<void> {
        const database = this.connection.db;
        if (!database) throw this.unavailable("MONGODB_NOT_CONNECTED");
        const hello = (await database.admin().command({ hello: 1 })) as {
            setName?: unknown;
            msg?: unknown;
        };
        if (typeof hello.setName !== "string" && hello.msg !== "isdbgrid") {
            throw this.unavailable("MONGODB_TRANSACTIONS_REQUIRED");
        }

        const models = Object.values(this.connection.models) as Model<unknown>[];
        await this.createDeclaredIndexes(models);
        this.ready = true;
    }

    /** Permite à readiness provar que topology e índices passaram no arranque. */
    checkReady(): void {
        if (!this.ready) throw this.unavailable("MONGODB_INTEGRITY_NOT_READY");
    }

    /**
     * Materializa índices com concorrência limitada.
     *
     * Cada modelo continua a concluir o seu próprio `createIndexes` antes de a
     * API ficar ready, mas coleções independentes deixam de bloquear o arranque
     * em série. Se uma criação falhar, nenhum worker inicia trabalho adicional;
     * as operações já em curso terminam antes de o bootstrap falhar fechado.
     */
    private async createDeclaredIndexes(models: Model<unknown>[]): Promise<void> {
        let nextModelIndex = 0;
        let failure: unknown;

        const worker = async (): Promise<void> => {
            while (failure === undefined) {
                const modelIndex = nextModelIndex;
                nextModelIndex += 1;
                if (modelIndex >= models.length) return;

                try {
                    await models[modelIndex].createIndexes();
                } catch (error) {
                    failure = error;
                }
            }
        };

        const workerCount = Math.min(INDEX_BUILD_CONCURRENCY, models.length);
        await Promise.all(
            Array.from({ length: workerCount }, () => worker()),
        );

        if (failure !== undefined) throw failure;
    }

    private unavailable(code: string): ServiceUnavailableException {
        return new ServiceUnavailableException({
            code,
            message:
                "MongoDB deve suportar transações e materializar os índices StudyFlow.",
        });
    }
}
