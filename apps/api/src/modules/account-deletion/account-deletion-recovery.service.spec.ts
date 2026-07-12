/** Testes do reconciliador idempotente de eliminações interrompidas. */
import { AccountDeletionRecoveryService } from "./account-deletion-recovery.service.js";

describe("AccountDeletionRecoveryService", () => {
    it("reativa pendentes com nova geração sem tocar na outbox", async () => {
        const userModel = {
            updateMany: jest
                .fn()
                .mockResolvedValueOnce({ modifiedCount: 2 })
                .mockResolvedValueOnce({ modifiedCount: 0 }),
        };
        const service = new AccountDeletionRecoveryService(userModel as never);

        await expect(service.runOnce()).resolves.toEqual({
            compensatedAccounts: 2,
        });
        await expect(service.runOnce()).resolves.toEqual({
            compensatedAccounts: 0,
        });

        expect(userModel.updateMany).toHaveBeenCalledTimes(2);
        expect(userModel.updateMany).toHaveBeenCalledWith(
            { accountStatus: "DELETION_PENDING" },
            {
                $set: { accountStatus: "ACTIVE" },
                $unset: { deletionStartedAt: 1 },
                $inc: { sessionVersion: 1 },
            },
        );
    });

    it("faz o arranque falhar se não conseguir reconciliar Mongo", async () => {
        const service = new AccountDeletionRecoveryService({
            updateMany: jest.fn().mockRejectedValue(new Error("mongo unavailable")),
        } as never);

        await expect(service.onApplicationBootstrap()).rejects.toThrow(
            "mongo unavailable",
        );
    });
});
