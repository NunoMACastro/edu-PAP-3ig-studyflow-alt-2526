# BK-MF4-01 - Notificar grupos/turmas sobre novos materiais, feedback e tarefas.

## Header

- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-12`
- `rf_rnf`: `RF49`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md`
- `last_updated`: `2026-07-11`

#### Objetivo

Construir o contrato de notificações internas para turmas e grupos de estudo. No fim deste BK, a API consegue criar uma notificação sobre novo material, feedback ou tarefa, calcular destinatários no backend e guardar quem recebeu ou foi suprimido por preferências.

#### Importância

RF49 garante que a actividade pedagógica chega aos alunos certos. Sem esta camada, materiais, feedback e tarefas podem existir no StudyFlow mas ficar escondidos nos módulos de origem.

#### Scope-in

- Criar DTO, schema, service, controller e módulo `ContextNotificationsModule`.
- Validar turma por `ClassesService.findOwnedClass`.
- Validar grupo por `StudyGroupsService.ensureMember`.
- Respeitar `NotificationPreferencesService.isInAppEnabled`.
- Criar cliente e painel React mínimos para listar e disparar notificações internas.
- Criar testes de service para ownership, membership e preferências.

#### Scope-out

- Email, push nativo e integrações externas.
- Quotas globais de notificação, que ficam para BK-MF4-03.
- Criação de materiais, feedback ou tarefas.
- Regras de IA.

#### Estado antes e depois

##### Estado antes

MF1 e MF3 já entregam turmas, grupos, preferências e sessão autenticada. Não existe um dispatcher comum que transforme eventos pedagógicos em notificações internas persistidas.

##### Estado depois

Fica definido um módulo implementável para criar e listar notificações de contexto, com destinatários calculados no backend e filtros de preferência auditáveis.

##### Decisões de escopo

- `CANONICO`: RF49 é o requisito desta entrega.
- `CANONICO`: a sessão é a única fonte para `actor.id` e `actor.role`.
- `DERIVADO`: `/api/context-notifications` é o endpoint técnico escolhido para não duplicar endpoints por cada origem de evento.
- `DERIVADO`: turmas usam o contexto de preferência `STUDY_GOAL`; grupos usam `GROUP_SESSION`, porque esses valores já existem em MF3.

#### Pre-requisitos

- BK-MF1-12 como origem funcional de tarefas/notificações escolares.
- `ClassesService.findOwnedClass` disponível em `apps/api/src/modules/classes/classes.service.ts`.
- `StudyGroupsService.ensureMember` disponível em `apps/api/src/modules/study-groups/study-groups.service.ts`.
- `NotificationPreferencesService.isInAppEnabled` disponível em `apps/api/src/modules/notification-preferences/notification-preferences.service.ts`.
- `SessionGuard` e `AuthenticatedUser` de MF0.

#### Glossário

- Notificação de contexto: registo interno associado a uma turma ou grupo.
- Destinatário aceite: utilizador que pertence ao contexto e mantém alerta in-app activo.
- Destinatário suprimido: utilizador que pertence ao contexto mas desativou o canal in-app.
- Evento pedagógico: novo material, feedback ou tarefa.
- Dispatcher: service que recebe o evento e calcula quem deve ser avisado.

#### Conceitos teóricos essenciais

O frontend não escolhe destinatários. Essa decisão pertence ao backend, porque exige ownership de turma, membership de grupo e preferências por utilizador. A notificação deve guardar apenas metadados necessários: actor, contexto, tipo de evento, título, corpo curto e listas de destinatários aceites/suprimidos.

#### Arquitetura do BK

- Endpoint: `POST /api/context-notifications` e `GET /api/context-notifications`.
- Modelo/schema: `ContextNotification`.
- Service: `ContextNotificationsService`.
- Controller: `ContextNotificationsController`.
- Guard: `SessionGuard`.
- Cliente API: `context-notifications-client.ts`.
- Componente: `ContextNotificationsPanel`.
- Testes: `context-notifications.service.spec.ts`.
- Handoff: BK-MF4-02 consome o histórico de notificações para acompanhamento docente.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/context-notifications/dto/create-context-notification.dto.ts`
- CRIAR: `apps/api/src/modules/context-notifications/schemas/context-notification.schema.ts`
- CRIAR: `apps/api/src/modules/context-notifications/context-notifications.service.ts`
- CRIAR: `apps/api/src/modules/context-notifications/context-notifications.controller.ts`
- CRIAR: `apps/api/src/modules/context-notifications/context-notifications.module.ts`
- CRIAR: `apps/api/src/modules/context-notifications/context-notifications.service.spec.ts`
- CRIAR: `apps/web/src/features/context-notifications/context-notifications-client.ts`
- CRIAR: `apps/web/src/features/context-notifications/context-notifications-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Definir DTO e schema de domínio

1. Objetivo funcional do passo no contexto da app.
   Criar o contrato de entrada e persistência para notificações de turma/grupo.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/context-notifications/dto/create-context-notification.dto.ts`
   - CRIAR: `apps/api/src/modules/context-notifications/schemas/context-notification.schema.ts`
3. Instruções do que fazer.
   Define enums explícitos para alvo e evento. Usa `@IsMongoId`, limites de texto e arrays de `ObjectId` no schema.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/context-notifications/dto/create-context-notification.dto.ts
import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export enum ContextNotificationTargetType {
    CLASS = "CLASS",
    GROUP = "GROUP",
}

export enum ContextNotificationEventType {
    MATERIAL_CREATED = "MATERIAL_CREATED",
    FEEDBACK_POSTED = "FEEDBACK_POSTED",
    TASK_ASSIGNED = "TASK_ASSIGNED",
}

/**
 * Entrada validada para criar uma notificação de contexto.
 */
export class CreateContextNotificationDto {
    /** O alvo decide que service de ownership ou membership será usado. */
    @IsEnum(ContextNotificationTargetType)
    targetType!: ContextNotificationTargetType;

    @IsMongoId()
    targetId!: string;

    /** O evento evita strings livres impossíveis de validar em testes. */
    @IsEnum(ContextNotificationEventType)
    eventType!: ContextNotificationEventType;

    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(500)
    body!: string;

    @IsOptional()
    @IsMongoId()
    sourceId?: string;
}
```

```ts
// apps/api/src/modules/context-notifications/schemas/context-notification.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "../dto/create-context-notification.dto.js";

export type ContextNotificationDocument = HydratedDocument<ContextNotification>;

/**
 * Notificação persistida com destinatários calculados no backend.
 */
@Schema({ timestamps: true, collection: "context_notifications" })
export class ContextNotification {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ContextNotificationTargetType), index: true })
    targetType!: ContextNotificationTargetType;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    targetId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ContextNotificationEventType), index: true })
    eventType!: ContextNotificationEventType;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 500 })
    body!: string;

    @Prop({ type: Types.ObjectId })
    sourceId?: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
    recipientIds!: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
    suppressedRecipientIds!: Types.ObjectId[];
}

export const ContextNotificationSchema = SchemaFactory.createForClass(ContextNotification);
ContextNotificationSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
```

5. Explicação do código.
   O DTO impede payloads vagos e o schema guarda a decisão final do backend. Os IDs são estritamente internos para entrega/ownership; nunca entram no DTO público. A vista administrativa expõe apenas contagens agregadas.
6. Validação do passo.
   Executa `npm run test:unit -- context-notifications` depois dos restantes ficheiros existirem.
7. Cenário negativo/erro esperado.
   Enviar `targetType: "ROOM"` deve falhar na validação com erro 400.

### Passo 2 - Implementar o service com ownership, membership e preferências

1. Objetivo funcional do passo no contexto da app.
   Criar notificações reais, calculando destinatários no backend.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/context-notifications/context-notifications.service.ts`
3. Instruções do que fazer.
   Injeta `ClassesService`, `StudyGroupsService` e `NotificationPreferencesService`. Nunca aceites destinatários vindos do frontend.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/context-notifications/context-notifications.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    ContextNotificationTargetType,
    CreateContextNotificationDto,
} from "./dto/create-context-notification.dto.js";
import { ContextNotification, ContextNotificationDocument } from "./schemas/context-notification.schema.js";

export type ContextNotificationRecipientView = {
    id: string;
    targetType: ContextNotificationTargetType;
    targetId: string;
    eventType: string;
    title: string;
    body: string;
    createdAt?: Date;
};

export type ContextNotificationAdminView = ContextNotificationRecipientView & {
    recipientCount: number;
    suppressedCount: number;
};

type ContextNotificationRow = {
    _id: unknown;
    targetType: ContextNotificationTargetType;
    targetId: unknown;
    eventType: string;
    title: string;
    body: string;
    recipientIds: unknown[];
    suppressedRecipientIds: unknown[];
    createdAt?: Date;
};

/**
 * Orquestra notificações sem permitir que o cliente escolha destinatários.
 */
@Injectable()
export class ContextNotificationsService {
    constructor(
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
        private readonly classesService: ClassesService,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Cria uma notificação e persiste destinatários aceites e suprimidos.
     */
    async create(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<ContextNotificationAdminView> {
        const candidateIds = await this.resolveCandidateIds(actor, input);
        const preferenceContext = this.toPreferenceContext(input.targetType);
        const acceptedIds: string[] = [];
        const suppressedIds: string[] = [];

        for (const userId of candidateIds) {
            // A preferência é avaliada por destinatário para evitar fugas entre turmas/grupos.
            const enabled = await this.preferencesService.isInAppEnabled(userId, preferenceContext);
            if (enabled) acceptedIds.push(userId);
            else suppressedIds.push(userId);
        }

        const notification = await this.notificationModel.create({
            actorId: new Types.ObjectId(actor.id),
            targetType: input.targetType,
            targetId: new Types.ObjectId(input.targetId),
            eventType: input.eventType,
            title: input.title.trim(),
            body: input.body.trim(),
            sourceId: input.sourceId ? new Types.ObjectId(input.sourceId) : undefined,
            recipientIds: acceptedIds.map((userId) => new Types.ObjectId(userId)),
            suppressedRecipientIds: suppressedIds.map((userId) => new Types.ObjectId(userId)),
        });

        return this.toAdminView(notification.toObject());
    }

    /**
     * Lista apenas notificações onde o utilizador foi destinatário aceite.
     */
    async listMine(actor: AuthenticatedUser): Promise<ContextNotificationRecipientView[]> {
        const rows = await this.notificationModel
            .find({ recipientIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        return rows.map((row) => this.toRecipientView(row));
    }

    private async resolveCandidateIds(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<string[]> {
        if (input.targetType === ContextNotificationTargetType.CLASS) {
            const schoolClass = await this.classesService.findOwnedClass(actor.id, input.targetId);
            return schoolClass.studentIds;
        }

        const group = await this.studyGroupsService.ensureMember(actor.id, input.targetId);
        // O autor não precisa de receber a própria notificação de grupo.
        return group.memberIds.filter((memberId) => memberId !== actor.id);
    }

    private toPreferenceContext(targetType: ContextNotificationTargetType): NotificationContext {
        return targetType === ContextNotificationTargetType.GROUP
            ? NotificationContext.GROUP_SESSION
            : NotificationContext.STUDY_GOAL;
    }

    private toRecipientView(row: ContextNotificationRow): ContextNotificationRecipientView {
        return {
            id: String(row._id),
            targetType: row.targetType,
            targetId: String(row.targetId),
            eventType: row.eventType,
            title: row.title,
            body: row.body,
            createdAt: row.createdAt,
        };
    }

    private toAdminView(row: ContextNotificationRow): ContextNotificationAdminView {
        const recipientCount = row.recipientIds.length;
        const suppressedCount = row.suppressedRecipientIds.length;
        return {
            ...this.toRecipientView(row),
            recipientCount,
            suppressedCount,
        };
    }
}
```

5. Explicação do código.
   O service chama os módulos já existentes para confirmar que o actor controla a turma ou pertence ao grupo. A lista final de destinatários é derivada da base de dados, não do cliente, o que evita notificar alunos fora do contexto.
6. Validação do passo.
   Num teste, `classesService.findOwnedClass` deve ser chamado para `targetType=CLASS`; `studyGroupsService.ensureMember` deve ser chamado para `targetType=GROUP`.
7. Cenário negativo/erro esperado.
   Um professor a notificar uma turma que não é sua deve receber `CLASS_NOT_FOUND`.

### Passo 3 - Expor controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Tornar o service acessível por HTTP protegido.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/context-notifications/context-notifications.controller.ts`
   - CRIAR: `apps/api/src/modules/context-notifications/context-notifications.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Usa `SessionGuard`, importa módulos de dependência e exporta o service para BK-MF4-02.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/context-notifications/context-notifications.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";

/**
 * Endpoints protegidos de notificações internas.
 */
@Controller("api/context-notifications")
@UseGuards(SessionGuard)
export class ContextNotificationsController {
    constructor(private readonly notificationsService: ContextNotificationsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.notificationsService.listMine(request.user!);
    }

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() input: CreateContextNotificationDto) {
        return this.notificationsService.create(request.user!, input);
    }
}
```

```ts
// apps/api/src/modules/context-notifications/context-notifications.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { ContextNotificationsController } from "./context-notifications.controller.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { ContextNotification, ContextNotificationSchema } from "./schemas/context-notification.schema.js";

/**
 * Módulo MF4 que liga eventos pedagógicos a notificações internas.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        StudyGroupsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([{ name: ContextNotification.name, schema: ContextNotificationSchema }]),
    ],
    controllers: [ContextNotificationsController],
    providers: [ContextNotificationsService],
    exports: [ContextNotificationsService],
})
export class ContextNotificationsModule {}
```

5. Explicação do código.
   O controller só entrega o actor autenticado e o DTO ao service. O módulo importa as dependências reais e exporta o dispatcher para que BK-MF4-02 possa reutilizar a notificação sem duplicar regras.
6. Validação do passo.
   Confirma que `AppModule` importa `ContextNotificationsModule` e que `GET /api/context-notifications` exige sessão.
7. Cenário negativo/erro esperado.
   Um pedido sem cookie de sessão deve devolver 401/403 pelo `SessionGuard`.

### Passo 4 - Criar cliente e painel React

1. Objetivo funcional do passo no contexto da app.
   Permitir testar a listagem e criação de notificações na UI.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/context-notifications/context-notifications-client.ts`
   - CRIAR: `apps/web/src/features/context-notifications/context-notifications-panel.tsx`
3. Instruções do que fazer.
   Reutiliza `requestMf3Json` para manter cookies HttpOnly e CSRF da app.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/context-notifications/context-notifications-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type ContextNotification = {
    id: string;
    targetType: "CLASS" | "GROUP";
    eventType: string;
    title: string;
    body: string;
};

export type CreateContextNotificationInput = {
    targetType: "CLASS" | "GROUP";
    targetId: string;
    eventType: "MATERIAL_CREATED" | "FEEDBACK_POSTED" | "TASK_ASSIGNED";
    title: string;
    body: string;
    sourceId?: string;
};

/**
 * Lê notificações do utilizador autenticado com cookies seguros.
 */
export function loadContextNotifications() {
    return requestMf3Json<ContextNotification[]>("/api/context-notifications");
}

/**
 * Cria uma notificação interna sem expor destinatários ao frontend.
 */
export function createContextNotification(input: CreateContextNotificationInput) {
    return requestMf3Json<ContextNotification>("/api/context-notifications", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
```

```tsx
// apps/web/src/features/context-notifications/context-notifications-panel.tsx
import { useEffect, useState } from "react";
import { ContextNotification, loadContextNotifications } from "./context-notifications-client.js";

/**
 * Painel simples para validar RF49 durante desenvolvimento.
 */
export function ContextNotificationsPanel() {
    const [items, setItems] = useState<ContextNotification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        loadContextNotifications()
            .then((nextItems) => {
                if (active) setItems(nextItems);
            })
            .catch((err: Error) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                // O flag evita setState depois de desmontar o componente.
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (loading) return <p>A carregar notificações...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
        <section aria-labelledby="context-notifications-title">
            <h2 id="context-notifications-title">Notificações</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
```

5. Explicação do código.
   O cliente não recebe nem envia tokens. O painel cobre estados de loading, erro e sucesso, e usa `role="alert"` para erro acessível.
6. Validação do passo.
   Com sessão válida, o painel deve listar notificações recebidas; sem sessão, deve apresentar a mensagem do backend.
7. Cenário negativo/erro esperado.
   Se a API devolver erro, o painel não deve esconder a falha nem repetir pedidos em loop.

### Passo 5 - Testar regras críticas

1. Objetivo funcional do passo no contexto da app.
   Provar que o dispatcher respeita contexto e preferências.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/context-notifications/context-notifications.service.spec.ts`
3. Instruções do que fazer.
   Testa uma turma com dois alunos, um aceite e outro suprimido.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/context-notifications/context-notifications.service.spec.ts
import { ContextNotificationsService } from "./context-notifications.service.js";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "./dto/create-context-notification.dto.js";

describe("ContextNotificationsService", () => {
    it("calcula destinatários de turma e respeita preferências in-app", async () => {
        const createdRows: unknown[] = [];
        const model = {
            create: jest.fn(async (row) => {
                createdRows.push(row);
                return { toObject: () => ({ _id: "n1", createdAt: new Date(), ...row }) };
            }),
        };
        const classesService = {
            findOwnedClass: jest.fn(async () => ({ studentIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"] })),
        };
        const groupsService = { ensureMember: jest.fn() };
        const preferencesService = {
            // O segundo aluno fica suprimido para provar que a lista não é cega.
            isInAppEnabled: jest.fn(async (userId: string) => userId.endsWith("11")),
        };
        const service = new ContextNotificationsService(
            model as never,
            classesService as never,
            groupsService as never,
            preferencesService as never,
        );

        const result = await service.create(
            { id: "507f1f77bcf86cd799439010", email: "teacher@studyflow.test", role: "TEACHER" },
            {
                targetType: ContextNotificationTargetType.CLASS,
                targetId: "507f1f77bcf86cd799439013",
                eventType: ContextNotificationEventType.MATERIAL_CREATED,
                title: "Novo material",
                body: "Consulta o PDF da aula.",
            },
        );

        expect(classesService.findOwnedClass).toHaveBeenCalled();
        expect(result.recipientCount).toBe(1);
        expect(result.suppressedCount).toBe(1);
        expect(result).not.toHaveProperty("recipientIds");
        expect(result).not.toHaveProperty("suppressedRecipientIds");
        expect(createdRows).toHaveLength(1);
    });
});
```

5. Explicação do código.
   O teste isola o service e prova a regra mais importante do BK: destinatários são derivados do contexto e filtrados por preferência. Não há mocks de token nem storage do browser.
6. Validação do passo.
   `npm run test:unit -- context-notifications`
7. Cenário negativo/erro esperado.
   Se alguém remover a chamada a `isInAppEnabled`, este teste deve falhar na contagem de suprimidos.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF49 com evidência técnica e handoff.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Confirma imports, AppModule, endpoints, erro sem sessão e erro de turma/grupo sem acesso.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   Este passo não cria código; serve para garantir que a funcionalidade é demonstrável sem depender de módulos futuros.
6. Validação do passo.
   Executa `npm run test:unit`, `npm run test:integration` e uma chamada manual a `POST /api/context-notifications`.
7. Cenário negativo/erro esperado.
   Um utilizador fora do grupo deve receber o erro produzido por `StudyGroupsService.ensureMember`.

#### Critérios de aceite

- O endpoint cria notificações apenas para contextos autorizados.
- O frontend não envia destinatários.
- Preferências MF3 são respeitadas.
- `recipientIds` e `suppressedRecipientIds` ficam persistidos.
- Testes cobrem turma autorizada e suprimida por preferência.

#### Validação final

- `npm run test:unit -- context-notifications`
- `npm run test:integration`
- Teste manual: criar notificação de turma e confirmar por query interna de teste que alunos fora da turma não são destinatários; a resposta HTTP deve conter apenas contagens.

#### Evidence para PR/defesa

- Screenshot do painel com uma notificação recebida.
- Output dos testes unitários.
- Payload administrativo com `recipientCount`/`suppressedCount` e prova de ausência de IDs; payload do destinatário sem IDs nem contagens administrativas.
- Nota a explicar que email/push não entram neste BK.

#### Handoff

BK-MF4-02 pode usar `ContextNotificationsService.create` para avisos de acompanhamento docente. BK-MF4-03 deve impor quotas/canais antes da criação de notificações em massa.

### Atualização de entrega professor → aluno (2026-07-11)

As mutações de disponibilidade/estado publicam eventos idempotentes numa outbox com
lease, retry exponencial e falha auditada. A matriz automática inclui membership, arquivo
de turma/disciplina, publicações, materiais, projetos, testes, conteúdos IA aprovados e
salas guiadas. Edições textuais comuns não geram ruído. Cada destinatário tem linha própria
de entrega/leitura; eventos legacy são migrados como lidos para evitar um badge artificial.

`POST /api/context-notifications` é uma superfície manual limitada a `NEW_MATERIAL`,
`FEEDBACK` e `TASK`; os restantes tipos não podem ser forjados pelo cliente. A criação manual
respeita quota anti-spam. A outbox automática não é descartada pela quota, mas continua a
respeitar canal/preferência e revalida a membership no momento da entrega. O evento de remoção
é entregue apenas se o aluno ainda estiver fora da turma, evitando uma notificação obsoleta
quando existe remoção seguida de readmissão.

#### Changelog

- `2026-06-16`: guia corrigido com DTO/schema/service/controller/frontend/testes específicos de RF49.
- `2026-07-11`: documentadas matriz automática, allowlist manual, quota, revalidação, outbox/retry e estado individual da inbox.
