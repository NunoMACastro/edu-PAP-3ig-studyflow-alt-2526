/**
 * Partilha o mecanismo de autenticação e normalização segura usado pelos
 * gateways Socket.IO sem misturar regras de autorização dos respetivos domínios.
 */
import { AuthenticatedUser } from "../types/authenticated-request.js";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "../../modules/auth/session.service.js";

const DEFAULT_WEB_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

/** Forma mínima de socket necessária para autenticar uma ligação. */
export type AuthenticatedSocket = {
    data: {
        sessionId?: string;
        user?: AuthenticatedUser;
    };
    handshake: {
        headers: {
            cookie?: string;
            origin?: string;
        };
    };
};

/** Erro estável que pode ser exposto ao frontend sem detalhes internos. */
export type PublicSocketError = {
    code: string;
    message: string;
};

/**
 * Confirma que a origem do handshake pertence ao frontend configurado.
 *
 * @param client Socket recebida no namespace.
 * @param code Código público específico do domínio chamador.
 */
export function assertAllowedSocketOrigin(
    client: AuthenticatedSocket,
    code: string,
): void {
    const origin = client.handshake.headers.origin;
    if (!origin || !getAllowedWebOrigins().includes(origin)) {
        throw {
            response: {
                code,
                message: "Origem WebSocket não autorizada.",
            },
        };
    }
}

/**
 * Lê o identificador opaco de sessão do cookie HttpOnly.
 *
 * @param client Socket recebida no namespace.
 * @returns Identificador opaco da sessão.
 */
export function getSocketSessionId(client: AuthenticatedSocket): string {
    const cookies = parseCookieHeader(client.handshake.headers.cookie ?? "");
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (!sessionId) throw unauthenticatedSocketError();
    return sessionId;
}

/**
 * Relê a sessão em cada evento para detetar revogação, mudança de role ou
 * eliminação de conta, em vez de confiar no snapshot do handshake.
 *
 * @param client Socket previamente autenticada.
 * @param sessionService Serviço canónico de sessões.
 * @returns Utilizador atual da sessão.
 */
export async function requireLiveSocketUser(
    client: AuthenticatedSocket,
    sessionService: SessionService,
): Promise<AuthenticatedUser> {
    if (!client.data.sessionId) throw unauthenticatedSocketError();
    const user = await sessionService.requireSession(client.data.sessionId);
    client.data.user = user;
    return user;
}

/**
 * Normaliza exceções do domínio sem expor stacks, queries ou dados privados.
 *
 * @param error Exceção recebida.
 * @param fallback Erro usado quando a exceção não tem resposta pública.
 * @returns Erro seguro para REST-like acknowledgements e eventos Socket.IO.
 */
export function toPublicSocketError(
    error: unknown,
    fallback: PublicSocketError,
): PublicSocketError {
    const response =
        typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { code?: unknown; message?: unknown } })
                  .response
            : undefined;
    return {
        code:
            typeof response?.code === "string"
                ? response.code
                : fallback.code,
        message:
            typeof response?.message === "string"
                ? response.message
                : fallback.message,
    };
}

/** Indica se uma falha obriga a terminar imediatamente a socket. */
export function isSocketSessionFailure(code: string): boolean {
    return code === "UNAUTHENTICATED" || code === "SESSION_REVOKED";
}

/** Resolve as origens configuradas para CORS e validação de handshake. */
export function getAllowedWebOrigins(): string[] {
    const rawOrigin = process.env.WEB_ORIGIN?.trim();
    if (!rawOrigin || rawOrigin === DEFAULT_WEB_ORIGINS[0]) {
        return DEFAULT_WEB_ORIGINS;
    }
    return rawOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

/** Faz parsing mínimo do header Cookie sem expor os valores ao browser. */
function parseCookieHeader(cookieHeader: string): Record<string, string> {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce<Record<string, string>>((cookies, part) => {
            const separatorIndex = part.indexOf("=");
            if (separatorIndex === -1) return cookies;
            const name = part.slice(0, separatorIndex).trim();
            const value = part.slice(separatorIndex + 1).trim();
            if (name) cookies[name] = decodeURIComponent(value);
            return cookies;
        }, {});
}

/** Constrói a falha canónica usada quando não existe sessão válida na socket. */
function unauthenticatedSocketError() {
    return {
        response: {
            code: "UNAUTHENTICATED",
            message: "Inicia sessão para continuar.",
        },
    };
}
