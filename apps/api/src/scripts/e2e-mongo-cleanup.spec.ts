/**
 * Testa o cleanup do Mongo efémero sem arrancar processos externos.
 */
import { stopE2eMongoSafely } from "./e2e-mongo-cleanup.js";

describe("stopE2eMongoSafely", () => {
    it("confirma uma paragem normal", async () => {
        const stop = jest.fn().mockResolvedValue(undefined);

        await expect(stopE2eMongoSafely({ stop })).resolves.toBe(true);
        expect(stop).toHaveBeenCalledTimes(1);
    });

    it("tolera ECONNREFUSED numa causa aninhada quando o processo já terminou", async () => {
        const stop = jest.fn().mockRejectedValue(
            Object.assign(new Error("falha técnica sanitizada"), {
                cause: Object.assign(new Error("socket encerrado"), {
                    code: "ECONNREFUSED",
                }),
            }),
        );

        await expect(stopE2eMongoSafely({ stop })).resolves.toBe(false);
    });

    it("suprime apenas o warning ECONNREFUSED emitido internamente pela biblioteca", async () => {
        const expectedFailure = Object.assign(new Error("socket encerrado"), {
            code: "ECONNREFUSED",
        });
        const warn = jest.spyOn(console, "warn").mockImplementation();
        const stop = jest.fn().mockImplementation(async () => {
            console.warn(expectedFailure);
        });

        await expect(stopE2eMongoSafely({ stop })).resolves.toBe(true);
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it("preserva warnings internos não relacionados", async () => {
        const warning = Object.assign(new Error("permissão recusada"), {
            code: "EACCES",
        });
        const warn = jest.spyOn(console, "warn").mockImplementation();
        const stop = jest.fn().mockImplementation(async () => {
            console.warn(warning);
        });

        await expect(stopE2eMongoSafely({ stop })).resolves.toBe(true);
        expect(warn).toHaveBeenCalledWith(warning);
        warn.mockRestore();
    });

    it("propaga qualquer erro de cleanup não esperado", async () => {
        const failure = Object.assign(new Error("permissão recusada"), {
            code: "EACCES",
        });
        const stop = jest.fn().mockRejectedValue(failure);

        await expect(stopE2eMongoSafely({ stop })).rejects.toBe(failure);
    });
});
