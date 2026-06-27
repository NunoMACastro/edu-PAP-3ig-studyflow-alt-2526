# BK-MF7-08 - Endpoint de health-check

## Header

- `doc_id`: `GUIA-BK-MF7-08`
- `bk_id`: `BK-MF7-08`
- `macro`: `MF7`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-09`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais criar um endpoint público e mínimo de health-check para a API do StudyFlow. O resultado observável é `GET /api/health`, com resposta `200` e JSON técnico seguro com `status`, `uptimeSeconds`, `version` e `availability`.

No fim, a equipa consegue demonstrar `RNF30` com código NestJS completo, teste automatizado, smoke HTTP e evidence sem dados pessoais. O health-check também consome a função `evaluateAvailabilityBudget(...)` criada em `BK-MF7-02`, para fechar o handoff de disponibilidade mensal da própria MF7.

#### Importância

`RNF30` existe para confirmar rapidamente se a API arrancou depois de um deploy, rollback ou reinício. O health-check não substitui testes de negócio, autenticação, ownership, membership, quotas ou guardrails, mas dá um sinal operacional pequeno e fiável antes de abrir a aplicação a alunos e professores.

Este BK liga dois contratos anteriores da MF7: `BK-MF7-02` entrega a avaliação mensal de downtime e `BK-MF7-07` entrega readiness/rollback. O endpoint deste BK junta esses sinais sem expor configuração interna nem dados privados.

#### Scope-in

- Criar `HealthService` com resposta pública mínima.
- Consumir `evaluateAvailabilityBudget(...)` de `apps/api/src/common/operations/availability-budget.ts`.
- Criar `HealthController` com rota `GET /api/health`.
- Criar `HealthModule` e ligá-lo a `AppModule`.
- Criar teste automatizado para caminho principal e dois negativos P1.
- Validar que a resposta não expõe dados pessoais, cookies, tokens, variáveis de ambiente internas, prompts privados, materiais ou stack traces.
- Produzir evidence com comando, expected result e observed result.
- Preparar handoff para `BK-MF7-09`, que passa a poder usar o health-check como pré-condição operacional.

#### Scope-out

- Criar dashboards de monitorização, alertas externos, probes de Kubernetes, cloud, DNS, containers ou CI/CD real.
- Alterar login, sessões, cookies, ownership, membership, quotas, materiais, IA, turmas, salas ou professores.
- Criar frontend para health-check.
- Devolver detalhes de MongoDB, Redis, variáveis de ambiente, emails, userIds, cookies, tokens, prompts privados, materiais privados ou stack traces.
- Prometer RAG, embeddings, OCR, chunking semântico ou indexação automática.

#### Estado antes e depois

- Estado antes: `BK-MF7-02` deixa `evaluateAvailabilityBudget(...)` preparado e `BK-MF7-07` deixa deploy com rollback e readiness documentados, mas ainda falta uma rota operacional que exponha um estado seguro da API.
- Estado depois: `apps/api` passa a expor `GET /api/health`, com `HealthService`, `HealthController`, `HealthModule`, integração em `AppModule`, consumo de `evaluateAvailabilityBudget(...)`, teste automatizado e smoke HTTP documentado.

#### Pre-requisitos

- `README.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `apps/api/src/common/operations/availability-budget.ts`
- `apps/api/src/app.module.ts`
- `apps/api/package.json`

#### Glossário

- **Health-check:** endpoint técnico que confirma que a API está viva e devolve um estado operacional mínimo.
- **Uptime:** tempo, em segundos, desde que o processo Node.js arrancou.
- **Versão da release:** identificador público e curto da versão publicada.
- **Disponibilidade mensal:** leitura agregada de downtime entregue por `BK-MF7-02`, sem dados pessoais.
- **Smoke HTTP:** pedido real e curto feito à API para confirmar um comportamento mínimo.
- **Falhar fechado:** bloquear ou reprovar quando uma condição de segurança não é cumprida.
- **Evidence:** prova objetiva usada em PR e defesa, com comando, resultado esperado e resultado observado.
- **Dados sensíveis:** cookies, tokens, passwords, emails, userIds, prompts privados, materiais privados, variáveis internas e stack traces.

#### Conceitos teóricos essenciais

- **Endpoint operacional:** rota criada para operação técnica, não para expor dados de domínio. Neste BK, o endpoint serve deploy, rollback, smoke tests e leitura agregada de disponibilidade.
- **Controller NestJS:** classe que recebe pedidos HTTP e delega trabalho no service. Aqui recebe `GET /api/health` e devolve a resposta do `HealthService`.
- **Service NestJS:** classe com regra técnica reutilizável. Aqui calcula a resposta pública, lê apenas variáveis públicas/controladas e consome a função de disponibilidade de `BK-MF7-02`.
- **Module NestJS:** unidade que agrupa controller e service para o NestJS conseguir descobrir a rota.
- **Resposta pública mínima:** JSON pequeno que ajuda a operação sem revelar dados privados. Evita transformar health-check num ponto de fuga de informação.
- **Disponibilidade agregada:** valor operacional sem identidade de aluno, professor, turma, sala ou material. Entra como minutos mensais e sai como `HEALTHY`, `WARNING` ou `BREACHED`.
- **Smoke test:** validação rápida de um fluxo mínimo. O smoke deste BK confirma `200` e campos esperados sem exigir login.
- **Teste negativo:** prova que a resposta não inclui informação proibida. Para `P1`, este BK usa dois negativos: não expor identidade/sessão e não expor configuração interna.
- **Privacidade e RGPD:** mesmo endpoints técnicos devem minimizar dados. O health-check não deve devolver dados pessoais porque pode ser consultado por ferramentas de operação.

#### Arquitetura do BK

O BK entrega uma peça backend pequena:

1. `evaluateAvailabilityBudget(...)`, criado em `BK-MF7-02`, calcula `HEALTHY`, `WARNING` ou `BREACHED` a partir de minutos mensais agregados.
2. `HealthService.getStatus()` consome essa função e monta `{ status, uptimeSeconds, version, availability }`.
3. `HealthService.describe()` mantém um método simples para o controller.
4. `HealthController` expõe `GET /api/health`.
5. `HealthModule` regista controller e service.
6. `AppModule` importa `HealthModule`.
7. `health.controller.spec.ts` prova caminho principal e dois negativos P1.

O endpoint é público de propósito: se a equipa precisar de confirmar deploy ou rollback, não deve depender de sessão autenticada. A segurança vem da minimização da resposta, não de dados privados.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/health/health.service.ts`
- CRIAR: `apps/api/src/common/health/health.controller.ts`
- CRIAR: `apps/api/src/common/health/health.module.ts`
- CRIAR: `apps/api/src/common/health/health.controller.spec.ts`
- EDITAR: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/common/operations/availability-budget.ts`
- REVER: `apps/api/package.json`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega apenas `RNF30`, sem alterar IDs, owners, prioridades, deploy com rollback ou regras de IA.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
    - LOCALIZAÇÃO: linhas de `RNF30`, `BK-MF7-08`, predecessor `BK-MF7-07`, handoff operacional de `BK-MF7-02` e sucessor `BK-MF7-09`.

3. Instruções do que fazer.

Confirma as decisões seguintes:

- `CANONICO`: `RNF30` exige endpoint de health-check.
- `CANONICO`: `BK-MF7-08` é `P1`, `S12`, `Core`, owner `Kaua`, apoio `Guilherme`.
- `CANONICO`: o próximo BK é `BK-MF7-09`.
- `DERIVADO`: a rota pública mínima será `GET /api/health`.
- `DERIVADO`: a resposta deve incluir `status`, `uptimeSeconds`, `version` e `availability`, sem dados pessoais.
- `DERIVADO`: `availability` reutiliza o contrato operacional `evaluateAvailabilityBudget(...)` já criado em `BK-MF7-02`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental porque fixa o contrato antes de criares ficheiros.

5. Explicação do código.

Não existe código neste passo. A validação documental evita que confundas health-check com login, deploy, monitorização cloud ou endpoints de IA. Também impede que `BK-MF7-02` deixe um handoff prometido sem consumo real.

6. Validação do passo.

Resultado esperado: `BK-MF7-08` continua ligado a `RNF30`, mantém `P1`, `S12`, `Core`, consome o contrato de disponibilidade de `BK-MF7-02` e prepara `BK-MF7-09`.

7. Cenário negativo/erro esperado.

Se encontrares uma proposta que devolve emails, userIds, cookies, tokens, prompts, materiais ou configuração interna no health-check, rejeita-a antes de escrever código.

### Passo 2 - Mapear o ponto de integração backend

1. Objetivo funcional do passo no contexto da app.

Localizar onde o novo módulo técnico deve entrar na API sem duplicar responsabilidades e confirmar o contrato de disponibilidade que vem de `BK-MF7-02`.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/app.module.ts`
    - REVER: `apps/api/src/common/operations/availability-budget.ts`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: imports de `apps/api/src/app.module.ts`, lista `imports` do `@Module`, exports de `availability-budget.ts`, scripts `build` e `test` de `apps/api/package.json`.

3. Instruções do que fazer.

Abre `apps/api/src/app.module.ts` e confirma que a API usa NestJS modular. Depois confirma que `apps/api/src/common/operations/availability-budget.ts` exporta `evaluateAvailabilityBudget(...)` e `AvailabilityBudgetResult`. Este BK vai criar `apps/api/src/common/health/` porque o health-check é técnico e transversal, não pertence a aluno, professor, materiais ou IA.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é preparatório: só estás a escolher o ponto certo para encaixar o módulo.

5. Explicação do código.

Não existe código neste passo. A decisão importante é manter o health-check numa pasta técnica comum, evitando duplicar conceitos de domínio ou misturar operação com dados privados. A função de disponibilidade fica fora do módulo health porque já nasceu em `BK-MF7-02` e pode ser reutilizada por outras evidências operacionais.

6. Validação do passo.

Resultado esperado: tens identificado `apps/api/src/app.module.ts` como ficheiro de integração, `apps/api/src/common/operations/availability-budget.ts` como contrato de disponibilidade e sabes que vais adicionar `HealthModule` à lista `imports`.

7. Cenário negativo/erro esperado.

Se tentares criar outro cálculo de downtime dentro do health-check, a MF fica com dois contratos para a mesma regra. Corrige e reutiliza `evaluateAvailabilityBudget(...)`.

### Passo 3 - Criar o HealthService

1. Objetivo funcional do passo no contexto da app.

Criar o service que calcula a resposta pública e segura do health-check, incluindo disponibilidade agregada.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/health/health.service.ts`
    - REVER: `apps/api/src/common/operations/availability-budget.ts`
    - LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/health/health.service.ts`.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/common/health` se ainda não existir. Depois cria o ficheiro `health.service.ts` com o código completo abaixo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/health/health.service.ts
import { Injectable } from "@nestjs/common";
import {
    AvailabilityBudgetResult,
    evaluateAvailabilityBudget,
} from "../operations/availability-budget.js";

export type HealthStatus = "ok" | "degraded";

export type HealthView = {
    status: HealthStatus;
    uptimeSeconds: number;
    version: string;
    availability: AvailabilityBudgetResult;
};

const DEFAULT_RELEASE_VERSION = "dev";
const DEFAULT_DOWNTIME_MINUTES = 0;

/**
 * Calcula a resposta pública de saúde da API StudyFlow.
 */
@Injectable()
export class HealthService {
    /**
     * Devolve metadados mínimos para smoke tests de deploy e rollback.
     *
     * @returns Estado técnico seguro da API.
     */
    describe(): HealthView {
        return this.getStatus();
    }

    /**
     * Junta o estado de runtime com o orçamento mensal de disponibilidade.
     *
     * @returns Estado público da API, sem dados pessoais nem segredos.
     */
    getStatus(): HealthView {
        const releaseVersion = process.env.STUDYFLOW_RELEASE_VERSION?.trim();
        const downtimeMinutes = readMonthlyDowntimeMinutes(
            process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES,
        );
        const availability = evaluateAvailabilityBudget(downtimeMinutes);

        // O estado fica agregado: ajuda a operação sem mostrar alunos, turmas, materiais ou configuração interna.
        return {
            status: availability.status === "BREACHED" ? "degraded" : "ok",
            uptimeSeconds: Math.floor(process.uptime()),
            // A versão pública ajuda a defender que release está ativa sem mostrar variáveis internas.
            version:
                releaseVersion && releaseVersion.length > 0
                    ? releaseVersion
                    : DEFAULT_RELEASE_VERSION,
            availability,
        };
    }
}

/**
 * Lê o downtime mensal vindo do ambiente de execução.
 *
 * @param rawValue Valor textual opcional com minutos mensais de downtime.
 * @returns Minutos válidos para `evaluateAvailabilityBudget(...)`.
 */
function readMonthlyDowntimeMinutes(rawValue: string | undefined): number {
    if (!rawValue || rawValue.trim().length === 0) {
        return DEFAULT_DOWNTIME_MINUTES;
    }

    const parsedValue = Number(rawValue);
    // Uma configuração inválida nunca deve aparecer na resposta pública do health-check.
    return Number.isFinite(parsedValue) && parsedValue >= 0
        ? parsedValue
        : DEFAULT_DOWNTIME_MINUTES;
}
```

5. Explicação do código.

`HealthView` define exatamente o JSON público esperado: `status`, `uptimeSeconds`, `version` e `availability`. `HealthService.describe()` delega em `getStatus()` para o controller poder continuar simples. `getStatus()` lê uma versão pública, lê minutos mensais agregados e chama `evaluateAvailabilityBudget(...)`, que veio do `BK-MF7-02`.

A função `readMonthlyDowntimeMinutes(...)` evita expor configuração interna: se a variável estiver vazia ou inválida, o health-check usa `0` como fallback seguro e não devolve o valor bruto. O endpoint não consulta MongoDB, Redis, sessão, cookies, materiais, prompts ou utilizadores, porque `RNF30` exige disponibilidade operacional, não diagnóstico profundo.

Este service prepara `HealthController`, que no passo seguinte vai expor a rota HTTP.

6. Validação do passo.

Confirma que o ficheiro exporta `HealthView` e `HealthService`, importa `evaluateAvailabilityBudget(...)` do caminho criado em `BK-MF7-02` e não devolve propriedades como `userId`, `email`, `cookie`, `token`, `mongoUri`, `redisUrl`, `prompt` ou `stack`.

7. Cenário negativo/erro esperado.

Se `STUDYFLOW_MONTHLY_DOWNTIME_MINUTES` vier inválido, a resposta deve continuar pública e segura, sem devolver o valor bruto nem stack trace.

### Passo 4 - Criar o HealthController

1. Objetivo funcional do passo no contexto da app.

Expor `GET /api/health` e delegar a resposta no `HealthService`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/health/health.controller.ts`
    - REVER: `apps/api/src/common/health/health.service.ts`
    - LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/health/health.controller.ts`.

3. Instruções do que fazer.

Cria `health.controller.ts` com o código completo abaixo. Não adiciones `SessionGuard`: este endpoint tem de ser público para deploy, rollback e smoke test. A proteção vem da resposta mínima.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { HealthService, HealthView } from "./health.service.js";

/**
 * Expõe uma rota técnica mínima para confirmar que a API StudyFlow responde.
 */
@Controller("api/health")
export class HealthController {
    /**
     * @param healthService Service que produz a resposta pública segura.
     */
    constructor(private readonly healthService: HealthService) {}

    /**
     * Devolve o estado público da API.
     *
     * @returns Metadados mínimos para deploy, rollback e smoke HTTP.
     */
    @Get()
    describe(): HealthView {
        // A rota é pública para funcionar antes do login, mas nunca devolve dados pessoais.
        return this.healthService.describe();
    }
}
```

5. Explicação do código.

`@Controller("api/health")` cria a base da rota e `@Get()` responde a `GET /api/health`. O controller não calcula dados diretamente; delega no `HealthService`, mantendo responsabilidades claras. A rota não usa sessão porque uma ferramenta de deploy ou smoke pode precisar de a chamar antes de existir utilizador autenticado.

O cuidado de segurança é não devolver nada além de estado técnico mínimo e disponibilidade agregada. O controller também não aceita body, query string, `userId`, `roomId`, `classId` ou qualquer outro identificador vindo do frontend.

6. Validação do passo.

Resultado esperado: o controller importa `HealthService` e `HealthView` do ficheiro criado no passo anterior, sem imports partidos.

7. Cenário negativo/erro esperado.

Se adicionares userId, email, cookie, token, URI de base de dados ou stack trace à resposta, remove de imediato. Health-check público não é endpoint de diagnóstico profundo.

### Passo 5 - Criar o HealthModule e ligar ao AppModule

1. Objetivo funcional do passo no contexto da app.

Registar controller e service no NestJS e ligar o novo módulo à aplicação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/health/health.module.ts`
    - EDITAR: `apps/api/src/app.module.ts`
    - LOCALIZAÇÃO: ficheiro completo `health.module.ts`; imports e lista `imports` de `apps/api/src/app.module.ts`.

3. Instruções do que fazer.

Primeiro cria `HealthModule`. Depois edita `AppModule`, importando `HealthModule` e adicionando-o à lista `imports` depois dos módulos operacionais já existentes.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/health/health.module.ts
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

/**
 * Regista o endpoint técnico de health-check da API.
 */
@Module({
    // Controller e service ficam juntos para o NestJS conseguir expor GET /api/health.
    controllers: [HealthController],
    providers: [HealthService],
})
export class HealthModule {}
```

```ts
// apps/api/src/app.module.ts
/**
 * Agrupa os módulos principais da API para expor a aplicação StudyFlow.
 */
import "./common/config/load-env.js";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthModule } from "./common/health/health.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";
import { AdaptiveExplanationsModule } from "./modules/adaptive-explanations/adaptive-explanations.module.js";
import { AiGuardrailsModule } from "./modules/ai-guardrails/ai-guardrails.module.js";
import { CurriculumNavigationModule } from "./modules/curriculum-navigation/curriculum-navigation.module.js";
import { ExternalKnowledgeAiModule } from "./modules/external-knowledge-ai/external-knowledge-ai.module.js";
import { NotificationPreferencesModule } from "./modules/notification-preferences/notification-preferences.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { StudyAlertsModule } from "./modules/study-alerts/study-alerts.module.js";
import { StudyGroupAiModule } from "./modules/study-group-ai/study-group-ai.module.js";
import { StudyGroupMessagesModule } from "./modules/study-group-messages/study-group-messages.module.js";
import { StudyGroupSessionsModule } from "./modules/study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "./modules/study-groups/study-groups.module.js";
import { UnifiedSearchModule } from "./modules/unified-search/unified-search.module.js";
import { AccountDeletionModule } from "./modules/account-deletion/account-deletion.module.js";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module.js";
import { AiConsentsModule } from "./modules/ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
import { ContextNotificationsModule } from "./modules/context-notifications/context-notifications.module.js";
import { FollowUpAlertsModule } from "./modules/follow-up-alerts/follow-up-alerts.module.js";
import { NotificationPoliciesModule } from "./modules/notification-policies/notification-policies.module.js";
import { PrivacyDataExportsModule } from "./modules/privacy-data-exports/privacy-data-exports.module.js";
import { ExternalMaterialImportsModule } from "./modules/external-material-imports/external-material-imports.module.js";

/**
 * Módulo raiz da API.
 *
 * A aplicação fica organizada por domínios e inclui um módulo técnico comum
 * para health-check operacional, sem misturar dados privados na resposta.
 */
@Module({
    imports: [
        MongooseModule.forRoot(
            process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow",
        ),
        // HealthModule entra cedo porque não depende de sessão nem de módulos de domínio.
        HealthModule,
        AuthModule,
        StudentsModule,
        StudyModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        ClassAiModule,
        ClassPostsModule,
        Mf2Module,
        AiGuardrailsModule,
        SourceGroundedAiModule,
        ExternalKnowledgeAiModule,
        AdaptiveExplanationsModule,
        StudyGroupsModule,
        StudyGroupMessagesModule,
        StudyGroupSessionsModule,
        StudyGroupAiModule,
        UnifiedSearchModule,
        CurriculumNavigationModule,
        NotificationPreferencesModule,
        StudyAlertsModule,
        AdminUsersModule,
        AuditLogModule,
        PrivacyDataExportsModule,
        AccountDeletionModule,
        AiConsentsModule,
        ContextNotificationsModule,
        FollowUpAlertsModule,
        NotificationPoliciesModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        ExternalMaterialImportsModule,
    ],
})
export class AppModule {}
```

5. Explicação do código.

`HealthModule` junta `HealthController` e `HealthService`, permitindo ao NestJS descobrir a rota. `AppModule` importa `HealthModule`, o que torna `GET /api/health` parte da aplicação. A ordem escolhida deixa claro que o health-check é técnico e não depende de autenticação ou de modelos de domínio.

O ficheiro `app.module.ts` continua a preservar todos os módulos existentes; a única integração nova é `HealthModule`.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
```

Resultado esperado: o build compila sem erros de import, sem módulos em falta e sem duplicar endpoints.

7. Cenário negativo/erro esperado.

Se esqueceres `HealthModule` em `AppModule`, o código compila, mas `GET /api/health` pode não ficar exposto. Corrige a lista `imports` antes de avançar.

### Passo 6 - Criar teste automatizado com negativos P1

1. Objetivo funcional do passo no contexto da app.

Provar o caminho principal e dois negativos P1 sem depender de servidor HTTP externo.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/common/health/health.controller.spec.ts`
    - REVER: `apps/api/src/common/health/health.controller.ts`
    - REVER: `apps/api/src/common/health/health.service.ts`
    - LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/health/health.controller.spec.ts`.

3. Instruções do que fazer.

Cria o teste abaixo. Ele valida a resposta normal, confirma que não há dados de identidade/sessão e confirma que não há configuração interna exposta.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/health/health.controller.spec.ts
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
    const previousReleaseVersion = process.env.STUDYFLOW_RELEASE_VERSION;
    const previousDowntimeMinutes =
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES;

    afterEach(() => {
        restoreEnv("STUDYFLOW_RELEASE_VERSION", previousReleaseVersion);
        restoreEnv(
            "STUDYFLOW_MONTHLY_DOWNTIME_MINUTES",
            previousDowntimeMinutes,
        );
    });

    it("devolve o estado público da API com disponibilidade agregada", () => {
        process.env.STUDYFLOW_RELEASE_VERSION = "2026.06.27";
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES = "48";
        const controller = createController();

        const result = controller.describe();

        // O caminho principal prova release, uptime e handoff operacional de BK-MF7-02.
        expect(result).toMatchObject({
            status: "ok",
            version: "2026.06.27",
            availability: {
                downtimeMinutes: 48,
                limitMinutes: 60,
                status: "WARNING",
            },
        });
        expect(result.uptimeSeconds).toEqual(expect.any(Number));
    });

    it("não expõe identidade, sessão ou dados pessoais", () => {
        const controller = createController();

        const result = controller.describe();

        // O negativo P1 impede transformar uma rota pública em fuga de dados pessoais.
        expect(result).not.toHaveProperty("userId");
        expect(result).not.toHaveProperty("email");
        expect(result).not.toHaveProperty("cookie");
        expect(result).not.toHaveProperty("token");
    });

    it("não expõe configuração interna nem stack traces", () => {
        delete process.env.STUDYFLOW_RELEASE_VERSION;
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES = "valor-interno";
        const controller = createController();

        const result = controller.describe();

        // O negativo P1 mantém detalhes internos fora da resposta pública.
        expect(result).not.toHaveProperty("mongoUri");
        expect(result).not.toHaveProperty("redisUrl");
        expect(result).not.toHaveProperty("stack");
        expect(result.version).toBe("dev");
        expect(result.availability.downtimeMinutes).toBe(0);
    });
});

/**
 * Cria o controller com dependências reais e pequenas para manter o teste claro.
 *
 * @returns Controller pronto para chamar o método público do health-check.
 */
function createController(): HealthController {
    return new HealthController(new HealthService());
}

/**
 * Repõe uma variável de ambiente no valor anterior ao teste.
 *
 * @param key Nome da variável.
 * @param value Valor anterior, se existia.
 */
function restoreEnv(key: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[key];
        return;
    }

    process.env[key] = value;
}
```

5. Explicação do código.

O primeiro teste confirma o caminho principal: o controller devolve `status: "ok"`, `version`, `uptimeSeconds` e `availability` com o estado `WARNING` calculado por `evaluateAvailabilityBudget(...)`. O segundo teste é o negativo de identidade e sessão: garante que a rota pública não mostra `userId`, `email`, `cookie` ou `token`. O terceiro teste é o negativo de configuração interna: garante que a resposta não expõe `mongoUri`, `redisUrl` ou `stack`, que a versão cai para `"dev"` e que um valor inválido de downtime não aparece na resposta.

Este teste usa `HealthController` e `HealthService` reais, sem depender de servidor HTTP, base de dados ou credenciais.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit -- health.controller
```

Resultado esperado: a suite passa com três testes.

7. Cenário negativo/erro esperado.

Se a suite falhar porque algum campo sensível aparece na resposta, remove esse campo do `HealthService` ou do `HealthController` antes de abrir PR.

### Passo 7 - Validar build, smoke HTTP e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com evidence observável e deixar `BK-MF7-09` preparado para usar o health-check como pré-condição.

2. Ficheiros envolvidos:
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/src/common/health/health.controller.ts`
    - REVER: `apps/api/src/common/health/health.controller.spec.ts`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
    - LOCALIZAÇÃO: comandos de terminal e evidence de PR/defesa.

3. Instruções do que fazer.

Executa build, teste unitário e um smoke HTTP com a API em execução. Se a API estiver a correr noutra porta, ajusta apenas a porta do URL.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- health.controller
curl -i http://127.0.0.1:3000/api/health
```

5. Explicação do código.

O build confirma que os imports e módulos compilam. O teste unitário confirma caminho principal e negativos P1. O `curl` confirma que o endpoint está exposto por HTTP e devolve resposta observável, que deve ser semelhante a:

```json
{
  "status": "ok",
  "uptimeSeconds": 12,
  "version": "dev",
  "availability": {
    "downtimeMinutes": 0,
    "limitMinutes": 60,
    "status": "HEALTHY"
  }
}
```

Esta evidence é suficiente para `BK-MF7-09` usar o health-check como pré-condição antes de validar IA com fontes.

6. Validação do passo.

Resultados esperados:

- `npm --prefix apps/api run build`: termina com código `0`.
- `npm --prefix apps/api run test:unit -- health.controller`: passa com três testes.
- `curl -i http://127.0.0.1:3000/api/health`: devolve `HTTP/1.1 200` e JSON com `status`, `uptimeSeconds`, `version` e `availability`.

7. Cenário negativo/erro esperado.

Se o `curl` devolver `404`, confirma se `HealthModule` foi importado em `AppModule`. Se devolver dados sensíveis, remove-os antes de guardar evidence. Se o servidor não estiver a correr, regista isso como bloqueio de ambiente e mantém build/teste como evidence local.

#### Critérios de aceite

- `RNF30` fica demonstrável por código, teste automatizado e smoke HTTP.
- `GET /api/health` responde `200` com `status`, `uptimeSeconds`, `version` e `availability`.
- `HealthService`, `HealthController` e `HealthModule` estão completos.
- `HealthService` consome `evaluateAvailabilityBudget(...)` criado em `BK-MF7-02`.
- `AppModule` importa `HealthModule`.
- O teste cobre caminho principal e dois negativos P1.
- A resposta pública não expõe userId, email, cookies, tokens, passwords, prompts, materiais, URIs internas, variáveis privadas ou stack traces.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- O handoff para `BK-MF7-09` fica claro.

#### Validação final

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- health.controller
curl -i http://127.0.0.1:3000/api/health
rg -n "userId|email|cookie|token|MONGODB_URI|REDIS|stack|prompt|material" apps/api/src/common/health
```

Resultado esperado:

- `build`: passa.
- `test:unit`: passa.
- `curl`: devolve `200` e JSON público mínimo.
- `rg`: não encontra dados sensíveis no contrato do health-check, exceto nos testes negativos quando estiverem a verificar ausência desses campos.

#### Evidence para PR/defesa

- `proof_build`: output de `npm --prefix apps/api run build`.
- `proof_unit`: output de `npm --prefix apps/api run test:unit -- health.controller`.
- `proof_smoke_http`: request/response de `curl -i http://127.0.0.1:3000/api/health`.
- `proof_negativo_identidade`: teste que confirma ausência de `userId`, `email`, `cookie` e `token`.
- `proof_negativo_configuracao`: teste que confirma ausência de `mongoUri`, `redisUrl` e `stack`.
- `proof_disponibilidade`: resposta com `availability.status` calculado por `evaluateAvailabilityBudget(...)`.
- `proof_privacidade`: confirmação de que a rota pública devolve apenas metadados técnicos mínimos.

#### Handoff

Depois deste BK, o `BK-MF7-09` recebe:

- `GET /api/health` como pré-condição operacional;
- módulo técnico isolado em `apps/api/src/common/health`;
- resposta pública mínima para deploy e rollback;
- estado agregado de disponibilidade vindo de `BK-MF7-02`;
- testes que impedem exposição acidental de dados sensíveis.

O próximo BK não deve recriar health-check. Deve usar esta prova operacional antes de validar a explicabilidade da IA com fontes.

#### Changelog

- `2026-06-27`: guia corrigido com código completo para `HealthService`, `HealthController`, `HealthModule`, integração em `AppModule`, consumo de `evaluateAvailabilityBudget(...)`, teste automatizado, dois negativos P1, smoke HTTP e handoff para `BK-MF7-09`.
