/**
 * Define a política única dos cookies de sessão StudyFlow.
 */
import { CookieOptions } from "express";
import { SESSION_TTL_SECONDS } from "./session.service.js";

/**
 * Devolve as opções usadas para criar o cookie de sessão.
 *
 * @returns Opções Express com flags alinhadas com RNF16.
 */
export function sessionCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS * 1000,
        path: "/",
    };
}

/**
 * Devolve as opções usadas para limpar o cookie de sessão.
 *
 * @returns Opções sem `maxAge`, mantendo nome/path/flags compatíveis.
 */
export function clearSessionCookieOptions(): CookieOptions {
    const { maxAge: _maxAge, ...options } = sessionCookieOptions();

    // Limpar com as mesmas flags evita deixar cookie antigo preso no browser.
    return options;
}
