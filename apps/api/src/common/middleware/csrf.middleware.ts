// apps/api/src/common/middleware/csrf.middleware.ts
/**
 * Aplica middleware transversal antes dos controllers processarem pedidos.
 */
import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Aplica uma proteção CSRF mínima compatível com cookies HttpOnly.
 *
 * @param request Pedido HTTP recebido pelo Nest/Express.
 * @param response Resposta HTTP usada para terminar pedidos bloqueados.
 * @param next Função que passa o pedido para o próximo middleware.
 * @returns Nada; termina a resposta quando o pedido falha a validação.
 */
export function csrfMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (SAFE_METHODS.has(request.method)) {
        next();
        return;
    }

    const csrfHeader = request.header("x-studyflow-csrf");
    const origin = request.header("origin");
    const host = request.header("host");
    const sameOrigin = isSameOrigin(origin, host);

    if (csrfHeader === "1" || sameOrigin) {
        next();
        return;
    }

    // A mensagem pública explica o bloqueio sem revelar cookies ou identificadores da sessão.
    response.status(403).json({
        code: "CSRF_CHECK_FAILED",
        message: "Pedido bloqueado por proteção CSRF.",
    });
}

/**
 * Compara o host recebido com o host parseado do Origin.
 *
 * @param origin Cabeçalho Origin enviado pelo browser.
 * @param host Cabeçalho Host do pedido.
 * @returns Verdadeiro apenas quando os hosts são exatamente iguais.
 */
function isSameOrigin(origin?: string, host?: string): boolean {
    if (!origin || !host) return false;

    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}