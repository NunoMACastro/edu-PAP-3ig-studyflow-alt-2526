/**
 * Testa a política centralizada de hashing de passwords.
 */
import { PasswordHashingService } from "./password-hashing.service.js";

describe("PasswordHashingService", () => {
    it("gera hash bcrypt sem guardar texto claro", async () => {
        const service = new PasswordHashingService();

        const hash = await service.hash("password-segura");

        expect(hash).not.toBe("password-segura");
        expect(hash).toMatch(/^\$2[aby]\$/);
        await expect(service.compare("password-segura", hash)).resolves.toBe(true);
    });

    it("rejeita password errada contra hash válido", async () => {
        const service = new PasswordHashingService();
        const hash = await service.hash("password-correta");

        await expect(service.compare("password-errada", hash)).resolves.toBe(false);
    });
});
