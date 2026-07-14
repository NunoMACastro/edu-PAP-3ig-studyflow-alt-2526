/**
 * Implementa as regras de negócio de auth e concentra validações do domínio.
 */
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UsersService } from "../users/users.service.js";
import { SessionStore } from "./session-store.js";

export const SESSION_REDIS = Symbol("SESSION_REDIS");
export const SESSION_COOKIE_NAME = "sf_sid";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

type StoredSessionV2 = {
    version: 2;
    userId: string;
    sessionVersion: number;
};

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
     * Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido.
     *
     * @param redis Valor de redis usado pela função para executar constructor com dados explícitos.
     */
    constructor(
        @Inject(SESSION_REDIS) private readonly redis: SessionStore,
        private readonly usersService: UsersService,
    ) {}

    /**
     * Cria uma nova sessão para o utilizador autenticado.
     *
     * @param user Utilizador público validado no login.
     * @returns Identificador opaco a gravar no cookie HttpOnly.
     */
    async createSession(user: AuthenticatedUser): Promise<string> {
        const current = await this.usersService.findSessionUser(user.id);
        if (!current) throw this.unauthenticated();

        const sessionId = randomBytes(32).toString("hex");
        const payload: StoredSessionV2 = {
            version: 2,
            userId: current.user.id,
            sessionVersion: current.sessionVersion,
        };
        await this.redis.set(
            this.key(sessionId),
            JSON.stringify(payload),
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
            throw this.unauthenticated();
        }

        const stored = this.parseSession(rawSession);
        if (!stored) {
            await this.redis.del(this.key(sessionId));
            throw this.revoked();
        }

        const current = await this.usersService.findSessionUser(stored.userId);
        if (!current || current.sessionVersion !== stored.sessionVersion) {
            await this.redis.del(this.key(sessionId));
            throw this.revoked();
        }

        return current.user;
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
        return `studyflow:sessions:v2:${sessionId}`;
    }

    /**
     * Valida o payload Redis sem confiar em objetos serializados por versões
     * anteriores da aplicação.
     *
     * @param rawSession JSON guardado no servidor.
     * @returns Payload v2 validado ou `null` quando está corrompido/obsoleto.
     */
    private parseSession(rawSession: string): StoredSessionV2 | null {
        try {
            const candidate = JSON.parse(rawSession) as Partial<StoredSessionV2>;
            if (
                candidate.version !== 2 ||
                typeof candidate.userId !== "string" ||
                candidate.userId.length === 0 ||
                !Number.isSafeInteger(candidate.sessionVersion) ||
                Number(candidate.sessionVersion) < 0
            ) {
                return null;
            }
            return candidate as StoredSessionV2;
        } catch {
            return null;
        }
    }

    /**
     * Produz uma resposta genérica para não revelar se a conta, a sessão ou a
     * versão de autoridade foi a causa da rejeição.
     *
     * @returns Exceção HTTP estável para todos os cenários de revogação.
     */
    private unauthenticated(): UnauthorizedException {
        return new UnauthorizedException({
            code: "UNAUTHENTICATED",
            message: "A sessão expirou. Inicia sessão novamente.",
        });
    }

    /** Distingue revogação deliberada de uma sessão apenas ausente/expirada. */
    private revoked(): UnauthorizedException {
        return new UnauthorizedException({
            code: "SESSION_REVOKED",
            message: "A sessão foi revogada. Inicia sessão novamente.",
        });
    }
}
