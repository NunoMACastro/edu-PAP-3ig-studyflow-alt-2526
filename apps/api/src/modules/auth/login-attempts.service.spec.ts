/**
 * Testa o comportamento de auth e documenta os cenários de aceitação automatizados.
 */
import { HttpException } from "@nestjs/common";
import { LoginAttemptsService } from "./login-attempts.service.js";

describe("LoginAttemptsService", () => {
    /**
     * Cria fixture ou estrutura auxiliar de autenticação para manter testes e prompts legíveis.
     * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
     *
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    function makeRedis() {
        return {
            get: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
            del: jest.fn(),
        };
    }

    it("regista falhas por email e IP com TTL sem guardar valores em claro", async () => {
        const redis = makeRedis();
        redis.incr.mockResolvedValue(1);
        const service = new LoginAttemptsService(redis as never);

        await service.recordFailedLogin("Aluno@Example.com", "127.0.0.1");

        expect(redis.incr).toHaveBeenCalledTimes(2);
        expect(redis.expire).toHaveBeenCalledTimes(2);
        expect(redis.expire).toHaveBeenCalledWith(expect.any(String), 900);

        const emailKey = redis.incr.mock.calls[0][0] as string;
        const ipKey = redis.incr.mock.calls[1][0] as string;
        expect(emailKey).toMatch(/^studyflow:login-attempts:email:/);
        expect(ipKey).toMatch(/^studyflow:login-attempts:ip:/);
        expect(emailKey).not.toContain("Aluno");
        expect(emailKey).not.toContain("example.com");
        expect(ipKey).not.toContain("127.0.0.1");
    });

    it("bloqueia login quando o limite por email foi atingido", async () => {
        const redis = makeRedis();
        redis.get.mockResolvedValueOnce("5").mockResolvedValueOnce("0");
        const service = new LoginAttemptsService(redis as never);

        const attempt = service.assertCanAttempt("aluno@example.com", "127.0.0.1");

        await expect(attempt).rejects.toMatchObject({
            response: {
                code: "LOGIN_RATE_LIMITED",
            },
        });
        await expect(attempt).rejects.toBeInstanceOf(HttpException);
    });

    it("bloqueia login quando o limite por IP foi atingido", async () => {
        const redis = makeRedis();
        redis.get.mockResolvedValueOnce("0").mockResolvedValueOnce("50");
        const service = new LoginAttemptsService(redis as never);

        await expect(
            service.assertCanAttempt("aluno@example.com", "127.0.0.1"),
        ).rejects.toMatchObject({
            response: {
                code: "LOGIN_RATE_LIMITED",
            },
        });
    });

    it("limpa o contador por email depois de login bem-sucedido", async () => {
        const redis = makeRedis();
        const service = new LoginAttemptsService(redis as never);

        await service.clearEmailFailures("Aluno@Example.com");

        expect(redis.del).toHaveBeenCalledWith(
            expect.stringMatching(/^studyflow:login-attempts:email:/),
        );
        expect(redis.del.mock.calls[0][0]).not.toContain("Aluno");
        expect(redis.del.mock.calls[0][0]).not.toContain("example.com");
    });

    it("bloqueia o sexto registo por IP durante uma hora", async () => {
        const redis = makeRedis();
        redis.incr.mockResolvedValueOnce(6);
        const service = new LoginAttemptsService(redis as never);

        await expect(
            service.consumeRegistrationAttempt("127.0.0.1"),
        ).rejects.toMatchObject({
            response: { code: "REGISTRATION_RATE_LIMITED" },
        });
        expect(redis.incr).toHaveBeenCalledWith(
            expect.stringMatching(/^studyflow:registration-attempts:ip:/),
        );
        expect(redis.incr.mock.calls[0][0]).not.toContain("127.0.0.1");
    });
});
