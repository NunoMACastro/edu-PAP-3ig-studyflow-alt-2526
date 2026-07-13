/** Testa o gate de transações e índices sem abrir sockets. */
import { PersistenceIntegrityService } from "./persistence-integrity.service.js";

describe("PersistenceIntegrityService", () => {
    it("cria índices e fica ready num replica set", async () => {
        const createIndexes = jest.fn().mockResolvedValue(undefined);
        const service = new PersistenceIntegrityService({
            db: {
                admin: () => ({
                    command: jest.fn().mockResolvedValue({ setName: "studyflow-rs" }),
                }),
            },
            models: { User: { createIndexes } },
        } as never);

        await service.onApplicationBootstrap();

        expect(createIndexes).toHaveBeenCalledTimes(1);
        expect(() => service.checkReady()).not.toThrow();
    });

    it("materializa índices de modelos independentes em paralelo", async () => {
        let releaseFirstIndex!: () => void;
        let releaseSecondIndex!: () => void;
        const firstIndex = new Promise<void>((resolve) => {
            releaseFirstIndex = resolve;
        });
        const secondIndex = new Promise<void>((resolve) => {
            releaseSecondIndex = resolve;
        });
        const firstCreateIndexes = jest.fn().mockReturnValue(firstIndex);
        const secondCreateIndexes = jest.fn().mockReturnValue(secondIndex);
        const service = new PersistenceIntegrityService({
            db: {
                admin: () => ({
                    command: jest.fn().mockResolvedValue({ setName: "studyflow-rs" }),
                }),
            },
            models: {
                User: { createIndexes: firstCreateIndexes },
                Subject: { createIndexes: secondCreateIndexes },
            },
        } as never);

        const bootstrap = service.onApplicationBootstrap();
        await Promise.resolve();
        await Promise.resolve();

        expect(firstCreateIndexes).toHaveBeenCalledTimes(1);
        expect(secondCreateIndexes).toHaveBeenCalledTimes(1);

        releaseFirstIndex();
        releaseSecondIndex();
        await bootstrap;
        expect(() => service.checkReady()).not.toThrow();
    });

    it("falha fechada num Mongo standalone", async () => {
        const service = new PersistenceIntegrityService({
            db: {
                admin: () => ({ command: jest.fn().mockResolvedValue({ ok: 1 }) }),
            },
            models: {},
        } as never);

        await expect(service.onApplicationBootstrap()).rejects.toMatchObject({
            response: { code: "MONGODB_TRANSACTIONS_REQUIRED" },
        });
        expect(() => service.checkReady()).toThrow();
    });
});
