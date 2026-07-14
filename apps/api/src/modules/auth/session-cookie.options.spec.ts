/**
 * Testa a política única de cookies de sessão.
 */
import {
    clearSessionCookieOptions,
    sessionCookieOptions,
} from "./session-cookie.options.js";
import { SESSION_TTL_SECONDS } from "./session.service.js";

describe("sessionCookieOptions", () => {
    const previousNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = previousNodeEnv;
    });

    it("usa HttpOnly, SameSite e TTL alinhado com a sessão", () => {
        process.env.NODE_ENV = "development";

        expect(sessionCookieOptions()).toEqual({
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: SESSION_TTL_SECONDS * 1000,
            path: "/",
        });
    });

    it("ativa Secure em produção e limpa com flags compatíveis", () => {
        process.env.NODE_ENV = "production";

        expect(sessionCookieOptions()).toMatchObject({ secure: true });
        expect(clearSessionCookieOptions()).toEqual({
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
        });
    });
});
