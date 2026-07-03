import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Modulo backend incluido no mapa tecnico minimo de StudyFlow.
 */
export type TechnicalMapModule = {
    name: string;
    domain: string;
    responsibility: string;
    securityRule: string;
    critical: boolean;
};

/**
 * Endpoint critico documentado para rastrear entrada, resposta e regra de seguranca.
 */
export type TechnicalMapEndpoint = {
    method: string;
    path: string;
    input: string;
    output: string;
    securityRule: string;
};

/**
 * Modelo persistido ou schema usado em fluxos criticos.
 */
export type TechnicalMapModel = {
    name: string;
    domain: string;
    sensitiveData: string;
    protectionRule: string;
};

/**
 * Fluxo funcional critico que deve ter falha controlada documentada.
 */
export type TechnicalMapFlow = {
    name: string;
    source: string;
    target: string;
    controlledFailure: string;
};

/**
 * Contrato completo exportado pelo mapa tecnico minimo.
 */
export type TechnicalMap = {
    modules: TechnicalMapModule[];
    routes: {
        path: string;
        page: string;
        profile: string;
        securityRule: string;
    }[];
    endpoints: TechnicalMapEndpoint[];
    models: TechnicalMapModel[];
    flows: TechnicalMapFlow[];
};

export const REQUIRED_MODULES = [
    "AuthModule",
    "StudentsModule",
    "StudyRoomsModule",
    "MaterialsModule",
    "OfficialMaterialsModule",
    "SourceGroundedAiModule",
    "TeacherAiModule",
    "ClassAiModule",
    "AiModelPoliciesModule",
    "AiQuotasModule",
    "AuditLogModule",
] as const;

export const TECHNICAL_MAP: TechnicalMap = {
    modules: [
        {
            name: "AuthModule",
            domain: "Autenticacao",
            responsibility: "Registo, login, sessao e utilizador autenticado.",
            securityRule: "Cookies HttpOnly e sessao validada no backend.",
            critical: true,
        },
        {
            name: "MaterialsModule",
            domain: "Materiais privados",
            responsibility: "Materiais submetidos pelo aluno em areas de estudo.",
            securityRule: "O userId vem da sessao autenticada e valida ownership.",
            critical: true,
        },
        {
            name: "StudentsModule",
            domain: "Perfil do aluno",
            responsibility: "Perfil editavel com ano escolar, curso e turma.",
            securityRule:
                "O perfil e lido pelo backend via sessao; o frontend nao envia ano para a IA da sala.",
            critical: true,
        },
        {
            name: "StudyRoomsModule",
            domain: "Salas de estudo",
            responsibility: "Salas, partilhas e IA partilhada da sala.",
            securityRule:
                "Membership e fontes autorizadas sao validadas antes do perfil pedagogico entrar no prompt.",
            critical: true,
        },
        {
            name: "OfficialMaterialsModule",
            domain: "Materiais oficiais",
            responsibility: "Materiais de professor associados a disciplina ou turma.",
            securityRule: "Professor e disciplina sao validados no backend.",
            critical: true,
        },
        {
            name: "SourceGroundedAiModule",
            domain: "IA com fontes",
            responsibility: "Respostas baseadas em excertos citaveis.",
            securityRule: "Bloqueia resposta quando nao ha fontes processaveis.",
            critical: true,
        },
        {
            name: "TeacherAiModule",
            domain: "Voz IA docente",
            responsibility: "Voz base por turma e override opcional por disciplina.",
            securityRule:
                "Ownership por professor, resolucao `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.",
            critical: true,
        },
        {
            name: "ClassAiModule",
            domain: "IA da disciplina",
            responsibility: "Assistente da turma ou disciplina com voz docente herdada.",
            securityRule:
                "Valida membership da disciplina, materiais oficiais e voz efetiva resolvida.",
            critical: true,
        },
        {
            name: "GuidedStudyRoomsModule",
            domain: "Salas guiadas",
            responsibility: "Salas docentes por turma com disciplina opcional.",
            securityRule:
                "Valida turma/professor/aluno; `subjectId` so e aceite se pertencer a turma.",
            critical: true,
        },
        {
            name: "AiModelPoliciesModule",
            domain: "Governanca IA",
            responsibility: "Politicas de modelo e limites por contexto.",
            securityRule: "Nao expoe chaves, prompts privados nem respostas completas.",
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
            responsibility: "Eventos tecnicos e sensiveis para defesa e rastreabilidade.",
            securityRule: "Logs minimizados, sem materiais privados nem credenciais.",
            critical: true,
        },
    ],
    routes: [
        {
            path: "/app/perfil",
            page: "ProfilePage",
            profile: "Aluno",
            securityRule:
                "A API guarda o ano escolar no perfil autenticado e a IA da sala le esse dado apenas no backend.",
        },
        {
            path: "/app/areas/:id/ferramentas",
            page: "StudyToolsPage",
            profile: "Aluno",
            securityRule:
                "A API filtra artefactos por area e utilizador autenticado.",
        },
        {
            path: "/app/salas/:id/ia",
            page: "RoomAiPage",
            profile: "Aluno",
            securityRule:
                "A pergunta nao envia ano; a API valida membership, fontes e perfil do aluno autenticado.",
        },
        {
            path: "/app/professor/turmas/:id/voz",
            page: "TeacherClassAiVoicePage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da turma antes de ler ou gravar voz base.",
        },
        {
            path: "/app/professor/disciplinas/:id/materiais",
            page: "TeacherOfficialMaterialsPage",
            profile: "Professor",
            securityRule:
                "A API valida professor, disciplina e materiais oficiais.",
        },
        {
            path: "/app/professor/disciplinas/:id/voz",
            page: "TeacherAiVoicePage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da disciplina e trata a configuracao como override.",
        },
        {
            path: "/app/professor/turmas/:id/salas-guiadas",
            page: "TeacherGuidedStudyRoomsPage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da turma e disciplina opcional da mesma turma.",
        },
        {
            path: "/app/disciplinas/:id/ia",
            page: "StudentClassAiPage",
            profile: "Aluno",
            securityRule: "A API valida inscricao na disciplina antes de responder.",
        },
        {
            path: "/app/turmas/:id/salas-guiadas",
            page: "StudentGuidedStudyRoomsPage",
            profile: "Aluno",
            securityRule:
                "A API valida inscricao na turma e nao expoe controlos de voz docente.",
        },
        {
            path: "/app/admin/governanca",
            page: "AdminGovernancePage",
            profile: "Admin",
            securityRule: "A API valida role de administracao no backend.",
        },
    ],
    endpoints: [
        {
            method: "POST",
            path: "/api/auth/login",
            input: "email e password",
            output: "sessao HttpOnly e utilizador publico",
            securityRule:
                "Nao devolve passwordHash nem tokens de sessao ao frontend.",
        },
        {
            method: "GET",
            path: "/api/auth/me",
            input: "cookie de sessao",
            output: "utilizador autenticado",
            securityRule: "Falha com 401 quando a sessao nao existe.",
        },
        {
            method: "GET",
            path: "/api/students/me/profile",
            input: "cookie de sessao",
            output: "perfil escolar do aluno",
            securityRule:
                "O userId vem da sessao; o frontend nao escolhe que perfil ler.",
        },
        {
            method: "POST",
            path: "/api/study-areas/:studyAreaId/materials",
            input: "material privado do aluno",
            output: "material criado",
            securityRule:
                "O userId vem da sessao autenticada e a area valida ownership.",
        },
        {
            method: "GET",
            path: "/api/study-areas/:id/summaries",
            input: "area de estudo",
            output: "resumos da area",
            securityRule: "Ownership da area e validado no backend.",
        },
        {
            method: "POST",
            path: "/api/ai/source-grounded-answers",
            input: "job de indexacao e pergunta",
            output: "resposta IA com citacoes",
            securityRule:
                "Bloqueia resposta quando nao ha fontes processaveis autorizadas.",
        },
        {
            method: "POST",
            path: "/api/study-rooms/:roomId/ai/answers",
            input: "pergunta e fontes opcionais da sala",
            output: "resposta IA com fontes da sala",
            securityRule:
                "Membership e fontes sao obrigatorias; o ano escolar vem do perfil autenticado e so adapta linguagem.",
        },
        {
            method: "GET",
            path: "/api/teacher/classes/:classId/ai-voice",
            input: "turma docente",
            output: "voz base da turma ou default",
            securityRule: "Valida ownership da turma.",
        },
        {
            method: "PUT",
            path: "/api/teacher/classes/:classId/ai-voice",
            input: "tom, detalhe e regras",
            output: "voz base da turma",
            securityRule: "Apenas professor dono da turma.",
        },
        {
            method: "GET",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "disciplina docente",
            output: "voz efetiva da disciplina",
            securityRule:
                "Valida ownership da disciplina e inclui metadata de heranca.",
        },
        {
            method: "PUT",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "tom, detalhe e regras",
            output: "override da disciplina",
            securityRule: "Apenas professor dono da disciplina.",
        },
        {
            method: "DELETE",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "disciplina docente",
            output: "voz efetiva herdada",
            securityRule: "Remove override sem apagar voz base da turma.",
        },
        {
            method: "POST",
            path: "/api/teacher/classes/:classId/guided-study-rooms",
            input: "sala guiada e `subjectId` opcional",
            output: "sala guiada criada",
            securityRule:
                "`subjectId`, quando existe, tem de pertencer a turma e ao professor.",
        },
        {
            method: "GET",
            path: "/api/teacher/classes/:classId/guided-study-rooms",
            input: "turma docente",
            output: "salas guiadas da turma",
            securityRule: "Valida ownership da turma.",
        },
        {
            method: "GET",
            path: "/api/student/classes/:classId/guided-study-rooms",
            input: "turma do aluno",
            output: "salas guiadas abertas",
            securityRule:
                "Valida inscricao na turma e nao devolve controlos de voz.",
        },
        {
            method: "POST",
            path: "/api/student/subjects/:subjectId/ai/answers",
            input: "pergunta do aluno",
            output: "resposta IA citada",
            securityRule: "Membership da disciplina e fontes oficiais sao obrigatorias.",
        },
    ],
    models: [
        {
            name: "User",
            domain: "Identidade",
            sensitiveData: "email, password hash",
            protectionRule: "Hash nunca e devolvido ao frontend.",
        },
        {
            name: "StudentProfile",
            domain: "Perfil do aluno",
            sensitiveData: "nome, ano escolar, curso e turma",
            protectionRule:
                "Lido por userId da sessao; o ano escolar adapta apenas a forma da resposta IA.",
        },
        {
            name: "StudyArea",
            domain: "Estudo individual",
            sensitiveData: "relacao com aluno",
            protectionRule: "Ownership por sessao autenticada.",
        },
        {
            name: "StudyRoom",
            domain: "Salas de estudo",
            sensitiveData: "membros e contexto colaborativo",
            protectionRule: "Membership validada antes de listar partilhas ou chamar IA.",
        },
        {
            name: "Material",
            domain: "Materiais privados",
            sensitiveData: "conteudo e metadados de estudo",
            protectionRule: "Visivel apenas ao aluno dono.",
        },
        {
            name: "OfficialMaterial",
            domain: "Disciplina e turma",
            sensitiveData: "material criado por professor",
            protectionRule: "Acesso limitado por professor, turma e disciplina.",
        },
        {
            name: "TeacherClassAiVoice",
            domain: "Voz IA docente",
            sensitiveData: "regras pedagogicas da turma",
            protectionRule: "Visivel/editavel apenas pelo professor dono da turma.",
        },
        {
            name: "TeacherAiVoice",
            domain: "Voz IA docente",
            sensitiveData: "override pedagogico da disciplina",
            protectionRule:
                "Visivel/editavel apenas pelo professor dono da disciplina.",
        },
        {
            name: "GuidedStudyRoom",
            domain: "Salas guiadas",
            sensitiveData: "agenda, objetivo e disciplina opcional",
            protectionRule:
                "Professor gere por turma; aluno le apenas salas abertas da turma inscrita.",
        },
        {
            name: "SourceGroundedAiAnswer",
            domain: "IA com fontes",
            sensitiveData: "pergunta, resposta e citacoes",
            protectionRule: "Sem resposta quando faltam fontes processaveis.",
        },
        {
            name: "RoomAiInteraction",
            domain: "IA da sala",
            sensitiveData: "pergunta, resposta e fontes da sala",
            protectionRule:
                "Nao guarda ano escolar; guarda apenas a interacao e IDs de fontes autorizadas.",
        },
        {
            name: "AuditLog",
            domain: "Auditoria",
            sensitiveData: "eventos tecnicos",
            protectionRule:
                "Minimizacao de dados pessoais e sem conteudos privados completos.",
        },
    ],
    flows: [
        {
            name: "Login seguro",
            source: "POST /api/auth/login",
            target: "shell autenticada",
            controlledFailure: "401 para credenciais invalidas.",
        },
        {
            name: "Resumo IA privado",
            source: "materiais da area",
            target: "artefacto IA com fontes",
            controlledFailure: "bloqueio quando nao ha fontes processaveis.",
        },
        {
            name: "Material oficial",
            source: "professor e disciplina",
            target: "material oficial indexavel",
            controlledFailure: "403 quando o professor nao tem acesso.",
        },
        {
            name: "Heranca de voz docente",
            source: "turma e disciplina opcional",
            target: "voz efetiva com `source` e `hasOverride`",
            controlledFailure:
                "default seguro quando nao ha configuracao e 403/404 fora do ownership.",
        },
        {
            name: "Sala guiada docente",
            source: "turma do professor",
            target: "sala com disciplina opcional",
            controlledFailure:
                "400/403 quando `subjectId` nao pertence a turma/professor.",
        },
        {
            name: "IA com fontes obrigatorias",
            source: "POST /api/ai/source-grounded-answers",
            target: "resposta citada",
            controlledFailure: "erro controlado quando nao ha fontes autorizadas.",
        },
        {
            name: "IA da sala adaptada ao ano escolar",
            source: "aluno membro pergunta na sala",
            target: "resposta com fontes da sala e linguagem adaptada",
            controlledFailure:
                "403 sem membership, 422 sem fontes e fallback neutro quando o ano escolar nao existe.",
        },
        {
            name: "IA da disciplina",
            source: "aluno inscrito",
            target: "resposta com citacoes e voz efetiva",
            controlledFailure: "403 sem membership e erro controlado sem fontes.",
        },
    ],
};

/**
 * Resolve o caminho do AppModule a partir da raiz do repo ou de real_dev/api.
 *
 * @returns Caminho absoluto para `real_dev/api/src/app.module.ts` ou `src/app.module.ts`.
 * @throws Error quando o ficheiro raiz da API nao existe.
 */
export async function resolveAppModulePath(): Promise<string> {
    const candidates = [
        resolve(process.cwd(), "src/app.module.ts"),
        resolve(process.cwd(), "real_dev/api/src/app.module.ts"),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // O script pode ser chamado por `npm --prefix real_dev/api` ou pela raiz do repo.
        }
    }

    throw new Error("Nao foi encontrado real_dev/api/src/app.module.ts.");
}

/**
 * Extrai imports nomeados de modulos a partir do AppModule.
 *
 * @param appModuleSource Conteudo textual de `app.module.ts`.
 * @returns Lista ordenada de modulos importados.
 */
export function extractImportedModules(appModuleSource: string): string[] {
    const matches = appModuleSource.matchAll(
        /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"[^"]+";/g,
    );
    return [...new Set([...matches].map((match) => match[1]))].sort();
}

/**
 * Garante que os modulos criticos continuam presentes no AppModule.
 *
 * @param importedModules Modulos encontrados no ficheiro raiz da API.
 * @param requiredModules Modulos criticos exigidos pelo mapa tecnico.
 * @throws Error quando algum modulo critico desaparece.
 */
export function assertRequiredModules(
    importedModules: readonly string[],
    requiredModules: readonly string[] = REQUIRED_MODULES,
): void {
    const missing = requiredModules.filter(
        (moduleName) => !importedModules.includes(moduleName),
    );

    if (missing.length > 0) {
        // Falha fechada: o mapa nao pode ficar verde se a app deixou de importar um modulo critico.
        throw new Error(`Modulos criticos ausentes no AppModule: ${missing.join(", ")}.`);
    }
}

/**
 * Cria uma linha de tabela Markdown com pipes escapados.
 *
 * @param cells Valores textuais da linha.
 * @returns Linha Markdown segura.
 */
export function tableRow(cells: readonly string[]): string {
    return `| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
}

/**
 * Gera o Markdown do mapa tecnico minimo.
 *
 * @param map Contratos tecnicos documentados.
 * @returns Documento Markdown completo.
 * @throws Error quando um endpoint critico nao declara regra de seguranca.
 */
export function buildTechnicalMapMarkdown(map: TechnicalMap): string {
    const moduleRows = map.modules.map((item) =>
        tableRow([
            `\`${item.name}\``,
            item.domain,
            item.responsibility,
            item.securityRule,
        ]),
    );
    const routeRows = map.routes.map((route) =>
        tableRow([`\`${route.path}\``, `\`${route.page}\``, route.profile, route.securityRule]),
    );
    const endpointRows = map.endpoints.map((endpoint) => {
        if (endpoint.securityRule.trim().length === 0) {
            // Cada endpoint critico tem de explicar a barreira que protege dados e contexto.
            throw new Error(
                `Endpoint ${endpoint.method} ${endpoint.path} nao declara regra de seguranca.`,
            );
        }

        return tableRow([
            `\`${endpoint.method}\``,
            `\`${endpoint.path}\``,
            endpoint.input,
            endpoint.output,
            endpoint.securityRule,
        ]);
    });
    const modelRows = map.models.map((model) =>
        tableRow([
            `\`${model.name}\``,
            model.domain,
            model.sensitiveData,
            model.protectionRule,
        ]),
    );
    const flowRows = map.flows.map((flow) =>
        tableRow([flow.name, `\`${flow.source}\``, flow.target, flow.controlledFailure]),
    );

    return [
        "# StudyFlow - mapa tecnico minimo",
        "",
        "## Objetivo",
        "",
        "Este documento liga os modulos, fluxos, modelos e endpoints criticos do StudyFlow na implementacao real em `real_dev`.",
        "Existe para cumprir `RNF27` e para dar a `BK-MF7-06` uma base concreta para escolher testes automatizados de modulos criticos.",
        "",
        "## Modulos backend criticos",
        "",
        "| Modulo | Dominio | Responsabilidade | Seguranca documentada |",
        "| --- | --- | --- | --- |",
        ...moduleRows,
        "",
        "## Rotas frontend criticas",
        "",
        "| Rota | Pagina | Perfil | Regra de seguranca |",
        "| --- | --- | --- | --- |",
        ...routeRows,
        "",
        "## Endpoints criticos",
        "",
        "| Metodo | Endpoint | Entrada principal | Resposta esperada | Regra de seguranca |",
        "| --- | --- | --- | --- | --- |",
        ...endpointRows,
        "",
        "## Modelos principais",
        "",
        "| Modelo/schema | Dominio | Dados sensiveis | Regra de protecao |",
        "| --- | --- | --- | --- |",
        ...modelRows,
        "",
        "## Fluxos criticos",
        "",
        "| Fluxo | Origem | Destino | Falha controlada obrigatoria |",
        "| --- | --- | --- | --- |",
        ...flowRows,
        "",
        "## Como validar",
        "",
        "1. Confirmar que `real_dev/api/src/app.module.ts` importa os modulos criticos diretos exigidos pelo script.",
        "2. Executar `npm --prefix real_dev/api test -- export-technical-map.spec.ts --runInBand`.",
        "3. Executar `npm --prefix real_dev/api run build`.",
        "4. Gerar a versao atualizada com `node real_dev/api/dist/scripts/export-technical-map.js`.",
        "5. Comparar o output gerado com este documento e atualizar o artefacto se algum contrato critico mudar.",
        "",
    ].join("\n");
}

/**
 * Valida o AppModule e devolve o Markdown do mapa tecnico.
 *
 * @returns Documento Markdown depois de confirmar modulos criticos.
 */
export async function exportTechnicalMap(): Promise<string> {
    const appModulePath = await resolveAppModulePath();
    const appModuleSource = await readFile(appModulePath, "utf8");
    assertRequiredModules(extractImportedModules(appModuleSource));
    return buildTechnicalMapMarkdown(TECHNICAL_MAP);
}

/**
 * Confirma se o ficheiro foi chamado como script compilado ou fonte direta.
 *
 * @param argv Argumentos do processo Node.js.
 * @returns `true` quando o entrypoint e este exportador.
 */
export function isTechnicalMapCli(argv: readonly string[] = process.argv): boolean {
    const entrypoint = argv[1] ?? "";
    return (
        entrypoint.endsWith("export-technical-map.js") ||
        entrypoint.endsWith("export-technical-map.ts")
    );
}

if (isTechnicalMapCli()) {
    exportTechnicalMap()
        .then((markdown) => {
            process.stdout.write(markdown);
        })
        .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Falha desconhecida.";
            console.error(message);
            process.exitCode = 1;
        });
}
