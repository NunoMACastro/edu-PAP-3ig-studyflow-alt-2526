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
        for (const model of models) {
            await model.createIndexes();
        }
        this.ready = true;
    }

    /** Permite à readiness provar que topology e índices passaram no arranque. */
    checkReady(): void {
        if (!this.ready) throw this.unavailable("MONGODB_INTEGRITY_NOT_READY");
    }

    private unavailable(code: string): ServiceUnavailableException {
        return new ServiceUnavailableException({
            code,
            message:
                "MongoDB deve suportar transações e materializar os índices StudyFlow.",
        });
    }
}

