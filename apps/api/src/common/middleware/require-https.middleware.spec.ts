/**
 * Testa a barreira HTTPS aplicada em produção.
 */
import { ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequireHttpsMiddleware } from "./require-https.middleware.js";

describe("RequireHttpsMiddleware", () => {
    const previousNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = previousNodeEnv;
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

    it("bloqueia produção sem x-forwarded-proto https", () => {
        process.env.NODE_ENV = "production";

        expect(() =>
            new RequireHttpsMiddleware().use(
                { headers: { "x-forwarded-proto": "http" }, protocol: "http" } as unknown as Request,
                {} as Response,
                jest.fn(),
            ),
        ).toThrow(ForbiddenException);
    });

    it("permite produção com protocolo HTTPS validado pelo proxy", () => {
        process.env.NODE_ENV = "production";
        const next = jest.fn();

        new RequireHttpsMiddleware().use(
            { headers: { "x-forwarded-proto": "https" }, protocol: "http" } as unknown as Request,
            {} as Response,
            next,
        );

        expect(next).toHaveBeenCalledTimes(1);
    });
});
