/**
 * Disponibiliza um hook React para partilhar estado de hooks React.
 */
import { useCallback, useEffect, useState } from "react";
import {
    getCurrentUser,
    isApiError,
    logout,
    SESSION_UNAUTHORIZED_EVENT,
    User,
} from "../lib/apiClient.js";

export type SessionStatus =
    | "checking"
    | "authenticated"
    | "anonymous"
    | "unavailable";

/**
 * Hook que mantém o estado de sessão do frontend.
 *
 * A sessão real está no cookie HttpOnly; este hook guarda apenas o utilizador
 * público devolvido por `/api/auth/me`.
 *
 * @returns Estado da sessão e ações de refresh/logout.
 */
export function useSession() {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<SessionStatus>("checking");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega a sessão a partir da API.
     *
     * @returns Promise resolvida depois de atualizar estado local.
     */
    const refresh = useCallback(async (): Promise<void> => {
        setStatus("checking");
        setError(null);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setStatus("authenticated");
        } catch (caught) {
            if (isApiError(caught) && caught.status === 401) {
                setUser(null);
                setStatus("anonymous");
                return;
            }

            setUser(null);
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível validar a sessão.",
            );
            setStatus("unavailable");
        }
    }, []);

    /**
     * Termina sessão e limpa o utilizador público do frontend.
     *
     * @returns Promise resolvida depois do logout.
     */
    async function signOut(): Promise<void> {
        setError(null);
        try {
            await logout();
            setUser(null);
            setStatus("anonymous");
        } catch (caught) {
            const message =
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível terminar a sessão.";
            setError(message);
            throw caught;
        }
    }

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        /**
         * Expira localmente a sessão quando qualquer pedido protegido recebe 401.
         */
        function handleUnauthorized(): void {
            setUser(null);
            setError(null);
            setStatus("anonymous");
        }

        window.addEventListener(SESSION_UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => {
            window.removeEventListener(
                SESSION_UNAUTHORIZED_EVENT,
                handleUnauthorized,
            );
        };
    }, []);

    return {
        user,
        status,
        loading: status === "checking",
        error,
        refresh,
        signOut,
    };
}
