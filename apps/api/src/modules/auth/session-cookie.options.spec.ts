// apps/api/src/modules/auth/session-cookie.options.spec.ts
/**
 * Testa a política RNF16 dos cookies de sessão.
 */
import {
    clearSessionCookieOptions,
    sessionCookieOptions,
} from "./session-cookie.options.js";
import { SESSION_TTL_SECONDS } from "./session.service.js";

describe("sessionCookieOptions", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
            return;
        }

        process.env.NODE_ENV = originalNodeEnv;
    });

    it("ativa HttpOnly, SameSite e duração da sessão", () => {
        process.env.NODE_ENV = "test";

        const options = sessionCookieOptions();

        // Em testes locais o cookie não exige HTTPS, mas mantém proteção HttpOnly.
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: SESSION_TTL_SECONDS * 1000,
            path: "/",
        });
    });

    it("ativa Secure em produção", () => {
        process.env.NODE_ENV = "production";

        const options = sessionCookieOptions();

        // Em produção, RNF16 exige que o cookie seja enviado apenas por canal seguro.
        expect(options.secure).toBe(true);
    });

    it("limpa o cookie com as mesmas flags e sem maxAge", () => {
        process.env.NODE_ENV = "production";

        const options = clearSessionCookieOptions();

        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
        });
        expect(options).not.toHaveProperty("maxAge");
    });
});