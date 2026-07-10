/**
 * Verifica que toda a superfície pública de pedidos da aplicação continua a
 * construir URLs locais da API e a usar o cliente HTTP autenticado.
 *
 * Este teste é deliberadamente orientado ao contrato público: quando se
 * acrescenta um novo endpoint ao módulo, ele passa automaticamente por este
 * smoke test e deixa de poder apontar acidentalmente para um host externo ou
 * produzir segmentos `undefined`.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "./apiClient.js";

type PublicApiFunction = (...args: unknown[]) => unknown;

const nonRequestExports = new Set([
    "ApiError",
    "isApiError",
    "requestJson",
]);

/**
 * Cria argumentos inofensivos suficientes para executar cada adaptador de
 * endpoint. Os valores não simulam dados do domínio: o objetivo é validar a
 * construção do pedido, ficando os fluxos de UI cobertos nos respetivos testes.
 */
function createArguments(name: string): unknown[] {
    if (name === "submitFileMaterial") {
        return [
            "resource-id",
            new File(["conteúdo de teste"], "material.pdf", {
                type: "application/pdf",
            }),
            "Material de teste",
        ];
    }

    if (name === "exportStudyToolArtifact") {
        return ["resource-id", "related-id", "md"];
    }

    return ["resource-id", "related-id", "PUBLISHED"];
}

describe("contrato dos adaptadores HTTP", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("mantém todos os endpoints públicos limitados a caminhos /api válidos", async () => {
        const fetchMock = vi.fn().mockImplementation(() =>
            Promise.resolve(
                new Response(JSON.stringify({ ok: true }), {
                    status: 200,
                    headers: {
                        "content-disposition": 'attachment; filename="export.md"',
                        "content-type": "application/json",
                    },
                }),
            ),
        );
        vi.stubGlobal("fetch", fetchMock);

        const requestFunctions = Object.entries(api)
            .filter(
                ([name, exportedValue]) =>
                    typeof exportedValue === "function" && !nonRequestExports.has(name),
            )
            .map(
                ([name, exportedValue]) =>
                    [name, exportedValue as PublicApiFunction] as const,
            );

        expect(requestFunctions.length).toBeGreaterThan(70);

        for (const [name, requestFunction] of requestFunctions) {
            await expect(
                Promise.resolve(
                    requestFunction(...createArguments(name)),
                ),
                `falha ao construir o pedido de ${name}`,
            ).resolves.toBeDefined();
        }

        expect(fetchMock).toHaveBeenCalledTimes(requestFunctions.length);

        for (const [url, options] of fetchMock.mock.calls as [string, RequestInit][]) {
            expect(url).toMatch(/^\/api\//);
            expect(url).not.toContain("undefined");
            expect(options.credentials).toBe("include");

            const headers = new Headers(options.headers);
            expect(headers.get("x-studyflow-csrf")).toBe("1");
        }
    });
});
