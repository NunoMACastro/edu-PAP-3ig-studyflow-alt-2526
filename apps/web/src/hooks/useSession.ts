/**
 * Disponibiliza um hook React para partilhar estado de hooks React.
 */
import { useEffect, useState } from "react";
import { getCurrentUser, logout, User } from "../lib/apiClient.js";

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
    const [loading, setLoading] = useState(true);

    /**
     * Recarrega a sessão a partir da API.
     *
     * @returns Promise resolvida depois de atualizar estado local.
     */
    async function refresh(): Promise<void> {
        setLoading(true);
        try {
            setUser(await getCurrentUser());
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Termina sessão e limpa o utilizador público do frontend.
     *
     * @returns Promise resolvida depois do logout.
     */
    async function signOut(): Promise<void> {
        await logout();
        setUser(null);
    }

    useEffect(() => {
        void refresh();
    }, []);

    return { user, loading, refresh, signOut };
}
