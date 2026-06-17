# BK-MF4-10 - Definir quotas de IA por aluno/turma/grupo e monitorizar consumo.

## Header

- `doc_id`: `GUIA-BK-MF4-10`
- `bk_id`: `BK-MF4-10`
- `macro`: `MF4`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-09`
- `rf_rnf`: `RF58`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Criar quotas mensais de IA por aluno, turma ou grupo e monitorizar consumo. Antes de chamar o provider, o service IA reserva unidades de uso de forma atómica; se a quota estiver excedida, a chamada é bloqueada.

#### Importância

RF58 torna a IA operável em contexto escolar. Sem quotas, um aluno, turma ou grupo pode consumir recursos de forma descontrolada e afectar todos os restantes utilizadores.

#### Scope-in

- Criar DTOs de política e reserva de quota.
- Criar schemas `AiQuotaPolicy` e `AiQuotaUsage`.
- Criar service com `reserveUsage` atómico.
- Expor endpoints admin para quotas e consulta de consumo.
- Integrar com BK-MF4-09 e services IA.
- Criar painel admin de monitorização.
- Criar testes de quota excedida.

#### Scope-out

- Billing financeiro.
- Rate limiting HTTP genérico.
- Estimativa exacta de tokens por provider.
- Novos modelos IA, cobertos por BK-MF4-09.

#### Estado antes e depois

##### Estado antes

BK-MF4-09 define modelos e limites, mas não mede nem reserva consumo por contexto.

##### Estado depois

Fica `ai-quotas` com políticas mensais e uso acumulado por `USER`, `CLASS` ou `GROUP`, pronto para ser chamado antes do provider.

##### Decisões de escopo

- `CANONICO`: admin define quotas.
- `DERIVADO`: período mensal usa formato `YYYY-MM`.
- `DERIVADO`: unidade de consumo é número inteiro calculado pelo service IA antes da chamada.
- `DERIVADO`: reserva ocorre antes do provider para prevenir excesso.

#### Pre-requisitos

- BK-MF4-09.
- BK-MF4-06 para consentimento.
- BK-MF4-08 para auditoria.
- `ClassesService` e `StudyGroupsService` para validar contexto nos services consumidores.
- `requestMf3Json`.

#### Glossário

- Scope de quota: alvo da quota (`USER`, `CLASS`, `GROUP`).
- Unidade de IA: medida interna simples de consumo.
- Reserva atómica: incremento de uso que falha se ultrapassar o limite.
- Período: mês de consumo no formato `YYYY-MM`.

#### Conceitos teóricos essenciais

Quota não deve ser verificada apenas com leitura seguida de escrita, porque dois pedidos simultâneos podem ultrapassar o limite. A operação deve fazer filtro por limite restante e incremento no mesmo comando de base de dados.

#### Arquitetura do BK

- Endpoint: `GET /api/admin/ai-quotas`, `PUT /api/admin/ai-quotas`, `GET /api/admin/ai-usage`.
- Modelo/schema: `AiQuotaPolicy`, `AiQuotaUsage`.
- Service: `AiQuotasService`.
- Controller: `AiQuotasController`.
- Integração: services IA chamam `reserveUsage` antes de `AI_PROVIDER`.
- Cliente: `ai-quotas-client.ts`.
- Componente: `AiQuotasPanel`.
- Testes: `ai-quotas.service.spec.ts`.
- Handoff: BK-MF5-01 recebe IA com limites e consumo governados.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-quotas/dto/upsert-ai-quota-policy.dto.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/dto/reserve-ai-usage.dto.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/schemas/ai-quota-policy.schema.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/schemas/ai-quota-usage.schema.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.controller.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.module.ts`
- CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.service.spec.ts`
- EDITAR: services IA que chamam `AI_PROVIDER`
- CRIAR: `apps/web/src/features/ai-quotas/ai-quotas-client.ts`
- CRIAR: `apps/web/src/features/ai-quotas/ai-quotas-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar DTOs e schemas de quota

1. Objetivo funcional do passo no contexto da app.
   Modelar políticas e consumo mensal.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-quotas/dto/upsert-ai-quota-policy.dto.ts`
   - CRIAR: `apps/api/src/modules/ai-quotas/dto/reserve-ai-usage.dto.ts`
   - CRIAR: `apps/api/src/modules/ai-quotas/schemas/ai-quota-policy.schema.ts`
   - CRIAR: `apps/api/src/modules/ai-quotas/schemas/ai-quota-usage.schema.ts`
3. Instruções do que fazer.
   Usa `scopeType`, `scopeId`, `purpose` e `monthlyLimit`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-quotas/dto/upsert-ai-quota-policy.dto.ts
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from "class-validator";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";

export enum AiQuotaScopeType {
    USER = "USER",
    CLASS = "CLASS",
    GROUP = "GROUP",
}

/**
 * Política mensal de quota IA.
 */
export class UpsertAiQuotaPolicyDto {
    @IsEnum(AiQuotaScopeType)
    scopeType!: AiQuotaScopeType;

    @IsOptional()
    @IsMongoId()
    scopeId?: string;

    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsInt()
    @Min(1)
    @Max(100000)
    monthlyLimit!: number;
}
```

```ts
// apps/api/src/modules/ai-quotas/dto/reserve-ai-usage.dto.ts
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from "class-validator";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "./upsert-ai-quota-policy.dto.js";

/**
 * Reserva de consumo feita por um service IA antes do provider.
 */
export class ReserveAiUsageDto {
    @IsEnum(AiQuotaScopeType)
    scopeType!: AiQuotaScopeType;

    @IsOptional()
    @IsMongoId()
    scopeId?: string;

    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsInt()
    @Min(1)
    @Max(10000)
    units!: number;
}
```

```ts
// apps/api/src/modules/ai-quotas/schemas/ai-quota-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "../dto/upsert-ai-quota-policy.dto.js";

export type AiQuotaPolicyDocument = HydratedDocument<AiQuotaPolicy>;

/**
 * Limite mensal configurado por admin.
 */
@Schema({ timestamps: true, collection: "ai_quota_policies" })
export class AiQuotaPolicy {
    @Prop({ required: true, enum: Object.values(AiQuotaScopeType), index: true })
    scopeType!: AiQuotaScopeType;

    @Prop({ type: Types.ObjectId, index: true })
    scopeId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, min: 1, max: 100000 })
    monthlyLimit!: number;
}

export const AiQuotaPolicySchema = SchemaFactory.createForClass(AiQuotaPolicy);
AiQuotaPolicySchema.index({ scopeType: 1, scopeId: 1, purpose: 1 }, { unique: true });
```

```ts
// apps/api/src/modules/ai-quotas/schemas/ai-quota-usage.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "../dto/upsert-ai-quota-policy.dto.js";

export type AiQuotaUsageDocument = HydratedDocument<AiQuotaUsage>;

/**
 * Consumo acumulado por período mensal.
 */
@Schema({ timestamps: true, collection: "ai_quota_usage" })
export class AiQuotaUsage {
    @Prop({ required: true, enum: Object.values(AiQuotaScopeType), index: true })
    scopeType!: AiQuotaScopeType;

    @Prop({ type: Types.ObjectId, index: true })
    scopeId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, match: /^\d{4}-\d{2}$/, index: true })
    period!: string;

    @Prop({ required: true, min: 0, default: 0 })
    usedUnits!: number;
}

export const AiQuotaUsageSchema = SchemaFactory.createForClass(AiQuotaUsage);
AiQuotaUsageSchema.index({ scopeType: 1, scopeId: 1, purpose: 1, period: 1 }, { unique: true });
```

5. Explicação do código.
   Política e consumo ficam separados. A chave única por scope/finalidade/período impede duplicar contadores.
6. Validação do passo.
   `monthlyLimit: 0` deve falhar.
7. Cenário negativo/erro esperado.
   `scopeId` inválido deve ser rejeitado.

### Passo 2 - Implementar reserva atómica

1. Objetivo funcional do passo no contexto da app.
   Bloquear chamadas IA que ultrapassam quota.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
3. Instruções do que fazer.
   Usa `findOneAndUpdate` com condição de limite restante.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-quotas/ai-quotas.service.ts
import { ForbiddenException, Injectable, TooManyRequestsException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";
import { ReserveAiUsageDto } from "./dto/reserve-ai-usage.dto.js";
import { AiQuotaPolicy, AiQuotaPolicyDocument } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageDocument } from "./schemas/ai-quota-usage.schema.js";

export type AiQuotaUsageView = { period: string; usedUnits: number; monthlyLimit: number };

/**
 * Serviço de quotas IA com reserva atómica.
 */
@Injectable()
export class AiQuotasService {
    constructor(
        @InjectModel(AiQuotaPolicy.name) private readonly policyModel: Model<AiQuotaPolicyDocument>,
        @InjectModel(AiQuotaUsage.name) private readonly usageModel: Model<AiQuotaUsageDocument>,
    ) {}

    async upsertPolicy(actor: AuthenticatedUser, input: UpsertAiQuotaPolicyDto) {
        this.assertAdmin(actor);
        return this.policyModel
            .findOneAndUpdate(
                this.policyKey(input),
                { $set: { ...input, scopeId: input.scopeId ? new Types.ObjectId(input.scopeId) : undefined } },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
    }

    async reserveUsage(input: ReserveAiUsageDto): Promise<AiQuotaUsageView> {
        const period = this.currentPeriod();
        const policy = await this.policyModel.findOne(this.policyKey(input)).lean();
        if (!policy) {
            throw new ForbiddenException({ code: "AI_QUOTA_POLICY_MISSING", message: "Não existe quota de IA para este contexto." });
        }

        const remainingFilter = {
            ...this.policyKey(input),
            period,
            usedUnits: { $lte: policy.monthlyLimit - input.units },
        };
        const usage = await this.usageModel
            .findOneAndUpdate(
                remainingFilter,
                {
                    $inc: { usedUnits: input.units },
                    $setOnInsert: { ...this.policyKey(input), period },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();

        if (!usage) {
            throw new TooManyRequestsException({ code: "AI_QUOTA_EXCEEDED", message: "A quota mensal de IA foi excedida." });
        }
        return { period, usedUnits: usage.usedUnits, monthlyLimit: policy.monthlyLimit };
    }

    private policyKey(input: Pick<UpsertAiQuotaPolicyDto, "scopeType" | "scopeId" | "purpose">) {
        return {
            scopeType: input.scopeType,
            scopeId: input.scopeId ? new Types.ObjectId(input.scopeId) : undefined,
            purpose: input.purpose,
        };
    }

    private currentPeriod(): string {
        return new Date().toISOString().slice(0, 7);
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem configurar quotas." });
        }
    }
}
```

5. Explicação do código.
   A condição `usedUnits <= monthlyLimit - units` e o `$inc` ficam no mesmo comando. Isto reduz o risco de duas chamadas simultâneas ultrapassarem o limite.
6. Validação do passo.
   Com limite 10 e uso 8, reserva de 3 deve falhar.
7. Cenário negativo/erro esperado.
   Sem política configurada deve devolver `AI_QUOTA_POLICY_MISSING`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor gestão admin de quotas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.controller.ts`
   - CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Exporta `AiQuotasService` para services IA.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-quotas/ai-quotas.controller.ts
import { Body, Controller, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { UpsertAiQuotaPolicyDto } from "./dto/upsert-ai-quota-policy.dto.js";

/**
 * API administrativa de quotas IA.
 */
@Controller("api/admin/ai-quotas")
@UseGuards(SessionGuard)
export class AiQuotasController {
    constructor(private readonly quotasService: AiQuotasService) {}

    @Put()
    upsertPolicy(@Req() request: AuthenticatedRequest, @Body() input: UpsertAiQuotaPolicyDto) {
        return this.quotasService.upsertPolicy(request.user!, input);
    }
}
```

```ts
// apps/api/src/modules/ai-quotas/ai-quotas.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiQuotasController } from "./ai-quotas.controller.js";
import { AiQuotasService } from "./ai-quotas.service.js";
import { AiQuotaPolicy, AiQuotaPolicySchema } from "./schemas/ai-quota-policy.schema.js";
import { AiQuotaUsage, AiQuotaUsageSchema } from "./schemas/ai-quota-usage.schema.js";

/**
 * Módulo de quotas e consumo IA.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: AiQuotaPolicy.name, schema: AiQuotaPolicySchema },
            { name: AiQuotaUsage.name, schema: AiQuotaUsageSchema },
        ]),
    ],
    controllers: [AiQuotasController],
    providers: [AiQuotasService],
    exports: [AiQuotasService],
})
export class AiQuotasModule {}
```

5. Explicação do código.
   O endpoint de escrita é admin-only. A reserva não precisa de endpoint público porque é chamada por services IA.
6. Validação do passo.
   Admin cria quota mensal para `USER`.
7. Cenário negativo/erro esperado.
   Não admin recebe `ADMIN_ROLE_REQUIRED`.

### Passo 4 - Integrar nos services IA

1. Objetivo funcional do passo no contexto da app.
   Reservar quota antes de chamar o provider.
2. Ficheiros envolvidos:
   - EDITAR: services IA que chamam `AI_PROVIDER`
3. Instruções do que fazer.
   A ordem é consentimento, política de modelo, quota e provider.
4. Código completo, correto e integrado com a app final.

```ts
// Contrato dentro de um service IA de aluno antes de AI_PROVIDER
await this.aiConsentsService.assertGranted(actor.id, AiConsentPurpose.PRIVATE_AREA_AI);
const policy = await this.aiModelPoliciesService.resolveForUse(AiModelPurpose.PRIVATE_AREA_AI);
await this.aiQuotasService.reserveUsage({
    scopeType: AiQuotaScopeType.USER,
    scopeId: actor.id,
    purpose: policy.purpose,
    units: Math.max(1, Math.ceil(prompt.length / 1000)),
});
```

5. Explicação do código.
   A unidade é derivada do tamanho do prompt para MVP. A reserva antes do provider impede chamadas que já excedem quota.
6. Validação do passo.
   Com quota excedida, o provider não deve ser chamado.
7. Cenário negativo/erro esperado.
   Se `reserveUsage` for chamado depois do provider, há consumo não governado.

### Passo 5 - Criar frontend admin

1. Objetivo funcional do passo no contexto da app.
   Permitir configurar quotas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/ai-quotas/ai-quotas-client.ts`
   - CRIAR: `apps/web/src/features/ai-quotas/ai-quotas-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` para criar/actualizar quota.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/ai-quotas/ai-quotas-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiQuotaPolicyInput = {
    scopeType: "USER" | "CLASS" | "GROUP";
    scopeId?: string;
    purpose: "PRIVATE_AREA_AI" | "STUDY_GROUP_AI" | "CLASS_AI" | "PROJECT_AI" | "SUMMARY" | "STUDY_TOOL";
    monthlyLimit: number;
};

export function saveAiQuotaPolicy(input: AiQuotaPolicyInput) {
    return requestMf3Json("/api/admin/ai-quotas", { method: "PUT", body: JSON.stringify(input) });
}
```

```tsx
// apps/web/src/features/ai-quotas/ai-quotas-panel.tsx
import { useState } from "react";
import { saveAiQuotaPolicy } from "./ai-quotas-client.js";

/**
 * Painel admin mínimo para configurar quota IA global por utilizador.
 */
export function AiQuotasPanel() {
    const [limit, setLimit] = useState(100);
    const [message, setMessage] = useState<string | null>(null);

    async function save() {
        await saveAiQuotaPolicy({ scopeType: "USER", purpose: "PRIVATE_AREA_AI", monthlyLimit: limit });
        setMessage("Quota guardada.");
    }

    return (
        <section aria-labelledby="ai-quotas-title">
            <h2 id="ai-quotas-title">Quotas de IA</h2>
            {message ? <p>{message}</p> : null}
            <label>Limite mensal<input type="number" min={1} value={limit} onChange={(event) => setLimit(Number(event.target.value))} /></label>
            <button type="button" onClick={save}>Guardar quota</button>
        </section>
    );
}
```

5. Explicação do código.
   O painel cobre o fluxo administrativo mínimo. O backend continua a validar role e limites numéricos.
6. Validação do passo.
   Guardar quota deve devolver política criada.
7. Cenário negativo/erro esperado.
   Limite zero deve ser rejeitado pela API.

### Passo 6 - Testar quota excedida

1. Objetivo funcional do passo no contexto da app.
   Provar que a reserva bloqueia excesso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-quotas/ai-quotas.service.spec.ts`
3. Instruções do que fazer.
   Simula política de limite 10 e ausência de documento actualizado.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-quotas/ai-quotas.service.spec.ts
import { TooManyRequestsException } from "@nestjs/common";
import { AiQuotasService } from "./ai-quotas.service.js";
import { AiModelPurpose } from "../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "./dto/upsert-ai-quota-policy.dto.js";

describe("AiQuotasService", () => {
    it("bloqueia reserva acima da quota mensal", async () => {
        const policyModel = { findOne: jest.fn(() => ({ lean: async () => ({ monthlyLimit: 10 }) })) };
        const usageModel = { findOneAndUpdate: jest.fn(() => ({ lean: async () => null })) };
        const service = new AiQuotasService(policyModel as never, usageModel as never);

        await expect(
            service.reserveUsage({ scopeType: AiQuotaScopeType.USER, scopeId: "507f1f77bcf86cd799439010", purpose: AiModelPurpose.PRIVATE_AREA_AI, units: 3 }),
        ).rejects.toBeInstanceOf(TooManyRequestsException);
    });
});
```

5. Explicação do código.
   O teste simula a base a não actualizar porque a condição de limite restante falhou.
6. Validação do passo.
   `npm run test:unit -- ai-quotas`
7. Cenário negativo/erro esperado.
   Se a reserva ignorar o limite, o teste falha.

#### Critérios de aceite

- Admin define quota por scope/finalidade.
- Uso é acumulado por mês.
- Reserva atómica bloqueia excesso.
- Services IA reservam antes do provider.
- O erro público é `AI_QUOTA_EXCEEDED`.

#### Validação final

- `npm run test:unit -- ai-quotas`
- `npm run test:integration`
- Teste manual de duas chamadas até exceder limite.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de quota criada.
- Erro `AI_QUOTA_EXCEEDED`.
- Demonstração de `usedUnits` incrementado.

#### Handoff

BK-MF5-01 pode assumir que chamadas IA já têm consentimento, política de modelo e quota antes do provider.

#### Changelog

- `2026-06-16`: guia corrigido com quotas IA, reserva atómica e monitorização de consumo.
