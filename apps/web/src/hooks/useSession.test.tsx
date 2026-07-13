/**
 * Testa a máquina de estados da sessão sem cookies ou servidor real.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getCurrentUser, logout } from "../lib/apiClient.js";
import { useSession } from "./useSession.js";

vi.mock("../lib/apiClient.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../lib/apiClient.js")>();
    return {
        ...actual,
        getCurrentUser: vi.fn(),
        logout: vi.fn(),
    };
});

const currentUser = {
    id: "user-1",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};

describe("useSession", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUser).mockReset();
        vi.mocked(logout).mockReset();
    });

    it("passa de checking para authenticated", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
        const { result } = renderHook(() => useSession());

        expect(result.current.status).toBe("checking");
        await waitFor(() => expect(result.current.status).toBe("authenticated"));
        expect(result.current.user).toEqual(currentUser);
    });

    it("trata apenas 401 como sessão anónima", async () => {
        vi.mocked(getCurrentUser).mockRejectedValue(
            new ApiError("Sessão expirada.", 401, "SESSION_REVOKED"),
        );
        const { result } = renderHook(() => useSession());

        await waitFor(() => expect(result.current.status).toBe("anonymous"));
        expect(result.current.user).toBeNull();
    });

    it("mantém falhas de rede no estado unavailable em vez de simular logout", async () => {
        vi.mocked(getCurrentUser).mockRejectedValue(
            new ApiError("Sem ligação.", 0, "NETWORK_ERROR"),
        );
        const { result } = renderHook(() => useSession());

        await waitFor(() => expect(result.current.status).toBe("unavailable"));
        expect(result.current.error).toBe("Sem ligação.");
    });

    it("normaliza uma falha não Error durante a verificação", async () => {
        vi.mocked(getCurrentUser).mockRejectedValue("offline");
        const { result } = renderHook(() => useSession());

        await waitFor(() => expect(result.current.status).toBe("unavailable"));
        expect(result.current.error).toBe("Não foi possível validar a sessão.");
    });

    it("só limpa a sessão depois de logout confirmado", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
        vi.mocked(logout).mockRejectedValueOnce(new Error("API indisponível."));
        const { result } = renderHook(() => useSession());
        await waitFor(() => expect(result.current.status).toBe("authenticated"));

        await act(async () => {
            await expect(result.current.signOut()).rejects.toThrow(
                "API indisponível.",
            );
        });
        expect(result.current.status).toBe("authenticated");
        expect(result.current.user).toEqual(currentUser);
    });

    it("limpa a sessão depois de logout confirmado", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
        vi.mocked(logout).mockResolvedValue({ ok: true });
        const { result } = renderHook(() => useSession());
        await waitFor(() => expect(result.current.status).toBe("authenticated"));

        await act(async () => result.current.signOut());
        expect(result.current.status).toBe("anonymous");
        expect(result.current.user).toBeNull();
    });

    it("reage ao evento global de 401", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
        const { result } = renderHook(() => useSession());
        await waitFor(() => expect(result.current.status).toBe("authenticated"));

        act(() => {
            window.dispatchEvent(new Event("studyflow:session-unauthorized"));
        });
        expect(result.current.status).toBe("anonymous");
        expect(result.current.error).toBeNull();
    });
});
