# BK-MF6-03 - Arquitetura preparada para escalar horizontalmente.

## Header

- `doc_id`: `GUIA-BK-MF6-03`
- `bk_id`: `BK-MF6-03`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `real_dev_status`: `MITIGADO_POR_ESCOPO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF13`
- `fase_documental`: `Fase 3`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais tornar explícito o limite operacional do alvo: `PAP_LOCAL_ENDURECIDA`, single-instance e apenas em `127.0.0.1`. Sessões e jobs ficam persistidos para recuperação local, mas este BK não autoriza escala horizontal.

No fim, a equipa fica com checklist técnico, endpoint de diagnóstico e condição de reabertura: qualquer segunda instância exige adapter WebSocket/pub-sub, coordenação distribuída de jobs, testes de concorrência e nova auditoria. `RNF13` fica `MITIGADO_POR_ESCOPO`, nunca apresentado como garantia de produção.

#### Importância

`RNF13` é CANONICO nos requisitos não funcionais. Este BK existe porque a StudyFlow já tem autenticação, materiais, IA, turmas, salas e UX suficientes para precisar de garantias transversais: a aplicação deve continuar segura, responsiva e defensável quando aumenta o volume de dados e utilizadores.

Este guia também prepara `BK-MF6-04` porque entrega contratos, evidence e decisões técnicas que o próximo BK pode reutilizar.

#### Scope-in

- Implementar a decisão técnica mínima para `RNF13`.
- Criar ou ajustar os ficheiros listados em `Ficheiros a criar/editar/rever`.
- Validar cenário principal e cenário negativo com evidence objetiva.
- Preservar sessão HttpOnly, validação backend, ownership, membership e privacidade.
- Usar apenas caminhos públicos de aluno: `apps/api` e `apps/web`.

#### Scope-out

- Alterar RF/RNF, owner, sprint, prioridade ou dependências canónicas.
- Criar entidades de domínio que não existam na documentação.
- Adicionar dependências npm sem aprovação e justificação técnica.
- Mover regras de autorização para o frontend.
- Guardar segredos, sessões, hashes, prompts privados ou dados pessoais na evidence.
- Resolver observabilidade completa de MF7 ou compatibilidade de MF8 fora do handoff.

#### Estado antes e depois

- Estado antes: os BKs até MF5 entregam autenticação, materiais, IA, guardrails iniciais, UX transversal, feedback e smoke de concorrência.
- Estado depois: o runtime falha com configuração pública/multi-instância e a documentação regista os controlos compensatórios e a condição de reabertura.

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
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md`

#### Glossário

- **RNF13:** requisito não funcional que este BK torna executável.
- **Job:** registo de trabalho com estado observável pela API ou por comando técnico.
- **Ownership:** regra que garante que um aluno só acede aos seus dados privados.
- **Membership:** regra que confirma pertença a sala, grupo, turma ou disciplina.
- **Evidence:** prova objetiva usada em PR, revisão e defesa PAP.
- **Fallback honesto:** erro ou resposta controlada que não inventa sucesso quando faltam condições.

#### Conceitos teóricos essenciais

- **RNF:** `RNF13` é CANONICO e define a qualidade que este BK torna implementável.
- **Contexto autenticado:** o utilizador vem da sessão backend e nunca de campos enviados pelo frontend.
- **Privacidade:** dados de aluno, professor, sala, turma e disciplina ficam separados por ownership, membership ou role.
- **Evidence:** a defesa PAP precisa de comando, output e interpretação, não apenas uma descrição textual.
- **Trabalho assíncrono:** uma tarefa pesada deve libertar rapidamente o pedido HTTP e expor estado consultável.
- **Métrica observável:** tempo de resposta, estado do job e erro controlado mostram se a app melhora sem bloquear a UI.

#### Arquitetura do BK

- Endpoint(s): `GET /api/runtime/scope`, apenas para identity check local sem dados sensíveis.
- Modelo/schema: reutiliza modelos existentes quando possível; só cria persistência nova quando o passo técnico a justificar.
- Service(s): `apps/api/src/common/runtime/runtime-instance.service.ts` concentra a regra principal deste BK.
- Controller/route: expõe apenas contratos necessários ao RNF e mantém validação backend.
- Guard/middleware: sessão, CSRF, ownership, membership ou role ficam antes da regra de negócio.
- Cliente API: usa credentials include quando houver frontend autenticado.
- Testes: cenário principal e negativo obrigatório ligado ao requisito.
- Handoff para o próximo BK: `BK-MF6-04` consome a decisão técnica e a evidence produzida aqui.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/runtime/runtime-instance.service.ts`
- CRIAR: `apps/api/src/common/runtime/runtime.controller.ts`
- CRIAR: `apps/api/src/common/runtime/runtime.module.ts`
- CRIAR: `apps/api/src/common/runtime/runtime-instance.service.spec.ts`
- EDITAR: `apps/api/src/app.module.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-03` entrega `RNF13` sem alterar IDs, owners, sprint, prioridade ou escopo da matriz.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- LOCALIZAÇÃO: linhas do requisito e linha canónica do BK.

3. Instruções do que fazer.

`CANONICO`: o título, requisito, prioridade e próximo BK vêm da matriz e do backlog. `DERIVADO`: as decisões técnicas abaixo são a menor implementação coerente com a stack já usada em `apps/api` e `apps/web`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa escopo e evita inventar entidades ou endpoints fora da documentação. A decisão protege a sequência MF5 -> MF6 -> MF7.

6. Validação do passo.

Confirma que o header mantém `RNF13`, `P2`, `S08`, `Core` e `proximo_bk: BK-MF6-04`.

7. Cenário negativo/erro esperado.

Se alguém alterar metadados sem evidência documental, a revisão deve falhar e a alteração deve voltar ao contrato canónico.

### Passo 2 - Ler contratos anteriores e risco principal

1. Objetivo funcional do passo no contexto da app.

Ligar este BK ao que já existe antes dele: `BK-MF6-02`, MF0 a MF5, autenticação por cookie, validação backend, materiais, fontes e IA quando entram no fluxo.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/common/guards/session.guard.ts`
- REVER: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: módulos já usados pela funcionalidade alvo.

3. Instruções do que fazer.

Identifica sessões Redis, MongoDB, jobs persistidos e diagnóstico operacional. Confirma que a configuração obriga `local-pap`, loopback e uma única instância, e que permissões nunca ficam em memória como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é de leitura técnica. O aluno deve perceber o que já existe antes de criar ficheiros novos, para não duplicar controllers, services, DTOs ou regras de segurança.

6. Validação do passo.

Faz uma lista curta dos ficheiros que serão criados, editados e apenas revistos. A lista final deve coincidir com a secção de ficheiros deste BK.

7. Cenário negativo/erro esperado.

Se encontrares um endpoint equivalente já criado, não cries outro endpoint para a mesma responsabilidade; adapta o plano e regista a decisão na evidence.

### Passo 3 - Criar service principal do BK

1. Objetivo funcional do passo no contexto da app.

Implementar a regra central que torna `RNF13` observável e testável no backend.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/runtime/runtime-instance.service.ts`
- LOCALIZAÇÃO: ficheiro completo, com imports, JSDoc e comentários didáticos.

3. Instruções do que fazer.

Cria o ficheiro abaixo e mantém a responsabilidade concentrada. O service não recebe decisões de permissão do frontend; usa contexto autenticado ou configuração backend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/runtime/runtime-instance.service.ts
import { Injectable } from "@nestjs/common";

export type RuntimeInstanceView = {
    deploymentScope: "local-pap";
    host: "127.0.0.1";
    singleInstance: true;
    sessionStore: "redis";
    persistentStore: "mongodb";
};

/**
 * Identifica a instância sem expor dados de alunos, professores ou sessões.
 */
@Injectable()
export class RuntimeInstanceService {
    /**
     * Devolve metadados mínimos para verificar a identidade da instância local.
     *
     * @returns Dados técnicos seguros para smoke tests e evidence.
     */
    describe(): RuntimeInstanceView {
        // A resposta nunca inclui cookie, userId, email ou conteúdo privado do aluno.
        return {
            deploymentScope: "local-pap",
            host: "127.0.0.1",
            singleInstance: true,
            sessionStore: "redis",
            persistentStore: "mongodb",
        };
    }
}
```

5. Explicação do código.

O código torna o scope local verificável sem sugerir balanceamento. O loader tipado, não este DTO, é quem deve fazer o arranque falhar se scope/host/proxy/origens forem incompatíveis.

6. Validação do passo.

Executa teste unitário focado no service ou, se ainda não criares o teste neste passo, valida pelo TypeScript com `npm --prefix apps/api run build`.

7. Cenário negativo/erro esperado.

Força o cenário negativo descrito no código: contexto proibido, documento inválido, fonte ausente, canal inseguro ou falha transitória conforme o BK.

### Passo 4 - Integrar controller, cliente ou configuração

1. Objetivo funcional do passo no contexto da app.

Ligar o service ao ponto real da aplicação sem criar caminhos paralelos ou contratos duplicados.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/runtime/runtime.controller.ts`
- CRIAR: `apps/api/src/common/runtime/runtime.module.ts`
- EDITAR: `apps/api/src/app.module.ts`
- LOCALIZAÇÃO: ficheiros completos novos e import explícito no módulo raiz.

3. Instruções do que fazer.

Aplica a integração abaixo no local indicado. Mantém nomes consistentes com módulos anteriores e não alteres fluxos fora do requisito.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/runtime/runtime.controller.ts
import { Controller, Get } from "@nestjs/common";
import { RuntimeInstanceService } from "./runtime-instance.service.js";

/**
 * Endpoint técnico seguro para verificar que o processo certo serve o teste local.
 */
@Controller("api/runtime")
export class RuntimeController {
    constructor(private readonly runtime: RuntimeInstanceService) {}

    @Get("scope")
    instance() {
        // A resposta valida a identidade local sem revelar sessões ou cookies.
        return this.runtime.describe();
    }
}

// apps/api/src/common/runtime/runtime.module.ts
import { Module } from "@nestjs/common";
import { RuntimeController } from "./runtime.controller.js";
import { RuntimeInstanceService } from "./runtime-instance.service.js";

/**
 * Agrupa o endpoint técnico de runtime sem misturar regras de domínio StudyFlow.
 */
@Module({
    controllers: [RuntimeController],
    providers: [RuntimeInstanceService],
})
export class RuntimeModule {}

// apps/api/src/app.module.ts
import "./common/config/load-env.js";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RuntimeModule } from "./common/runtime/runtime.module.js";
import { AccountDeletionModule } from "./modules/account-deletion/account-deletion.module.js";
import { AdaptiveExplanationsModule } from "./modules/adaptive-explanations/adaptive-explanations.module.js";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module.js";
import { AiConsentsModule } from "./modules/ai-consents/ai-consents.module.js";
import { AiGuardrailsModule } from "./modules/ai-guardrails/ai-guardrails.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { ContextNotificationsModule } from "./modules/context-notifications/context-notifications.module.js";
import { CurriculumNavigationModule } from "./modules/curriculum-navigation/curriculum-navigation.module.js";
import { ExternalKnowledgeAiModule } from "./modules/external-knowledge-ai/external-knowledge-ai.module.js";
import { ExternalMaterialImportsModule } from "./modules/external-material-imports/external-material-imports.module.js";
import { FollowUpAlertsModule } from "./modules/follow-up-alerts/follow-up-alerts.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";
import { NotificationPoliciesModule } from "./modules/notification-policies/notification-policies.module.js";
import { NotificationPreferencesModule } from "./modules/notification-preferences/notification-preferences.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { PrivacyDataExportsModule } from "./modules/privacy-data-exports/privacy-data-exports.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyAlertsModule } from "./modules/study-alerts/study-alerts.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { StudyGroupAiModule } from "./modules/study-group-ai/study-group-ai.module.js";
import { StudyGroupMessagesModule } from "./modules/study-group-messages/study-group-messages.module.js";
import { StudyGroupSessionsModule } from "./modules/study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "./modules/study-groups/study-groups.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { UnifiedSearchModule } from "./modules/unified-search/unified-search.module.js";

/**
 * Módulo raiz da API.
 */
@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow"),
        AuthModule,
        RuntimeModule,
        StudentsModule,
        StudyModule,
        StudyAreasModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        MaterialsModule,
        AiModule,
        OfficialMaterialsModule,
        ExternalMaterialImportsModule,
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
    ],
})
export class AppModule {}
```

5. Explicação do código.

A integração mostra onde o service entra no fluxo real. O controller expõe apenas metadados técnicos e `GET /api/runtime/scope` permite ao E2E verificar que está ligado à instância local esperada.

6. Validação do passo.

Confirma que os imports apontam para ficheiros existentes ou criados neste BK e que `GET /api/runtime/scope` não duplica outra rota.

7. Cenário negativo/erro esperado.

Se a integração aceitar identificadores de aluno, sala ou turma enviados pelo body para decidir permissões, rejeita a alteração e volta a usar sessão/backend.

### Passo 5 - Adicionar teste e negativo obrigatório

1. Objetivo funcional do passo no contexto da app.

Criar uma prova pequena que falhe quando a regra de `RNF13` for removida.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/runtime/runtime-instance.service.spec.ts`
- LOCALIZAÇÃO: teste unitário, smoke ou comando operacional do BK.

3. Instruções do que fazer.

Adiciona o teste abaixo e adapta apenas nomes de imports se a organização local do módulo exigir.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/runtime/runtime-instance.service.spec.ts
import { RuntimeInstanceService } from "./runtime-instance.service.js";

describe("RuntimeInstanceService", () => {
    it("não devolve dados pessoais", () => {
        const result = new RuntimeInstanceService().describe();

        // O smoke protege a fronteira de privacidade do endpoint técnico.
        expect(result).toEqual({
            deploymentScope: "local-pap",
            host: "127.0.0.1",
            singleInstance: true,
            sessionStore: "redis",
            persistentStore: "mongodb",
        });
        expect(JSON.stringify(result)).not.toMatch(/cookie|email|password|sessionId|userId/i);
    });
});
```

5. Explicação do código.

O teste evita regressão silenciosa: se alguém expuser dados pessoais ou remover a forma mínima da resposta, a suite deixa de passar. O import explícito torna o ficheiro copiável sem o aluno ter de adivinhar a origem do service.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit` quando o teste for backend. Se o BK tocar UI, executa também `npm --prefix apps/web run build`.

7. Cenário negativo/erro esperado.

Altera temporariamente o input do teste para a situação inválida e confirma que a falha é explícita, com mensagem controlada e sem dados sensíveis.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md`
- LOCALIZAÇÃO: secções de validação final e evidence.

3. Instruções do que fazer.

Regista comando executado, resultado observado, cenário negativo e interpretação curta. Não copies cookies, hashes, URIs completas, prompts privados, respostas IA privadas ou dados pessoais para a evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo organiza a prova. A evidence é parte do trabalho técnico: mostra que o requisito foi validado e que o aluno entende o motivo da validação.

6. Validação do passo.

Guarda output de `npm --prefix apps/api run build`, `npm --prefix apps/api run test:unit` e qualquer smoke específico deste BK.

7. Cenário negativo/erro esperado.

Se uma validação não puder correr por falta de ambiente, regista o bloqueio com comando, erro observado e impacto. Não marques como sucesso.

### Passo 7 - Fechar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-04` consegue consumir o que este BK entrega sem reescrever a solução.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- LOCALIZAÇÃO: Handoff e Changelog.

3. Instruções do que fazer.

Atualiza o handoff com exports, endpoints, comandos e riscos restantes. A decisão marcada como DERIVADO neste BK é: criar endpoint de diagnóstico sem dados pessoais para validar multi-instância em ambiente de teste.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é garantir continuidade entre BKs. Este fecho evita que a MF6 fique como uma coleção de tarefas soltas.

6. Validação do passo.

Confirma que o próximo BK citado existe na matriz e que nenhum caminho interno de referência aparece no texto destinado ao aluno.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de algo que não foi entregue aqui, volta ao passo técnico correspondente e completa o contrato antes de fechar.

#### Critérios de aceite

- `RNF13` tem uma regra backend ou operacional verificável.
- O cenário principal produz output objetivo e repetível.
- O cenário negativo falha com erro controlado e sem dados sensíveis.
- A solução não depende de permissões decididas no frontend.
- Os caminhos de ficheiros usam apenas apps/api e apps/web.
- A evidence inclui comando, resultado observado e interpretação curta.
- O handoff para `BK-MF6-04` fica explícito.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit`
- `npm --prefix apps/web run build` se o BK tocar frontend
- Smoke manual ou comando específico indicado no passo 5
- Cenário negativo obrigatório descrito no passo 5

#### Evidence para PR/defesa

- pr: link ou referência do commit com o BK implementado.
- proof_tecnico: output do build/teste/smoke.
- proof_negativos: erro controlado do cenário negativo.
- proof_privacidade: confirmação de que não foram expostos cookies, hashes, prompts, respostas IA privadas ou dados pessoais.
- proof_handoff: nota curta a explicar como BK-MF6-04 consome este trabalho.

#### Handoff

- Entrega para `BK-MF6-04`: a equipa fica com checklist técnico, endpoint de diagnóstico e regra clara para manter estado partilhado em Redis/MongoDB.
- Exports produzidos: `RuntimeModule`, `RuntimeController`, `RuntimeInstanceService` e `RuntimeInstanceView`.
- Decisão DERIVADO registada: criar endpoint de diagnóstico sem dados pessoais para validar multi-instância em ambiente de teste.
- Risco residual: validar em ambiente semelhante ao deploy final antes de apresentar como garantia operacional.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-23`: corrigida integração NestJS do runtime e teste unitário para ficar copiável sem imports em falta.
- `2026-06-22`: guia reescrito com estrutura pedagógica completa, passos técnicos, código integrado, validação e handoff para `BK-MF6-04`.
