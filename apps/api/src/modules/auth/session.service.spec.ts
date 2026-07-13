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

    /**
     * Cria o serviço com a autoridade de utilizador relida da base de dados.
     *
     * @param overrides Campos atuais da conta simulada.
     * @returns Serviço e mocks necessários aos cenários de sessão.
     */
    function makeService(
        overrides: Partial<{
            id: string;
            email: string;
            role: "STUDENT" | "TEACHER" | "ADMIN";
            sessionVersion: number;
        }> = {},
    ) {
        const redis = makeRedis();
        const current = {
            user: {
                id: overrides.id ?? "user-1",
                email: overrides.email ?? "aluno@example.com",
                role: overrides.role ?? "STUDENT",
            },
            sessionVersion: overrides.sessionVersion ?? 0,
        };
        const usersService = {
            findSessionUser: jest.fn().mockResolvedValue(current),
        };
        return {
            redis,
            service: new SessionService(redis as never, usersService as never),
            usersService,
        };
    }

    it("cria sessão opaca em Redis com TTL", async () => {
        const { redis, service } = makeService();

        const sessionId = await service.createSession({
            id: "user-1",
            email: "aluno@example.com",
            role: "STUDENT",
        });

        expect(sessionId).toMatch(/^[a-f0-9]{64}$/);
        expect(redis.set).toHaveBeenCalledWith(
            `studyflow:sessions:v2:${sessionId}`,
            JSON.stringify({
                version: 2,
                userId: "user-1",
                sessionVersion: 0,
            }),
            "EX",
            SESSION_TTL_SECONDS,
        );
    });

    it("devolve utilizador autenticado quando a sessão existe", async () => {
        const { redis, service, usersService } = makeService({ role: "ADMIN" });
        redis.get.mockResolvedValue(
            JSON.stringify({
                version: 2,
                userId: "user-1",
                sessionVersion: 0,
            }),
        );

        await expect(service.requireSession("sid")).resolves.toEqual({
            id: "user-1",
            email: "aluno@example.com",
            role: "ADMIN",
        });
        expect(usersService.findSessionUser).toHaveBeenCalledWith("user-1");
    });

    it("rejeita sessão inexistente ou expirada", async () => {
        const { redis, service } = makeService();
        redis.get.mockResolvedValue(null);

        await expect(service.requireSession("sid")).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        await expect(service.requireSession("sid")).rejects.toMatchObject({
            response: {
                code: "UNAUTHENTICATED",
            },
        });
    });

    it("revoga sessão quando a versão da conta mudou", async () => {
        const { redis, service } = makeService({ sessionVersion: 2 });
        redis.get.mockResolvedValue(
            JSON.stringify({
                version: 2,
                userId: "user-1",
                sessionVersion: 1,
            }),
        );

        await expect(service.requireSession("sid")).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        await expect(service.requireSession("sid")).rejects.toMatchObject({
            response: { code: "SESSION_REVOKED" },
        });
        expect(redis.del).toHaveBeenCalledWith("studyflow:sessions:v2:sid");
    });

    it("rejeita e remove payloads Redis legados ou corrompidos", async () => {
        const { redis, service, usersService } = makeService();
        redis.get.mockResolvedValue(
            JSON.stringify({
                id: "user-1",
                email: "aluno@example.com",
                role: "STUDENT",
            }),
        );

        await expect(service.requireSession("sid")).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        await expect(service.requireSession("sid")).rejects.toMatchObject({
            response: { code: "SESSION_REVOKED" },
        });
        expect(usersService.findSessionUser).not.toHaveBeenCalled();
        expect(redis.del).toHaveBeenCalledWith("studyflow:sessions:v2:sid");
    });

    it("revoga sessão quando a conta deixou de estar ativa", async () => {
        const { redis, service, usersService } = makeService();
        redis.get.mockResolvedValue(
            JSON.stringify({
                version: 2,
                userId: "user-1",
                sessionVersion: 0,
            }),
        );
        usersService.findSessionUser.mockResolvedValue(null);

        await expect(service.requireSession("sid")).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        await expect(service.requireSession("sid")).rejects.toMatchObject({
            response: { code: "SESSION_REVOKED" },
        });
        expect(redis.del).toHaveBeenCalledWith("studyflow:sessions:v2:sid");
    });

    it("remove a chave Redis ao terminar sessão", async () => {
        const { redis, service } = makeService();

        await service.destroySession("sid");

        expect(redis.del).toHaveBeenCalledWith("studyflow:sessions:v2:sid");
    });
});
