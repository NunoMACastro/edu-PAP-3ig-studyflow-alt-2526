/**
 * Aplica cabeçalhos defensivos transversais nas respostas da API.
 */
import { NextFunction, Request, Response } from "express";

/**
 * Reduz risco de XSS refletido, clickjacking, sniffing e exposição de APIs do browser.
 *
 * @param _request Pedido HTTP recebido pela API.
 * @param response Resposta onde os cabeçalhos são definidos.
 * @param next Continua a cadeia de middlewares.
 * @returns Nada; apenas configura cabeçalhos seguros.
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
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    );

    next();
}
