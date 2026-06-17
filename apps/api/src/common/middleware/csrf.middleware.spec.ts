/**
 * Testa o comportamento de infraestrutura comum e documenta os cenários de aceitação automatizados.
 */
import { NextFunction, Request, Response } from "express";
import { csrfMiddleware } from "./csrf.middleware.js";

describe("csrfMiddleware", () => {
    /**
     * Confirma que a comparação de origin não aceita subdomínios maliciosos.
     */
    it("rejeita origins cujo host apenas contém o host legítimo", () => {
        const next = jest.fn();
        const response = createResponse();
        const request = createRequest({
            method: "POST",
            origin: "https://studyflow.test.evil.example",
            host: "studyflow.test",
        });

        csrfMiddleware(request, response, next);

        expect(next).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(403);
        expect(response.json).toHaveBeenCalledWith({
            code: "CSRF_CHECK_FAILED",
            message: "Pedido bloqueado por proteção CSRF.",
        });
    });

    /**
     * Confirma que pedidos same-origin continuam aceites.
     */
    it("aceita origins com host exatamente igual", () => {
        const next = jest.fn();
        const response = createResponse();
        const request = createRequest({
            method: "POST",
            origin: "https://studyflow.test",
            host: "studyflow.test",
        });

        csrfMiddleware(request, response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(response.status).not.toHaveBeenCalled();
    });
});

/**
 * Cria um request mínimo para testar o middleware.
 *
 * @param input Método, Origin e Host a simular.
 * @returns Request parcial compatível com o middleware.
 */
function createRequest(input: {
    method: string;
    origin?: string;
    host?: string;
}): Request {
    return {
        method: input.method,
        header: jest.fn((name: string) => {
            const normalized = name.toLowerCase();
            if (normalized === "origin") return input.origin;
            if (normalized === "host") return input.host;
            return undefined;
        }),
    } as unknown as Request;
}

/**
 * Cria um response mínimo com chaining de status/json.
 *
 * @returns Response parcial compatível com o middleware.
 */
function createResponse(): Response {
    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    return response as unknown as Response;
}
