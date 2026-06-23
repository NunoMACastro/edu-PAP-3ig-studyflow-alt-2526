/**
 * Implementa as regras de negócio de auth e concentra validações do domínio.
 */
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SessionStore } from "./session-store.js";

export const SESSION_REDIS = Symbol("SESSION_REDIS");
export const SESSION_COOKIE_NAME = "sf_sid";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

/**
 * Serviço de sessões opacas guardadas em Redis.
 *
 * A sessão não contém dados sensíveis no browser: o cookie guarda só um
 * identificador aleatório. Os dados do utilizador ficam no servidor e expiram.
 */
@Injectable()
export class SessionService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param redis redis necessário para executar constructor sem depender de estado global.
     */
    constructor(@Inject(SESSION_REDIS) private readonly redis: SessionStore) {}

    /**
     * Cria uma nova sessão para o utilizador autenticado.
     *
     * @param user Utilizador público validado no login.
     * @returns Identificador opaco a gravar no cookie HttpOnly.
     */
    async createSession(user: AuthenticatedUser): Promise<string> {
        const sessionId = randomBytes(32).toString("hex");
        await this.redis.set(
            this.key(sessionId),
            JSON.stringify(user),
            "EX",
            SESSION_TTL_SECONDS,
        );
        return sessionId;
    }

    /**
     * Obtém uma sessão ativa ou falha com erro genérico.
     *
     * @param sessionId Identificador recebido do cookie.
     * @returns Utilizador autenticado guardado em Redis.
     * @throws UnauthorizedException quando a sessão não existe ou expirou.
     */
    async requireSession(sessionId: string): Promise<AuthenticatedUser> {
        const rawSession = await this.redis.get(this.key(sessionId));
        if (!rawSession) {
            throw new UnauthorizedException({
                code: "UNAUTHENTICATED",
                message: "A sessão expirou. Inicia sessão novamente.",
            });
        }

        return JSON.parse(rawSession) as AuthenticatedUser;
    }

    /**
     * Invalida uma sessão existente.
     *
     * @param sessionId Identificador recebido do cookie.
     * @returns Promise resolvida depois de remover a chave de Redis.
     */
    async destroySession(sessionId: string): Promise<void> {
        await this.redis.del(this.key(sessionId));
    }

    /**
     * Constrói a chave Redis usada para uma sessão.
     *
     * @param sessionId Identificador opaco.
     * @returns Chave namespaced para evitar colisões.
     */
    private key(sessionId: string): string {
        return `studyflow:sessions:${sessionId}`;
    }
}
