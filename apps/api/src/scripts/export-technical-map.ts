// apps/api/src/scripts/export-technical-map.ts
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type TechnicalMapModule = {
    name: string;
    domain: string;
    responsibility: string;
    securityRule: string;
    critical: boolean;
};

export type TechnicalMapEndpoint = {
    method: string;
    path: string;
    input: string;
    output: string;
    securityRule: string;
};

export type TechnicalMapModel = {
    name: string;
    domain: string;
    sensitiveData: string;
    protectionRule: string;
};

export type TechnicalMapFlow = {
    name: string;
    source: string;
    target: string;
    controlledFailure: string;
};

export type TechnicalMap = {
    modules: TechnicalMapModule[];
    routes: string[];
    endpoints: TechnicalMapEndpoint[];
    models: TechnicalMapModel[];
    flows: TechnicalMapFlow[];
};

export const REQUIRED_MODULES = [
    "AuthModule",
    "MaterialsModule",
    "OfficialMaterialsModule",
    "SourceGroundedAiModule",
    "ClassAiModule",
    "AiModelPoliciesModule",
    "AiQuotasModule",
    "AuditLogModule",
] as const;

export const TECHNICAL_MAP: TechnicalMap = {
    modules: [
        {
            name: "AuthModule",
            domain: "Autenticação",
            responsibility: "Registo, login, sessão e utilizador autenticado.",
            securityRule: "Cookies HttpOnly e sessão validada no backend.",
            critical: true,
        },
        {
            name: "MaterialsModule",
            domain: "Materiais privados",
            responsibility: "Materiais submetidos pelo aluno em áreas de estudo.",
            securityRule: "O userId vem da sessão autenticada e valida ownership.",
            critical: true,
        },
        {
            name: "OfficialMaterialsModule",
            domain: "Materiais oficiais",
            responsibility: "Materiais de professor associados a disciplina ou turma.",
            securityRule: "Professor e disciplina são validados no backend.",
            critical: true,
        },
        {
            name: "SourceGroundedAiModule",
            domain: "IA com fontes",
            responsibility: "Respostas baseadas em excertos citáveis.",
            securityRule: "Bloqueia resposta quando não há fontes processáveis.",
            critical: true,
        },
        {
            name: "ClassAiModule",
            domain: "IA da disciplina",
            responsibility: "Assistente da turma ou disciplina com voz docente.",
            securityRule: "Valida membership da disciplina e materiais oficiais.",
            critical: true,
        },
        {
            name: "AiModelPoliciesModule",
            domain: "Governança IA",
            responsibility: "Políticas de modelo e limites por contexto.",
            securityRule: "Não expõe chaves, prompts privados nem respostas completas.",
            critical: true,
        },
        {
            name: "AiQuotasModule",
            domain: "Quotas IA",
            responsibility: "Reserva e consumo de quotas por aluno, turma ou grupo.",
            securityRule: "Limites aplicados no backend antes da chamada ao provider.",
            critical: true,
        },
        {
            name: "AuditLogModule",
            domain: "Auditoria",
            responsibility: "Eventos técnicos e sensíveis para defesa e rastreabilidade.",
            securityRule: "Logs minimizados, sem materiais privados nem credenciais.",
            critical: true,
        },
    ],
    routes: [
        "`/app/areas/:id/ferramentas` -> `StudyToolsPage`",
        "`/app/professor/disciplinas/:id/materiais` -> `TeacherOfficialMaterialsPage`",
        "`/app/disciplinas/:id/ia` -> `StudentClassAiPage`",
        "`/app/admin/governanca` -> `AdminGovernancePage`",
    ],
    endpoints: [
        {
            method: "POST",
            path: "/api/auth/login",
            input: "email e password",
            output: "sessão HttpOnly e utilizador público",
            securityRule: "Não devolve passwordHash nem tokens de sessão ao frontend.",
        },
        {
            method: "GET",
            path: "/api/auth/me",
            input: "cookie de sessão",
            output: "utilizador autenticado",
            securityRule: "Falha com 401 quando a sessão não existe.",
        },
        {
            method: "POST",
            path: "/api/study-areas/:studyAreaId/materials",
            input: "material privado do aluno",
            output: "material criado",
            securityRule: "O userId vem da sessão autenticada e a área valida ownership.",
        },
        {
            method: "GET",
            path: "/api/study-areas/:id/summaries",
            input: "área de estudo",
            output: "resumos da área",
            securityRule: "Ownership da área é validado no backend.",
        },
        {
            method: "POST",
            path: "/api/ai/source-grounded-answers",
            input: "job de indexação e pergunta",
            output: "resposta IA com citações",
            securityRule: "Bloqueia resposta quando não há fontes processáveis autorizadas.",
        },
        {
            method: "POST",
            path: "/api/student/subjects/:subjectId/ai/answers",
            input: "pergunta do aluno",
            output: "resposta IA citada",
            securityRule: "Membership da disciplina e fontes oficiais são obrigatórias.",
        },
    ],
    models: [
        {
            name: "User",
            domain: "Identidade",
            sensitiveData: "email, password hash",
            protectionRule: "Hash nunca é devolvido ao frontend.",
        },
        {
            name: "StudyArea",
            domain: "Estudo individual",
            sensitiveData: "relação com aluno",
            protectionRule: "Ownership por sessão autenticada.",
        },
        {
            name: "Material",
            domain: "Materiais privados",
            sensitiveData: "conteúdo e metadados de estudo",
            protectionRule: "Visível apenas ao aluno dono.",
        },
        {
            name: "OfficialMaterial",
            domain: "Disciplina e turma",
            sensitiveData: "material criado por professor",
            protectionRule: "Acesso limitado por professor, turma e disciplina.",
        },
        {
            name: "SourceGroundedAiAnswer",
            domain: "IA com fontes",
            sensitiveData: "pergunta, resposta e citações",
            protectionRule: "Sem resposta quando faltam fontes processáveis.",
        },
        {
            name: "AuditLog",
            domain: "Auditoria",
            sensitiveData: "eventos técnicos",
            protectionRule: "Minimização de dados pessoais e sem conteúdos privados completos.",
        },
    ],
    flows: [
        {
            name: "Login seguro",
            source: "POST /api/auth/login",
            target: "shell autenticada",
            controlledFailure: "401 para credenciais inválidas.",
        },
        {
            name: "Resumo IA privado",
            source: "materiais da área",
            target: "artefacto IA com fontes",
            controlledFailure: "bloqueio quando não há fontes processáveis.",
        },
        {
            name: "Material oficial",
            source: "professor e disciplina",
            target: "material oficial indexável",
            controlledFailure: "403 quando o professor não tem acesso.",
        },
        {
            name: "IA com fontes obrigatórias",
            source: "POST /api/ai/source-grounded-answers",
            target: "resposta citada",
            controlledFailure: "erro controlado quando não há fontes autorizadas.",
        },
        {
            name: "IA da disciplina",
            source: "aluno inscrito",
            target: "resposta com citações",
            controlledFailure: "403 sem membership e erro controlado sem fontes.",
        },
    ],
};

/**
 * Resolve o caminho do AppModule tanto a partir da raiz do repositório como de apps/api.
 *
 * @returns Caminho absoluto para apps/api/src/app.module.ts.
 */
export async function resolveAppModulePath(): Promise<string> {
    const candidates = [
        resolve(process.cwd(), "src/app.module.ts"),
        resolve(process.cwd(), "apps/api/src/app.module.ts"),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // A validação tenta o próximo caminho para funcionar em npm --prefix e na raiz do repo.
        }
    }

    throw new Error("Não foi encontrado apps/api/src/app.module.ts.");
}

/**
 * Extrai os módulos importados no AppModule através de leitura estática.
 *
 * @param appModuleSource Conteúdo textual de apps/api/src/app.module.ts.
 * @returns Lista ordenada de módulos importados.
 */
export function extractImportedModules(appModuleSource: string): string[] {
    const matches = appModuleSource.matchAll(/import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"[^"]+";/g);
    return [...new Set([...matches].map((match) => match[1]))].sort();
}

/**
 * Garante que os módulos críticos continuam presentes no AppModule.
 *
 * @param importedModules Módulos encontrados no ficheiro raiz da API.
 * @param requiredModules Módulos críticos exigidos pelo mapa técnico.
 */
export function assertRequiredModules(
    importedModules: readonly string[],
    requiredModules: readonly string[] = REQUIRED_MODULES,
): void {
    const missing = requiredModules.filter((moduleName) => !importedModules.includes(moduleName));

    if (missing.length > 0) {
        // A falha é explícita para impedir documentação verde quando um módulo crítico desaparece.
        throw new Error(`Módulos críticos ausentes no AppModule: ${missing.join(", ")}.`);
    }
}

/**
 * Cria uma linha de tabela Markdown segura.
 *
 * @param cells Valores textuais da linha.
 * @returns Linha Markdown com separadores escapados.
 */
export function tableRow(cells: readonly string[]): string {
    return `| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
}

/**
 * Gera o Markdown do mapa técnico mínimo.
 *
 * @param map Contratos técnicos documentados.
 * @returns Documento Markdown completo para docs/technical/STUDYFLOW-TECHNICAL-MAP.md.
 */
export function buildTechnicalMapMarkdown(map: TechnicalMap): string {
    const modules = map.modules.map((item) =>
        tableRow([
            `\`${item.name}\``,
            item.domain,
            item.responsibility,
            item.securityRule,
        ]),
    );

    const endpoints = map.endpoints.map((endpoint) => {
        if (endpoint.securityRule.trim().length === 0) {
            // Cada endpoint crítico tem de declarar a proteção que evita exposição de dados.
            throw new Error(`Endpoint ${endpoint.method} ${endpoint.path} não declara regra de segurança.`);
        }

        return tableRow([
            `\`${endpoint.method}\``,
            `\`${endpoint.path}\``,
            endpoint.input,
            endpoint.output,
            endpoint.securityRule,
        ]);
    });

    const models = map.models.map((model) =>
        tableRow([
            `\`${model.name}\``,
            model.domain,
            model.sensitiveData,
            model.protectionRule,
        ]),
    );

    const flows = map.flows.map((flow) =>
        tableRow([flow.name, flow.source, flow.target, flow.controlledFailure]),
    );

    return [
        "# StudyFlow - mapa técnico mínimo",
        "",
        "## Módulos backend críticos",
        "",
        "| Módulo | Domínio | Responsabilidade | Segurança documentada |",
        "| --- | --- | --- | --- |",
        ...modules,
        "",
        "## Rotas frontend críticas",
        "",
        ...map.routes.map((route) => `- ${route}`),
        "",
        "## Endpoints críticos",
        "",
        "| Método | Endpoint | Entrada principal | Resposta esperada | Regra de segurança |",
        "| --- | --- | --- | --- | --- |",
        ...endpoints,
        "",
        "## Modelos principais",
        "",
        "| Modelo/schema | Domínio | Dados sensíveis | Regra de proteção |",
        "| --- | --- | --- | --- |",
        ...models,
        "",
        "## Fluxos críticos",
        "",
        "| Fluxo | Origem | Destino | Falha controlada obrigatória |",
        "| --- | --- | --- | --- |",
        ...flows,
        "",
    ].join("\n");
}

/**
 * Lê o AppModule, valida módulos críticos e gera o mapa.
 *
 * @returns Markdown pronto para gravar em docs/technical/STUDYFLOW-TECHNICAL-MAP.md.
 */
export async function buildTechnicalMapFromAppModule(): Promise<string> {
    const appModulePath = await resolveAppModulePath();
    const appModuleSource = await readFile(appModulePath, "utf8");
    const importedModules = extractImportedModules(appModuleSource);

    assertRequiredModules(importedModules);

    return buildTechnicalMapMarkdown(TECHNICAL_MAP);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildTechnicalMapFromAppModule()
        .then((markdown) => {
            console.log(markdown);
        })
        .catch((error) => {
            const message = error instanceof Error ? error.message : "Erro desconhecido.";
            console.error(message);
            process.exitCode = 1;
        });
}