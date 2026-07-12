# BK-MF4-03 - Administradores configuram canais e quotas máximas de notificações.

## Header

- `doc_id`: `GUIA-BK-MF4-03`
- `bk_id`: `BK-MF4-03`
- `macro`: `MF4`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-02`
- `rf_rnf`: `RF51`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-03-administradores-configuram-canais-e-quotas-maximas-de-notificacoes.md`
- `last_updated`: `2026-07-11`

#### Objetivo

Criar a política administrativa e as quotas máximas do único canal suportado nesta fase,
`IN_APP`. O administrador define se a inbox interna está ativa e qual o limite máximo por
utilizador/dia e por contexto/hora.

> **Contrato atual:** `EMAIL` e `PUSH` não são canais disponíveis. Não aparecem no
> frontend, não são devolvidos na listagem administrativa e qualquer tentativa de os
> configurar devolve `422 NOTIFICATION_CHANNEL_NOT_AVAILABLE`. A presença desses valores
> no tipo persistente serve apenas para rejeição explícita/compatibilidade, não representa
> suporte de entrega.

#### Importância

RF51 evita ruído operacional e prepara o sistema para escalar notificações sem spam. Também protege BK-MF4-01 e BK-MF4-02 de disparos excessivos.

#### Scope-in

- Criar DTO e schema `NotificationChannelPolicy`.
- Criar service admin-only com validação de role.
- Expor endpoints de listagem e upsert.
- Criar método `assertWithinQuota` para ser usado por notificações e alertas.
- Criar cliente e painel de administração.
- Criar testes de acesso admin e limite excedido.

#### Scope-out

- Email, push e qualquer worker/provider de entrega externa.
- Scheduler de envio.
- Preferências pessoais, já tratadas por MF3.
- Auditoria transversal, coberta por BK-MF4-08.

#### Estado antes e depois

##### Estado antes

BK-MF4-01 e BK-MF4-02 criam notificações, mas não existe política global para limitar canais e frequência.

##### Estado depois

Fica uma política única `IN_APP`, consumível pelos services de notificações antes de cada envio interno.

##### Decisões de escopo

- `CANONICO`: só `ADMIN` gere políticas globais.
- `DERIVADO`: `/api/admin/notification-policies` é o endpoint administrativo único para RF51.
- `DERIVADO`: quotas usam contadores sobre `context_notifications`, sem criar uma segunda entidade de envio.
- `CANONICO`: `EMAIL` e `PUSH` devolvem `422 NOTIFICATION_CHANNEL_NOT_AVAILABLE`.

#### Pre-requisitos

- BK-MF4-01 e BK-MF4-02.
- `UserRole` com valor `ADMIN`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Canal suportado: `IN_APP`, entregue na inbox da StudyFlow.
- Canal indisponível: `EMAIL` ou `PUSH`; é recusado explicitamente com `422`.
- Quota por utilizador/dia: número máximo de notificações para o mesmo utilizador num dia.
- Quota por contexto/hora: número máximo de notificações para uma turma/grupo numa hora.
- Política efectiva: configuração activa no momento de criar a notificação.

#### Conceitos teóricos essenciais

Preferências pessoais respondem à pergunta "este utilizador quer receber?". Políticas administrativas respondem à pergunta "o sistema permite enviar?". As duas regras são acumuladas no backend.

#### Arquitetura do BK

- Endpoint: `GET /api/admin/notification-policies`, `PUT /api/admin/notification-policies/:channel`.
- Modelo/schema: `NotificationChannelPolicy`.
- Service: `NotificationPoliciesService`.
- Controller: `NotificationPoliciesController`.
- Guard: `SessionGuard` e role admin no service.
- Cliente: `notification-policies-client.ts`.
- Componente: `NotificationPoliciesPanel`.
- Handoff: BK-MF4-04 recebe uma MF com canais controlados e sem duplicação.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/notification-policies/dto/upsert-notification-policy.dto.ts`
- CRIAR: `apps/api/src/modules/notification-policies/schemas/notification-channel-policy.schema.ts`
- CRIAR: `apps/api/src/modules/notification-policies/notification-policies.service.ts`
- CRIAR: `apps/api/src/modules/notification-policies/notification-policies.controller.ts`
- CRIAR: `apps/api/src/modules/notification-policies/notification-policies.module.ts`
- CRIAR: `apps/api/src/modules/notification-policies/notification-policies.service.spec.ts`
- CRIAR: `apps/web/src/features/notification-policies/notification-policies-client.ts`
- CRIAR: `apps/web/src/features/notification-policies/notification-policies-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Definir DTO e schema de política

1. Objetivo funcional do passo no contexto da app.
   Transformar RF51 num contrato administrativo explícito.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-policies/dto/upsert-notification-policy.dto.ts`
   - CRIAR: `apps/api/src/modules/notification-policies/schemas/notification-channel-policy.schema.ts`
3. Instruções do que fazer.
   O `channel` vem do path e o DTO modela apenas estado ativo e limites positivos.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-policies/dto/upsert-notification-policy.dto.ts
import { IsBoolean, IsInt, Max, Min } from "class-validator";

/**
 * Configuração administrativa para um canal de notificação.
 */
export class UpsertNotificationPolicyDto {
    /** Permite desligar canais sem apagar histórico ou preferências pessoais. */
    @IsBoolean()
    enabled!: boolean;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerUserPerDay!: number;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerContextPerHour!: number;
}
```

```ts
// apps/api/src/modules/notification-policies/schemas/notification-channel-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
export type NotificationChannelPolicyDocument = HydratedDocument<NotificationChannelPolicy>;
/** EMAIL/PUSH permanecem no tipo apenas para rejeição explícita de pedidos legacy. */
export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";

/**
 * Política global de envio por canal.
 */
@Schema({ timestamps: true, collection: "notification_channel_policies" })
export class NotificationChannelPolicy {
    @Prop({ required: true, unique: true, enum: ["IN_APP", "EMAIL", "PUSH"], index: true })
    channel!: NotificationChannel;

    @Prop({ required: true, default: true })
    enabled!: boolean;

    @Prop({ required: true, min: 1, max: 200 })
    maxPerUserPerDay!: number;

    @Prop({ required: true, min: 1, max: 200 })
    maxPerContextPerHour!: number;
}

export const NotificationChannelPolicySchema = SchemaFactory.createForClass(NotificationChannelPolicy);
```

5. Explicação do código.
   A política separa o canal da preferência pessoal. O limite tem máximos defensivos para impedir configurações absurdas.
6. Validação do passo.
   Payload com `maxPerUserPerDay: 0` deve falhar.
7. Cenário negativo/erro esperado.
   `PUT .../EMAIL` ou `PUT .../PUSH` deve devolver `422 NOTIFICATION_CHANNEL_NOT_AVAILABLE`.

### Passo 2 - Implementar service admin-only e quotas

1. Objetivo funcional do passo no contexto da app.
   Permitir gestão administrativa e criar uma função reutilizável de quota.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-policies/notification-policies.service.ts`
3. Instruções do que fazer.
   O service valida `ADMIN`, faz upsert idempotente e expõe `assertWithinQuota`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-policies/notification-policies.service.ts
import { ForbiddenException, HttpException, HttpStatus, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotification, ContextNotificationDocument } from "../context-notifications/schemas/context-notification.schema.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationChannel, NotificationChannelPolicy, NotificationChannelPolicyDocument } from "./schemas/notification-channel-policy.schema.js";

export type NotificationPolicyView = UpsertNotificationPolicyDto & {
    channel: "IN_APP";
    updatedAt?: Date;
};

/**
 * Serviço administrativo para limites de notificação.
 */
@Injectable()
export class NotificationPoliciesService {
    constructor(
        @InjectModel(NotificationChannelPolicy.name)
        private readonly policyModel: Model<NotificationChannelPolicyDocument>,
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
    ) {}

    async list(actor: AuthenticatedUser): Promise<NotificationPolicyView[]> {
        this.assertAdmin(actor);
        const row = await this.policyModel.findOne({ channel: "IN_APP" }).lean();
        return [
            row
                ? this.toView(row)
                : { channel: "IN_APP", enabled: true, maxPerUserPerDay: 20, maxPerContextPerHour: 50 },
        ];
    }

    async upsert(actor: AuthenticatedUser, channel: NotificationChannel, input: UpsertNotificationPolicyDto): Promise<NotificationPolicyView> {
        this.assertAdmin(actor);
        if (channel !== "IN_APP") {
            throw new UnprocessableEntityException({
                code: "NOTIFICATION_CHANNEL_NOT_AVAILABLE",
                message: "Nesta versão, apenas o canal in-app está disponível.",
            });
        }
        const policy = await this.policyModel
            .findOneAndUpdate(
                { channel: "IN_APP" },
                { $set: input, $setOnInsert: { channel: "IN_APP" } },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toView(policy);
    }

    /**
     * Deve ser chamado antes de criar notificações em massa.
     */
    async assertWithinQuota(recipientIds: string[], contextId: string): Promise<void> {
        const policy =
            (await this.policyModel.findOne({ channel: "IN_APP" }).lean()) ??
            { channel: "IN_APP", enabled: true, maxPerUserPerDay: 20, maxPerContextPerHour: 50 };
        if (!policy.enabled) {
            throw new ForbiddenException({ code: "NOTIFICATION_CHANNEL_DISABLED", message: "Canal de notificação desativado." });
        }

        const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sinceHour = new Date(Date.now() - 60 * 60 * 1000);
        const recipientObjectIds = recipientIds.map((id) => new Types.ObjectId(id));
        const [perContextHour, overQuotaRecipients] = await Promise.all([
            this.notificationModel.countDocuments({ contextId: new Types.ObjectId(contextId), createdAt: { $gte: sinceHour } }),
            recipientObjectIds.length === 0
                ? Promise.resolve([])
                : this.notificationModel.aggregate([
                      { $match: { recipientIds: { $in: recipientObjectIds }, createdAt: { $gte: sinceDay } } },
                      { $unwind: "$recipientIds" },
                      { $match: { recipientIds: { $in: recipientObjectIds } } },
                      { $group: { _id: "$recipientIds", count: { $sum: 1 } } },
                      { $match: { count: { $gte: policy.maxPerUserPerDay } } },
                      { $limit: 1 },
                  ]),
        ]);

        // A verificação centralizada evita que BK-MF4-01 e BK-MF4-02 dupliquem regras.
        if (perContextHour >= policy.maxPerContextPerHour || overQuotaRecipients.length > 0) {
            throw new HttpException(
                { code: "NOTIFICATION_QUOTA_EXCEEDED", message: "Quota de notificações excedida." },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem gerir políticas." });
        }
    }

    private toView(row: {
        channel: NotificationChannel;
        enabled: boolean;
        maxPerUserPerDay: number;
        maxPerContextPerHour: number;
        updatedAt?: Date;
    }): NotificationPolicyView {
        return {
            channel: "IN_APP",
            enabled: row.enabled,
            maxPerUserPerDay: row.maxPerUserPerDay,
            maxPerContextPerHour: row.maxPerContextPerHour,
            updatedAt: row.updatedAt,
        };
    }
}
```

5. Explicação do código.
   `assertWithinQuota` opera sempre sobre `IN_APP` e recebe o contexto já resolvido. A contagem usa notificações persistidas e devolve erro 429 quando a política impede novo envio.
6. Validação do passo.
   Um actor `TEACHER` deve falhar em `upsert`; um admin deve criar/actualizar a política.
7. Cenário negativo/erro esperado.
   Canal desativado deve devolver `NOTIFICATION_CHANNEL_DISABLED`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor a configuração administrativa.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-policies/notification-policies.controller.ts`
   - CRIAR: `apps/api/src/modules/notification-policies/notification-policies.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   O controller fica protegido por sessão; role fica no service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-policies/notification-policies.controller.ts
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";
import { NotificationChannel } from "./schemas/notification-channel-policy.schema.js";

/**
 * API administrativa de políticas de notificação.
 */
@Controller("api/admin/notification-policies")
@UseGuards(SessionGuard)
export class NotificationPoliciesController {
    constructor(private readonly policiesService: NotificationPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put(":channel")
    upsert(
        @Req() request: AuthenticatedRequest,
        @Param("channel") channel: NotificationChannel,
        @Body() input: UpsertNotificationPolicyDto,
    ) {
        return this.policiesService.upsert(request.user!, channel, input);
    }
}
```

```ts
// apps/api/src/modules/notification-policies/notification-policies.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ContextNotification, ContextNotificationSchema } from "../context-notifications/schemas/context-notification.schema.js";
import { NotificationPoliciesController } from "./notification-policies.controller.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";
import { NotificationChannelPolicy, NotificationChannelPolicySchema } from "./schemas/notification-channel-policy.schema.js";

/**
 * Módulo administrativo de canais e quotas de notificação.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: NotificationChannelPolicy.name, schema: NotificationChannelPolicySchema },
            { name: ContextNotification.name, schema: ContextNotificationSchema },
        ]),
    ],
    controllers: [NotificationPoliciesController],
    providers: [NotificationPoliciesService],
    exports: [NotificationPoliciesService],
})
export class NotificationPoliciesModule {}
```

5. Explicação do código.
   O módulo exporta o service para BK-MF4-01 e BK-MF4-02 poderem validar quotas antes de criar notificações em massa.
6. Validação do passo.
   `GET /api/admin/notification-policies` deve rejeitar sessão sem role admin.
7. Cenário negativo/erro esperado.
   Pedido sem sessão deve ser bloqueado pelo `SessionGuard`.

### Passo 4 - Criar frontend administrativo

1. Objetivo funcional do passo no contexto da app.
   Listar e editar políticas no painel admin.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/notification-policies/notification-policies-client.ts`
   - CRIAR: `apps/web/src/features/notification-policies/notification-policies-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json`, não localStorage/sessionStorage.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/notification-policies/notification-policies-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type NotificationPolicy = {
    channel: "IN_APP";
    enabled: boolean;
    maxPerUserPerDay: number;
    maxPerContextPerHour: number;
};

export function loadNotificationPolicies() {
    return requestMf3Json<NotificationPolicy[]>("/api/admin/notification-policies");
}

/**
 * Persiste uma política administrativa com cookies HttpOnly.
 */
export function saveNotificationPolicy(input: NotificationPolicy) {
    return requestMf3Json<NotificationPolicy>(`/api/admin/notification-policies/${input.channel}`, {
        method: "PUT",
        body: JSON.stringify({
            enabled: input.enabled,
            maxPerUserPerDay: input.maxPerUserPerDay,
            maxPerContextPerHour: input.maxPerContextPerHour,
        }),
    });
}
```

```tsx
// apps/web/src/features/notification-policies/notification-policies-panel.tsx
import { useEffect, useState } from "react";
import { loadNotificationPolicies, NotificationPolicy, saveNotificationPolicy } from "./notification-policies-client.js";

/**
 * Painel administrativo para quotas de notificação.
 */
export function NotificationPoliciesPanel() {
    const [policies, setPolicies] = useState<NotificationPolicy[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNotificationPolicies().then(setPolicies).catch((err: Error) => setError(err.message));
    }, []);

    async function togglePolicy(policy: NotificationPolicy) {
        try {
            const saved = await saveNotificationPolicy({ ...policy, enabled: !policy.enabled });
            setPolicies((items) => items.map((item) => (item.channel === saved.channel ? saved : item)));
        } catch (err) {
            // A falha fica visível para o admin e não altera estado local indevidamente.
            setError(err instanceof Error ? err.message : "Não foi possível guardar a política.");
        }
    }

    return (
        <section aria-labelledby="notification-policies-title">
            <h2 id="notification-policies-title">Políticas de notificação</h2>
            {error ? <p role="alert">{error}</p> : null}
            {policies.map((policy) => (
                <button key={policy.channel} type="button" onClick={() => togglePolicy(policy)}>
                    {policy.channel}: {policy.enabled ? "activo" : "inactivo"}
                </button>
            ))}
        </section>
    );
}
```

5. Explicação do código.
   O painel é simples mas completo para validar RF51: carrega, mostra erro e permite alternar canal sem manipular tokens.
6. Validação do passo.
   Um admin deve conseguir alternar `IN_APP`; a UI não renderiza email/push.
7. Cenário negativo/erro esperado.
   Um utilizador não admin deve ver a mensagem de erro vinda do backend.

### Passo 5 - Testar autorização e quota

1. Objetivo funcional do passo no contexto da app.
   Proteger o painel e o enforcement.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/notification-policies/notification-policies.service.spec.ts`
3. Instruções do que fazer.
   Testa role admin e erro 429.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-policies/notification-policies.service.spec.ts
import { ForbiddenException, HttpException, UnprocessableEntityException } from "@nestjs/common";
import { NotificationPoliciesService } from "./notification-policies.service.js";

describe("NotificationPoliciesService", () => {
    it("bloqueia gestão por utilizador não admin", async () => {
        const service = new NotificationPoliciesService({} as never, {} as never);

        await expect(
            service.list({ id: "u1", email: "teacher@studyflow.test", role: "TEACHER" }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia envio quando a quota já foi atingida", async () => {
        const policyModel = { findOne: jest.fn(() => ({ lean: async () => ({ enabled: true, maxPerContextPerHour: 1, maxPerUserPerDay: 1 }) })) };
        const notificationModel = {
            countDocuments: jest.fn(async () => 1),
            aggregate: jest.fn(async () => []),
        };
        const service = new NotificationPoliciesService(policyModel as never, notificationModel as never);

        await expect(
            service.assertWithinQuota(["507f1f77bcf86cd799439012"], "507f1f77bcf86cd799439011"),
        ).rejects.toBeInstanceOf(HttpException);
    });

    it.each(["EMAIL", "PUSH"])("recusa o canal indisponível %s com 422", async (channel) => {
        const service = new NotificationPoliciesService({} as never, {} as never);

        await expect(
            service.upsert(
                { id: "u1", email: "admin@studyflow.test", role: "ADMIN" },
                channel as "EMAIL" | "PUSH",
                { enabled: true, maxPerUserPerDay: 20, maxPerContextPerHour: 50 },
            ),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});
```

5. Explicação do código.
   O primeiro teste protege a administração; o segundo protege os BKs consumidores contra
   excesso de notificações; o terceiro prova que valores legacy nunca ativam entrega externa.
6. Validação do passo.
   `npm run test:unit -- notification-policies`
7. Cenário negativo/erro esperado.
   Se o service deixar `TEACHER` listar políticas ou aceitar `EMAIL`/`PUSH`, os testes devem
   falhar. Para estes canais, confirma também `exception.getStatus() === 422`.

### Passo 6 - Validar integração com BK-MF4-01 e BK-MF4-02

1. Objetivo funcional do passo no contexto da app.
   Garantir que a política não fica isolada.
2. Ficheiros envolvidos:
   - REVER: `ContextNotificationsService`
   - REVER: `FollowUpAlertsService`
3. Instruções do que fazer.
   Injeta `NotificationPoliciesService` nos services de notificação antes de persistir notificações em massa.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A quota só tem valor se for chamada no caminho crítico de envio. Esta revisão liga RF51 aos RF49/RF50.
6. Validação do passo.
   Força uma política com limite 1 e tenta criar duas notificações no mesmo contexto.
7. Cenário negativo/erro esperado.
   A segunda criação deve devolver `NOTIFICATION_QUOTA_EXCEEDED`.

#### Critérios de aceite

- Só admins listam e alteram políticas.
- A listagem e a UI expõem apenas a política `IN_APP`.
- Configurar `EMAIL` ou `PUSH` devolve `422 NOTIFICATION_CHANNEL_NOT_AVAILABLE`.
- `assertWithinQuota` bloqueia canal desligado e excesso de quota.
- Frontend não guarda tokens.
- BK-MF4-01 e BK-MF4-02 ficam com ponto claro de integração.

#### Validação final

- `npm run test:unit -- notification-policies`
- `npm run test:integration`
- Teste manual de admin e utilizador não admin.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de política criada.
- Erro 429 para quota excedida.
- Screenshot do painel admin.

#### Handoff

BK-MF4-04 inicia privacidade/RGPD sem depender destas quotas, mas a MF passa a ter controlo operacional de notificações para próximos módulos.

#### Changelog

- `2026-06-16`: guia corrigido com política admin, quotas e integração com notificações/alertas.
- `2026-07-11`: escopo fechado em `IN_APP`; email/push passam a rejeição explícita `422`.
