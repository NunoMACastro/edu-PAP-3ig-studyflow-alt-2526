// apps/api/src/common/architecture/domain-boundary.spec.ts
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    assertAllowedDomainImport,
    resolveBackendDomainFromModulePath,
} from "./domain-boundary.js";
import type { BackendDomain } from "./domain-boundary.js";

type ModuleImport = {
    importedSymbol: string;
    importPath: string;
    domain: BackendDomain;
};

const currentDir = dirname(fileURLToPath(import.meta.url));
const appModulePath = resolve(currentDir, "../../app.module.ts");
const moduleImportPattern =
    /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"(\.\/modules\/[^"]+)";/g;

/**
 * Extrai os imports de módulos declarados no AppModule.
 *
 * @returns Lista de imports com domínio arquitetural resolvido.
 */
function listAppModuleImports(): ModuleImport[] {
    const source = readFileSync(appModulePath, "utf8");
    const imports: ModuleImport[] = [];

    for (const match of source.matchAll(moduleImportPattern)) {
        const importedSymbol = match[1];
        const importPath = match[2];
        if (importedSymbol === undefined || importPath === undefined) {
            throw new Error("Import de módulo inválido no AppModule.");
        }

        // Cada módulo raiz precisa de domínio para evitar crescimento sem ownership arquitetural.
        imports.push({
            importedSymbol,
            importPath,
            domain: resolveBackendDomainFromModulePath(importPath),
        });
    }

    return imports;
}

describe("assertAllowedDomainImport", () => {
    it("permite IA consumir materiais através de services públicos", () => {
        expect(() =>
            assertAllowedDomainImport({
                fromDomain: "AI",
                toDomain: "MATERIALS",
                importKind: "PUBLIC_SERVICE",
                importPath: "../materials/materials.service.js",
                importedSymbol: "MaterialsService",
            }),
        ).not.toThrow();
    });

    it("bloqueia IA a importar schemas internos de materiais", () => {
        // A IA deve pedir fontes ao service autorizado, não ler modelos persistidos diretamente.
        expect(() =>
            assertAllowedDomainImport({
                fromDomain: "AI",
                toDomain: "MATERIALS",
                importKind: "SCHEMA",
                importPath: "../materials/schemas/material.schema.js",
                importedSymbol: "MaterialSchema",
            }),
        ).toThrow("Importação bloqueada");
    });

    it("bloqueia operações a depender de domínios de negócio", () => {
        // O módulo operacional deve observar estado, não ler dados privados diretamente.
        expect(() =>
            assertAllowedDomainImport({
                fromDomain: "OPERATIONS",
                toDomain: "AI",
                importKind: "PUBLIC_SERVICE",
                importPath: "../ai/study-tools.service.js",
                importedSymbol: "StudyToolsService",
            }),
        ).toThrow("Importação bloqueada");
    });

    it("bloqueia módulos sem domínio reconhecido", () => {
        expect(() =>
            assertAllowedDomainImport({
                fromDomain: "UNKNOWN",
                toDomain: "AI",
                importKind: "MODULE",
                importPath: "./modules/new-feature/new-feature.module.js",
                importedSymbol: "NewFeatureModule",
            }),
        ).toThrow("Importação sem domínio reconhecido");
    });
});

describe("fronteiras declaradas no AppModule", () => {
    it("classifica todos os módulos raiz por domínio reconhecido", () => {
        const unknownImports = listAppModuleImports().filter(
            ({ domain }) => domain === "UNKNOWN",
        );

        expect(unknownImports).toEqual([]);
    });

    it("mantém cobertura dos domínios principais de RNF25", () => {
        const domains = new Set(listAppModuleImports().map(({ domain }) => domain));

        expect(Array.from(domains)).toEqual(
            expect.arrayContaining(["AI", "MATERIALS", "TEACHER", "STUDENT"]),
        );
    });

    it("não declara o mesmo módulo raiz duas vezes", () => {
        const importedSymbols = listAppModuleImports().map(
            ({ importedSymbol }) => importedSymbol,
        );
        const uniqueSymbols = new Set(importedSymbols);

        expect(uniqueSymbols.size).toBe(importedSymbols.length);
    });
});