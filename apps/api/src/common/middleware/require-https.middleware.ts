// apps/api/src/common/middleware/require-https.middleware.ts
import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/**
 * Recusa tráfego sem HTTPS em produção, assumindo proxy reverso configurado.
 */
@Injectable()
export class RequireHttpsMiddleware implements NestMiddleware {
    /**
     * Bloqueia pedidos HTTP em produção e deixa desenvolvimento local continuar.
     *
     * @param request Pedido Express recebido pela API.
     * @param _response Resposta Express, mantida para cumprir o contrato NestMiddleware.
     * @param next Função que entrega o pedido à próxima camada.
     */
    use(request: Request, _response: Response, next: NextFunction): void {
        if (process.env.NODE_ENV !== "production") {
            next();
            return;
        }

        const forwardedProto = String(request.headers["x-forwarded-proto"] ?? request.protocol)
            .split(",")[0]
            .trim()
            .toLowerCase();

        // Em produção, a API confia no protocolo validado pelo proxy e recusa downgrade para HTTP.
        if (forwardedProto !== "https") {
            throw new ForbiddenException({
                code: "HTTPS_REQUIRED",
                message: "Usa ligação HTTPS para aceder ao StudyFlow.",
            });
        }

        next();
    }
}