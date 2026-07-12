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

