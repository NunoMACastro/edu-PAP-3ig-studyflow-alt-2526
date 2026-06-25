// apps/api/src/modules/auth/login-attempts.service.ts
/**
 * Implementa as regras de negócio de auth e concentra validações do domínio.
 */
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { SESSION_REDIS } from "./session.service.js";
import { SessionStore } from "./session-store.js";

const LOGIN_ATTEMPT_TTL_SECONDS = 15 * 60;
const MAX_FAILURES_BY_EMAIL = 5;
const MAX_FAILURES_BY_IP = 50;

/**
 * Controla tentativas falhadas de login com chaves Redis de curta duração.
 */
@Injectable()
export class LoginAttemptsService {
    /**
     * Recebe o store de sessão para guardar contadores temporários.
     *
     * @param redis Store Redis ou equivalente usado pela app para estado efémero.
     */
    constructor(@Inject(SESSION_REDIS) private readonly redis: SessionStore) {}

    /**
     * Bloqueia novas tentativas quando email ou IP excederam o limite.
     *
     * @param email Email recebido no login.
     * @param ip Endereço IP observado pelo servidor.
     * @returns Promise resolvida quando a tentativa pode continuar.
     */
    async assertCanAttempt(email: string, ip: string): Promise<void> {
        const [emailFailures, ipFailures] = await Promise.all([
            this.getCount(this.emailKey(email)),
            this.getCount(this.ipKey(ip)),
        ]);

        if (
            emailFailures >= MAX_FAILURES_BY_EMAIL ||
            ipFailures >= MAX_FAILURES_BY_IP
        ) {
            throw new HttpException(
                {
                    code: "LOGIN_RATE_LIMITED",
                    message:
                        "Demasiadas tentativas falhadas. Tenta novamente mais tarde.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    /**
     * Regista uma tentativa falhada por email e por IP.
     *
     * @param email Email recebido no login.
     * @param ip Endereço IP observado pelo servidor.
     * @returns Promise resolvida depois de atualizar os contadores.
     */
    async recordFailedLogin(email: string, ip: string): Promise<void> {
        await Promise.all([
            this.incrementWithTtl(this.emailKey(email)),
            this.incrementWithTtl(this.ipKey(ip)),
        ]);
    }

    /**
     * Limpa falhas associadas ao email depois de autenticação bem-sucedida.
     *
     * @param email Email autenticado.
     * @returns Promise resolvida depois de remover o contador do email.
     */
    async clearEmailFailures(email: string): Promise<void> {
        await this.redis.del(this.emailKey(email));
    }

    /**
     * Obtém o contador atual para uma chave.
     *
     * @param key Chave interna sem email ou IP em claro.
     * @returns Número de falhas registadas.
     */
    private async getCount(key: string): Promise<number> {
        const value = await this.redis.get(key);
        return Number.parseInt(value ?? "0", 10) || 0;
    }

    /**
     * Incrementa um contador e aplica TTL quando a chave é criada.
     *
     * @param key Chave interna sem dados pessoais em claro.
     * @returns Promise resolvida depois de atualizar a chave.
     */
    private async incrementWithTtl(key: string): Promise<void> {
        const count = await this.redis.incr(key);
        if (count === 1) {
            // O TTL impede bloqueios permanentes e reduz retenção de dados técnicos.
            await this.redis.expire(key, LOGIN_ATTEMPT_TTL_SECONDS);
        }
    }

    /**
     * Cria chave Redis sem guardar o email em claro.
     *
     * @param email Email recebido no login.
     * @returns Chave namespaced e anonimizada.
     */
    private emailKey(email: string): string {
        return `studyflow:login-attempts:email:${this.hash(
            email.trim().toLowerCase(),
        )}`;
    }

    /**
     * Cria chave Redis sem guardar o IP em claro.
     *
     * @param ip Endereço IP recebido.
     * @returns Chave namespaced e anonimizada.
     */
    private ipKey(ip: string): string {
        return `studyflow:login-attempts:ip:${this.hash(ip)}`;
    }

    /**
     * Hash determinístico usado apenas para chaves técnicas de rate limit.
     *
     * @param value Valor sensível a anonimizar.
     * @returns SHA-256 hexadecimal.
     */
    private hash(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }
}