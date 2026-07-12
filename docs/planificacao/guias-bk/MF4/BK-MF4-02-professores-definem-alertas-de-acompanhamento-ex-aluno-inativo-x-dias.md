# BK-MF4-02 - Professores definem alertas de acompanhamento (ex.: aluno inativo x dias).

## Header

- `doc_id`: `GUIA-BK-MF4-02`
- `bk_id`: `BK-MF4-02`
- `macro`: `MF4`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md`
- `last_updated`: `2026-07-11`

#### Objetivo

Criar regras de acompanhamento docente para detetar alunos inativos numa turma. O
professor define a turma, a janela de dias e a mensagem; o backend valida uma turma ativa,
calcula exclusivamente atividade pedagógica oficial dessa turma e prepara notificações
in-app para alunos elegíveis.

> **Contrato canónico de atividade:** `StudyEvent` representa estudo privado e não pode
> ser usado neste BK. A fonte é `ClassLearningActivity`, com projeção
> `StudentClassActivityState`, sempre delimitada por `classId`. Só memberships
> `ClassMembership.status=ACTIVE` entram no cálculo e `joinedAt` é o baseline quando ainda
> não existe atividade. Salas autónomas/colaborativas, áreas privadas, rotinas e objetivos
> pessoais nunca contam para inatividade docente.

#### Importância

RF50 dá ao professor um mecanismo objectivo para intervir antes de o aluno se perder. A regra fica no backend para não depender de filtros visuais frágeis no frontend.

#### Scope-in

- Criar `FollowUpAlertRule` com turma, janela de inatividade e mensagem.
- Validar ownership e lifecycle por `ClassesService.findOwnedActiveClass`.
- Ler atividade por `ClassLearningActivityService`, sempre com `classId`.
- Usar `ClassMembership.joinedAt` como baseline e apenas memberships ativas.
- Criar preview de alunos inativos.
- Integrar com `ContextNotificationsService` de BK-MF4-01.
- Criar painel React com loading, erro, lista e formulário pequeno.

#### Scope-out

- Agendamento automático recorrente.
- Email/push.
- Métricas avançadas de aprendizagem.
- Atividade privada, salas autónomas e eventos sem contexto oficial de turma.

#### Estado antes e depois

##### Estado antes

MF0 guarda estudo privado por aluno e MF1/MF2 entregam turmas e atividades oficiais.
Esses dois contextos não podem ser misturados num sinal docente.

##### Estado depois

Fica um módulo `follow-up-alerts` com regras por turma ativa, preview factual de alunos
inativos e ligação a notificações internas. O Centro pode consultar a mesma fonte canónica
sem score de risco ou diagnóstico oculto.

##### Decisões de escopo

- `CANONICO`: RF50 depende de professor autenticado.
- `CANONICO`: a turma pertence ao professor antes de qualquer leitura agregada.
- `CANONICO`: inatividade usa apenas eventos oficiais cujo `classId` corresponde à turma.
- `CANONICO`: `ClassMembership.joinedAt` evita classificar recém-inscritos como inativos.
- `CANONICO`: estudo privado e salas autónomas não produzem atividade visível ao professor.

#### Pre-requisitos

- BK-MF2-11 como base de acompanhamento docente.
- BK-MF4-01 para enviar a notificação interna final.
- `ClassesService.findOwnedActiveClass` e `ClassMembership`.
- `ClassLearningActivityModule`, `ClassLearningActivity` e `StudentClassActivityState`.
- `requestMf3Json` no frontend.

#### Glossário

- Regra de acompanhamento: configuração criada pelo professor para uma turma.
- Aluno inativo: membro ativo cujo `max(joinedAt, lastActivityAt)` da mesma turma é
  anterior à janela configurada.
- Preview: simulação calculada antes de disparar notificações.
- Janela de inatividade: número de dias usado para comparar com o último evento.

#### Conceitos teóricos essenciais

Uma métrica de acompanhamento só é útil se vier de dados consistentes. Por isso, o
backend valida primeiro a turma, resolve memberships ativas e calcula a última atividade
apenas no par `classId/studentId`. Um evento privado do mesmo aluno não altera esse estado.

#### Arquitetura do BK

- Endpoint: `GET /api/follow-up-alerts/summary`, `GET/POST /api/follow-up-alerts`,
  `POST /api/follow-up-alerts/:id/run` e detalhe factual em
  `GET /api/follow-up-centre/classes/:classId/students/:studentId`.
- Modelo/schema: `FollowUpAlertRule`.
- Service: `FollowUpAlertsService`.
- Controller: `FollowUpAlertsController`.
- Dependências: `ClassesModule`, `ClassLearningActivityModule`,
  `ContextNotificationsModule` e `OfficialTestsModule`.
- Cliente API: `follow-up-alerts-client.ts`.
- Componente: `FollowUpAlertsPanel`.
- Testes: `follow-up-alerts.service.spec.ts`.
- Handoff: BK-MF4-03 limita canais/quotas usados por alertas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/follow-up-alerts/dto/create-follow-up-alert-rule.dto.ts`
- CRIAR: `apps/api/src/modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.ts`
- CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts`
- CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.controller.ts`
- CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.module.ts`
- CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts`
- CRIAR: `apps/api/src/modules/class-learning-activity/class-learning-activity.service.ts`
- CRIAR: `apps/api/src/modules/class-learning-activity/schemas/class-learning-activity.schema.ts`
- CRIAR: `apps/api/src/modules/class-learning-activity/schemas/student-class-activity-state.schema.ts`
- CRIAR: `apps/web/src/features/follow-up-alerts/follow-up-alerts-client.ts`
- CRIAR: `apps/web/src/features/follow-up-alerts/follow-up-alerts-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar DTO e schema da regra

1. Objetivo funcional do passo no contexto da app.
   Persistir regras docentes com campos específicos de RF50.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/dto/create-follow-up-alert-rule.dto.ts`
   - CRIAR: `apps/api/src/modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.ts`
3. Instruções do que fazer.
   Usa `classId`, `inactiveDays`, `title` e `message`. O lifecycle acionável vem da
   turma ativa, não de uma flag duplicada na regra.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/dto/create-follow-up-alert-rule.dto.ts
import { IsInt, IsMongoId, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/**
 * Entrada para criar uma regra de acompanhamento docente.
 */
export class CreateFollowUpAlertRuleDto {
    @IsMongoId()
    classId!: string;

    /** Janela curta evita regras abusivas ou impossíveis de interpretar. */
    @IsInt()
    @Min(1)
    @Max(90)
    inactiveDays!: number;

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    message!: string;
}
```

```ts
// apps/api/src/modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FollowUpAlertRuleDocument = HydratedDocument<FollowUpAlertRule>;

/**
 * Regra docente para acompanhar alunos com pouca actividade recente.
 */
@Schema({ timestamps: true, collection: "follow_up_alert_rules" })
export class FollowUpAlertRule {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 90 })
    inactiveDays!: number;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    message!: string;
}

export const FollowUpAlertRuleSchema = SchemaFactory.createForClass(FollowUpAlertRule);
FollowUpAlertRuleSchema.index({ teacherId: 1, createdAt: -1 });
```

5. Explicação do código.
   A regra já não usa campos genéricos: `classId` e `inactiveDays` representam diretamente RF50. O schema indexa o professor para listagens seguras.
6. Validação do passo.
   Um DTO com `inactiveDays: 0` deve ser rejeitado.
7. Cenário negativo/erro esperado.
   `classId` inválido deve produzir 400 antes do service.

### Passo 2 - Calcular alunos inativos no service

1. Objetivo funcional do passo no contexto da app.
   Criar regra, listar regras e calcular preview de alunos inativos.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts`
3. Instruções do que fazer.
   Injeta `ClassesService`, `ClassLearningActivityService` e
   `ContextNotificationsService`. A turma ativa é validada antes da query de atividade.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertRule, FollowUpAlertRuleDocument } from "./schemas/follow-up-alert-rule.schema.js";

export type FollowUpAlertRuleView = {
    id: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
};

/**
 * Regras de acompanhamento calculadas apenas a partir de atividade oficial da turma.
 */
@Injectable()
export class FollowUpAlertsService {
    constructor(
        @InjectModel(FollowUpAlertRule.name)
        private readonly ruleModel: Model<FollowUpAlertRuleDocument>,
        private readonly classesService: ClassesService,
        private readonly notificationsService: ContextNotificationsService,
        private readonly activityService: ClassLearningActivityService,
    ) {}

    async create(actor: AuthenticatedUser, input: CreateFollowUpAlertRuleDto): Promise<FollowUpAlertRuleView> {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, input.classId);
        const rule = await this.ruleModel.create({
            teacherId: new Types.ObjectId(actor.id),
            classId: new Types.ObjectId(input.classId),
            inactiveDays: input.inactiveDays,
            title: input.title.trim(),
            message: input.message.trim(),
        });
        return this.toRuleView(rule.toObject());
    }

    async list(actor: AuthenticatedUser): Promise<FollowUpAlertRuleView[]> {
        this.assertTeacher(actor);
        const rules = await this.ruleModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return rules.map((rule) => this.toRuleView(rule));
    }

    async summary(actor: AuthenticatedUser) {
        const rules = await this.list(actor);
        const summaries = await Promise.all(
            rules.map(async (rule) => ({
                ...rule,
                inactiveStudentIds: await this.previewInactiveStudentIds(actor, rule.id),
            })),
        );
        return { rules: summaries };
    }

    async previewInactiveStudentIds(
        actor: AuthenticatedUser,
        ruleId: string,
    ): Promise<string[]> {
        this.assertTeacher(actor);
        const rule = await this.findOwnedRule(actor.id, ruleId);
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            String(rule.classId),
        );
        return this.activityService.findInactiveStudentIds({
            classId: schoolClass._id,
            studentIds: schoolClass.studentIds,
            inactiveDays: rule.inactiveDays,
        });
    }

    async run(actor: AuthenticatedUser, ruleId: string) {
        this.assertTeacher(actor);
        const rule = await this.findOwnedRule(actor.id, ruleId);
        const recipientIds = await this.previewInactiveStudentIds(actor, ruleId);
        if (recipientIds.length === 0) return { inactiveStudentIds: [], notification: null };
        const notification = await this.notificationsService.createForRecipients(
            actor,
            {
                contextType: "CLASS",
                contextId: String(rule.classId),
                type: "FOLLOW_UP",
                title: rule.title,
                body: rule.message,
            },
            recipientIds,
        );
        return { inactiveStudentIds: recipientIds, notification };
    }

    private async findOwnedRule(teacherId: string, ruleId: string) {
        if (!Types.ObjectId.isValid(ruleId)) throw this.notFound();
        const rule = await this.ruleModel
            .findOne({ _id: ruleId, teacherId: new Types.ObjectId(teacherId) })
            .lean();
        if (!rule) throw this.notFound();
        return rule;
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({ code: "TEACHER_ROLE_REQUIRED", message: "Apenas professores podem criar alertas." });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "FOLLOW_UP_RULE_NOT_FOUND", message: "Regra de acompanhamento não encontrada." });
    }

    private toRuleView(rule: {
        _id: unknown;
        classId: unknown;
        inactiveDays: number;
        title: string;
        message: string;
    }): FollowUpAlertRuleView {
        return {
            id: String(rule._id),
            classId: String(rule.classId),
            inactiveDays: rule.inactiveDays,
            title: rule.title,
            message: rule.message,
        };
    }
}
```

5. Explicação do código.
   A regra é sempre filtrada por `teacherId`. O preview usa os alunos efetivos da turma
   validada; `ClassLearningActivityService` consulta a projeção pelo mesmo `classId`, exige
   membership ativa e compara a última ação oficial com `joinedAt`. Não existe query a
   `StudyEvent` nem exposição de atividade privada.
6. Validação do passo.
   Testa uma turma com dois membros antigos e atividade oficial recente, na mesma turma,
   apenas para um deles; o preview deve devolver apenas o outro. Acrescenta um evento
   privado recente ao aluno inativo e confirma que o resultado não muda.
7. Cenário negativo/erro esperado.
   Um aluno autenticado deve receber `TEACHER_ROLE_REQUIRED`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor as regras docentes por HTTP seguro.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.controller.ts`
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Usa `SessionGuard` e importa `ClassLearningActivityModule`, `ClassesModule` e
   `ContextNotificationsModule`. O preview faz parte de `GET /summary`; não exponhas um
   endpoint alternativo baseado em eventos privados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

/**
 * Endpoints de acompanhamento docente.
 */
@Controller("api/follow-up-alerts")
@UseGuards(SessionGuard)
export class FollowUpAlertsController {
    constructor(private readonly alertsService: FollowUpAlertsService) {}

    @Get("summary")
    summary(@Req() request: AuthenticatedRequest) {
        return this.alertsService.summary(request.user!);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.alertsService.list(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() input: CreateFollowUpAlertRuleDto) {
        return this.alertsService.create(request.user!, input);
    }

    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.run(request.user!, id);
    }
}
```

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassLearningActivityModule } from "../class-learning-activity/class-learning-activity.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { FollowUpAlertsController } from "./follow-up-alerts.controller.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";
import { FollowUpAlertRule, FollowUpAlertRuleSchema } from "./schemas/follow-up-alert-rule.schema.js";

/**
 * Módulo de regras docentes para alunos inativos.
 */
@Module({
    imports: [
        AuthModule,
        ClassLearningActivityModule,
        ClassesModule,
        ContextNotificationsModule,
        MongooseModule.forFeature([
            { name: FollowUpAlertRule.name, schema: FollowUpAlertRuleSchema },
        ]),
    ],
    controllers: [FollowUpAlertsController],
    providers: [FollowUpAlertsService],
})
export class FollowUpAlertsModule {}
```

5. Explicação do código.
   O controller separa o resumo factual, a listagem, a criação e o disparo. O módulo de
   atividade encapsula a projeção oficial e impede o módulo de acompanhamento de consultar
   estudo privado ou de repetir regras de membership.
6. Validação do passo.
   `GET /api/follow-up-alerts/summary` deve exigir professor autenticado e devolver apenas
   atividade oficial das turmas que lhe pertencem.
7. Cenário negativo/erro esperado.
   Regra inexistente deve devolver `FOLLOW_UP_RULE_NOT_FOUND`.

### Passo 4 - Criar cliente e painel docente

1. Objetivo funcional do passo no contexto da app.
   Dar ao professor um fluxo básico de listagem, criação e execução.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/follow-up-alerts/follow-up-alerts-client.ts`
   - CRIAR: `apps/web/src/features/follow-up-alerts/follow-up-alerts-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e mantém estados explícitos de loading, erro e sucesso.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/follow-up-alerts/follow-up-alerts-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type FollowUpAlertRule = {
    id: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
};

export function loadFollowUpAlerts() {
    return requestMf3Json<FollowUpAlertRule[]>("/api/follow-up-alerts");
}

/**
 * Executa uma regra e devolve a notificação criada por BK-MF4-01.
 */
export function runFollowUpAlert(id: string) {
    return requestMf3Json(`/api/follow-up-alerts/${id}/run`, { method: "POST" });
}
```

```tsx
// apps/web/src/features/follow-up-alerts/follow-up-alerts-panel.tsx
import { useEffect, useState } from "react";
import { FollowUpAlertRule, loadFollowUpAlerts, runFollowUpAlert } from "./follow-up-alerts-client.js";

/**
 * Painel docente para acompanhar regras de inatividade.
 */
export function FollowUpAlertsPanel() {
    const [rules, setRules] = useState<FollowUpAlertRule[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFollowUpAlerts().then(setRules).catch((err: Error) => setError(err.message));
    }, []);

    async function handleRun(ruleId: string) {
        setBusyId(ruleId);
        setError(null);
        try {
            await runFollowUpAlert(ruleId);
        } catch (err) {
            // O erro fica visível para o professor corrigir permissões ou dados.
            setError(err instanceof Error ? err.message : "Não foi possível executar o alerta.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <section aria-labelledby="follow-up-alerts-title">
            <h2 id="follow-up-alerts-title">Alertas de acompanhamento</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ul>
                {rules.map((rule) => (
                    <li key={rule.id}>
                        <strong>{rule.title}</strong>
                        <span>{rule.inactiveDays} dias sem atividade oficial da turma</span>
                        <button type="button" disabled={busyId === rule.id} onClick={() => handleRun(rule.id)}>
                            {busyId === rule.id ? "A enviar..." : "Enviar alerta"}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
```

5. Explicação do código.
   O painel não calcula inatividade. Ele chama o backend e mostra erros de forma acessível. O botão desativa enquanto a execução decorre para evitar duplicação acidental.
6. Validação do passo.
   Executar uma regra deve criar uma notificação via BK-MF4-01.
7. Cenário negativo/erro esperado.
   Se a regra pertencer a outro professor, o backend devolve erro e o painel mostra `role="alert"`.

### Passo 5 - Testar o contrato de atividade oficial por turma

1. Objetivo funcional do passo no contexto da app.
   Cobrir a delegação para a fonte canónica sem abrir uma dependência a estudo privado.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts`
3. Instruções do que fazer.
   Simula uma turma ativa com dois alunos e confirma que `classId`, os membros efetivos e
   `inactiveDays` chegam ao serviço que aplica `joinedAt` e atividade oficial.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

describe("FollowUpAlertsService", () => {
    it("calcula inatividade apenas no contexto oficial da turma", async () => {
        const rule = {
            _id: "507f1f77bcf86cd799439010",
            classId: "507f1f77bcf86cd799439011",
            inactiveDays: 7,
            title: "Retomar estudo",
            message: "Precisas de apoio?",
        };
        const ruleModel = { findOne: jest.fn(() => ({ lean: async () => rule })) };
        const classesService = {
            findOwnedActiveClass: jest.fn(async () => ({
                _id: "507f1f77bcf86cd799439011",
                studentIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
            })),
        };
        const notificationsService = { createForRecipients: jest.fn() };
        const activityService = {
            findInactiveStudentIds: jest
                .fn()
                .mockResolvedValue(["507f1f77bcf86cd799439013"]),
        };
        const service = new FollowUpAlertsService(
            ruleModel as never,
            classesService as never,
            notificationsService as never,
            activityService as never,
        );

        const result = await service.previewInactiveStudentIds(
            { id: "507f1f77bcf86cd799439014", email: "teacher@studyflow.test", role: "TEACHER" },
            "507f1f77bcf86cd799439010",
        );

        expect(classesService.findOwnedActiveClass).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439011",
        );
        expect(activityService.findInactiveStudentIds).toHaveBeenCalledWith({
            classId: "507f1f77bcf86cd799439011",
            studentIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
            inactiveDays: 7,
        });
        expect(result).toEqual(["507f1f77bcf86cd799439013"]);
    });
});
```

5. Explicação do código.
   O teste instancia o service com doubles dos quatro colaboradores. Não existe modelo de
   estudo privado neste construtor: `ClassLearningActivityService` filtra membership ativa,
   usa `joinedAt` como baseline e consulta o estado no mesmo `classId`.
6. Validação do passo.
   `npm run test:unit -- follow-up-alerts`
7. Cenário negativo/erro esperado.
   Se `findOwnedActiveClass` não for chamado, o teste deve falhar por ausência de validação
   da turma. Um teste próprio de `ClassLearningActivityService` deve ainda provar que uma
   membership removida não entra e que atividade privada recente não altera o resultado.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF50 com um fluxo demonstrável.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Valida criação, listagem, resumo e execução, incluindo o isolamento entre turmas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final confirma que RF50 não é só configuração: a regra calcula alunos com
   atividade oficial da turma e cria uma notificação real, sem revelar hábitos privados.
6. Validação do passo.
   `npm run test:unit -- follow-up-alerts` e chamada manual a `POST /api/follow-up-alerts/:id/run`.
7. Cenário negativo/erro esperado.
   Um professor não deve executar regra de outro professor.

#### Critérios de aceite

- Só professores criam regras.
- Toda regra pertence a uma turma do professor.
- O resumo devolve apenas membros `ACTIVE` da turma validada.
- `joinedAt` é o baseline quando o aluno ainda não tem atividade oficial.
- Atividade de outra turma e estudo privado não alteram a inatividade.
- Execução usa BK-MF4-01.
- Frontend mostra erro e bloqueia clique duplicado.

#### Validação final

- `npm run test:unit -- follow-up-alerts`
- `npm run test:integration`
- Teste manual com membro antigo sem atividade oficial e membro recém-inscrito.
- Teste negativo com atividade privada recente e atividade oficial noutra turma.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de `GET /api/follow-up-alerts/summary` com alunos inativos.
- Payload da notificação criada.
- Screenshot do painel docente.

#### Handoff

BK-MF4-03 deve limitar o canal `IN_APP` e aplicar quotas para impedir excesso de alertas por
turma/utilizador.

#### Changelog

- `2026-06-16`: guia corrigido com contrato real de alertas docentes, preview e integração com notificações.
- `2026-07-11`: atividade docente isolada por `classId`, membership ativa e baseline
  `joinedAt`; removida qualquer dependência positiva de estudo privado.
