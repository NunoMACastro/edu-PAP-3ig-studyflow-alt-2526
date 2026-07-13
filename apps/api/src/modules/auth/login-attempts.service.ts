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
const REGISTRATION_ATTEMPT_TTL_SECONDS = 60 * 60;
const MAX_REGISTRATIONS_BY_IP = 5;

/**
 * Controla tentativas falhadas de login com chaves Redis de curta duração.
 */
@Injectable()
export class LoginAttemptsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
     *
     * @param redis Valor de redis usado pela função para executar constructor com dados explícitos.
     */
    constructor(@Inject(SESSION_REDIS) private readonly redis: SessionStore) {}

    /**
     * Bloqueia novas tentativas quando email ou IP excederam o limite MF0.
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
     * Consome uma tentativa de registo antes do trabalho bcrypt. O contador é
     * aplicado por IP observado e expira automaticamente ao fim de uma hora.
     *
     * @param ip Endereço IP observado pelo servidor.
     */
    async consumeRegistrationAttempt(ip: string): Promise<void> {
        const key = `studyflow:registration-attempts:ip:${this.hash(ip)}`;
        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.expire(key, REGISTRATION_ATTEMPT_TTL_SECONDS);
        }
        if (count > MAX_REGISTRATIONS_BY_IP) {
            throw new HttpException(
                {
                    code: "REGISTRATION_RATE_LIMITED",
                    message:
                        "Foram efetuados demasiados registos. Tenta novamente mais tarde.",
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
     * @param key Chave Redis interna.
     * @returns Número de falhas registadas.
     */
    private async getCount(key: string): Promise<number> {
        const value = await this.redis.get(key);
        return Number.parseInt(value ?? "0", 10) || 0;
    }

    /**
     * Incrementa um contador e aplica TTL quando a chave é criada.
     *
     * @param key Chave Redis interna.
     * @returns Promise resolvida depois de atualizar a chave.
     */
    private async incrementWithTtl(key: string): Promise<void> {
        const count = await this.redis.incr(key);
        if (count === 1) {
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
