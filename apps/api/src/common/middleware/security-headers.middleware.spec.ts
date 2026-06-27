/**
 * Testa os cabeçalhos defensivos transversais da API.
 */
import { Request, Response } from "express";
import { securityHeadersMiddleware } from "./security-headers.middleware.js";

describe("securityHeadersMiddleware", () => {
    it("define cabeçalhos de segurança sem bloquear o pedido", () => {
        const setHeader = jest.fn();
        const next = jest.fn();

        securityHeadersMiddleware(
            {} as Request,
            { setHeader } as unknown as Response,
            next,
        );

        expect(setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
        expect(setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
        expect(setHeader).toHaveBeenCalledWith(
            "Content-Security-Policy",
            expect.stringContaining("frame-ancestors 'none'"),
        );
        expect(next).toHaveBeenCalledTimes(1);
    });
});
