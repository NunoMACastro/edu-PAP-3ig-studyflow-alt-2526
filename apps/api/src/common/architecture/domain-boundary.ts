/**
 * Define regras simples de fronteira entre domínios backend StudyFlow.
 */
export type BackendDomain =
    | "AI"
    | "MATERIALS"
    | "TEACHER"
    | "STUDENT"
    | "OPERATIONS"
    | "AUTH"
    | "GROUP"
    | "UNKNOWN";

/**
 * Tipo de contrato importado entre domínios.
 *
 * `PUBLIC_SERVICE` e `MODULE` são fronteiras aceitáveis; `SCHEMA` e
 * `INTERNAL_FILE` exigem mais cuidado porque podem contornar validações.
 */
export type DomainImportKind =
    | "MODULE"
    | "PUBLIC_SERVICE"
    | "DTO"
    | "SCHEMA"
    | "INTERNAL_FILE";

/**
 * Pedido de validação de uma importação entre domínios.
 */
export type DomainImportRequest = {
    fromDomain: BackendDomain;
    toDomain: BackendDomain;
    importKind: DomainImportKind;
    importPath: string;
    importedSymbol: string;
};

const DOMAIN_BY_MODULE_PREFIX: ReadonlyArray<{
    prefix: string;
    domain: BackendDomain;
}> = [
    { prefix: "./modules/ai/", domain: "AI" },
    { prefix: "./modules/source-grounded-ai/", domain: "AI" },
    { prefix: "./modules/class-ai/", domain: "AI" },
    { prefix: "./modules/teacher-ai/", domain: "AI" },
    { prefix: "./modules/study-group-ai/", domain: "AI" },
    { prefix: "./modules/ai-", domain: "AI" },
    { prefix: "./modules/external-knowledge-ai/", domain: "AI" },
    { prefix: "./modules/adaptive-explanations/", domain: "AI" },
    { prefix: "./modules/material", domain: "MATERIALS" },
    { prefix: "./modules/official-materials/", domain: "MATERIALS" },
    { prefix: "./modules/external-material-imports/", domain: "MATERIALS" },
    { prefix: "./modules/classes/", domain: "TEACHER" },
    { prefix: "./modules/subjects/", domain: "TEACHER" },
    { prefix: "./modules/class-", domain: "TEACHER" },
    { prefix: "./modules/students/", domain: "STUDENT" },
    { prefix: "./modules/study-rooms/", domain: "GROUP" },
    { prefix: "./modules/study/", domain: "STUDENT" },
    { prefix: "./modules/study-areas/", domain: "STUDENT" },
    { prefix: "./modules/auth/", domain: "AUTH" },
    { prefix: "./modules/users/", domain: "AUTH" },
    { prefix: "./modules/study-group", domain: "GROUP" },
    { prefix: "./modules/audit-log/", domain: "OPERATIONS" },
    { prefix: "./modules/admin-users/", domain: "OPERATIONS" },
    { prefix: "./modules/context-notifications/", domain: "OPERATIONS" },
    { prefix: "./modules/follow-up-alerts/", domain: "OPERATIONS" },
    { prefix: "./modules/notification", domain: "OPERATIONS" },
    { prefix: "./modules/privacy-", domain: "OPERATIONS" },
    { prefix: "./modules/account-deletion/", domain: "OPERATIONS" },
    { prefix: "./modules/curriculum-navigation/", domain: "OPERATIONS" },
    { prefix: "./modules/study-alerts/", domain: "OPERATIONS" },
    { prefix: "./modules/unified-search/", domain: "OPERATIONS" },
    { prefix: "./modules/mf2/", domain: "OPERATIONS" },
];

const ALLOWED_IMPORT_KINDS: Record<
    Exclude<BackendDomain, "UNKNOWN">,
    Partial<Record<Exclude<BackendDomain, "UNKNOWN">, DomainImportKind[]>>
> = {
    AI: {
        AI: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        TEACHER: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        STUDENT: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        GROUP: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    MATERIALS: {
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        TEACHER: ["PUBLIC_SERVICE", "DTO"],
        GROUP: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    TEACHER: {
        TEACHER: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        GROUP: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    STUDENT: {
        STUDENT: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        GROUP: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    OPERATIONS: {
        OPERATIONS: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
    },
    AUTH: {
        AUTH: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        TEACHER: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    GROUP: {
        GROUP: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        MATERIALS: ["PUBLIC_SERVICE", "DTO"],
        AI: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
};

/**
 * Resolve o domínio backend a partir do caminho importado no AppModule.
 *
 * @param importPath Caminho relativo usado no import.
 * @returns Domínio reconhecido ou `UNKNOWN` quando o caminho deve ser revisto.
 */
export function resolveBackendDomainFromModulePath(
    importPath: string,
): BackendDomain {
    const match = DOMAIN_BY_MODULE_PREFIX.find(({ prefix }) =>
        importPath.startsWith(prefix),
    );

    // UNKNOWN força revisão humana para não deixar módulos novos sem owner arquitetural.
    return match?.domain ?? "UNKNOWN";
}

/**
 * Resolve o domínio backend a partir de caminhos reais dentro de `src/modules`.
 *
 * @param sourcePath Caminho absoluto, relativo ao projeto ou relativo ao `AppModule`.
 * @returns Domínio reconhecido ou `UNKNOWN` quando o ficheiro ainda não tem owner arquitetural.
 */
export function resolveBackendDomainFromSourcePath(
    sourcePath: string,
): BackendDomain {
    const normalizedPath = sourcePath.replaceAll("\\", "/");
    const modulesMarker = normalizedPath.includes("/src/modules/")
        ? "/modules/"
        : "modules/";
    const modulesIndex = normalizedPath.indexOf(modulesMarker);

    if (modulesIndex < 0) {
        return resolveBackendDomainFromModulePath(normalizedPath);
    }

    const modulePath = normalizedPath.slice(modulesIndex + modulesMarker.length);
    return resolveBackendDomainFromModulePath(`./modules/${modulePath}`);
}

/**
 * Classifica uma importação real para a política de fronteiras.
 *
 * @param importPath Caminho declarado no import TypeScript.
 * @returns Tipo de importação usado por `assertAllowedDomainImport`.
 */
export function resolveDomainImportKind(importPath: string): DomainImportKind {
    const normalizedPath = importPath.replaceAll("\\", "/");

    if (normalizedPath.includes("/schemas/") || normalizedPath.includes(".schema.")) {
        return "SCHEMA";
    }

    if (normalizedPath.includes("/dto/")) {
        return "DTO";
    }

    if (normalizedPath.endsWith(".module.js") || normalizedPath.endsWith(".module.ts")) {
        return "MODULE";
    }

    if (
        normalizedPath.endsWith(".service.js") ||
        normalizedPath.endsWith(".service.ts") ||
        normalizedPath.includes("/providers/")
    ) {
        return "PUBLIC_SERVICE";
    }

    return "INTERNAL_FILE";
}

/**
 * Confirma se um domínio pode consumir outro sem quebrar a arquitetura.
 *
 * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
export function assertAllowedDomainImport(request: DomainImportRequest): void {
    const { fromDomain, importKind, importedSymbol, importPath, toDomain } = request;

    if (fromDomain === "UNKNOWN" || toDomain === "UNKNOWN") {
        // Domínios desconhecidos devem ser classificados antes de serem aceites no backend.
        throw new Error(
            `Importação sem domínio reconhecido: ${importedSymbol} em ${importPath}.`,
        );
    }

    const allowedKinds = ALLOWED_IMPORT_KINDS[fromDomain][toDomain] ?? [];
    if (!allowedKinds.includes(importKind)) {
        // A mensagem orienta o aluno para trocar dependência interna por service público.
        throw new Error(
            `Importação bloqueada: ${fromDomain} não deve importar ${importKind} de ${toDomain} (${importedSymbol}).`,
        );
    }
}
