/**
 * Serializa mutações HTTP autenticadas com a eliminação da mesma conta.
 *
 * A barreira é deliberadamente in-memory porque o deployment suportado é uma
 * única instância local. O estado persistido `DELETION_PENDING` continua a ser
 * a defesa fail-closed perante restart ou acesso fora do processo.
 */
import { ConflictException, Injectable } from "@nestjs/common";

type UserBarrierState = {
    activeMutations: number;
    deletionRequested: boolean;
    resolveIdle?: () => void;
};

export type AccountMutationLease = () => void;

/**
 * Read/write barrier por utilizador: mutações normais são leitores e a
 * eliminação é o escritor exclusivo.
 */
@Injectable()
export class AccountLifecycleBarrierService {
    private readonly states = new Map<string, UserBarrierState>();

    /**
     * Regista uma mutação autenticada até o respetivo handler terminar.
     * Pedidos que chegam depois de uma eliminação ter sido pedida falham antes
     * de executar lógica de domínio.
     */
    enterMutation(userId: string): AccountMutationLease {
        const state = this.getOrCreateState(userId);
        if (state.deletionRequested) {
            throw new ConflictException({
                code: "ACCOUNT_DELETION_IN_PROGRESS",
                message: "A eliminação da conta já está em curso.",
            });
        }

        state.activeMutations += 1;
        let released = false;
        return () => {
            if (released) return;
            released = true;
            state.activeMutations -= 1;
            if (state.activeMutations === 0) {
                state.resolveIdle?.();
                state.resolveIdle = undefined;
                this.removeIdleState(userId, state);
            }
        };
    }

    /**
     * Bloqueia novas mutações, espera pelas já autorizadas e executa a
     * eliminação em exclusividade. O `finally` liberta apenas a barreira local;
     * Mongo `DELETION_PENDING` mantém a conta bloqueada quando aplicável.
     */
    async runDeletionExclusive<T>(
        userId: string,
        work: () => Promise<T>,
    ): Promise<T> {
        const state = this.getOrCreateState(userId);
        if (state.deletionRequested) {
            throw new ConflictException({
                code: "ACCOUNT_DELETION_IN_PROGRESS",
                message: "A eliminação da conta já está em curso.",
            });
        }

        state.deletionRequested = true;
        try {
            if (state.activeMutations > 0) {
                await new Promise<void>((resolve) => {
                    state.resolveIdle = resolve;
                });
            }
            return await work();
        } finally {
            state.deletionRequested = false;
            state.resolveIdle = undefined;
            this.removeIdleState(userId, state);
        }
    }

    private getOrCreateState(userId: string): UserBarrierState {
        const existing = this.states.get(userId);
        if (existing) return existing;
        const created: UserBarrierState = {
            activeMutations: 0,
            deletionRequested: false,
        };
        this.states.set(userId, created);
        return created;
    }

    private removeIdleState(userId: string, state: UserBarrierState): void {
        if (state.activeMutations === 0 && !state.deletionRequested) {
            this.states.delete(userId);
        }
    }
}
