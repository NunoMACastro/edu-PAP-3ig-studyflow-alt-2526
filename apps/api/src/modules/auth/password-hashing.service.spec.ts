// apps/api/src/modules/auth/password-hashing.service.spec.ts
/**
 * Testa a política RNF15 de hashing de passwords locais.
 */
import { PasswordHashingService } from "./password-hashing.service.js";

describe("PasswordHashingService", () => {
    it("gera hash diferente da password e permite comparação válida", async () => {
        const service = new PasswordHashingService();

        const hash = await service.hash("PasswordSegura123");

        // O valor persistido nunca pode ser igual à password escrita pelo aluno.
        expect(hash).not.toBe("PasswordSegura123");
        await expect(
            service.compare("PasswordSegura123", hash),
        ).resolves.toBe(true);
    });

    it("rejeita comparação com password errada", async () => {
        const service = new PasswordHashingService();
        const hash = await service.hash("PasswordSegura123");

        // O negativo garante que o login não aceita uma password diferente.
        await expect(service.compare("OutraPassword123", hash)).resolves.toBe(
            false,
        );
    });
});