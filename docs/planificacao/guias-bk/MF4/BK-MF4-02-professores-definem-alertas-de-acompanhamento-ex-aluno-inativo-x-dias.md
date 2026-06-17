# BK-MF4-02 - Professores definem alertas de acompanhamento (ex.: aluno inativo x dias).

## Header

- `doc_id`: `GUIA-BK-MF4-02`
- `bk_id`: `BK-MF4-02`
- `macro`: `MF4`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF50`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Criar regras de acompanhamento docente para detectar alunos inativos numa turma. O professor define a turma, a janela de dias e a mensagem; o backend valida a turma, calcula actividade recente e prepara notificações internas para alunos elegíveis.

#### Importância

RF50 dá ao professor um mecanismo objectivo para intervir antes de o aluno se perder. A regra fica no backend para não depender de filtros visuais frágeis no frontend.

#### Scope-in

- Criar `FollowUpAlertRule` com turma, janela de inatividade e mensagem.
- Validar ownership docente por `ClassesService.findOwnedClass`.
- Ler actividade por `StudyEvent` existente.
- Criar preview de alunos inativos.
- Integrar com `ContextNotificationsService` de BK-MF4-01.
- Criar painel React com loading, erro, lista e formulário pequeno.

#### Scope-out

- Agendamento automático recorrente.
- Email/push.
- Métricas avançadas de aprendizagem.
- Alterar o modelo de `StudyEvent`.

#### Estado antes e depois

##### Estado antes

MF0 guarda eventos de estudo por aluno e MF1/MF2 entregam turmas e actividade colaborativa. Não existe regra docente persistida para acompanhar inatividade.

##### Estado depois

Fica um módulo `follow-up-alerts` com regras por turma, preview de alunos inativos e ligação a notificações internas.

##### Decisões de escopo

- `CANONICO`: RF50 depende de professor autenticado.
- `CANONICO`: a turma pertence ao professor antes de qualquer leitura agregada.
- `DERIVADO`: inatividade é calculada com `StudyEvent.occurredAt`, porque é a fonte já existente no `apps`.

#### Pre-requisitos

- BK-MF2-11 como base de acompanhamento docente.
- BK-MF4-01 para enviar a notificação interna final.
- `ClassesService.findOwnedClass`.
- `StudyEvent` e `StudyEventSchema`.
- `requestMf3Json` no frontend.

#### Glossário

- Regra de acompanhamento: configuração criada pelo professor para uma turma.
- Aluno inativo: aluno sem `StudyEvent` dentro da janela configurada.
- Preview: simulação calculada antes de disparar notificações.
- Janela de inatividade: número de dias usado para comparar com o último evento.

#### Conceitos teóricos essenciais

Uma métrica de acompanhamento só é útil se vier de dados consistentes. Por isso, o backend calcula a última actividade com `StudyEvent`, valida primeiro a turma e devolve apenas IDs de alunos da turma do professor.

#### Arquitetura do BK

- Endpoint: `GET /api/follow-up-alerts`, `POST /api/follow-up-alerts`, `POST /api/follow-up-alerts/:id/run`.
- Modelo/schema: `FollowUpAlertRule`.
- Service: `FollowUpAlertsService`.
- Controller: `FollowUpAlertsController`.
- Dependências: `ClassesModule`, `StudyModule`, `ContextNotificationsModule`.
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
   Usa `classId`, `inactivityDays`, `title`, `message` e `enabled`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/dto/create-follow-up-alert-rule.dto.ts
import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/**
 * Entrada para criar uma regra de acompanhamento docente.
 */
export class CreateFollowUpAlertRuleDto {
    @IsMongoId()
    classId!: string;

    /** Janela curta evita regras abusivas ou impossíveis de interpretar. */
    @IsInt()
    @Min(1)
    @Max(60)
    inactivityDays!: number;

    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(500)
    message!: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
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

    @Prop({ required: true, min: 1, max: 60 })
    inactivityDays!: number;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 500 })
    message!: string;

    @Prop({ required: true, default: true })
    enabled!: boolean;
}

export const FollowUpAlertRuleSchema = SchemaFactory.createForClass(FollowUpAlertRule);
FollowUpAlertRuleSchema.index({ teacherId: 1, classId: 1, createdAt: -1 });
```

5. Explicação do código.
   A regra já não usa campos genéricos: `classId` e `inactivityDays` representam directamente RF50. O schema indexa professor e turma para listagens seguras.
6. Validação do passo.
   Um DTO com `inactivityDays: 0` deve ser rejeitado.
7. Cenário negativo/erro esperado.
   `classId` inválido deve produzir 400 antes do service.

### Passo 2 - Calcular alunos inativos no service

1. Objetivo funcional do passo no contexto da app.
   Criar regra, listar regras e calcular preview de alunos inativos.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts`
3. Instruções do que fazer.
   Injeta `ClassesService`, `StudyEvent` model e `ContextNotificationsService`. A turma é validada antes da query de actividade.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "../context-notifications/dto/create-context-notification.dto.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertRule, FollowUpAlertRuleDocument } from "./schemas/follow-up-alert-rule.schema.js";

export type InactiveStudentView = { studentId: string; lastActivityAt: Date | null };
export type FollowUpAlertRuleView = {
    id: string;
    classId: string;
    inactivityDays: number;
    title: string;
    message: string;
    enabled: boolean;
};

/**
 * Regras de acompanhamento calculadas a partir do histórico de estudo.
 */
@Injectable()
export class FollowUpAlertsService {
    constructor(
        @InjectModel(FollowUpAlertRule.name)
        private readonly ruleModel: Model<FollowUpAlertRuleDocument>,
        @InjectModel(StudyEvent.name)
        private readonly eventModel: Model<StudyEventDocument>,
        private readonly classesService: ClassesService,
        private readonly notificationsService: ContextNotificationsService,
    ) {}

    async createRule(actor: AuthenticatedUser, input: CreateFollowUpAlertRuleDto): Promise<FollowUpAlertRuleView> {
        this.assertTeacher(actor);
        await this.classesService.findOwnedClass(actor.id, input.classId);
        const rule = await this.ruleModel.create({
            teacherId: new Types.ObjectId(actor.id),
            classId: new Types.ObjectId(input.classId),
            inactivityDays: input.inactivityDays,
            title: input.title.trim(),
            message: input.message.trim(),
            enabled: input.enabled ?? true,
        });
        return this.toRuleView(rule.toObject());
    }

    async listMine(actor: AuthenticatedUser): Promise<FollowUpAlertRuleView[]> {
        this.assertTeacher(actor);
        const rules = await this.ruleModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return rules.map((rule) => this.toRuleView(rule));
    }

    async previewInactiveStudents(actor: AuthenticatedUser, ruleId: string): Promise<InactiveStudentView[]> {
        const rule = await this.getOwnedRule(actor, ruleId);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, String(rule.classId));
        const since = new Date(Date.now() - rule.inactivityDays * 24 * 60 * 60 * 1000);
        const activeRows = await this.eventModel
            .find({
                userId: { $in: schoolClass.studentIds.map((id) => new Types.ObjectId(id)) },
                occurredAt: { $gte: since },
            })
            .select("userId occurredAt")
            .sort({ occurredAt: -1 })
            .lean();

        const activeIds = new Set(activeRows.map((row) => String(row.userId)));
        // A resposta é limitada à turma validada para evitar exposição de outros alunos.
        return schoolClass.studentIds
            .filter((studentId) => !activeIds.has(studentId))
            .map((studentId) => ({ studentId, lastActivityAt: null }));
    }

    async runRule(actor: AuthenticatedUser, ruleId: string) {
        const rule = await this.getOwnedRule(actor, ruleId);
        return this.notificationsService.create(actor, {
            targetType: ContextNotificationTargetType.CLASS,
            targetId: String(rule.classId),
            eventType: ContextNotificationEventType.TASK_ASSIGNED,
            title: rule.title,
            body: rule.message,
        });
    }

    private async getOwnedRule(actor: AuthenticatedUser, ruleId: string) {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(ruleId)) throw this.notFound();
        const rule = await this.ruleModel
            .findOne({ _id: ruleId, teacherId: new Types.ObjectId(actor.id), enabled: true })
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
        inactivityDays: number;
        title: string;
        message: string;
        enabled: boolean;
    }): FollowUpAlertRuleView {
        return {
            id: String(rule._id),
            classId: String(rule.classId),
            inactivityDays: rule.inactivityDays,
            title: rule.title,
            message: rule.message,
            enabled: rule.enabled,
        };
    }
}
```

5. Explicação do código.
   A regra é sempre filtrada por `teacherId`. O preview usa a lista de alunos da turma validada e consulta `StudyEvent` apenas para esses IDs, evitando exposição transversal.
6. Validação do passo.
   Testa uma turma com dois alunos e eventos recentes só para um deles; o preview deve devolver apenas o outro.
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
   Usa `SessionGuard` e importa `StudyModule`, `ClassesModule` e `ContextNotificationsModule`.
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

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.alertsService.listMine(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() input: CreateFollowUpAlertRuleDto) {
        return this.alertsService.createRule(request.user!, input);
    }

    @Get(":id/preview")
    preview(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.previewInactiveStudents(request.user!, id);
    }

    @Post(":id/run")
    run(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.alertsService.runRule(request.user!, id);
    }
}
```

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { StudyEvent, StudyEventSchema } from "../study/schemas/study-event.schema.js";
import { FollowUpAlertsController } from "./follow-up-alerts.controller.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";
import { FollowUpAlertRule, FollowUpAlertRuleSchema } from "./schemas/follow-up-alert-rule.schema.js";

/**
 * Módulo de regras docentes para alunos inativos.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        ContextNotificationsModule,
        MongooseModule.forFeature([
            { name: FollowUpAlertRule.name, schema: FollowUpAlertRuleSchema },
            { name: StudyEvent.name, schema: StudyEventSchema },
        ]),
    ],
    controllers: [FollowUpAlertsController],
    providers: [FollowUpAlertsService],
})
export class FollowUpAlertsModule {}
```

5. Explicação do código.
   O controller separa listagem, criação, preview e disparo. A importação directa de `StudyEvent` evita criar uma query informal noutro módulo.
6. Validação do passo.
   `GET /api/follow-up-alerts/:id/preview` deve exigir professor autenticado.
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
    inactivityDays: number;
    title: string;
    message: string;
    enabled: boolean;
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
                        <span>{rule.inactivityDays} dias sem actividade</span>
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

### Passo 5 - Criar teste de preview

1. Objetivo funcional do passo no contexto da app.
   Cobrir a regra de inatividade.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts`
3. Instruções do que fazer.
   Simula turma com dois alunos e um evento recente.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.spec.ts
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

describe("FollowUpAlertsService", () => {
    it("devolve apenas alunos sem eventos recentes na turma validada", async () => {
        const rule = {
            _id: "507f1f77bcf86cd799439010",
            classId: "507f1f77bcf86cd799439011",
            inactivityDays: 7,
            title: "Retomar estudo",
            message: "Precisas de apoio?",
            enabled: true,
        };
        const ruleModel = { findOne: jest.fn(() => ({ lean: async () => rule })) };
        const eventModel = {
            find: jest.fn(() => ({
                select: () => ({ sort: () => ({ lean: async () => [{ userId: "507f1f77bcf86cd799439012" }] }) }),
            })),
        };
        const classesService = {
            findOwnedClass: jest.fn(async () => ({
                studentIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
            })),
        };
        const notificationsService = { create: jest.fn() };
        const service = new FollowUpAlertsService(
            ruleModel as never,
            eventModel as never,
            classesService as never,
            notificationsService as never,
        );

        const result = await service.previewInactiveStudents(
            { id: "507f1f77bcf86cd799439014", email: "teacher@studyflow.test", role: "TEACHER" },
            "507f1f77bcf86cd799439010",
        );

        expect(classesService.findOwnedClass).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439011",
        );
        expect(result).toEqual([{ studentId: "507f1f77bcf86cd799439013", lastActivityAt: null }]);
    });
});
```

5. Explicação do código.
   O teste instancia o service com doubles dos quatro colaboradores e espera que apenas o aluno sem evento recente seja devolvido.
6. Validação do passo.
   `npm run test:unit -- follow-up-alerts`
7. Cenário negativo/erro esperado.
   Se `findOwnedClass` não for chamado, o teste deve falhar por ausência de validação de turma.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF50 com um fluxo demonstrável.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Valida criação, listagem, preview e execução.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final confirma que RF50 não é só configuração: a regra calcula alunos e cria uma notificação real.
6. Validação do passo.
   `npm run test:unit -- follow-up-alerts` e chamada manual a `POST /api/follow-up-alerts/:id/run`.
7. Cenário negativo/erro esperado.
   Um professor não deve executar regra de outro professor.

#### Critérios de aceite

- Só professores criam regras.
- Toda regra pertence a uma turma do professor.
- Preview devolve apenas alunos da turma validada.
- Execução usa BK-MF4-01.
- Frontend mostra erro e bloqueia clique duplicado.

#### Validação final

- `npm run test:unit -- follow-up-alerts`
- `npm run test:integration`
- Teste manual com turma sem actividade recente.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de preview com alunos inativos.
- Payload da notificação criada.
- Screenshot do painel docente.

#### Handoff

BK-MF4-03 deve definir quotas por canal para impedir excesso de alertas por turma/utilizador.

#### Changelog

- `2026-06-16`: guia corrigido com contrato real de alertas docentes, preview e integração com notificações.
