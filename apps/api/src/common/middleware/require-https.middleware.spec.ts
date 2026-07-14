/**
 * Testa a barreira HTTPS aplicada em produção.
 */
import { ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequireHttpsMiddleware } from "./require-https.middleware.js";

describe("RequireHttpsMiddleware", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousScope = process.env.STUDYFLOW_DEPLOYMENT_SCOPE;

    afterEach(() => {
        process.env.NODE_ENV = previousNodeEnv;
        process.env.STUDYFLOW_DEPLOYMENT_SCOPE = previousScope;
    });

    it("permite HTTP em desenvolvimento local", () => {
        process.env.NODE_ENV = "development";
        const next = jest.fn();

        new RequireHttpsMiddleware().use(
            { headers: {}, protocol: "http" } as Request,
            {} as Response,
            next,
        );

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("bloqueia produção pública mesmo com x-forwarded-proto forjado", () => {
        process.env.NODE_ENV = "production";
        process.env.STUDYFLOW_DEPLOYMENT_SCOPE = "public";

        expect(() =>
            new RequireHttpsMiddleware().use(
                {
                    headers: { "x-forwarded-proto": "https" },
                    protocol: "http",
                    secure: false,
                } as unknown as Request,
                {} as Response,
                jest.fn(),
            ),
        ).toThrow(ForbiddenException);
    });

    it("permite produção pública apenas quando Express marcou o pedido como seguro", () => {
        process.env.NODE_ENV = "production";
        process.env.STUDYFLOW_DEPLOYMENT_SCOPE = "public";
        const next = jest.fn();

        new RequireHttpsMiddleware().use(
            { headers: {}, protocol: "https", secure: true } as unknown as Request,
            {} as Response,
            next,
        );

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("permite HTTP no scope local-pap mesmo com build de produção", () => {
        process.env.NODE_ENV = "production";
        process.env.STUDYFLOW_DEPLOYMENT_SCOPE = "local-pap";
        const next = jest.fn();

        new RequireHttpsMiddleware().use(
            { headers: {}, protocol: "http", secure: false } as unknown as Request,
            {} as Response,
            next,
        );

        expect(next).toHaveBeenCalledTimes(1);
    });
});
