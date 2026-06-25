// apps/api/src/common/middleware/security-headers.middleware.ts
import { NextFunction, Request, Response } from "express";

/**
 * Aplica cabeçalhos defensivos transversais nas respostas HTTP da API.
 *
 * Estes cabeçalhos reduzem risco de XSS refletido, clickjacking, sniffing de
 * conteúdo e exposição desnecessária de capacidades do browser. A política é
 * intencionalmente pequena para caber no MVP sem adicionar dependências novas.
 *
 * @param _request Pedido HTTP recebido pela API.
 * @param response Resposta HTTP onde os cabeçalhos são aplicados.
 * @param next Função que continua a cadeia de middlewares.
 * @returns Nada; a função apenas configura cabeçalhos e passa o pedido adiante.
 */
export function securityHeadersMiddleware(
    _request: Request,
    response: Response,
    next: NextFunction,
): void {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "same-origin");
    response.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    );
    response.setHeader(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "form-action 'self'",
        ].join("; "),
    );

    // Os headers reduzem impacto no browser, mas não substituem validação nem autorização backend.
    next();
}