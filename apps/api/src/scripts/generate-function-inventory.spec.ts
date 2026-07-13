/** Unit tests for the AST-based function inventory generator. */
import { collectFileEntries, renderFunctionInventory } from "./generate-function-inventory.js";

describe("function inventory generator", () => {
    it("detecta declarações reais sem contar comentários ou strings", () => {
        const entries = collectFileEntries(
            "api/src/example.ts",
            `
                // function fake() {}
                export async function load(id: string) { return id; }
                class Service { run(value: number) { return value; } }
                const map = (value: string) => value;
                const text = "function alsoFake() {}";
            `,
            "API",
        );

        expect(entries.map((entry) => entry.name)).toEqual(["load", "Service.run", "map"]);
        expect(entries[0]).toMatchObject({ async: true, exported: true, parameters: 1 });
    });

    it("gera resumo e tabela determinísticos", () => {
        const entries = collectFileEntries(
            "web/src/example.tsx",
            "export const View = () => null;",
            "WEB",
        );
        const first = renderFunctionInventory(entries);
        expect(renderFunctionInventory(entries)).toBe(first);
        expect(first).toContain("| WEB | `web/src/example.tsx:1` | `View` | arrow |");
    });
});
