/**
 * Testa o comportamento de auth e documenta os cenários de aceitação automatizados.
 */
import { UnauthorizedException } from "@nestjs/common";
import {
    SESSION_TTL_SECONDS,
    SessionService,
} from "./session.service.js";

describe("SessionService", () => {
    /**
     * Cria fixture ou estrutura auxiliar de autenticação para manter testes e prompts legíveis.
     * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
     *
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    function makeRedis() {
        return {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        };
    }

    it("cria sessão opaca em Redis com TTL", async () => {
        const redis = makeRedis();
        const service = new SessionService(redis as never);

        const sessionId = await service.createSession({
            id: "user-1",
            email: "aluno@example.com",
            role: "STUDENT",
        });

        expect(sessionId).toMatch(/^[a-f0-9]{64}$/);
        expect(redis.set).toHaveBeenCalledWith(
            `studyflow:sessions:${sessionId}`,
            JSON.stringify({
                id: "user-1",
                email: "aluno@example.com",
                role: "STUDENT",
            }),
            "EX",
            SESSION_TTL_SECONDS,
        );
    });

    it("devolve utilizador autenticado quando a sessão existe", async () => {
        const redis = makeRedis();
        redis.get.mockResolvedValue(
            JSON.stringify({
                id: "user-1",
                email: "aluno@example.com",
                role: "STUDENT",
            }),
        );
        const service = new SessionService(redis as never);

        await expect(service.requireSession("sid")).resolves.toEqual({
            id: "user-1",
            email: "aluno@example.com",
            role: "STUDENT",
        });
    });

    it("rejeita sessão inexistente ou expirada", async () => {
        const redis = makeRedis();
        redis.get.mockResolvedValue(null);
        const service = new SessionService(redis as never);

        await expect(service.requireSession("sid")).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        await expect(service.requireSession("sid")).rejects.toMatchObject({
            response: {
                code: "UNAUTHENTICATED",
            },
        });
    });

    it("remove a chave Redis ao terminar sessão", async () => {
        const redis = makeRedis();
        const service = new SessionService(redis as never);

        await service.destroySession("sid");

        expect(redis.del).toHaveBeenCalledWith("studyflow:sessions:sid");
    });
});
