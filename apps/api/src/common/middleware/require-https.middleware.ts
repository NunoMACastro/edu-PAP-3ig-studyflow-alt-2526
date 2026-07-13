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
        const scope =
            process.env.STUDYFLOW_DEPLOYMENT_SCOPE?.trim() || "local-pap";
        if (process.env.NODE_ENV !== "production" || scope === "local-pap") {
            next();
            return;
        }

        // `request.secure` só pode refletir um proxy quando o adapter configurou
        // explicitamente esse proxy como confiável. Um header direto nunca basta.
        if (!request.secure) {
            throw new ForbiddenException({
                code: "HTTPS_REQUIRED",
                message: "Usa ligação HTTPS para aceder ao StudyFlow.",
            });
        }

        next();
    }
}
