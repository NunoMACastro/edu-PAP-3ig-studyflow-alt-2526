/**
 * Implementa eliminação/anonymização de conta própria.
 */
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import type { Connection, Model } from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { SessionService } from "../auth/session.service.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { PersonalDataRegistryService } from "../personal-data/personal-data-registry.service.js";
import { AccountDeletionRequest, AccountDeletionRequestDocument } from "./schemas/account-deletion-request.schema.js";

/**
 * Serviço da operação destrutiva de conta.
 */
@Injectable()
export class AccountDeletionService {
    /**
     * Recebe as dependências injetadas de AccountDeletionService para manter eliminação de conta testável e separado de detalhes externos.
     *
     * @param deletionModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param userModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param sessionService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param connection Ligação Mongoose usada para eliminar e anonimizar atomicamente.
     * @param personalDataRegistry Registry central de documentos e ficheiros pessoais.
     * @param accountLifecycleBarrier Barreira local que drena mutações já autorizadas antes do delete.
     */
    constructor(
        @InjectModel(AccountDeletionRequest.name)
        private readonly deletionModel: Model<AccountDeletionRequestDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly sessionService: SessionService,
        private readonly auditLogService: AuditLogService,
        @InjectConnection() private readonly connection: Connection,
        private readonly personalDataRegistry: PersonalDataRegistryService,
        private readonly accountLifecycleBarrier: AccountLifecycleBarrierService,
    ) {}

    /**
     * Elimina dados pessoais próprios, anonimiza a conta e revoga a sessão.
     *
     * @param actor Utilizador autenticado.
     * @param sessionId Sessão atual a destruir.
     * @returns Contadores removidos.
     */
    async deleteMine(actor: AuthenticatedUser, sessionId?: string) {
        if (!sessionId) {
            throw new ForbiddenException({
                code: "SESSION_REQUIRED",
                message: "Sessão inválida para eliminar conta.",
            });
        }
        return this.accountLifecycleBarrier.runDeletionExclusive(actor.id, () =>
            this.executeDeletion(actor, sessionId),
        );
    }

    /** Executa o fluxo apenas depois de todas as mutações anteriores terminarem. */
    private async executeDeletion(
        actor: AuthenticatedUser,
        sessionId: string,
    ) {
        const userObjectId = new Types.ObjectId(actor.id);
        const pendingSessionVersion = await this.markDeletionPending(userObjectId);

        // O estado DELETION_PENDING e a nova geração revogam todas as sessões
        // antes de qualquer snapshot ou intenção de filesystem ser preparado.
        await this.destroySessionBestEffort(sessionId);

        let plan;
        try {
            plan = await this.personalDataRegistry.prepareDeletion(actor.id);
        } catch (error) {
            await this.compensateFailedDeletion(
                userObjectId,
                pendingSessionVersion,
            );
            throw error;
        }

        const deletionReference = randomUUID();
        let result;
        try {
            result = await this.connection.transaction(async (session) => {
                const account = await this.userModel.findById(
                    userObjectId,
                    null,
                    { session },
                );
                if (
                    !account ||
                    account.accountStatus !== "DELETION_PENDING" ||
                    account.sessionVersion !== pendingSessionVersion
                ) {
                    throw new ForbiddenException({
                        code: "ACCOUNT_DELETION_STATE_CHANGED",
                        message: "O estado da eliminação de conta foi alterado.",
                    });
                }

                // O evento nasce na mesma transação e é imediatamente
                // anonimizado/associado a TTL pelo registry abaixo.
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "PRIVACY",
                        action: "ACCOUNT_DELETED",
                        resourceType: "User",
                        resourceId: actor.id,
                        result: "SUCCESS",
                    },
                    session,
                );

                const personalDataDeletion =
                    await this.personalDataRegistry.applyDeletion(plan, session);
                const deletedCounts = {
                    materials: personalDataDeletion.affectedCounts.Material ?? 0,
                    studyAreas: personalDataDeletion.affectedCounts.StudyArea ?? 0,
                    studyEvents:
                        personalDataDeletion.affectedCounts.StudyEvent ?? 0,
                };

                const userUpdate = await this.userModel.updateOne(
                    {
                        _id: userObjectId,
                        accountStatus: "DELETION_PENDING",
                        sessionVersion: pendingSessionVersion,
                    },
                    {
                        $set: {
                            email: `deleted-${plan.anonymousId}@studyflow.local`,
                            passwordHash: "deleted-account",
                            authProvider: "local",
                            role: "STUDENT",
                            accountStatus: "DELETED",
                            deletedAt: new Date(),
                        },
                        $unset: { deletionStartedAt: 1 },
                        $inc: { sessionVersion: 1 },
                    },
                    { session },
                );
                if (userUpdate.matchedCount !== 1) {
                    throw new ForbiddenException({
                        code: "ACCOUNT_DELETION_STATE_CHANGED",
                        message: "O estado da eliminação de conta foi alterado.",
                    });
                }

                await this.deletionModel.create(
                    [
                        {
                            reference: deletionReference,
                            deletedCounts:
                                personalDataDeletion.affectedCounts,
                            expiresAt:
                                personalDataDeletion.retentionExpiresAt,
                        },
                    ],
                    { session },
                );

                return {
                    deletionReference,
                    deletedCounts,
                    affectedCounts: personalDataDeletion.affectedCounts,
                    registryVersion: personalDataDeletion.registryVersion,
                    retentionExpiresAt:
                        personalDataDeletion.retentionExpiresAt,
                };
            });
        } catch (error) {
            await this.compensateFailedDeletion(
                userObjectId,
                pendingSessionVersion,
                plan,
            );
            throw error;
        }

        const storageDeletion =
            await this.personalDataRegistry.finalizeDeletion(plan);

        // A geração persistida já revogou todas as sessões; remover a chave
        // atual reduz também o lixo no Redis sem tornar o delete dependente dele.
        await this.destroySessionBestEffort(sessionId);

        return {
            ...result,
            ...storageDeletion,
            sessionRevoked: true,
        };
    }

    /** Torna a revogação visível antes de preparar dados ou filesystem. */
    private async markDeletionPending(userObjectId: Types.ObjectId): Promise<number> {
        return this.connection.transaction(async (session) => {
            const account = await this.userModel.findById(userObjectId, null, {
                session,
            });
            if (!account || account.accountStatus !== "ACTIVE") {
                throw new ForbiddenException({
                    code: "ACCOUNT_NOT_ACTIVE",
                    message: "A conta já não está ativa.",
                });
            }

            if (account.role === "ADMIN") {
                const activeAdmins = {
                    role: "ADMIN" as const,
                    accountStatus: "ACTIVE" as const,
                };
                await this.connection.collection("studyflow_invariants").updateOne(
                    { _id: "active-admin-sentinel" as never },
                    { $inc: { version: 1 }, $set: { kind: "ACTIVE_ADMIN" } },
                    { upsert: true, session },
                );
                await this.userModel.updateMany(
                    activeAdmins,
                    { $inc: { roleInvariantVersion: 1 } },
                    { session },
                );
                const adminCount = await this.userModel.countDocuments(
                    activeAdmins,
                    { session },
                );
                if (adminCount <= 1) {
                    throw new ConflictException({
                        code: "LAST_ADMIN_REQUIRED",
                        message: "Não podes eliminar o último administrador.",
                    });
                }
            }

            const currentSessionVersion = Number.isSafeInteger(
                account.sessionVersion,
            )
                ? account.sessionVersion
                : 0;
            const pendingSessionVersion = currentSessionVersion + 1;
            const update = await this.userModel.updateOne(
                { _id: userObjectId, accountStatus: "ACTIVE" },
                {
                    $set: {
                        accountStatus: "DELETION_PENDING",
                        deletionStartedAt: new Date(),
                    },
                    $inc: { sessionVersion: 1 },
                },
                { session },
            );
            if (update.matchedCount !== 1) {
                throw new ForbiddenException({
                    code: "ACCOUNT_NOT_ACTIVE",
                    message: "A conta já não está ativa.",
                });
            }
            return pendingSessionVersion;
        });
    }

    /**
     * Reativa a conta apenas se ainda for exatamente a operação pendente que
     * falhou. A nova geração mantém revogadas as sessões anteriores.
     */
    private async compensateFailedDeletion(
        userObjectId: Types.ObjectId,
        pendingSessionVersion: number,
        plan?: Awaited<ReturnType<PersonalDataRegistryService["prepareDeletion"]>>,
    ): Promise<void> {
        const failures: unknown[] = [];
        let accountCompensated = false;
        try {
            const update = await this.userModel.updateOne(
                {
                    _id: userObjectId,
                    accountStatus: "DELETION_PENDING",
                    sessionVersion: pendingSessionVersion,
                },
                {
                    $set: { accountStatus: "ACTIVE" },
                    $unset: { deletionStartedAt: 1 },
                    $inc: { sessionVersion: 1 },
                },
            );
            if (update.matchedCount === 1) {
                accountCompensated = true;
            } else {
                const current = await this.userModel.findById(userObjectId);
                if (current?.accountStatus === "DELETED") {
                    // Um resultado de commit ambíguo não pode apagar a outbox:
                    // o reconciliador irá concluir o delete físico após o commit.
                    return;
                }
                if (
                    current?.accountStatus === "ACTIVE" &&
                    current.sessionVersion > pendingSessionVersion
                ) {
                    accountCompensated = true;
                } else {
                    failures.push(new Error("Estado pendente não foi compensado."));
                }
            }
        } catch (error) {
            failures.push(error);
        }

        // Só remove intenções de filesystem depois de Mongo estar novamente
        // ACTIVE. Se esta etapa falhar ou o processo cair, a outbox e as
        // referências Mongo preservadas tornam a repetição segura.
        if (plan && accountCompensated) {
            try {
                await this.personalDataRegistry.cancelDeletion(plan);
            } catch (error) {
                failures.push(error);
            }
        }

        if (failures.length > 0) {
            throw new ServiceUnavailableException({
                code: "ACCOUNT_DELETION_COMPENSATION_FAILED",
                message: "A eliminação falhou e requer reconciliação do operador.",
            });
        }
    }

    private async destroySessionBestEffort(sessionId: string): Promise<void> {
        try {
            await this.sessionService.destroySession(sessionId);
        } catch {
            // DELETION_PENDING/DELETED + sessionVersion já revogam a sessão no
            // Mongo; Redis é apenas limpeza imediata da chave opaca.
        }
    }
}
