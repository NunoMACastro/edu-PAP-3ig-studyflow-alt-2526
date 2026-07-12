/** Testes do relógio de heartbeat partilhado pelos runners Mongo. */
import {
    executeWithMongoLeaseHeartbeat,
    MongoLeaseLostError,
} from "./mongo-lease-heartbeat.js";

describe("executeWithMongoLeaseHeartbeat", () => {
    it("renova durante trabalho demorado e confirma o lease antes de devolver", async () => {
        const heartbeat = jest.fn().mockResolvedValue(true);

        await expect(
            executeWithMongoLeaseHeartbeat({
                leaseMs: 30,
                heartbeat,
                operation: () => new Promise((resolve) => setTimeout(() => resolve("ok"), 35)),
            }),
        ).resolves.toBe("ok");

        expect(heartbeat.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it("não entrega o resultado quando um heartbeat perde o token", async () => {
        const heartbeat = jest
            .fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValue(true);

        await expect(
            executeWithMongoLeaseHeartbeat({
                leaseMs: 30,
                heartbeat,
                operation: () => new Promise((resolve) => setTimeout(resolve, 20)),
            }),
        ).rejects.toBeInstanceOf(MongoLeaseLostError);
    });
});
