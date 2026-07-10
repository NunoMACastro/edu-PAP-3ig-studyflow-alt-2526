/** Testes do ciclo transacional e compensável de eliminação de conta. */
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AccountDeletionService } from "./account-deletion.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "student@example.test",
    role: "STUDENT",
};
const admin: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439011",
    email: "admin@example.test",
    role: "ADMIN",
};
const anonymousId = "507f1f77bcf86cd799439098";

describe("AccountDeletionService", () => {
    it("exige sessão atual para eliminar conta", async () => {
        const { service } = makeService();
        await expect(service.deleteMine(student)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it("bloqueia o último admin antes de preparar dados ou filesystem", async () => {
        const { personalDataRegistry, service, userModel } = makeService({
            role: "ADMIN",
        });
        userModel.countDocuments.mockResolvedValueOnce(1);

        await expect(service.deleteMine(admin, "session-1")).rejects.toBeInstanceOf(
            ConflictException,
        );
        expect(personalDataRegistry.prepareDeletion).not.toHaveBeenCalled();
        expect(personalDataRegistry.cancelDeletion).not.toHaveBeenCalled();
    });

    it("revoga antes do snapshot, elimina e devolve referência não associável", async () => {
        const {
            auditLogService,
            deletionModel,
            personalDataRegistry,
            sessionService,
            service,
            userModel,
        } = makeService();

        await expect(service.deleteMine(student, "session-1")).resolves.toMatchObject({
            deletionReference: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            ),
            deletedCounts: { materials: 2, studyAreas: 1, studyEvents: 3 },
            physicalFilesDeleted: 1,
            physicalFilesPending: 0,
            sessionRevoked: true,
        });

        expect(userModel.updateOne).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ accountStatus: "ACTIVE" }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    accountStatus: "DELETION_PENDING",
                    deletionStartedAt: expect.any(Date),
                }),
                $inc: { sessionVersion: 1 },
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(
            userModel.updateOne.mock.invocationCallOrder[0],
        ).toBeLessThan(
            personalDataRegistry.prepareDeletion.mock.invocationCallOrder[0],
        );
        expect(sessionService.destroySession.mock.invocationCallOrder[0]).toBeLessThan(
            personalDataRegistry.prepareDeletion.mock.invocationCallOrder[0],
        );
        expect(userModel.updateOne).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                accountStatus: "DELETION_PENDING",
                sessionVersion: 5,
            }),
            expect.objectContaining({
                $set: expect.objectContaining({ accountStatus: "DELETED" }),
                $unset: { deletionStartedAt: 1 },
                $inc: { sessionVersion: 1 },
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                action: "ACCOUNT_DELETED",
            }),
            expect.anything(),
        );
        const receipt = deletionModel.create.mock.calls[0]?.[0]?.[0];
        expect(receipt).toEqual(
            expect.objectContaining({
                reference: expect.any(String),
                expiresAt: new Date("2026-10-07T00:00:00Z"),
            }),
        );
        expect(receipt).not.toHaveProperty("userId");
        expect(personalDataRegistry.cancelDeletion).not.toHaveBeenCalled();
        expect(sessionService.destroySession).toHaveBeenCalledTimes(2);
    });

    it("reativa com nova geração quando prepare falha", async () => {
        const { personalDataRegistry, service, userModel } = makeService();
        personalDataRegistry.prepareDeletion.mockRejectedValueOnce(
            new Error("storage unavailable"),
        );

        await expect(service.deleteMine(student, "session-1")).rejects.toThrow(
            "storage unavailable",
        );
        expect(userModel.updateOne).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                accountStatus: "DELETION_PENDING",
                sessionVersion: 5,
            }),
            expect.objectContaining({
                $set: { accountStatus: "ACTIVE" },
                $unset: { deletionStartedAt: 1 },
                $inc: { sessionVersion: 1 },
            }),
        );
    });

    it("cancela outbox e reativa quando a transação final aborta", async () => {
        const { personalDataRegistry, service, userModel } = makeService();
        personalDataRegistry.applyDeletion.mockRejectedValueOnce(
            new Error("transaction aborted"),
        );

        await expect(service.deleteMine(student, "session-1")).rejects.toThrow(
            "transaction aborted",
        );
        expect(personalDataRegistry.cancelDeletion).toHaveBeenCalledTimes(1);
        expect(userModel.updateOne).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ accountStatus: "DELETION_PENDING" }),
            expect.objectContaining({ $set: { accountStatus: "ACTIVE" } }),
        );
        expect(personalDataRegistry.finalizeDeletion).not.toHaveBeenCalled();
    });

    it("preserva a outbox quando o commit ficou confirmado em Mongo mas a resposta foi ambígua", async () => {
        const {
            connection,
            personalDataRegistry,
            service,
            userModel,
        } = makeService();
        userModel.findById
            .mockReset()
            .mockResolvedValueOnce({
                role: "STUDENT",
                accountStatus: "ACTIVE",
                sessionVersion: 4,
            })
            .mockResolvedValueOnce({
                role: "STUDENT",
                accountStatus: "DELETION_PENDING",
                sessionVersion: 5,
            })
            .mockResolvedValueOnce({
                role: "STUDENT",
                accountStatus: "DELETED",
                sessionVersion: 6,
            });
        userModel.updateOne
            .mockReset()
            .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 })
            .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 })
            .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 });
        let transactionCount = 0;
        connection.transaction.mockImplementation(async (work) => {
            transactionCount += 1;
            const result = await work({ id: "transaction-session" });
            if (transactionCount === 2) {
                throw new Error("commit acknowledgement lost");
            }
            return result;
        });

        await expect(service.deleteMine(student, "session-1")).rejects.toThrow(
            "commit acknowledgement lost",
        );

        expect(personalDataRegistry.cancelDeletion).not.toHaveBeenCalled();
        expect(personalDataRegistry.finalizeDeletion).not.toHaveBeenCalled();
    });

    it("espera por mutações já autorizadas antes de marcar a conta pendente", async () => {
        const accountLifecycleBarrier = new AccountLifecycleBarrierService();
        const releaseMutation = accountLifecycleBarrier.enterMutation(student.id);
        const { service, userModel } = makeService({ accountLifecycleBarrier });

        const deletion = service.deleteMine(student, "session-1");
        await Promise.resolve();

        expect(userModel.findById).not.toHaveBeenCalled();
        expect(() => accountLifecycleBarrier.enterMutation(student.id)).toThrow(
            ConflictException,
        );

        releaseMutation();
        await expect(deletion).resolves.toMatchObject({ sessionRevoked: true });
        expect(userModel.findById).toHaveBeenCalled();
    });
});

function makeService(options: {
    role?: "STUDENT" | "ADMIN";
    accountLifecycleBarrier?: AccountLifecycleBarrierService;
} = {}) {
    const role = options.role ?? "STUDENT";
    const deletionModel = {
        create: jest.fn().mockResolvedValue([{ _id: "receipt" }]),
    };
    const userModel = {
        findById: jest
            .fn()
            .mockResolvedValueOnce({
                role,
                accountStatus: "ACTIVE",
                sessionVersion: 4,
            })
            .mockResolvedValue({
                role,
                accountStatus: "DELETION_PENDING",
                sessionVersion: 5,
            }),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
        countDocuments: jest.fn().mockResolvedValue(2),
        updateOne: jest
            .fn()
            .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };
    const sessionService = {
        destroySession: jest.fn().mockResolvedValue(undefined),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const connection = {
        collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        }),
        transaction: jest.fn(async (work) =>
            work({ id: "transaction-session" }),
        ),
    };
    const personalDataRegistry = {
        prepareDeletion: jest.fn().mockResolvedValue({
            registryVersion: "2026-07-10.1",
            subjectId: student.id,
            anonymousId,
            retentionReference: "6cb8daaf-758c-4389-923b-4ed3dac78998",
            materialIds: [],
            indexJobIds: [],
            storageOperations: [],
        }),
        applyDeletion: jest.fn().mockResolvedValue({
            registryVersion: "2026-07-10.1",
            affectedCounts: { Material: 2, StudyArea: 1, StudyEvent: 3 },
            retentionExpiresAt: new Date("2026-10-07T00:00:00Z"),
        }),
        finalizeDeletion: jest.fn().mockResolvedValue({
            physicalFilesDeleted: 1,
            physicalFilesPending: 0,
        }),
        cancelDeletion: jest.fn().mockResolvedValue(undefined),
    };
    const accountLifecycleBarrier = options.accountLifecycleBarrier ?? {
        runDeletionExclusive: jest.fn(
            async (_userId: string, work: () => Promise<unknown>) => work(),
        ),
    };

    return {
        auditLogService,
        connection,
        deletionModel,
        personalDataRegistry,
        sessionService,
        service: new AccountDeletionService(
            deletionModel as never,
            userModel as never,
            sessionService as never,
            auditLogService as never,
            connection as never,
            personalDataRegistry as never,
            accountLifecycleBarrier as never,
        ),
        userModel,
    };
}
