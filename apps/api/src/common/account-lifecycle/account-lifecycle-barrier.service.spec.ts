/** Testes concorrentes da barreira local de ciclo de vida da conta. */
import { ConflictException } from "@nestjs/common";
import { AccountLifecycleBarrierService } from "./account-lifecycle-barrier.service.js";

describe("AccountLifecycleBarrierService", () => {
    it("espera pela mutação em voo e recusa novas mutações durante o delete", async () => {
        const service = new AccountLifecycleBarrierService();
        const releaseMutation = service.enterMutation("user-1");
        const exclusiveWork = jest.fn().mockResolvedValue("deleted");

        const deletion = service.runDeletionExclusive("user-1", exclusiveWork);
        await Promise.resolve();

        expect(exclusiveWork).not.toHaveBeenCalled();
        expect(() => service.enterMutation("user-1")).toThrow(
            ConflictException,
        );

        releaseMutation();
        await expect(deletion).resolves.toBe("deleted");
        expect(exclusiveWork).toHaveBeenCalledTimes(1);

        const releaseAfterDeletion = service.enterMutation("user-1");
        expect(() => releaseAfterDeletion()).not.toThrow();
        expect(() => releaseAfterDeletion()).not.toThrow();
    });

    it("não bloqueia mutações de outro utilizador", async () => {
        const service = new AccountLifecycleBarrierService();
        const releaseFirstUser = service.enterMutation("user-1");

        await expect(
            service.runDeletionExclusive("user-2", async () => "deleted"),
        ).resolves.toBe("deleted");

        releaseFirstUser();
    });

    it("recusa duas eliminações simultâneas da mesma conta", async () => {
        const service = new AccountLifecycleBarrierService();
        let finishFirst!: () => void;
        const first = service.runDeletionExclusive(
            "user-1",
            () => new Promise<void>((resolve) => (finishFirst = resolve)),
        );
        await Promise.resolve();

        await expect(
            service.runDeletionExclusive("user-1", async () => undefined),
        ).rejects.toBeInstanceOf(ConflictException);

        finishFirst();
        await first;
    });
});
