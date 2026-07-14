import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import {
    assertAllowedDomainImport,
    resolveBackendDomainFromModulePath,
    resolveBackendDomainFromSourcePath,
    resolveDomainImportKind,
} from "./domain-boundary.js";
import type { BackendDomain, DomainImportKind } from "./domain-boundary.js";

type ModuleImport = {
    importedSymbol: string;
    importPath: string;
    domain: BackendDomain;
};

type SourceImport = {
    sourceFilePath: string;
    importPath: string;
    resolvedImportPath: string;
    importedSymbol: string;
    fromDomain: BackendDomain;
    toDomain: BackendDomain;
    importKind: DomainImportKind;
    isTypeOnly: boolean;
};

type AllowedDangerousImport = {
    sourceFilePath: string;
    importPath: string;
    rationale: string;
};

const appModulePath = resolve(process.cwd(), "src/app.module.ts");
const modulesRootPath = resolve(process.cwd(), "src/modules");
const moduleImportPattern =
    /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"(\.\/modules\/[^"]+)";/g;
const sourceImportPattern =
    /import\s+(type\s+)?[\s\S]*?\s+from\s+"([^"]+)";/g;
const auditedBoundarySourcePaths = [
    "src/modules/source-grounded-ai/source-grounded-ai.service.ts",
    "src/modules/study-rooms/study-rooms.module.ts",
    "src/modules/study-rooms/room-shares.service.ts",
    "src/modules/unified-search/unified-search.service.ts",
] as const;

const allowedDangerousImports: readonly AllowedDangerousImport[] = [
    {
        sourceFilePath: "src/modules/study-rooms/study-rooms.module.ts",
        importPath: "../auth/schemas/user.schema.js",
        rationale: "salas persistem membership com utilizadores canonicos.",
    },
];

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

/**
 * Extrai imports relativos entre módulos reais auditados da API.
 *
 * @returns Imports com domínio de origem, domínio de destino e tipo de contrato.
 */
function listSourceImports(): SourceImport[] {
    return auditedBoundarySourcePaths.flatMap((relativeSourceFilePath) => {
        const sourceFilePath = resolve(process.cwd(), relativeSourceFilePath);
        const source = readFileSync(sourceFilePath, "utf8");
        const imports: SourceImport[] = [];

        for (const match of source.matchAll(sourceImportPattern)) {
            const importPath = match[2];
            if (!importPath?.startsWith(".")) continue;

            const resolvedImportPath = resolve(
                dirname(sourceFilePath),
                importPath.replace(/\.js$/, ".ts"),
            );
            if (!resolvedImportPath.startsWith(modulesRootPath)) continue;

            const importedSymbol = match[0].replace(/\s+/g, " ").trim();
            imports.push({
                sourceFilePath: projectPath(sourceFilePath),
                importPath,
                resolvedImportPath: projectPath(resolvedImportPath),
                importedSymbol,
                fromDomain: resolveBackendDomainFromSourcePath(sourceFilePath),
                toDomain: resolveBackendDomainFromSourcePath(resolvedImportPath),
                importKind: resolveDomainImportKind(importPath),
                isTypeOnly: Boolean(match[1]),
            });
        }

        return imports;
    });
}

/**
 * Converte caminhos absolutos em caminhos relativos estáveis no relatório de teste.
 *
 * @param filePath Caminho absoluto.
 * @returns Caminho relativo ao package API.
 */
function projectPath(filePath: string): string {
    return relative(process.cwd(), filePath).replaceAll("\\", "/");
}

/**
 * Confirma se uma importação interna perigosa está documentada como exceção temporária.
 *
 * @param sourceImport Import real extraído do código.
 * @returns `true` quando existe exceção explícita.
 */
function isAllowlistedDangerousImport(sourceImport: SourceImport): boolean {
    return allowedDangerousImports.some(
        (allowedImport) =>
            allowedImport.sourceFilePath === sourceImport.sourceFilePath &&
            allowedImport.importPath === sourceImport.importPath &&
            allowedImport.rationale.trim().length >= 20,
    );
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

describe("fronteiras dos imports reais entre módulos", () => {
    it("classifica todos os ficheiros de módulos auditados por domínio reconhecido", () => {
        const unknownFiles = auditedBoundarySourcePaths
            .filter(
                (filePath) =>
                    resolveBackendDomainFromSourcePath(filePath) === "UNKNOWN",
            );

        expect(unknownFiles).toEqual([]);
    });

    it("bloqueia imports internos perigosos sem exceção explícita", () => {
        const violations = listSourceImports()
            .filter(
                (sourceImport) =>
                    sourceImport.fromDomain !== sourceImport.toDomain &&
                    !["UNKNOWN"].includes(sourceImport.fromDomain) &&
                    !["UNKNOWN"].includes(sourceImport.toDomain) &&
                    ["SCHEMA", "INTERNAL_FILE"].includes(sourceImport.importKind),
            )
            .filter((sourceImport) => {
                try {
                    assertAllowedDomainImport(sourceImport);
                    return false;
                } catch {
                    return !sourceImport.isTypeOnly && !isAllowlistedDangerousImport(sourceImport);
                }
            })
            .map((sourceImport) => ({
                sourceFilePath: sourceImport.sourceFilePath,
                importPath: sourceImport.importPath,
                fromDomain: sourceImport.fromDomain,
                toDomain: sourceImport.toDomain,
                importKind: sourceImport.importKind,
            }));

        expect(violations).toEqual([]);
    });

    it("mantém as exceções de fronteira documentadas e ainda existentes", () => {
        const imports = listSourceImports();
        const staleAllowlist = allowedDangerousImports.filter(
            (allowedImport) =>
                !imports.some(
                    (sourceImport) =>
                        sourceImport.sourceFilePath === allowedImport.sourceFilePath &&
                        sourceImport.importPath === allowedImport.importPath,
                ),
        );

        expect(staleAllowlist).toEqual([]);
    });
});
