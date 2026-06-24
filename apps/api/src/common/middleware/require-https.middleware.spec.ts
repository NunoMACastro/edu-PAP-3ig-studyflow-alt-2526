// apps/api/src/common/middleware/require-https.middleware.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequireHttpsMiddleware } from "./require-https.middleware.js";

describe("RequireHttpsMiddleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it("permite HTTPS em produção", () => {
        process.env.NODE_ENV = "production";
        const middleware = new RequireHttpsMiddleware();
        const next = jest.fn();

        // O proxy informa HTTPS e o pedido pode continuar para os controllers.
        middleware.use({ headers: { "x-forwarded-proto": "https" }, protocol: "http" } as Request, {} as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("recusa HTTP em produção sem expor dados sensíveis", () => {
        process.env.NODE_ENV = "production";
        const middleware = new RequireHttpsMiddleware();
        const next = jest.fn();
        let thrown: unknown;

        try {
            // O cenário negativo prova que o backend não aceita downgrade para HTTP em produção.
            middleware.use({ headers: { "x-forwarded-proto": "http" }, protocol: "http" } as Request, {} as Response, next);
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(ForbiddenException);
        expect((thrown as ForbiddenException).getResponse()).toMatchObject({
            code: "HTTPS_REQUIRED",
            message: "Usa ligação HTTPS para aceder ao StudyFlow.",
        });
        expect(JSON.stringify((thrown as ForbiddenException).getResponse())).not.toMatch(/cookie|token|password/i);
        expect(next).not.toHaveBeenCalled();
    });
});