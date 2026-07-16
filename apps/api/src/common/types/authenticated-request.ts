/**
 * Define tipos partilhados para contratos internos da API.
 */
import { Request } from "express";

/**
 * Utilizador autenticado anexado ao pedido pelo `SessionGuard`.
 *
 * Este contrato é herdado por todos os BKs da MF0 para impedir que o frontend
 * envie `userId` no body ou no URL quando o ownership deve vir da sessão.
 */
export type AuthenticatedUser = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    displayName?: string;
};

/**
 * Pedido Express enriquecido com o utilizador autenticado.
 */
export type AuthenticatedRequest = Request & {
    user?: AuthenticatedUser;
};
