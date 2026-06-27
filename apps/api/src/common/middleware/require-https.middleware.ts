/**
 * Bloqueia tráfego inseguro em produção antes dos controllers.
 */
import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware de RNF14 para exigir HTTPS em produção.
 */
@Injectable()
export class RequireHttpsMiddleware implements NestMiddleware {
    /**
     * Recusa pedidos HTTP em produção e mantém desenvolvimento local viável.
     *
     * @param request Pedido Express recebido pela API.
     * @param _response Resposta Express, mantida pelo contrato NestMiddleware.
     * @param next Continua a cadeia quando o canal é aceitável.
     * @returns Nada; lança exceção quando o canal é inseguro.
     */
    use(request: Request, _response: Response, next: NextFunction): void {
        if (process.env.NODE_ENV !== "production") {
            next();
            return;
        }

        const forwardedProto = String(
            request.headers["x-forwarded-proto"] ?? request.protocol,
        )
            .split(",")[0]
            .trim()
            .toLowerCase();

        // Em produção, a API confia no protocolo validado pelo proxy e recusa downgrade.
        if (forwardedProto !== "https") {
            throw new ForbiddenException({
                code: "HTTPS_REQUIRED",
                message: "Usa ligação HTTPS para aceder ao StudyFlow.",
            });
        }

        next();
    }
}
