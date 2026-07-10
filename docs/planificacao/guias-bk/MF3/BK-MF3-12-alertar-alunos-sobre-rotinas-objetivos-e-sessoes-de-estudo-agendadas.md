# BK-MF3-12 - Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.

## Header

- `doc_id`: `GUIA-BK-MF3-12`
- `bk_id`: `BK-MF3-12`
- `macro`: `MF3`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-05`
- `rf_rnf`: `RF48`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-01`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-12-alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar alertas internos de estudo. O guia parte dos contratos canónicos de RF48, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF48 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Agregar alertas de rotina, objetivo e sessão.
- Respeitar preferência `inApp`.
- Devolver empty state claro.

#### Scope-out

- Envio real de email ou push.
- Alertas docentes avançados.
- Quotas administrativas.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `GET /api/study-alerts`, DTO, backend, frontend, validações e handoff para `BK-MF4-01`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `GET /api/study-alerts` é DERIVADO como contrato técnico mínimo para cumprir RF48 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF0-05` com rotinas e objetivos.
- `BK-MF3-07` com sessões futuras.
- `BK-MF3-11` com preferências.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Alerta interno é uma mensagem contextualizada dentro da app.
- Rotinas e objetivos vêm do BK-MF0-05.
- Sessões de grupo vêm de BK-MF3-07 como dependência técnica derivada.
- Preferências vêm de BK-MF3-11 e controlam se o alerta aparece no canal app.

##### Conceitos backend

- O controller recebe HTTP, mas não decide permissões.
- O service valida sessão, ownership ou membership antes de tocar em dados sensíveis.
- O DTO protege o service contra campos vazios, tipos errados e payloads demasiado grandes.
- O módulo NestJS liga controller, service, schemas e módulos herdados.

##### Conceitos frontend

- O componente React separa input, loading, erro, sucesso e vazio.
- O cliente API é tipado para alinhar payload e resposta.
- `credentials: 'include'` envia o cookie HttpOnly sem guardar tokens no browser.

##### Conceitos de segurança

- O frontend nunca envia `userId` como fonte de verdade.
- O backend valida membership ou ownership com services herdados.
- Erros negativos são controlados com `400`, `401`, `403`, `404`, `422` ou `503`, conforme a causa.

#### Arquitetura do BK

- Endpoint: `GET /api/study-alerts`.
- Backend: `apps/api/src/modules/study-alerts`.
- Frontend: `apps/web/src/features/study-alerts`.
- DTO principal: `StudyAlertsQueryDto`.
- Service principal: `StudyAlertsService`.
- Controller principal: `StudyAlertsController`.
- Módulo principal: `StudyAlertsModule`.
- Handoff: `BK-MF4-01`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/study-alerts/dto/study-alerts-query.dto.ts`
- CRIAR: `apps/api/src/modules/study-alerts/schemas/study-alert-read.schema.ts`
- CRIAR: `apps/api/src/modules/study-alerts/study-alerts.service.ts`
- CRIAR: `apps/api/src/modules/study-alerts/study-alerts.controller.ts`
- CRIAR: `apps/api/src/modules/study-alerts/study-alerts.module.ts`
- CRIAR: `apps/web/src/features/study-alerts/load-study-alerts.ts`
- CRIAR: `apps/web/src/features/study-alerts/study-alerts-panel.tsx`
- REVER: `apps/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-alerts/dto/study-alerts-query.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-alerts/dto/study-alerts-query.dto.ts
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

/**
 * Query de alertas internos de estudo.
 */
export class StudyAlertsQueryDto {
    /**
     * Quando ativo, mostra apenas alertas futuros.
     */
    @IsOptional()
    @Transform(({ value }) => {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return value;
    })
    @IsBoolean()
    onlyUpcoming?: boolean;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia `GET /api/study-alerts?onlyUpcoming=talvez` e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-alerts/schemas/study-alert-read.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-alerts/schemas/study-alert-read.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyAlertReadDocument = HydratedDocument<StudyAlertRead>;

/**
 * Estado de leitura de um alerta derivado.
 */
@Schema({ timestamps: true })
export class StudyAlertRead {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, index: true })
    alertKey!: string;

    @Prop({ required: true })
    readAt!: Date;
}

export const StudyAlertReadSchema =
    SchemaFactory.createForClass(StudyAlertRead);

StudyAlertReadSchema.index({ userId: 1, alertKey: 1 }, { unique: true });
```

5. Explicação do código.
   O schema evita respostas soltas: a app guarda quem executou o fluxo, que dados foram usados e que resultado foi devolvido. Isto permite testes e continuidade.
6. Validação do passo.
   Arranca a API depois do módulo e confirma que o schema é registado pelo NestJS.
7. Cenário negativo/erro esperado.
   Não guardes segredos, tokens ou dados de outros contextos neste documento.

### Passo 3 - Implementar o service de aplicação

1. Objetivo funcional do passo no contexto da app.
   Concentrar regras de negócio, ownership, membership, erros e efeitos de persistência num ponto testável.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-alerts/study-alerts.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-alerts/study-alerts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    NotificationContext,
} from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { RoutinesService } from "../study/routines.service.js";
import { PublicStudyGoalDto, PublicStudyRoutineDto } from "../study/dto/public-study-plan.dto.js";
import { StudyGroupSessionsService } from "../study-group-sessions/study-group-sessions.service.js";
import { StudyAlertsQueryDto } from "./dto/study-alerts-query.dto.js";

export type StudyAlert = {
    key: string;
    context: NotificationContext;
    title: string;
    body: string;
    dueAt?: Date;
    sourceId: string;
};

/**
 * Serviço de alertas internos derivados de rotinas, objetivos e sessões.
 */
@Injectable()
export class StudyAlertsService {
    constructor(
        private readonly routinesService: RoutinesService,
        private readonly sessionsService: StudyGroupSessionsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Lista alertas in-app respeitando preferências por contexto.
     *
     * @param actor Aluno autenticado.
     * @param query Filtros opcionais.
     * @returns Alertas internos.
     */
    async listAlerts(
        actor: AuthenticatedUser,
        query: StudyAlertsQueryDto,
    ): Promise<StudyAlert[]> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const [plan, sessions, routineInApp, goalInApp, sessionInApp] =
            await Promise.all([
                this.routinesService.listMine(actor.id),
                this.sessionsService.listUpcomingForStudent(actor),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.STUDY_ROUTINE,
                ),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.STUDY_GOAL,
                ),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.GROUP_SESSION,
                ),
            ]);

        const alerts: StudyAlert[] = [
            ...(routineInApp
                ? plan.routines.map((routine) => this.fromRoutine(routine))
                : []),
            ...(goalInApp ? plan.goals.map((goal) => this.fromGoal(goal)) : []),
            ...(sessionInApp
                ? sessions.map((session) => ({
                      key: `session:${session._id}`,
                      context: NotificationContext.GROUP_SESSION,
                      title: `Sessão: ${session.title}`,
                      body:
                          session.goal ??
                          `Sessão agendada para ${this.formatDateTime(session.startsAt)}.`,
                      dueAt: session.startsAt,
                      sourceId: session._id,
                  }))
                : []),
        ];

        return query.onlyUpcoming
            ? alerts.filter((alert) => !alert.dueAt || alert.dueAt >= new Date())
            : alerts;
    }

    /**
     * Converte rotina num alerta interno.
     *
     * @param routine Rotina pessoal.
     * @returns Alerta de rotina.
     */
    private fromRoutine(routine: PublicStudyRoutineDto): StudyAlert {
        return {
            key: `routine:${routine._id}`,
            context: NotificationContext.STUDY_ROUTINE,
            title: `Rotina: ${routine.title}`,
            body: `Planeada para ${routine.weekdays.join(", ")} às ${routine.startTime}.`,
            sourceId: routine._id,
        };
    }

    /**
     * Converte objetivo num alerta interno.
     *
     * @param goal Objetivo pessoal.
     * @returns Alerta de objetivo.
     */
    private fromGoal(goal: PublicStudyGoalDto): StudyAlert {
        return {
            key: `goal:${goal._id}`,
            context: NotificationContext.STUDY_GOAL,
            title: `Objetivo: ${goal.title}`,
            body: goal.targetDate
                ? `Objetivo com data alvo em ${this.formatDate(goal.targetDate)}.`
                : "Objetivo ativo sem data alvo definida.",
            dueAt: goal.targetDate,
            sourceId: goal._id,
        };
    }

    /**
     * Formata data em PT-PT para resposta pública.
     *
     * @param value Data alvo.
     * @returns Data formatada.
     */
    private formatDate(value: Date): string {
        return new Intl.DateTimeFormat("pt-PT").format(value);
    }

    /**
     * Formata data/hora em PT-PT para alertas.
     *
     * @param value Data da sessão.
     * @returns Data e hora formatadas.
     */
    private formatDateTime(value: Date): string {
        return new Intl.DateTimeFormat("pt-PT", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(value);
    }
}
```

5. Explicação do código.
   O service recebe o actor autenticado, valida o contexto com services de BKs anteriores e só depois lê, grava ou chama IA. Isto impede que a UI contorne regras de segurança.
6. Validação do passo.
   Cria testes unitários para sessão válida, contexto proibido e dados insuficientes.
7. Cenário negativo/erro esperado.
   Não faças consultas diretas por ID sem validar owner ou membership.

### Passo 4 - Expor o endpoint no controller

1. Objetivo funcional do passo no contexto da app.
   Ligar `GET /api/study-alerts` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-alerts/study-alerts.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-alerts/study-alerts.controller.ts
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { StudyAlertsQueryDto } from "./dto/study-alerts-query.dto.js";
import { StudyAlertsService } from "./study-alerts.service.js";

/**
 * Endpoint de alertas internos de estudo.
 */
@Controller("api/study-alerts")
@UseGuards(SessionGuard)
export class StudyAlertsController {
    constructor(private readonly alertsService: StudyAlertsService) {}

    /**
     * Lista alertas in-app derivados dos contratos existentes.
     *
     * @param request Pedido autenticado.
     * @param query Filtro opcional.
     * @returns Alertas visíveis.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Query() query: StudyAlertsQueryDto,
    ) {
        return this.alertsService.listAlerts(request.user!, query);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz um pedido sem cookie para `GET /api/study-alerts` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/study-alerts/study-alerts.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `StudyAlertsModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-alerts/study-alerts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyModule } from "../study/study.module.js";
import { StudyGroupSessionsModule } from "../study-group-sessions/study-group-sessions.module.js";
import {
    StudyAlertRead,
    StudyAlertReadSchema,
} from "./schemas/study-alert-read.schema.js";
import { StudyAlertsController } from "./study-alerts.controller.js";
import { StudyAlertsService } from "./study-alerts.service.js";

/**
 * Módulo MF3 de alertas internos de estudo.
 */
@Module({
    imports: [
        AuthModule,
        StudyModule,
        StudyGroupSessionsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([
            { name: StudyAlertRead.name, schema: StudyAlertReadSchema },
        ]),
    ],
    controllers: [StudyAlertsController],
    providers: [StudyAlertsService],
})
export class StudyAlertsModule {}
```

5. Explicação do código.
   O módulo explicita dependências. Se algum import falhar, o erro aparece no arranque da API em vez de surgir no meio do fluxo do aluno.
6. Validação do passo.
   Arranca a API e confirma que o módulo resolve todos os providers.
7. Cenário negativo/erro esperado.
   Não declares outro provider de IA nem dupliques módulos herdados.

### Passo 6 - Criar o cliente frontend tipado

1. Objetivo funcional do passo no contexto da app.
   Isolar a chamada HTTP para que o componente não tenha URLs, métodos ou parsing espalhados.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/study-alerts/load-study-alerts.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/study-alerts/load-study-alerts.ts
import { NotificationContext } from "../notification-preferences/update-notification-preferences.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type StudyAlert = {
    key: string;
    context: NotificationContext;
    title: string;
    body: string;
    dueAt?: string;
    sourceId: string;
};

/**
 * Carrega alertas internos de estudo.
 *
 * @param onlyUpcoming Filtra alertas futuros.
 * @returns Alertas visíveis.
 */
export function loadStudyAlerts(onlyUpcoming = true): Promise<StudyAlert[]> {
    return requestMf3Json<StudyAlert[]>(
        `/api/study-alerts?onlyUpcoming=${String(onlyUpcoming)}`,
    );
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. O erro é lançado para a UI mostrar feedback controlado.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/study-alerts/study-alerts-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/study-alerts/study-alerts-panel.tsx
import { useEffect, useState } from "react";
import { loadStudyAlerts, StudyAlert } from "./load-study-alerts.js";

/**
 * Painel de alertas internos de estudo.
 *
 * @returns Lista de alertas.
 */
export function StudyAlertsPanel() {
    const [alerts, setAlerts] = useState<StudyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            setAlerts(await loadStudyAlerts(true));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    return (
        <section className="sf-panel space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Alertas</h2>
                <button className="sf-button-secondary" onClick={() => void refresh()}>
                    Atualizar
                </button>
            </div>
            {error ? <p className="sf-error">{error}</p> : null}
            {loading ? <p className="text-sm text-slate-600">A carregar alertas...</p> : null}
            {!loading && alerts.length === 0 ? (
                <p className="text-sm text-slate-600">Sem alertas ativos.</p>
            ) : null}
            <div className="grid gap-2">
                {alerts.map((alert) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={alert.key}>
                        <strong>{alert.title}</strong>
                        <p className="text-slate-700">{alert.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.
   O componente valida o fluxo real: envia dados pelo cliente tipado, mostra erros e apresenta a resposta sem expor dados sensíveis.
6. Validação do passo.
   Preenche o formulário, submete e confirma que o resultado aparece sem reload da página.
7. Cenário negativo/erro esperado.
   Não escondas erros; feedback silencioso faz o aluno pensar que a app não respondeu.

### Passo 8 - Fechar validação do BK

1. Objetivo funcional do passo no contexto da app.
   Registar o contrato mínimo que a equipa deve cobrir com testes e evidência.
2. Ficheiros envolvidos:
   - REVER: `apps/api/src/modules/mf3-http-contracts.spec.ts`
   - LOCALIZAÇÃO: `teste de contrato MF3 e teste unitário do módulo`
3. Instruções do que fazer.
   Revê os testes Jest já configurados para a MF3 e confirma o cenário deste BK sem adicionar dependências novas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação: usa os testes Jest existentes em `apps/api/src/modules/mf3-http-contracts.spec.ts` e o teste unitário do módulo correspondente, sem adicionar dependências novas.

5. Explicação do código.
   A validação usa Jest e os testes de contrato existentes da MF3 para confirmar rota, autenticação, DTO e cenário negativo sem introduzir dependências HTTP externas.
6. Validação do passo.
   Executa os testes unitários da API e confirma que o ficheiro `apps/api/src/modules/mf3-http-contracts.spec.ts` cobre o endpoint documentado.
7. Cenário negativo/erro esperado.
   Não marques o BK como concluído sem pelo menos um negativo de autenticação/autorização e um negativo de validação.

#### Critérios de aceite

##### Expected results

- Pedido válido para `GET /api/study-alerts` devolve `200 OK` com alertas autorizados.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `GET /api/study-alerts` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF4-01` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i http://localhost:3000/api/study-alerts
```

##### Negativos obrigatórios

- Sem cookie de sessão: `401 Unauthorized`.
- Campo obrigatório em falta: `400 Bad Request`.
- Recurso de outro aluno, grupo ou turma: `403 Forbidden` ou `404 Not Found`.
- Fonte inexistente ou não processável: `422 Unprocessable Entity` nos fluxos que usam fontes.

#### Evidence para PR/defesa

- Output do smoke test com payload válido.
- Output de pelo menos dois cenários negativos.
- Screenshot ou vídeo curto do painel frontend com sucesso e erro.
- Nota no PR com os documentos canónicos consultados e os requisitos cobertos.
- Referência ao requisito `RF48` e ao próximo BK `BK-MF4-01`.

#### Handoff

- Este BK entrega `StudyAlertsModule`, `StudyAlertsService`, `StudyAlertsController` e cliente frontend tipado.
- O próximo BK é `BK-MF4-01`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
