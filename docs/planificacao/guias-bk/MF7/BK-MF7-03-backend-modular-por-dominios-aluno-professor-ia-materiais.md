# BK-MF7-03 - Backend modular por domínios (aluno, professor, IA, materiais).

## Header

- `doc_id`: `GUIA-BK-MF7-03`
- `bk_id`: `BK-MF7-03`
- `macro`: `MF7`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF25`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-04`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar uma verificação simples de fronteiras entre domínios backend. O resultado observável é uma política que impede importações diretas perigosas entre módulos de aluno, professor, IA e materiais, e um teste que confirma que os módulos declarados em `AppModule` continuam classificados por domínio.

No fim, a equipa consegue demonstrar `RNF25` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF25` é essencial para manter o projeto evolutivo. Sem fronteiras, services de IA podem começar a consultar modelos de professores ou materiais diretamente, quebrando ownership e tornando os testes frágeis.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar ou documentar o contrato de arquitetura modular backend.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar pelo menos um caminho principal e um cenário negativo.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF25`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e a app já tem módulos backend, mas ainda falta uma verificação explícita de fronteiras entre domínios para evitar acoplamentos indevidos.
- Estado depois: a app passa a ter `assertAllowedDomainImport(...)`, `resolveBackendDomainFromModulePath(...)` e teste de fronteira sobre módulos declarados em `AppModule`, preparando componentização frontend em `BK-MF7-04`.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Arquitetura modular backend:** foco técnico deste BK para cumprir `RNF25`.

#### Conceitos teóricos essenciais

- **Domínio:** zona funcional com responsabilidade própria, como IA, materiais ou turmas.
- **Boundary:** fronteira que obriga um módulo a consumir outro por service público.
- **Acoplamento:** dependência direta que torna alterações difíceis e pode contornar segurança.
- **Erro comum a evitar:** importar schemas de outro domínio para poupar uma chamada ao service correto.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint.
- Modelo/schema: não cria schema.
- Service(s): funções `assertAllowedDomainImport(...)` e `resolveBackendDomainFromModulePath(...)`.
- Controller/route: não cria controller.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; este BK não cria fluxo HTTP.
- Cliente API: não cria cliente API.
- Segurança/autorização: impede acoplamentos que contornem services de ownership/membership e valida que `AppModule` continua a agrupar módulos por domínios reconhecidos.
- Testes: unitários para import permitido/bloqueado, teste de integração arquitetural sobre `apps/api/src/app.module.ts` e evidence E2E/smoke de arranque da API no PR.
- Handoff para o próximo BK: `BK-MF7-04` aplica o mesmo raciocínio a componentes frontend.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/architecture/domain-boundary.ts`
- CRIAR: `apps/api/src/common/architecture/domain-boundary.spec.ts`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/modules/ai/ai.module.ts`
- REVER: `apps/api/src/modules/materials/materials.module.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-03` entrega `RNF25` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF25` em `docs/RNF.md`, confirma a linha `BK-MF7-03` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF25` exige backend modular por domínios.
- `DERIVADO`: mapear domínios por prefixo de ficheiro para validação pedagógica.
- `DERIVADO`: permitir que IA consuma contratos públicos de materiais, mas bloquear acesso direto a schemas internos de materiais sem passar pelo service autorizado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-03` continua ligado a `RNF25`, `prioridade: P0`, `sprint: S11` e `proximo_bk: BK-MF7-04`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.
### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de arquitetura modular backend.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- LOCALIZAÇÃO: módulos já criados nas macrofases anteriores e ponto de integração deste BK.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação ou edição.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa o service existente.
### Passo 3 - Criar ou editar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Construir o ficheiro principal que torna `RNF25` implementável.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/architecture/domain-boundary.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/architecture/domain-boundary.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/architecture/domain-boundary.ts
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
    { prefix: "./modules/ai-", domain: "AI" },
    { prefix: "./modules/material", domain: "MATERIALS" },
    { prefix: "./modules/official-materials/", domain: "MATERIALS" },
    { prefix: "./modules/external-material-imports/", domain: "MATERIALS" },
    { prefix: "./modules/classes/", domain: "TEACHER" },
    { prefix: "./modules/subjects/", domain: "TEACHER" },
    { prefix: "./modules/class-", domain: "TEACHER" },
    { prefix: "./modules/students/", domain: "STUDENT" },
    { prefix: "./modules/study/", domain: "STUDENT" },
    { prefix: "./modules/study-areas/", domain: "STUDENT" },
    { prefix: "./modules/auth/", domain: "AUTH" },
    { prefix: "./modules/study-group", domain: "GROUP" },
    { prefix: "./modules/audit-log/", domain: "OPERATIONS" },
    { prefix: "./modules/admin-users/", domain: "OPERATIONS" },
    { prefix: "./modules/context-notifications/", domain: "OPERATIONS" },
    { prefix: "./modules/follow-up-alerts/", domain: "OPERATIONS" },
    { prefix: "./modules/notification", domain: "OPERATIONS" },
    { prefix: "./modules/privacy-", domain: "OPERATIONS" },
    { prefix: "./modules/account-deletion/", domain: "OPERATIONS" },
    { prefix: "./modules/curriculum-navigation/", domain: "OPERATIONS" },
    { prefix: "./modules/external-knowledge-ai/", domain: "AI" },
    { prefix: "./modules/adaptive-explanations/", domain: "AI" },
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
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    MATERIALS: {
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        TEACHER: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    TEACHER: {
        TEACHER: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    STUDENT: {
        STUDENT: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        MATERIALS: ["MODULE", "PUBLIC_SERVICE", "DTO"],
        OPERATIONS: ["PUBLIC_SERVICE", "DTO"],
    },
    OPERATIONS: {
        OPERATIONS: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
    },
    AUTH: {
        AUTH: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        TEACHER: ["PUBLIC_SERVICE", "DTO"],
    },
    GROUP: {
        GROUP: ["MODULE", "PUBLIC_SERVICE", "DTO", "SCHEMA", "INTERNAL_FILE"],
        STUDENT: ["PUBLIC_SERVICE", "DTO"],
        MATERIALS: ["PUBLIC_SERVICE", "DTO"],
        AI: ["PUBLIC_SERVICE", "DTO"],
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
 * Confirma se um domínio pode consumir outro sem quebrar a arquitetura.
 *
 * @param request Dados da importação a validar.
 * @throws Error quando o domínio ou o tipo de importação viola a fronteira.
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
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-03`. Cumpre `RNF25`, usa nomes explícitos, documenta tipos e funções com JSDoc e coloca comentários didáticos junto das decisões de segurança arquitetural.

`resolveBackendDomainFromModulePath(...)` classifica os módulos declarados no `AppModule`; se aparecer um caminho novo sem domínio, devolve `UNKNOWN` para obrigar revisão. `assertAllowedDomainImport(...)` valida uma importação concreta e distingue `PUBLIC_SERVICE`, `DTO`, `MODULE`, `SCHEMA` e `INTERNAL_FILE`. Essa distinção evita o erro comum de deixar IA, operação ou UI futura lerem schemas internos para contornar services que validam ownership, membership e fontes autorizadas.

Os dados de entrada são metadados de importação, não dados de alunos. A saída é silenciosa quando a regra passa e uma exceção explícita quando falha. O aluno pode acrescentar novos prefixos quando criar módulos, mas não deve alargar permissões para `SCHEMA` ou `INTERNAL_FILE` entre domínios sem justificar no PR e sem testes negativos.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo ou decisões de autorização feitas no frontend.

7. Cenário negativo/erro esperado.

Se removeres a validação ou o comentário didático, o BK fica `PARCIAL`; se a falha expuser dados privados ou permitir mistura de contextos, fica `CRITICO`.
### Passo 4 - Integrar com a aplicação

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato principal ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/architecture/domain-boundary.ts`
- CRIAR: `apps/api/src/common/architecture/domain-boundary.spec.ts`
- REVER: `apps/api/src/app.module.ts`
- LOCALIZAÇÃO: `apps/api/src/common/architecture/domain-boundary.spec.ts`, testes que percorrem imports dos módulos declarados em `apps/api/src/app.module.ts`.

3. Instruções do que fazer.

Não importes `domain-boundary.ts` dentro de `AppModule`; este contrato é uma verificação de arquitetura, não uma dependência runtime. Usa `apps/api/src/app.module.ts` como lista canónica de módulos e escreve os testes em `domain-boundary.spec.ts` para confirmar que domínios como `auth`, `materials`, `source-grounded-ai`, `class-ai`, `teacher-ai`, `ai-quotas` e `audit-log` mantêm fronteiras explícitas.

O teste deve fazer duas coisas:
- unidade: validar imports permitidos e bloqueados com `assertAllowedDomainImport(...)`;
- integração arquitetural: ler `apps/api/src/app.module.ts`, extrair imports dos módulos e garantir que nenhum fica `UNKNOWN`.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo; o contrato completo e o teste ficam nos ficheiros indicados no Passo 3 e no Passo 5.

5. Explicação do código.

O ponto de integração é o teste arquitetural. Isto evita colocar lógica de validação de imports dentro da aplicação em produção e mantém `AppModule` como fonte de leitura, não como local de regras artificiais. Quando um aluno acrescentar um módulo novo ao backend, o teste deve obrigar a atribuir esse módulo a um domínio, em vez de o deixar perdido na arquitetura.

6. Validação do passo.

Resultado esperado: `domain-boundary.spec.ts` falha quando um domínio importa outro domínio proibido, falha quando `AppModule` contém um módulo sem domínio reconhecido e passa quando `AppModule` mantém módulos coesos por domínio.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.
### Passo 5 - Adicionar teste ou evidence técnica

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de `BK-MF7-03` funciona e falha de forma controlada.

2. Ficheiros envolvidos:
- CRIAR/EDITAR: `apps/api/src/common/architecture/domain-boundary.spec.ts`
- LOCALIZAÇÃO: ficheiro de teste ou evidence `apps/api/src/common/architecture/domain-boundary.spec.ts`.

3. Instruções do que fazer.

Adiciona o teste/evidence abaixo e garante que existe pelo menos um cenário negativo. Para `P0`, prepara três negativos na PR; para `P1`, dois; para `P2`, um é suficiente.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

Este bloco prova o caminho principal e três falhas controladas. O caminho principal mostra que IA pode consumir materiais através de um service público, preservando ownership e fontes autorizadas. Os negativos bloqueiam três riscos: importar schema interno de materiais a partir de IA, deixar operação consultar services de negócio diretamente e acrescentar módulo sem domínio reconhecido.

A segunda parte do teste lê `apps/api/src/app.module.ts` e transforma imports reais em domínios. Isto fecha a lacuna de integração: o teste deixa de ser apenas uma matriz abstrata e passa a vigiar a lista real de módulos raiz. A evidence não contém materiais privados, respostas completas de IA, cookies, credenciais ou dados de outro aluno, apenas nomes de módulos e caminhos técnicos.

6. Validação do passo.

Comandos recomendados:
- Unit/integration arquitetural: `npm --prefix apps/api test -- domain-boundary.spec.ts`
- Build backend: `npm --prefix apps/api run build`
- Evidence E2E/smoke em PR: arrancar a API no ambiente de teste e confirmar que uma rota protegida existente, por exemplo `GET /api/auth/me`, continua a responder `401` sem cookies em vez de falhar por erro de arranque.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar comportamento ou erro esperado, não é evidence suficiente. Para `P0`, a PR deve guardar evidence dos três negativos do bloco: schema interno de materiais bloqueado, operação a depender de IA bloqueada e módulo sem domínio reconhecido bloqueado.
### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz minima de testes por prioridade: `P0` exige unit, integração, evidence E2E/smoke e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidencia de testes por camada: backend, documentação e smoke de arranque da API, porque este BK não cria frontend nem endpoint novo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados: testes verdes ou bloqueio explicado; nenhum comando deve depender de segredos locais para passar.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista o caminho e o erro exato.
### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-03` com prova técnica e instrução clara para `BK-MF7-04`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Se o BK tocar IA, inclui prova de fontes/contexto; se tocar operação, inclui prova de health, logs ou readiness.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa e handoff explícito para `BK-MF7-04`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF25` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- `domain-boundary.spec.ts` lê `apps/api/src/app.module.ts` e falha se algum módulo raiz ficar sem domínio reconhecido.
- A PR inclui evidence P0: unit, integração arquitetural, smoke/E2E de arranque e três negativos controlados.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P0`.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Quando houver teste backend, executar `npm --prefix apps/api test -- domain-boundary.spec.ts`.
- Executar `npm --prefix apps/api run build`.
- Registar smoke/E2E de arranque da API no PR; se o ambiente local bloquear portas, marcar o bloqueio com erro observado.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-03`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: erro controlado do cenário negativo exigido.
- `proof_fontes`: para IA, lista de `sourceLabel`, `locator` e excerto limitado.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF25` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-04` aplica o mesmo raciocínio a componentes frontend: componentes podem reutilizar contratos públicos, mas não devem atravessar fronteiras para decidir ownership, role ou membership.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade. Se `BK-MF7-04` introduzir novos clientes ou páginas, a evidence deve confirmar que permissões continuam no backend.

#### Changelog

- `2026-06-26`: teste arquitetural reforçado para ler `AppModule`, classificar módulos por domínio e concretizar três negativos P0.
- `2026-06-26`: contrato de modularidade backend documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
