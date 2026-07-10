# BK-MF4-08 - Auditoria completa (materiais, IA, papéis).

## Header

- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-07`
- `rf_rnf`: `RF56`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-09`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Criar auditoria transversal para eventos de materiais, IA e papéis. O sistema passa a registar actor, acção, recurso, resultado e metadados minimizados, com consulta restrita a administradores.

#### Importância

RF56 dá rastreabilidade às áreas mais sensíveis do StudyFlow. Sem auditoria, não é possível explicar quem alterou papéis, que operações IA ocorreram ou que acções tocaram materiais.

#### Scope-in

- Criar DTO e schema `AuditEvent`.
- Criar `AuditLogService.record`.
- Expor listagem admin com filtros.
- Integrar pontos de chamada em materiais, IA e papéis.
- Reduzir metadados sensíveis.
- Criar painel admin de consulta.
- Criar testes de redacção e role admin.

#### Scope-out

- Exportação SIEM externa.
- Logs de infraestrutura.
- Armazenar prompts completos, respostas IA completas, passwords, cookies ou hashes.
- Auditoria forense legal fora da aplicação.

#### Estado antes e depois

##### Estado antes

Há alguns históricos funcionais, mas não existe um audit log transversal e consultável por admin.

##### Estado depois

Fica um módulo `audit-log` com registo centralizado e pontos de integração claros para BK-MF4-07, IA e materiais.

##### Decisões de escopo

- `CANONICO`: só `ADMIN` consulta auditoria global.
- `CANONICO`: eventos sensíveis devem ser minimizados.
- `DERIVADO`: o service aceita metadados simples e remove chaves proibidas antes de persistir.

#### Pre-requisitos

- BK-MF4-07.
- Services de materiais e IA existentes.
- `SessionGuard`.
- `UserRole`.
- `requestMf3Json`.

#### Glossário

- Audit event: registo imutável de uma acção relevante.
- Actor: utilizador que executou a acção.
- Resource: entidade afectada.
- Metadata: contexto técnico mínimo sem dados sensíveis.
- Redacção: remoção de chaves proibidas antes de persistir.

#### Conceitos teóricos essenciais

Auditoria não é logging livre. Deve ter schema, filtros, minimização e autorização. O objectivo é responder "quem fez o quê, sobre que recurso, com que resultado", sem copiar conteúdo privado.

#### Arquitetura do BK

- Endpoint: `GET /api/admin/audit-events`.
- Modelo/schema: `AuditEvent`.
- Service: `AuditLogService`.
- Controller: `AuditLogController`.
- Integrações: materiais, IA, papéis.
- Cliente: `audit-log-client.ts`.
- Componente: `AuditLogPanel`.
- Testes: `audit-log.service.spec.ts`.
- Handoff: BK-MF4-09 usa auditoria para alterações de modelos IA.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/audit-log/dto/audit-query.dto.ts`
- CRIAR: `apps/api/src/modules/audit-log/schemas/audit-event.schema.ts`
- CRIAR: `apps/api/src/modules/audit-log/audit-log.service.ts`
- CRIAR: `apps/api/src/modules/audit-log/audit-log.controller.ts`
- CRIAR: `apps/api/src/modules/audit-log/audit-log.module.ts`
- CRIAR: `apps/api/src/modules/audit-log/audit-log.service.spec.ts`
- EDITAR: `apps/api/src/modules/admin-users/admin-users.service.ts`
- EDITAR: `GovernedAiExecutionService`, único ponto que regista eventos de execução IA.
- EDITAR: services de materiais que criam/alteram materiais
- CRIAR: `apps/web/src/features/audit-log/audit-log-client.ts`
- CRIAR: `apps/web/src/features/audit-log/audit-log-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar query e schema de auditoria

1. Objetivo funcional do passo no contexto da app.
   Definir o formato dos eventos e filtros.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/audit-log/dto/audit-query.dto.ts`
   - CRIAR: `apps/api/src/modules/audit-log/schemas/audit-event.schema.ts`
3. Instruções do que fazer.
   Usa enums de domínio e metadados pequenos.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/audit-log/dto/audit-query.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export enum AuditDomain {
    MATERIAL = "MATERIAL",
    AI = "AI",
    ROLE = "ROLE",
}

export enum AuditResult {
    SUCCESS = "SUCCESS",
    DENIED = "DENIED",
    FAILED = "FAILED",
}

/**
 * Filtros administrativos para consulta de auditoria.
 */
export class AuditQueryDto {
    @IsOptional()
    @IsEnum(AuditDomain)
    domain?: AuditDomain;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    action?: string;
}
```

```ts
// apps/api/src/modules/audit-log/schemas/audit-event.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AuditDomain, AuditResult } from "../dto/audit-query.dto.js";

export type AuditEventDocument = HydratedDocument<AuditEvent>;

/**
 * Evento auditável minimizado.
 */
@Schema({ timestamps: true, collection: "audit_events" })
export class AuditEvent {
    @Prop({ type: Types.ObjectId, ref: "User", index: true })
    actorId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 80, index: true })
    anonymousActorId?: string;

    @Prop({ required: true, enum: Object.values(AuditDomain), index: true })
    domain!: AuditDomain;

    @Prop({ required: true, trim: true, maxlength: 80, index: true })
    action!: string;

    @Prop({ required: true, trim: true, maxlength: 80 })
    resourceType!: string;

    @Prop({ trim: true, maxlength: 80 })
    resourceId?: string;

    @Prop({ required: true, enum: Object.values(AuditResult), index: true })
    result!: AuditResult;

    @Prop({ type: Object, default: {} })
    metadata!: Record<string, string | number | boolean>;

    @Prop({ index: true })
    anonymizedAt?: Date;

    // Preenchido apenas quando o actor exerce o direito de eliminação.
    @Prop({ index: true })
    expiresAt?: Date;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
AuditEventSchema.index({ domain: 1, action: 1, createdAt: -1 });
AuditEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

5. Explicação do código.
   O schema guarda campos estáveis e metadados pequenos. O enum de domínio evita misturar auditoria com logs soltos.
6. Validação do passo.
   Query com domínio inválido deve falhar.
7. Cenário negativo/erro esperado.
   Action acima de 80 caracteres deve ser rejeitada.

### Passo 2 - Implementar service com redacção

1. Objetivo funcional do passo no contexto da app.
   Registar eventos e listar auditoria para admins.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/audit-log/audit-log.service.ts`
3. Instruções do que fazer.
   Remove chaves sensíveis de `metadata`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/audit-log/audit-log.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditDomain, AuditQueryDto, AuditResult } from "./dto/audit-query.dto.js";
import { AuditEvent, AuditEventDocument } from "./schemas/audit-event.schema.js";

export type RecordAuditEventInput = {
    actorId: string;
    domain: AuditDomain;
    action: string;
    resourceType: string;
    resourceId?: string;
    result: AuditResult;
    metadata?: Record<string, string | number | boolean>;
};

/**
 * Serviço central de auditoria com minimização de metadados.
 */
@Injectable()
export class AuditLogService {
    private readonly blockedMetadataKeys = new Set(["password", "passwordHash", "token", "cookie", "prompt", "answer"]);

    constructor(
        @InjectModel(AuditEvent.name)
        private readonly auditModel: Model<AuditEventDocument>,
    ) {}

    async record(input: RecordAuditEventInput): Promise<void> {
        await this.auditModel.create({
            actorId: new Types.ObjectId(input.actorId),
            domain: input.domain,
            action: input.action,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            result: input.result,
            metadata: this.redactMetadata(input.metadata ?? {}),
        });
    }

    async list(actor: AuthenticatedUser, query: AuditQueryDto) {
        this.assertAdmin(actor);
        const filter: Record<string, string> = {};
        if (query.domain) filter.domain = query.domain;
        if (query.action) filter.action = query.action;
        return this.auditModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    }

    /** Política ANONYMIZE_90D usada pelo PersonalDataRegistry. */
    async anonymizeForDeletedUser(
        actorId: string,
        anonymousActorId: string,
        session: ClientSession,
    ): Promise<void> {
        await this.auditModel.updateMany(
            { actorId: new Types.ObjectId(actorId) },
            {
                $unset: { actorId: 1, resourceId: 1 },
                $set: {
                    anonymousActorId,
                    metadata: {},
                    anonymizedAt: new Date(),
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                },
            },
            { session },
        );
    }

    private redactMetadata(metadata: Record<string, string | number | boolean>) {
        return Object.fromEntries(
            Object.entries(metadata).filter(([key]) => !this.blockedMetadataKeys.has(key)),
        );
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem consultar auditoria." });
        }
    }
}
```

5. Explicação do código.
   `record` não devolve dados ao chamador e redige metadados antes de persistir. O handler `ANONYMIZE_90D` remove a ligação ao actor, limpa metadata/resource e ativa TTL de 90 dias. `list` é admin-only e limitado a 100 eventos.
6. Validação do passo.
   Um evento com `passwordHash` em metadata deve ser gravado sem essa chave.
7. Cenário negativo/erro esperado.
   Um professor a listar eventos recebe `ADMIN_ROLE_REQUIRED`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor consulta administrativa de auditoria.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/audit-log/audit-log.controller.ts`
   - CRIAR: `apps/api/src/modules/audit-log/audit-log.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Exporta o service para outros módulos registarem eventos.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/audit-log/audit-log.controller.ts
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditQueryDto } from "./dto/audit-query.dto.js";

/**
 * Consulta administrativa de eventos auditáveis.
 */
@Controller("api/admin/audit-events")
@UseGuards(SessionGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest, @Query() query: AuditQueryDto) {
        return this.auditLogService.list(request.user!, query);
    }
}
```

```ts
// apps/api/src/modules/audit-log/audit-log.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AuditLogController } from "./audit-log.controller.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditEvent, AuditEventSchema } from "./schemas/audit-event.schema.js";

/**
 * Módulo transversal de auditoria.
 */
@Module({
    imports: [AuthModule, MongooseModule.forFeature([{ name: AuditEvent.name, schema: AuditEventSchema }])],
    controllers: [AuditLogController],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class AuditLogModule {}
```

5. Explicação do código.
   A consulta fica protegida por sessão e role admin. A exportação do service é o contrato para materiais, IA e papéis.
6. Validação do passo.
   `GET /api/admin/audit-events?domain=ROLE` deve devolver eventos para admin.
7. Cenário negativo/erro esperado.
   Não admin deve ser bloqueado.

### Passo 4 - Integrar pontos de auditoria

1. Objetivo funcional do passo no contexto da app.
   Ligar eventos reais ao audit log.
2. Ficheiros envolvidos:
   - EDITAR: `apps/api/src/modules/admin-users/admin-users.service.ts`
   - EDITAR: services de materiais
   - EDITAR: services IA
3. Instruções do que fazer.
   Injeta `AuditLogService` e chama `record` depois de acções sensíveis ou quando houver negação relevante.
4. Código completo, correto e integrado com a app final.

```ts
// Trecho final a inserir em AdminUsersService após a alteração de papel
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";

/**
 * Regista uma alteração de papel sem copiar email, password ou sessão.
 */
private async auditRoleChange(actorId: string, targetUserId: string, previousRole: string, nextRole: string): Promise<void> {
    await this.auditLogService.record({
        actorId,
        domain: AuditDomain.ROLE,
        action: "USER_ROLE_CHANGED",
        resourceType: "User",
        resourceId: targetUserId,
        result: AuditResult.SUCCESS,
        metadata: { previousRole, nextRole },
    });
}
```

5. Explicação do código.
   O evento guarda a transição de role, não email nem dados de sessão. Materiais e IA devem seguir a mesma regra: IDs e resultado, nunca conteúdo integral.
6. Validação do passo.
   Alterar papel deve criar evento `USER_ROLE_CHANGED`.
7. Cenário negativo/erro esperado.
   Se metadata incluir `prompt`, o service remove a chave antes de guardar.

### Passo 5 - Criar cliente e painel admin

1. Objetivo funcional do passo no contexto da app.
   Consultar eventos auditáveis.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/audit-log/audit-log-client.ts`
   - CRIAR: `apps/web/src/features/audit-log/audit-log-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e renderiza lista simples.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/audit-log/audit-log-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AuditEvent = {
    _id: string;
    actorId: string;
    domain: "MATERIAL" | "AI" | "ROLE";
    action: string;
    resourceType: string;
    resourceId?: string;
    result: "SUCCESS" | "DENIED" | "FAILED";
};

export function loadAuditEvents(domain?: AuditEvent["domain"]) {
    const suffix = domain ? `?domain=${domain}` : "";
    return requestMf3Json<AuditEvent[]>(`/api/admin/audit-events${suffix}`);
}
```

```tsx
// apps/web/src/features/audit-log/audit-log-panel.tsx
import { useEffect, useState } from "react";
import { AuditEvent, loadAuditEvents } from "./audit-log-client.js";

/**
 * Painel administrativo de auditoria.
 */
export function AuditLogPanel() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAuditEvents().then(setEvents).catch((err: Error) => setError(err.message));
    }, []);

    return (
        <section aria-labelledby="audit-log-title">
            <h2 id="audit-log-title">Auditoria</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ol>{events.map((event) => <li key={event._id}>{event.domain} - {event.action} - {event.result}</li>)}</ol>
        </section>
    );
}
```

5. Explicação do código.
   O painel só consome a API admin. Erros ficam visíveis e os eventos são renderizados sem metadados sensíveis.
6. Validação do passo.
   Admin vê eventos recentes; não admin vê erro.
7. Cenário negativo/erro esperado.
   Falha de sessão não deve cair num estado vazio silencioso.

### Passo 6 - Testar redacção e autorização

1. Objetivo funcional do passo no contexto da app.
   Garantir que auditoria não vira vazamento de dados.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/audit-log/audit-log.service.spec.ts`
3. Instruções do que fazer.
   Testa remoção de `passwordHash` e bloqueio de não admin.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/audit-log/audit-log.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service.js";
import { AuditDomain, AuditResult } from "./dto/audit-query.dto.js";

describe("AuditLogService", () => {
    it("remove metadados sensíveis antes de persistir", async () => {
        const create = jest.fn();
        const service = new AuditLogService({ create } as never);
        await service.record({
            actorId: "507f1f77bcf86cd799439010",
            domain: AuditDomain.ROLE,
            action: "USER_ROLE_CHANGED",
            resourceType: "User",
            result: AuditResult.SUCCESS,
            metadata: { passwordHash: "secret", nextRole: "TEACHER" },
        });
        expect(create.mock.calls[0][0].metadata).toEqual({ nextRole: "TEACHER" });
    });

    it("bloqueia consulta por não admin", async () => {
        const service = new AuditLogService({} as never);
        await expect(service.list({ id: "u1", email: "t@studyflow.test", role: "TEACHER" }, {})).rejects.toBeInstanceOf(ForbiddenException);
    });
});
```

5. Explicação do código.
   O primeiro teste previne fuga de dados; o segundo protege a consulta global.
6. Validação do passo.
   `npm run test:unit -- audit-log`
7. Cenário negativo/erro esperado.
   Se `redactMetadata` for removido, o teste deve falhar.

### Passo 7 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF56 com integração transversal.
2. Ficheiros envolvidos:
   - REVER: audit log, admin-users, services IA e materiais
3. Instruções do que fazer.
   Confirma eventos para role, material e IA.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A auditoria só cumpre RF56 se registar domínios reais, não apenas existir como endpoint.
6. Validação do passo.
   `rg -n "auditLogService.record|AuditDomain" apps/api/src/modules`.
7. Cenário negativo/erro esperado.
   Um service sensível sem registo de auditoria deve ser corrigido.

#### Critérios de aceite

- Só admin consulta auditoria.
- Eventos têm actor, domínio, acção, recurso e resultado.
- Metadata redige chaves sensíveis.
- Alteração de role cria evento.
- IA e materiais têm pontos de integração definidos.

#### Validação final

- `npm run test:unit -- audit-log`
- `npm run test:integration`
- Pesquisa por pontos de auditoria.

#### Evidence para PR/defesa

- Output dos testes.
- Evento de alteração de papel.
- Demonstração de metadata redigida.
- Screenshot do painel admin.

#### Handoff

BK-MF4-09 deve auditar alterações de políticas de modelos IA usando `AuditDomain.AI`.

#### Changelog

- `2026-06-16`: guia corrigido com audit log transversal, redacção de metadados e consulta admin.
