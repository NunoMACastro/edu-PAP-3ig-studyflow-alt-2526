# BK-MF7-05 - Documentação técnica mínima (modelos, fluxos, endpoints).

## Header

- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 3`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-06`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais criar um mapa técnico mínimo que liga modelos, fluxos e endpoints críticos. O resultado observável é um documento curto, mantido no repositório, que ajuda a equipa a defender a arquitetura sem depender de memória oral.

No fim, a equipa consegue demonstrar `RNF27` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF27` evita que a aplicação fique correta mas impossível de explicar. A documentação deve cobrir contratos reais, endpoints protegidos, ownership/membership e fluxos de IA com fontes.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar ou documentar o contrato de documentação técnica mínima.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar pelo menos um caminho principal e um cenário negativo.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF27`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e a app já tem módulos, rotas e componentes acumulados, mas falta um mapa técnico mínimo para modelos, fluxos e endpoints críticos.
- Estado depois: a app passa a ter `STUDYFLOW-TECHNICAL-MAP.md`, script `export-technical-map.ts` e teste `export-technical-map.spec.ts`, preparando seleção de módulos críticos em `BK-MF7-06`.

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
- `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Documentação técnica mínima:** foco técnico deste BK para cumprir `RNF27`.

#### Conceitos teóricos essenciais

- **Mapa técnico:** documento que liga módulos, endpoints, modelos e fluxos.
- **Contrato público:** rota, payload e resposta que outras partes do projeto podem consumir.
- **Rastreabilidade:** capacidade de explicar que BK criou cada peça importante.
- **Erro comum a evitar:** documentar nomes genéricos sem caminho, endpoint ou regra de segurança.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): documenta endpoints existentes; não cria endpoints.
- Modelo/schema: documenta schemas principais por domínio.
- Service(s): script `export-technical-map.ts` para imprimir mapa inicial.
- Controller/route: não cria controller.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; operações técnicas sem dados pessoais nunca expõem materiais, prompts, cookies ou credenciais.
- Cliente API: usa clientes existentes com `credentials: 'include'` quando houver frontend autenticado.
- Segurança/autorização: documenta que sessão, ownership, membership e roles ficam validados no backend.
- Testes: `apps/api/src/scripts/export-technical-map.spec.ts`, execução do script e revisão por pares.
- Handoff para o próximo BK: `BK-MF7-06` usa o mapa técnico para escolher módulos críticos a testar.

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`
- CRIAR: `apps/api/src/scripts/export-technical-map.ts`
- CRIAR: `apps/api/src/scripts/export-technical-map.spec.ts`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-05` entrega `RNF27` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF27` em `docs/RNF.md`, confirma a linha `BK-MF7-05` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF27` exige documentação técnica mínima.
- `DERIVADO`: criar um mapa Markdown versionado em `docs/technical`.
- `DERIVADO`: automatizar a primeira versão para reduzir omissões de endpoints.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-05` continua ligado a `RNF27`, `prioridade: P1`, `sprint: S06` e `proximo_bk: BK-MF7-06`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.
### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de documentação técnica mínima.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
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
### Passo 3 - Criar o mapa técnico mínimo

1. Objetivo funcional do passo no contexto da app.

Criar o documento versionado que torna `RNF27` visível para a equipa e para a defesa PAP.

2. Ficheiros envolvidos:
- CRIAR: `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`
- LOCALIZAÇÃO: ficheiro completo `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`.

3. Instruções do que fazer.

Cria a pasta `docs/technical` se ainda não existir e adiciona o ficheiro Markdown abaixo. O mapa deve documentar nomes técnicos, responsabilidades e regras de segurança, mas não deve guardar dados pessoais, cookies, credenciais, prompts privados, respostas completas da IA nem materiais reais de alunos.

4. Código completo, correto e integrado com a app final.

```md
<!-- docs/technical/STUDYFLOW-TECHNICAL-MAP.md -->
# StudyFlow - mapa técnico mínimo

## Objetivo

Este documento liga os módulos, fluxos, modelos e endpoints críticos do StudyFlow.
Ele existe para cumprir `RNF27` e para dar a `BK-MF7-06` uma base concreta para escolher testes automatizados de módulos críticos.

## Módulos backend críticos

| Módulo | Domínio | Responsabilidade | Segurança documentada |
| --- | --- | --- | --- |
| `AuthModule` | Autenticação | Registo, login, sessão e utilizador autenticado. | Cookies HttpOnly e sessão validada no backend. |
| `MaterialsModule` | Materiais privados | Materiais submetidos pelo aluno em áreas de estudo. | `userId` vem da sessão autenticada e valida ownership. |
| `OfficialMaterialsModule` | Materiais oficiais | Materiais de professor associados a disciplina/turma. | Professor e disciplina são validados no backend. |
| `SourceGroundedAiModule` | IA com fontes | Respostas baseadas em excertos citáveis. | Bloqueia resposta quando não há fontes processáveis. |
| `ClassAiModule` | IA da disciplina | Assistente da turma/disciplina com voz docente. | Valida membership da disciplina e materiais oficiais. |
| `AiModelPoliciesModule` | Governança IA | Políticas de modelo e limites por contexto. | Não expõe chaves, prompts privados nem respostas completas. |
| `AiQuotasModule` | Quotas IA | Reserva e consumo de quotas por aluno/turma/grupo. | Limites aplicados no backend antes da chamada ao provider. |
| `AuditLogModule` | Auditoria | Eventos técnicos e sensíveis para defesa e rastreabilidade. | Logs minimizados, sem materiais privados nem credenciais. |

## Rotas frontend críticas

| Rota | Página | Perfil | Regra de segurança |
| --- | --- | --- | --- |
| `/app/areas/:id/ferramentas` | `StudyToolsPage` | Aluno | A API filtra artefactos por área e utilizador autenticado. |
| `/app/professor/disciplinas/:id/materiais` | `TeacherOfficialMaterialsPage` | Professor | A API valida professor, disciplina e materiais oficiais. |
| `/app/disciplinas/:id/ia` | `StudentClassAiPage` | Aluno | A API valida inscrição na disciplina antes de responder. |
| `/app/admin/governanca` | `AdminGovernancePage` | Admin | A API valida role de administração no backend. |

## Endpoints críticos

| Método | Endpoint | Entrada principal | Resposta esperada | Regra de segurança |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | email e password | sessão HttpOnly e utilizador público | Não devolve `passwordHash` nem tokens de sessão ao frontend. |
| `GET` | `/api/auth/me` | cookie de sessão | utilizador autenticado | Falha com `401` quando a sessão não existe. |
| `POST` | `/api/study-areas/:studyAreaId/materials` | material privado do aluno | material criado | `userId` vem da sessão autenticada e a área valida ownership. |
| `GET` | `/api/study-areas/:id/summaries` | área de estudo | resumos da área | Ownership da área é validado no backend. |
| `POST` | `/api/ai/source-grounded-answers` | job de indexação e pergunta | resposta IA com citações | Bloqueia resposta quando não há fontes processáveis autorizadas. |
| `POST` | `/api/student/subjects/:subjectId/ai/answers` | pergunta do aluno | resposta IA citada | Membership da disciplina e fontes oficiais são obrigatórias. |

## Modelos principais

| Modelo/schema | Domínio | Dados sensíveis | Regra de proteção |
| --- | --- | --- | --- |
| `User` | Identidade | email, password hash | Hash nunca é devolvido ao frontend. |
| `StudyArea` | Estudo individual | relação com aluno | Ownership por sessão autenticada. |
| `Material` | Materiais privados | conteúdo e metadados de estudo | Visível apenas ao aluno dono. |
| `OfficialMaterial` | Disciplina/turma | material criado por professor | Acesso limitado por professor, turma e disciplina. |
| `SourceGroundedAiAnswer` | IA com fontes | pergunta, resposta e citações | Sem resposta quando faltam fontes processáveis. |
| `AuditLog` | Auditoria | eventos técnicos | Minimização de dados pessoais e sem conteúdos privados completos. |

## Fluxos críticos

| Fluxo | Origem | Destino | Falha controlada obrigatória |
| --- | --- | --- | --- |
| Login seguro | `POST /api/auth/login` | shell autenticada | `401` para credenciais inválidas. |
| Resumo IA privado | materiais da área | artefacto IA com fontes | bloqueio quando não há fontes processáveis. |
| Material oficial | professor/disciplina | material oficial indexável | `403` quando o professor não tem acesso. |
| IA com fontes obrigatórias | `POST /api/ai/source-grounded-answers` | resposta citada | erro controlado quando não há fontes autorizadas. |
| IA da disciplina | aluno inscrito | resposta com citações | `403` sem membership e erro controlado sem fontes. |

## Como validar

1. Confirmar que `apps/api/src/app.module.ts` importa os módulos críticos listados.
2. Executar `npm --prefix apps/api test -- export-technical-map.spec.ts`.
3. Executar `npm --prefix apps/api run build`.
4. Gerar a versão atualizada com `node apps/api/dist/scripts/export-technical-map.js`.
5. Comparar o output gerado com este documento e atualizar a PR se algum módulo crítico estiver em falta.
```

5. Explicação do código.

O ficheiro Markdown é o artefacto documental principal de `RNF27`. Ele não cria endpoints nem altera runtime; apenas torna explícito o que já existe na aplicação: módulos, rotas, endpoints, modelos, fluxos e regras de segurança. Isto evita documentação vaga e prepara `BK-MF7-06`, porque o próximo BK consegue escolher módulos críticos a testar a partir de uma lista concreta.

A tabela de endpoints inclui a regra de segurança ao lado de cada rota para evitar uma defesa incompleta. Por exemplo, `POST /api/study-areas/:studyAreaId/materials` não pode ser explicado apenas como "cria material"; o aluno deve saber que o `userId` vem da sessão autenticada e que o backend valida ownership da área antes de aceitar o material. A secção `Como validar` liga o documento ao script do próximo passo, sem depender de memória oral.

6. Validação do passo.

Confirma que o ficheiro existe em `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`, que tem as secções `Módulos backend críticos`, `Rotas frontend críticas`, `Endpoints críticos`, `Modelos principais`, `Fluxos críticos` e `Como validar`, e que não contém dados reais de alunos, cookies, passwords, prompts privados ou respostas completas da IA.

7. Cenário negativo/erro esperado.

Se um endpoint crítico aparecer sem regra de segurança, o mapa deve ser rejeitado na PR porque não cumpre `RNF27`.

### Passo 4 - Criar o script de exportação e validação

1. Objetivo funcional do passo no contexto da app.

Criar um script local que valida os módulos críticos no `AppModule` e imprime o mapa técnico em Markdown.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/export-technical-map.ts`
- REVER: `apps/api/src/app.module.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/scripts/export-technical-map.ts`.

3. Instruções do que fazer.

Cria o ficheiro abaixo. O script faz leitura estática de `apps/api/src/app.module.ts`, valida se os módulos críticos estão importados e imprime Markdown. Ele não arranca a API, não cria ligação MongoDB e não lê dados reais.

Não adiciones dependências npm. Usa apenas APIs standard de Node.js.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

O script transforma a documentação técnica numa peça verificável. Primeiro resolve o caminho do `AppModule` para funcionar tanto com `npm --prefix apps/api` como a partir da raiz do repositório. Depois extrai imports com leitura textual e valida `REQUIRED_MODULES`. Esta validação evita um erro comum: atualizar a documentação enquanto um módulo crítico deixou de estar registado na API.

O mapa em si fica em `TECHNICAL_MAP`. Ele não guarda dados reais; só guarda nomes técnicos, responsabilidades e regras de proteção. `buildTechnicalMapMarkdown` gera o documento e rejeita endpoints sem regra de segurança, porque `RNF27` não é apenas listar rotas: é explicar o contrato técnico mínimo, incluindo segurança e privacidade.

6. Validação do passo.

Executa `npm --prefix apps/api run build` e depois `node apps/api/dist/scripts/export-technical-map.js`. Resultado esperado: o comando imprime Markdown com `AuthModule`, `MaterialsModule`, `SourceGroundedAiModule`, `ClassAiModule`, `AiModelPoliciesModule`, `AiQuotasModule` e `AuditLogModule`.

7. Cenário negativo/erro esperado.

Se removeres `SourceGroundedAiModule` de `apps/api/src/app.module.ts`, o script deve falhar com a mensagem `Módulos críticos ausentes no AppModule: SourceGroundedAiModule.`.

### Passo 5 - Adicionar teste backend com negativos P1

1. Objetivo funcional do passo no contexto da app.

Provar que o mapa técnico é gerado e que falha quando falta um módulo crítico ou uma regra de segurança.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/export-technical-map.spec.ts`
- REVER: `apps/api/jest.config.cjs`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/scripts/export-technical-map.spec.ts`.

3. Instruções do que fazer.

Cria o teste abaixo. Como `BK-MF7-05` é `P1`, o teste deve cobrir um caminho principal e dois negativos: módulo crítico ausente e endpoint crítico sem regra de segurança.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/export-technical-map.spec.ts
import {
    TECHNICAL_MAP,
    assertRequiredModules,
    buildTechnicalMapMarkdown,
    extractImportedModules,
} from "./export-technical-map.js";

const APP_MODULE_SOURCE = `
import { AuthModule } from "./modules/auth/auth.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
`;

describe("exportTechnicalMap", () => {
    it("gera mapa técnico com módulos e endpoints críticos", () => {
        const importedModules = extractImportedModules(APP_MODULE_SOURCE);

        assertRequiredModules(importedModules);
        const markdown = buildTechnicalMapMarkdown(TECHNICAL_MAP);

        // O teste valida conteúdo operacional, não apenas a existência da função.
        expect(markdown).toContain("AuthModule");
        expect(markdown).toContain("POST");
        expect(markdown).toContain("/api/student/subjects/:subjectId/ai/answers");
        expect(markdown).toContain("Membership da disciplina");
    });

    it("falha quando falta um módulo crítico no AppModule", () => {
        const importedModules = extractImportedModules(`
            import { AuthModule } from "./modules/auth/auth.module.js";
            import { MaterialsModule } from "./modules/materials/materials.module.js";
        `);

        // Este negativo impede que a documentação ignore a IA com fontes.
        expect(() => assertRequiredModules(importedModules)).toThrow(
            "Módulos críticos ausentes no AppModule",
        );
    });

    it("falha quando um endpoint crítico não declara regra de segurança", () => {
        const unsafeMap = {
            ...TECHNICAL_MAP,
            endpoints: [
                {
                    method: "POST",
                    path: "/api/study-areas/:studyAreaId/materials",
                    input: "material privado do aluno",
                    output: "material criado",
                    securityRule: "",
                },
            ],
        };

        // Cada endpoint crítico tem de explicar ownership, membership, role ou exposição mínima.
        expect(() => buildTechnicalMapMarkdown(unsafeMap)).toThrow(
            "não declara regra de segurança",
        );
    });
});
```

5. Explicação do código.

O primeiro teste prova que o mapa contém módulos e endpoints críticos, incluindo a IA da disciplina com membership. O segundo teste remove módulos críticos e confirma que a validação falha. O terceiro teste cria um endpoint sem regra de segurança e confirma que o gerador rejeita esse mapa.

Estes testes usam dados técnicos controlados, não dados reais. Não há cookies, passwords reais, materiais privados, prompts privados nem respostas completas da IA. A intenção pedagógica é mostrar ao aluno que documentação técnica também tem negativos: não basta existir um ficheiro, ele tem de representar contratos críticos com segurança explícita.

6. Validação do passo.

Comando recomendado: `npm --prefix apps/api test -- export-technical-map.spec.ts`.

Resultado esperado: `3` testes passam, incluindo dois negativos.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar módulo ausente e endpoint sem regra de segurança, não é evidence suficiente para `P1`.
### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz minima de testes por prioridade: `P0` exige unit, integração e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidencia de testes por camada: backend, frontend, documentação e smoke quando existir endpoint.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados:
- `npm --prefix apps/api test -- export-technical-map.spec.ts`: suite verde com caminho principal e dois negativos.
- `npm --prefix apps/api run build`: sem erros TypeScript/NestJS.
- `node apps/api/dist/scripts/export-technical-map.js`: imprime Markdown sem arrancar API nem base de dados.
- `bash scripts/validate-planificacao.sh`: planeamento sem drift crítico.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se o script falhar por módulo crítico ausente, confirma primeiro se o módulo deve voltar ao `AppModule` ou se o mapa deve ser atualizado com decisão documentada.
### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-05` com prova técnica e instrução clara para `BK-MF7-06`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Se o BK tocar IA, inclui prova de fontes/contexto; se tocar operação, inclui prova técnica sem dados pessoais, materiais privados, prompts, cookies ou credenciais.

4. Código completo, correto e integrado com a app final.

Tabela mínima de evidence para anexar ao PR ou relatório técnico:

| Caso | Expected | Observed a registar |
| --- | --- | --- |
| Caminho principal | `npm --prefix apps/api test -- export-technical-map.spec.ts` passa com o teste de geração do mapa. | Output Jest com a suite `exportTechnicalMap`. |
| Negativo 1 | Remover um módulo crítico da fonte de teste faz `assertRequiredModules` lançar erro. | Output Jest do teste `falha quando falta um módulo crítico no AppModule`. |
| Negativo 2 | Endpoint crítico sem regra de segurança faz `buildTechnicalMapMarkdown` lançar erro. | Output Jest do teste `falha quando um endpoint crítico não declara regra de segurança`. |
| Build | `npm --prefix apps/api run build` termina sem erros TypeScript. | Output do build. |
| Privacidade | Evidence não contém credenciais, cookies, materiais privados, prompts privados nem respostas completas da IA. | Confirmação textual no PR. |

5. Explicação do código.

A tabela obriga a PR a mostrar expected/observed. Isto evita uma entrega vaga com "funciona" e liga a documentação técnica a validação objetiva. O próximo BK passa a ter uma fonte confiável para escolher módulos críticos, porque o mapa lista domínios e o teste garante que os principais módulos continuam presentes.

6. Validação do passo.

Resultado esperado: evidence completa com caminho principal, dois negativos P1, build backend, confirmação de privacidade e handoff explícito para `BK-MF7-06`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF27` fica demonstrável por documento Markdown, script, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P1`: módulo crítico ausente e endpoint crítico sem regra de segurança.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `npm --prefix apps/api test -- export-technical-map.spec.ts`.
- Executar `npm --prefix apps/api run build`.
- Executar `node apps/api/dist/scripts/export-technical-map.js`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-05`.
- `proof_tecnico`: output de `npm --prefix apps/api test -- export-technical-map.spec.ts`, `npm --prefix apps/api run build` e `node apps/api/dist/scripts/export-technical-map.js`.
- `proof_negativos`: erro controlado para módulo crítico ausente e endpoint sem regra de segurança.
- `proof_fontes`: para IA, lista de `sourceLabel`, `locator` e excerto limitado.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF27` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-06` usa o mapa técnico validado para escolher módulos críticos a testar.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-26`: mapa técnico mínimo documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
- `2026-06-26`: separação entre mapa Markdown, script TypeScript e teste Jest corrigida; validação P1 passou a incluir dois negativos verificáveis.
- `2026-06-26`: endpoints do mapa técnico alinhados com controllers reais de materiais por área de estudo e IA com fontes; endpoints operacionais ficam reservados para o BK próprio.
