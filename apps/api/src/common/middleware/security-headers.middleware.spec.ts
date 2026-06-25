// apps/api/src/common/middleware/security-headers.middleware.spec.ts
/**
 * Testa os cabeçalhos defensivos aplicados antes dos controllers.
 */
import { NextFunction, Request, Response } from "express";
import { securityHeadersMiddleware } from "./security-headers.middleware.js";

describe("securityHeadersMiddleware", () => {
    /**
     * Confirma que a resposta recebe headers de hardening e continua o fluxo.
     */
    it("aplica cabeçalhos defensivos e chama next", () => {
        const headers = new Map<string, string>();
        const next: NextFunction = jest.fn();
        const response = createResponse(headers);

        securityHeadersMiddleware({} as Request, response, next);

        expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(headers.get("X-Frame-Options")).toBe("DENY");
        expect(headers.get("Referrer-Policy")).toBe("same-origin");
        expect(headers.get("Content-Security-Policy")).toContain(
            "frame-ancestors 'none'",
        );
        expect(next).toHaveBeenCalledTimes(1);
    });
});

/**
 * Cria uma resposta mínima para observar chamadas a `setHeader`.
 *
 * @param headers Mapa onde o teste guarda os headers configurados.
 * @returns Response parcial compatível com Express.
 */
function createResponse(headers: Map<string, string>): Response {
    const response: Pick<Response, "setHeader"> = {
        setHeader(name: string, value: number | string | readonly string[]) {
            headers.set(name, Array.isArray(value) ? value.join(",") : String(value));
            return response as Response;
        },
    };

    // O cast passa por unknown para manter o teste tipado sem recorrer a `any`.
    return response as unknown as Response;
}