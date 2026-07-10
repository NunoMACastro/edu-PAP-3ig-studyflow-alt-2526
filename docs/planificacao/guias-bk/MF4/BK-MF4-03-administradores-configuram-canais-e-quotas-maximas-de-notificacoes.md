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
- `last_updated`: `2026-07-10`

#### Objetivo

Criar a política administrativa de canais e quotas máximas de notificações. O administrador define se o canal interno, email ou push está activo e qual o limite máximo por utilizador/dia e por contexto/hora.

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

- Integração real com email/push.
- Scheduler de envio.
- Preferências pessoais, já tratadas por MF3.
- Auditoria transversal, coberta por BK-MF4-08.

#### Estado antes e depois

##### Estado antes

BK-MF4-01 e BK-MF4-02 criam notificações, mas não existe política global para limitar canais e frequência.

##### Estado depois

Fica um contrato único para políticas de notificação, consumível pelos services de notificações antes de cada envio.

##### Decisões de escopo

- `CANONICO`: só `ADMIN` gere políticas globais.
- `DERIVADO`: `/api/admin/notification-policies` é o endpoint administrativo único para RF51.
- `DERIVADO`: quotas usam contadores sobre `context_notifications`, sem criar uma segunda entidade de envio.

#### Pre-requisitos

- BK-MF4-01 e BK-MF4-02.
- `UserRole` com valor `ADMIN`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Canal: meio de entrega configurável (`IN_APP`, `EMAIL`, `PUSH`).
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
   Modela canal, estado activo e limites positivos.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/notification-policies/dto/upsert-notification-policy.dto.ts
import { IsBoolean, IsEnum, IsInt, Max, Min } from "class-validator";

export enum NotificationChannel {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
}

/**
 * Configuração administrativa para um canal de notificação.
 */
export class UpsertNotificationPolicyDto {
    @IsEnum(NotificationChannel)
    channel!: NotificationChannel;

    /** Permite desligar canais sem apagar histórico ou preferências pessoais. */
    @IsBoolean()
    enabled!: boolean;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerUserPerDay!: number;

    @IsInt()
    @Min(1)
    @Max(500)
    maxPerTargetPerHour!: number;
}
```

```ts
// apps/api/src/modules/notification-policies/schemas/notification-channel-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { NotificationChannel } from "../dto/upsert-notification-policy.dto.js";

export type NotificationChannelPolicyDocument = HydratedDocument<NotificationChannelPolicy>;

/**
 * Política global de envio por canal.
 */
@Schema({ timestamps: true, collection: "notification_channel_policies" })
export class NotificationChannelPolicy {
    @Prop({ required: true, unique: true, enum: Object.values(NotificationChannel), index: true })
    channel!: NotificationChannel;

    @Prop({ required: true, default: true })
    enabled!: boolean;

    @Prop({ required: true, min: 1, max: 200 })
    maxPerUserPerDay!: number;

    @Prop({ required: true, min: 1, max: 500 })
    maxPerTargetPerHour!: number;
}

export const NotificationChannelPolicySchema = SchemaFactory.createForClass(NotificationChannelPolicy);
```

5. Explicação do código.
   A política separa o canal da preferência pessoal. O limite tem máximos defensivos para impedir configurações absurdas.
6. Validação do passo.
   Payload com `maxPerUserPerDay: 0` deve falhar.
7. Cenário negativo/erro esperado.
   Canal fora do enum deve devolver 400.

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
import { ForbiddenException, Injectable, TooManyRequestsException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotification, ContextNotificationDocument } from "../context-notifications/schemas/context-notification.schema.js";
import { NotificationChannel, UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationChannelPolicy, NotificationChannelPolicyDocument } from "./schemas/notification-channel-policy.schema.js";

export type NotificationPolicyView = UpsertNotificationPolicyDto & { updatedAt?: Date };

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
        const rows = await this.policyModel.find().sort({ channel: 1 }).lean();
        return rows.map((row) => this.toView(row));
    }

    async upsert(actor: AuthenticatedUser, input: UpsertNotificationPolicyDto): Promise<NotificationPolicyView> {
        this.assertAdmin(actor);
        const policy = await this.policyModel
            .findOneAndUpdate(
                { channel: input.channel },
                { $set: input },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toView(policy);
    }

    /**
     * Deve ser chamado antes de criar notificações em massa.
     */
    async assertWithinQuota(channel: NotificationChannel, targetType: string, targetId: string, recipientIds: string[]): Promise<void> {
        const policy = await this.policyModel.findOne({ channel }).lean();
        if (!policy?.enabled) {
            throw new ForbiddenException({ code: "NOTIFICATION_CHANNEL_DISABLED", message: "Canal de notificação desativado." });
        }

        const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sinceHour = new Date(Date.now() - 60 * 60 * 1000);
        const [perTargetHour, perUserDay] = await Promise.all([
            this.notificationModel.countDocuments({ targetType, targetId: new Types.ObjectId(targetId), createdAt: { $gte: sinceHour } }),
            this.notificationModel.countDocuments({ recipientIds: { $in: recipientIds.map((id) => new Types.ObjectId(id)) }, createdAt: { $gte: sinceDay } }),
        ]);

        // A verificação centralizada evita que BK-MF4-01 e BK-MF4-02 dupliquem regras.
        if (perTargetHour >= policy.maxPerTargetPerHour || perUserDay >= policy.maxPerUserPerDay) {
            throw new TooManyRequestsException({ code: "NOTIFICATION_QUOTA_EXCEEDED", message: "Quota de notificações excedida." });
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
        maxPerTargetPerHour: number;
        updatedAt?: Date;
    }): NotificationPolicyView {
        return {
            channel: row.channel,
            enabled: row.enabled,
            maxPerUserPerDay: row.maxPerUserPerDay,
            maxPerTargetPerHour: row.maxPerTargetPerHour,
            updatedAt: row.updatedAt,
        };
    }
}
```

5. Explicação do código.
   `assertWithinQuota` recebe o canal e o contexto já resolvidos. A contagem usa notificações persistidas e devolve erro 429 quando a política impede novo envio.
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
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";

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

    @Put()
    upsert(@Req() request: AuthenticatedRequest, @Body() input: UpsertNotificationPolicyDto) {
        return this.policiesService.upsert(request.user!, input);
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
    channel: "IN_APP" | "EMAIL" | "PUSH";
    enabled: boolean;
    maxPerUserPerDay: number;
    maxPerTargetPerHour: number;
};

export function loadNotificationPolicies() {
    return requestMf3Json<NotificationPolicy[]>("/api/admin/notification-policies");
}

/**
 * Persiste uma política administrativa com cookies HttpOnly.
 */
export function saveNotificationPolicy(input: NotificationPolicy) {
    return requestMf3Json<NotificationPolicy>("/api/admin/notification-policies", {
        method: "PUT",
        body: JSON.stringify(input),
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
   Um admin deve conseguir alternar `IN_APP`.
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
import { ForbiddenException, TooManyRequestsException } from "@nestjs/common";
import { NotificationChannel } from "./dto/upsert-notification-policy.dto.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";

describe("NotificationPoliciesService", () => {
    it("bloqueia gestão por utilizador não admin", async () => {
        const service = new NotificationPoliciesService({} as never, {} as never);

        await expect(
            service.list({ id: "u1", email: "teacher@studyflow.test", role: "TEACHER" }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("bloqueia envio quando a quota já foi atingida", async () => {
        const policyModel = { findOne: jest.fn(() => ({ lean: async () => ({ enabled: true, maxPerTargetPerHour: 1, maxPerUserPerDay: 1 }) })) };
        const notificationModel = { countDocuments: jest.fn(async () => 1) };
        const service = new NotificationPoliciesService(policyModel as never, notificationModel as never);

        await expect(
            service.assertWithinQuota(NotificationChannel.IN_APP, "CLASS", "507f1f77bcf86cd799439011", ["507f1f77bcf86cd799439012"]),
        ).rejects.toBeInstanceOf(TooManyRequestsException);
    });
});
```

5. Explicação do código.
   O primeiro teste protege a administração; o segundo protege os BKs consumidores contra excesso de notificações.
6. Validação do passo.
   `npm run test:unit -- notification-policies`
7. Cenário negativo/erro esperado.
   Se o service deixar `TEACHER` listar políticas, o primeiro teste deve falhar.

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
- `IN_APP`, `EMAIL` e `PUSH` têm política única.
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
