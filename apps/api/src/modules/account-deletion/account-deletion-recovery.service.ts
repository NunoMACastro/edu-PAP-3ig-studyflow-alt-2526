/** Recupera eliminações interrompidas antes da transação destrutiva final. */
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { User, UserDocument } from "../auth/schemas/user.schema.js";

export type AccountDeletionRecoverySummary = {
    compensatedAccounts: number;
};

/**
 * Reconciliador de arranque idempotente.
 *
 * Um `DELETION_PENDING` persistido prova que a transação destrutiva não chegou
 * a marcar a conta como `DELETED`. Como o plano de ficheiros não é persistido
 * como um job retomável, a opção segura é reativar a conta, incrementar de novo
 * a geração de sessão e deixar a outbox intacta. As referências Mongo ainda
 * existentes impedem o reconciliador de storage de apagar esses ficheiros.
 */
@Injectable()
export class AccountDeletionRecoveryService
    implements OnApplicationBootstrap
{
    private readonly logger = new Logger(AccountDeletionRecoveryService.name);

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.runOnce();
    }

    /** Compensa todas as contas ainda pendentes numa atualização atómica. */
    async runOnce(): Promise<AccountDeletionRecoverySummary> {
        const result = await this.userModel.updateMany(
            { accountStatus: "DELETION_PENDING" },
            {
                $set: { accountStatus: "ACTIVE" },
                $unset: { deletionStartedAt: 1 },
                $inc: { sessionVersion: 1 },
            },
        );
        const compensatedAccounts = result.modifiedCount ?? 0;
        if (compensatedAccounts > 0) {
            this.logger.warn(
                JSON.stringify({
                    event: "ACCOUNT_DELETION_PENDING_COMPENSATED",
                    count: compensatedAccounts,
                }),
            );
        }
        return { compensatedAccounts };
    }
}
