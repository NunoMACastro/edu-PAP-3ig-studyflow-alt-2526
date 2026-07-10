/**
 * Testa parsing e sinalização global do cliente HTTP canónico.
 */
import { describe, expect, it, vi } from "vitest";
import {
    ApiError,
    requestJson,
    SESSION_UNAUTHORIZED_EVENT,
} from "./apiClient.js";

describe("requestJson", () => {
    it("preserva status, code e mensagens de validação", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        code: "VALIDATION_FAILED",
                        message: ["Título inválido.", "Pergunta em falta."],
                    }),
                    { status: 400 },
                ),
            ),
        );

        await expect(requestJson("/api/test")).rejects.toEqual(
            expect.objectContaining({
                status: 400,
                code: "VALIDATION_FAILED",
                message: "Título inválido. Pergunta em falta.",
            }),
        );
    });

    it("aceita respostas vazias e sinaliza 401 à sessão", async () => {
        const unauthorized = vi.fn();
        window.addEventListener(SESSION_UNAUTHORIZED_EVENT, unauthorized);
        vi.stubGlobal(
            "fetch",
            vi.fn()
                .mockResolvedValueOnce(new Response(null, { status: 204 }))
                .mockResolvedValueOnce(
                    new Response(
                        JSON.stringify({ code: "UNAUTHENTICATED", message: "Sessão expirada." }),
                        { status: 401 },
                    ),
                ),
        );

        await expect(requestJson<void>("/api/no-content")).resolves.toBeUndefined();
        await expect(requestJson("/api/protected")).rejects.toBeInstanceOf(ApiError);
        expect(unauthorized).toHaveBeenCalledTimes(1);
        window.removeEventListener(SESSION_UNAUTHORIZED_EVENT, unauthorized);
    });

    it("preserva o boundary multipart e normaliza erros de upload", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({ code: "UPLOAD_LIMIT", message: "Limite atingido." }),
                { status: 429 },
            ),
        );
        vi.stubGlobal("fetch", fetchMock);
        const body = new FormData();
        body.append("file", new Blob(["x"]), "material.txt");

        await expect(
            requestJson("/api/upload", { method: "POST", body }),
        ).rejects.toEqual(
            expect.objectContaining({ status: 429, code: "UPLOAD_LIMIT" }),
        );
        const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
        expect(headers.has("content-type")).toBe(false);
        expect(headers.get("x-studyflow-csrf")).toBe("1");
    });
});
