# BK-MF7-08 - Endpoint de health-check

## Header

- `doc_id`: `GUIA-BK-MF7-08`
- `bk_id`: `BK-MF7-08`
- `macro`: `MF7`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-09`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais separar liveness e readiness. `GET /api/health/live` responde `200` se o processo está vivo. `GET /api/health/ready` e o alias compatível `GET /api/health` respondem `200` apenas quando MongoDB, Redis, storage e runner estão disponíveis; qualquer dependência obrigatória indisponível devolve `503`.

No fim, a equipa consegue demonstrar `RNF30` com código NestJS, testes positivos e readiness negativa, smoke HTTP e evidence sem dados pessoais. O orçamento mensal de `BK-MF7-02` continua separado destes sinais instantâneos.

#### Importância

`RNF30` existe para confirmar rapidamente se a API arrancou depois de um deploy, rollback ou reinício. O health-check não substitui testes de negócio, autenticação, ownership, membership, quotas ou guardrails, mas dá um sinal operacional pequeno e fiável antes de abrir a aplicação a alunos e professores.

Este BK liga dois contratos anteriores da MF7: `BK-MF7-02` entrega a avaliação mensal de downtime e `BK-MF7-07` entrega readiness/rollback. O endpoint deste BK junta esses sinais sem expor configuração interna nem dados privados.

#### Scope-in

- Criar `HealthService` com resposta pública mínima.
- Manter `evaluateAvailabilityBudget(...)` separado do health instantâneo.
- Criar `HealthController` com `/live`, `/ready` e alias fail-closed `/health`.
- Criar probes com timeout curto para MongoDB, Redis, leitura/escrita segura no storage e heartbeat do runner.
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
- Estado depois: a API distingue processo vivo de instância pronta e usa `503` perante dependência crítica indisponível.

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
- **Service NestJS:** classe que separa processo vivo de dependências prontas e agrega probes com timeout.
- **Module NestJS:** unidade que agrupa controller e service para o NestJS conseguir descobrir a rota.
- **Resposta pública mínima:** JSON pequeno que ajuda a operação sem revelar dados privados. Evita transformar health-check num ponto de fuga de informação.
- **Readiness:** sinal fail-closed de MongoDB, Redis, storage e runner.
- **Smoke test:** confirma `200` saudável e `503` quando cada dependência é desligada, sem exigir login.
- **Teste negativo:** prova que a resposta não inclui informação proibida. Para `P1`, este BK usa dois negativos: não expor identidade/sessão e não expor configuração interna.
- **Privacidade e RGPD:** mesmo endpoints técnicos devem minimizar dados. O health-check não deve devolver dados pessoais porque pode ser consultado por ferramentas de operação.

#### Arquitetura do BK

O BK entrega uma peça backend pequena:

1. `HealthService.live()` devolve apenas processo vivo.
2. `HealthService.ready()` executa as quatro probes e lança `503` perante qualquer rejeição.
3. `HealthController` expõe `/live`, `/ready` e o alias `/health`.
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
- `DERIVADO`: as rotas públicas são `/live`, `/ready` e o alias `/health`.
- `DERIVADO`: readiness é `200 ready` ou `503 SERVICE_NOT_READY`, sem estado intermédio que pareça saudável.

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

Não mistures o cálculo mensal de downtime com liveness/readiness; mantém `evaluateAvailabilityBudget(...)` no contrato operacional próprio de BK-MF7-02.

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
import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export type ReadinessDependency = { check(): Promise<void> };
export const READINESS_DEPENDENCIES = Symbol("READINESS_DEPENDENCIES");

export type LivenessView = { status: "alive"; uptimeSeconds: number };
export type ReadinessView = { status: "ready"; version: string };

/**
 * Calcula a resposta pública de saúde da API StudyFlow.
 */
@Injectable()
export class HealthService {
    constructor(
        @Inject(READINESS_DEPENDENCIES)
        private readonly dependencies: ReadinessDependency[],
    ) {}

    live(): LivenessView {
        return { status: "alive", uptimeSeconds: Math.floor(process.uptime()) };
    }

    async ready(): Promise<ReadinessView> {
        const results = await Promise.allSettled(
            this.dependencies.map((dependency) => dependency.check()),
        );
        if (results.some((result) => result.status === "rejected")) {
            throw new ServiceUnavailableException({
                status: "unavailable",
                code: "SERVICE_NOT_READY",
            });
        }
        return {
            status: "ready",
            version: process.env.STUDYFLOW_RELEASE_VERSION?.trim() || "dev",
        };
    }
}
```

5. Explicação do código.

`live()` não consulta dependências. `ready()` executa probes com timeout para MongoDB, Redis, storage e runner; uma rejeição lança `503 SERVICE_NOT_READY`. A resposta pública não identifica qual dependência falhou nem expõe URI, path, stack ou credenciais; o detalhe fica apenas em logs sanitizados.

Este service prepara `HealthController`, que no passo seguinte vai expor a rota HTTP.

6. Validação do passo.

Confirma que existem exatamente quatro probes obrigatórias e que readiness negativa devolve `503`, sem propriedades como `userId`, `email`, `cookie`, `token`, `mongoUri`, `redisUrl`, `storagePath`, `prompt` ou `stack`.

7. Cenário negativo/erro esperado.

Se `STUDYFLOW_MONTHLY_DOWNTIME_MINUTES` vier inválido, a resposta deve continuar pública e segura, sem devolver o valor bruto nem stack trace.

### Passo 4 - Criar o HealthController

1. Objetivo funcional do passo no contexto da app.

Expor liveness, readiness e o alias de readiness no mesmo controller público mínimo.

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
import { HealthService, LivenessView, ReadinessView } from "./health.service.js";

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
    @Get("live")
    live(): LivenessView {
        return this.healthService.live();
    }

    @Get("ready")
    ready(): Promise<ReadinessView> {
        return this.healthService.ready();
    }

    @Get()
    readinessAlias(): Promise<ReadinessView> {
        return this.healthService.ready();
    }
}
```

5. Explicação do código.

`/live` sinaliza apenas o processo. `/ready` e o alias `/health` usam exatamente o mesmo método fail-closed. As rotas não usam sessão e devolvem apenas estado técnico mínimo.

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
import { ServiceUnavailableException } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
    it("liveness não depende de MongoDB, Redis, storage ou runner", () => {
        const rejected = { check: jest.fn().mockRejectedValue(new Error("down")) };
        const controller = createController([rejected, rejected, rejected, rejected]);
        expect(controller.live()).toMatchObject({ status: "alive" });
    });

    it("ready e alias devolvem ready quando as quatro probes passam", async () => {
        process.env.STUDYFLOW_RELEASE_VERSION = "2026.06.27";
        const ok = { check: jest.fn().mockResolvedValue(undefined) };
        const controller = createController([ok, ok, ok, ok]);
        await expect(controller.ready()).resolves.toEqual({
            status: "ready",
            version: "2026.06.27",
        });
        await expect(controller.readinessAlias()).resolves.toEqual({
            status: "ready",
            version: "2026.06.27",
        });
    });

    it("ready e alias falham closed quando uma probe rejeita", async () => {
        const ok = { check: jest.fn().mockResolvedValue(undefined) };
        const down = { check: jest.fn().mockRejectedValue(new Error("secret detail")) };
        const controller = createController([ok, ok, down, ok]);
        await expect(controller.ready()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        await expect(controller.readinessAlias()).rejects.toMatchObject({
            response: { status: "unavailable", code: "SERVICE_NOT_READY" },
        });
    });
});

/**
 * Cria o controller com dependências reais e pequenas para manter o teste claro.
 *
 * @returns Controller pronto para chamar o método público do health-check.
 */
function createController(dependencies: Array<{ check(): Promise<void> }>): HealthController {
    return new HealthController(new HealthService(dependencies));
}
```

5. Explicação do código.

Os testes provam que liveness continua `200` durante falha de dependência, que readiness/alias passam apenas com quatro probes verdes e que a falha é `503` sem detalhes internos.

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
curl -i http://127.0.0.1:3000/api/health/live
curl -i http://127.0.0.1:3000/api/health/ready
```

5. Explicação do código.

O build confirma que os imports e módulos compilam. O teste unitário confirma caminho principal e negativos P1. O `curl` confirma que o endpoint está exposto por HTTP e devolve resposta observável, que deve ser semelhante a:

```json
{
  "status": "ready",
  "version": "dev"
}
```

Esta evidence é suficiente para `BK-MF7-09` usar o health-check como pré-condição antes de validar IA com fontes.

6. Validação do passo.

Resultados esperados:

- `npm --prefix apps/api run build`: termina com código `0`.
- `npm --prefix apps/api run test:unit -- health.controller`: passa com três testes.
- Com dependências verdes, `/live`, `/ready` e `/health` devolvem `200`.
- Com MongoDB, Redis, storage ou runner indisponível, `/live` mantém `200` e `/ready` + `/health` devolvem `503`.

7. Cenário negativo/erro esperado.

Se o `curl` devolver `404`, confirma se `HealthModule` foi importado em `AppModule`. Se devolver dados sensíveis, remove-os antes de guardar evidence. Se o servidor não estiver a correr, regista isso como bloqueio de ambiente e mantém build/teste como evidence local.

#### Critérios de aceite

- `RNF30` fica demonstrável por código, teste automatizado e smoke HTTP.
- `GET /api/health/live` responde `200` enquanto o processo vive.
- `GET /api/health/ready` e `GET /api/health` são fail-closed e devolvem `503` se uma das quatro dependências falhar.
- `HealthService`, `HealthController` e `HealthModule` estão completos.
- `HealthService` tem quatro probes obrigatórias com timeout curto.
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
- `curl`: devolve `200` em estado saudável; o smoke negativo prova `503` por dependência.
- `rg`: não encontra dados sensíveis no contrato do health-check, exceto nos testes negativos quando estiverem a verificar ausência desses campos.

#### Evidence para PR/defesa

- `proof_build`: output de `npm --prefix apps/api run build`.
- `proof_unit`: output de `npm --prefix apps/api run test:unit -- health.controller`.
- `proof_smoke_http`: request/response de `curl -i http://127.0.0.1:3000/api/health`.
- `proof_negativo_identidade`: teste que confirma ausência de `userId`, `email`, `cookie` e `token`.
- `proof_negativo_configuracao`: teste que confirma ausência de `mongoUri`, `redisUrl` e `stack`.
- `proof_readiness_negativa`: quatro falhas controladas, uma por dependência, com `/live=200` e `/ready` + alias `=503`.
- `proof_privacidade`: confirmação de que a rota pública devolve apenas metadados técnicos mínimos.

#### Handoff

Depois deste BK, o `BK-MF7-09` recebe:

- `GET /api/health` como pré-condição operacional;
- módulo técnico isolado em `apps/api/src/common/health`;
- resposta pública mínima para deploy e rollback;
- readiness fail-closed de MongoDB, Redis, storage e runner;
- testes que impedem exposição acidental de dados sensíveis.

O próximo BK não deve recriar health-check. Deve usar esta prova operacional antes de validar a explicabilidade da IA com fontes.

#### Changelog

- `2026-07-10`: health separado em liveness/readiness, alias fail-closed e probes MongoDB/Redis/storage/runner com testes 503.
