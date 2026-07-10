# BK-MF4-09 - Configurar modelos de IA e limites de uso.

## Header

- `doc_id`: `GUIA-BK-MF4-09`
- `bk_id`: `BK-MF4-09`
- `macro`: `MF4`
- `owner`: `Kaua`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF57`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-10`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Criar políticas administrativas para modelos e limites técnicos. O administrador define finalidade, provider, modelo, tamanho máximo, timeout e estado ativo; `GovernedAiExecutionService` passa a resolver a política para todos os fluxos.

#### Importância

RF57 impede que cada service IA escolha modelo e limites de forma solta. A configuração central dá controlo operacional, melhora previsibilidade e prepara quotas em BK-MF4-10.

#### Scope-in

- Criar DTO e schema `AiModelPolicy`.
- Criar service admin-only para listar/upsert.
- Criar método `resolveForUse`.
- Auditar alterações com BK-MF4-08.
- Criar cliente e painel admin.
- Integrar `AiModelPoliciesService` dentro de `GovernedAiExecutionService`.
- Criar testes de role e política desativada.

#### Scope-out

- Cobrança financeira.
- Reserva de consumo, coberta por BK-MF4-10.
- Consentimentos, cobertos por BK-MF4-06.
- Alterar prompts pedagógicos.

#### Estado antes e depois

##### Estado antes

Existe uma fachada governada; falta integrar nela uma política administrativa por finalidade.

##### Estado depois

Fica um módulo `ai-model-policies` que centraliza modelo, limites e estado por finalidade, com auditoria de alterações.

##### Decisões de escopo

- `CANONICO`: só admin configura modelos.
- `DERIVADO`: finalidade da política usa o mesmo vocabulário de consentimento IA sempre que possível.
- `DERIVADO`: o provider continua isolado; os services recebem política e passam limites antes da chamada.

#### Pre-requisitos

- BK-MF4-06 para consentimentos.
- BK-MF4-08 para auditoria.
- `GovernedAiExecutionService`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Política de modelo: configuração administrativa de modelo e limites por finalidade.
- Finalidade IA: domínio funcional que usa IA.
- Fallback honesto: mensagem controlada quando a IA está desativada ou indisponível.
- Timeout: tempo máximo permitido para resposta do provider.

#### Conceitos teóricos essenciais

Modelo e limites são resolvidos pela fachada depois de autorização/consentimento e antes de construir o prompt. O service de domínio continua responsável por ownership e fontes autorizadas, mas não consulta policy nem provider diretamente.

#### Arquitetura do BK

- Endpoint: `GET /api/admin/ai-model-policies`, `PUT /api/admin/ai-model-policies/:purpose`.
- Modelo/schema: `AiModelPolicy`.
- Service: `AiModelPoliciesService`.
- Controller: `AiModelPoliciesController`.
- Integração: services IA chamam `resolveForUse`.
- Cliente: `ai-model-policies-client.ts`.
- Componente: `AiModelPoliciesPanel`.
- Testes: `ai-model-policies.service.spec.ts`.
- Handoff: BK-MF4-10 usa a finalidade para aplicar quotas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts`
- CRIAR: `apps/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts`
- CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.controller.ts`
- CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.module.ts`
- CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- EDITAR: `apps/api/src/modules/ai/governed-ai-execution.service.ts`
- CRIAR: `apps/web/src/features/ai-model-policies/ai-model-policies-client.ts`
- CRIAR: `apps/web/src/features/ai-model-policies/ai-model-policies-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Definir DTO e schema de política IA

1. Objetivo funcional do passo no contexto da app.
   Persistir modelo, provider e limites por finalidade.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts`
   - CRIAR: `apps/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts`
3. Instruções do que fazer.
   Usa enums fechados e limites numéricos.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts
import { IsBoolean, IsEnum, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export enum AiModelPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
    GROUP_AI = "GROUP_AI",
    CLASS_AI = "CLASS_AI",
    PROJECT_AI = "PROJECT_AI",
    SOURCE_GROUNDED_AI = "SOURCE_GROUNDED_AI",
    EXTERNAL_KNOWLEDGE_AI = "EXTERNAL_KNOWLEDGE_AI",
    ADAPTIVE_EXPLANATION = "ADAPTIVE_EXPLANATION",
    SUMMARY = "SUMMARY",
    STUDY_TOOL = "STUDY_TOOL",
    ROOM_AI = "ROOM_AI",
}

export enum AiProviderName {
    OPENAI = "OPENAI",
}

/**
 * Política administrativa de modelo IA.
 */
export class UpsertAiModelPolicyDto {
    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsEnum(AiProviderName)
    provider!: AiProviderName;

    @IsString()
    @MinLength(3)
    @MaxLength(80)
    model!: string;

    /** Limita prompt antes de enviar dados ao provider. */
    @IsInt()
    @Min(500)
    @Max(50000)
    maxPromptChars!: number;

    @IsInt()
    @Min(1000)
    @Max(30000)
    timeoutMs!: number;

    @IsBoolean()
    enabled!: boolean;
}
```

```ts
// apps/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiModelPurpose, AiProviderName } from "../dto/upsert-ai-model-policy.dto.js";

export type AiModelPolicyDocument = HydratedDocument<AiModelPolicy>;

/**
 * Política de modelo IA por finalidade.
 */
@Schema({ timestamps: true, collection: "ai_model_policies" })
export class AiModelPolicy {
    @Prop({ required: true, unique: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, enum: Object.values(AiProviderName), default: AiProviderName.OPENAI })
    provider!: AiProviderName;

    @Prop({ required: true, trim: true, maxlength: 80 })
    model!: string;

    @Prop({ required: true, min: 500, max: 50000 })
    maxPromptChars!: number;

    @Prop({ required: true, min: 1000, max: 30000 })
    timeoutMs!: number;

    @Prop({ required: true, default: true })
    enabled!: boolean;
}

export const AiModelPolicySchema = SchemaFactory.createForClass(AiModelPolicy);
```

5. Explicação do código.
   A finalidade impede uma configuração única demasiado ampla. Os limites evitam prompts gigantes e timeouts impraticáveis.
6. Validação do passo.
   `maxPromptChars: 100` deve falhar.
7. Cenário negativo/erro esperado.
   Provider fora de `OPENAI` deve ser rejeitado até existir integração documentada.

### Passo 2 - Implementar service admin e resolução de uso

1. Objetivo funcional do passo no contexto da app.
   Gerir políticas e bloquear finalidades desativadas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
3. Instruções do que fazer.
   Injeta `AuditLogService` para alterações administrativas.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts
import { ForbiddenException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";
import { AiModelPurpose, UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";
import { AiModelPolicy, AiModelPolicyDocument } from "./schemas/ai-model-policy.schema.js";

export type AiModelPolicyView = UpsertAiModelPolicyDto & { updatedAt?: Date };

/**
 * Serviço central de políticas de modelos IA.
 */
@Injectable()
export class AiModelPoliciesService {
    constructor(
        @InjectModel(AiModelPolicy.name)
        private readonly policyModel: Model<AiModelPolicyDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async list(actor: AuthenticatedUser): Promise<AiModelPolicyView[]> {
        this.assertAdmin(actor);
        const rows = await this.policyModel.find().sort({ purpose: 1 }).lean();
        return rows.map((row) => this.toView(row));
    }

    async upsert(actor: AuthenticatedUser, input: UpsertAiModelPolicyDto): Promise<AiModelPolicyView> {
        this.assertAdmin(actor);
        const saved = await this.policyModel
            .findOneAndUpdate({ purpose: input.purpose }, { $set: input }, { new: true, upsert: true, runValidators: true })
            .lean();
        await this.auditLogService.record({
            actorId: actor.id,
            domain: AuditDomain.AI,
            action: "AI_MODEL_POLICY_UPDATED",
            resourceType: "AiModelPolicy",
            resourceId: input.purpose,
            result: AuditResult.SUCCESS,
            metadata: { model: input.model, enabled: input.enabled },
        });
        return this.toView(saved);
    }

    async resolveForUse(purpose: AiModelPurpose): Promise<AiModelPolicyView> {
        const policy = await this.policyModel.findOne({ purpose }).lean();
        if (!policy) {
            throw new ServiceUnavailableException({ code: "AI_MODEL_POLICY_MISSING", message: "A política de IA ainda não está configurada." });
        }
        if (!policy.enabled) {
            throw new ServiceUnavailableException({ code: "AI_MODEL_POLICY_DISABLED", message: "Esta funcionalidade de IA está temporariamente desativada." });
        }
        return this.toView(policy);
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem configurar IA." });
        }
    }

    private toView(row: {
        purpose: AiModelPurpose;
        provider: UpsertAiModelPolicyDto["provider"];
        model: string;
        maxPromptChars: number;
        timeoutMs: number;
        enabled: boolean;
        updatedAt?: Date;
    }): AiModelPolicyView {
        return {
            purpose: row.purpose,
            provider: row.provider,
            model: row.model,
            maxPromptChars: row.maxPromptChars,
            timeoutMs: row.timeoutMs,
            enabled: row.enabled,
            updatedAt: row.updatedAt,
        };
    }
}
```

5. Explicação do código.
   `resolveForUse` é chamado por services IA antes de gerar prompt final. Alterações administrativas ficam auditadas sem guardar prompt ou resposta.
6. Validação do passo.
   Política ausente deve devolver `AI_MODEL_POLICY_MISSING`.
7. Cenário negativo/erro esperado.
   Política desativada deve devolver `AI_MODEL_POLICY_DISABLED`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor gestão de políticas IA.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.controller.ts`
   - CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Importa `AuditLogModule` e exporta o service para BK-MF4-10.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.controller.ts
import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { UpsertAiModelPolicyDto } from "./dto/upsert-ai-model-policy.dto.js";

/**
 * API administrativa de políticas IA.
 */
@Controller("api/admin/ai-model-policies")
@UseGuards(SessionGuard)
export class AiModelPoliciesController {
    constructor(private readonly policiesService: AiModelPoliciesService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.policiesService.list(request.user!);
    }

    @Put()
    upsert(@Req() request: AuthenticatedRequest, @Body() input: UpsertAiModelPolicyDto) {
        return this.policiesService.upsert(request.user!, input);
    }
}
```

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AiModelPoliciesController } from "./ai-model-policies.controller.js";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { AiModelPolicy, AiModelPolicySchema } from "./schemas/ai-model-policy.schema.js";

/**
 * Módulo de configuração administrativa de IA.
 */
@Module({
    imports: [AuthModule, AuditLogModule, MongooseModule.forFeature([{ name: AiModelPolicy.name, schema: AiModelPolicySchema }])],
    controllers: [AiModelPoliciesController],
    providers: [AiModelPoliciesService],
    exports: [AiModelPoliciesService],
})
export class AiModelPoliciesModule {}
```

5. Explicação do código.
   O módulo fica exportado para que quotas e services IA usem a mesma política.
6. Validação do passo.
   `PUT /api/admin/ai-model-policies` deve exigir admin.
7. Cenário negativo/erro esperado.
   Pedido sem sessão deve falhar no guard.

### Passo 4 - Integrar na fachada governada

1. Objetivo funcional do passo no contexto da app.
   Aplicar política central uma única vez na fachada.
2. Ficheiros envolvidos:
   - EDITAR: `apps/api/src/modules/ai/governed-ai-execution.service.ts`
3. Instruções do que fazer.
   `authorize` chama `resolveForUse`; `executeAuthorized` limita fontes, constrói o prompt, valida comprimento e só depois reserva quota e faz a invocação privada.
4. Código completo, correto e integrado com a app final.

```ts
const policy = await this.aiModelPoliciesService.resolveForUse(input.purpose);
const limitedSources = input.sources.slice(0, policy.maxSourceCount);
const prompt = input.buildPrompt(limitedSources);
assertPromptWithinLimit(prompt, policy);
```

5. Explicação do código.
   A validação ocorre depois de consentimento e ownership, mas antes do provider. Isto evita custos e exposição de dados quando a política bloqueia.
6. Validação do passo.
   Prompt acima do limite deve falhar antes de reservar quota ou invocar o provider privado.
7. Cenário negativo/erro esperado.
   O teste arquitetural deve falhar se um consumidor de domínio injetar o provider ou consultar policy fora da fachada.

### Passo 5 - Criar frontend admin

1. Objetivo funcional do passo no contexto da app.
   Gerir políticas IA no painel admin.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/ai-model-policies/ai-model-policies-client.ts`
   - CRIAR: `apps/web/src/features/ai-model-policies/ai-model-policies-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json`, sem tokens em storage.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/ai-model-policies/ai-model-policies-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiModelPolicy = {
    purpose: "PRIVATE_AREA_AI" | "GROUP_AI" | "CLASS_AI" | "PROJECT_AI" | "SOURCE_GROUNDED_AI" | "EXTERNAL_KNOWLEDGE_AI" | "ADAPTIVE_EXPLANATION" | "SUMMARY" | "STUDY_TOOL" | "ROOM_AI";
    provider: "OPENAI";
    model: string;
    maxPromptChars: number;
    timeoutMs: number;
    enabled: boolean;
};

export function loadAiModelPolicies() {
    return requestMf3Json<AiModelPolicy[]>("/api/admin/ai-model-policies");
}

export function saveAiModelPolicy(input: AiModelPolicy) {
    return requestMf3Json<AiModelPolicy>("/api/admin/ai-model-policies", { method: "PUT", body: JSON.stringify(input) });
}
```

```tsx
// apps/web/src/features/ai-model-policies/ai-model-policies-panel.tsx
import { useEffect, useState } from "react";
import { AiModelPolicy, loadAiModelPolicies, saveAiModelPolicy } from "./ai-model-policies-client.js";

/**
 * Painel admin de políticas IA.
 */
export function AiModelPoliciesPanel() {
    const [items, setItems] = useState<AiModelPolicy[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiModelPolicies().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function toggle(policy: AiModelPolicy) {
        const saved = await saveAiModelPolicy({ ...policy, enabled: !policy.enabled });
        setItems((current) => current.map((item) => (item.purpose === saved.purpose ? saved : item)));
    }

    return (
        <section aria-labelledby="ai-model-policies-title">
            <h2 id="ai-model-policies-title">Modelos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {items.map((item) => <button key={item.purpose} type="button" onClick={() => toggle(item)}>{item.purpose}: {item.model}</button>)}
        </section>
    );
}
```

5. Explicação do código.
   O painel permite activar/desactivar políticas existentes e mantém erro visível.
6. Validação do passo.
   Admin consegue alternar uma política.
7. Cenário negativo/erro esperado.
   Não admin deve ver erro da API.

### Passo 6 - Testar política desativada

1. Objetivo funcional do passo no contexto da app.
   Garantir fallback honesto sem provider.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
3. Instruções do que fazer.
   Testa ausência e estado desativado.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts
import { ServiceUnavailableException } from "@nestjs/common";
import { AiModelPoliciesService } from "./ai-model-policies.service.js";
import { AiModelPurpose, AiProviderName } from "./dto/upsert-ai-model-policy.dto.js";

describe("AiModelPoliciesService", () => {
    it("bloqueia finalidade IA desativada", async () => {
        const policyModel = {
            findOne: jest.fn(() => ({ lean: async () => ({ purpose: AiModelPurpose.PRIVATE_AREA_AI, provider: AiProviderName.OPENAI, model: "gpt-test", maxPromptChars: 1000, timeoutMs: 4000, enabled: false }) })),
        };
        const service = new AiModelPoliciesService(policyModel as never, {} as never);

        await expect(service.resolveForUse(AiModelPurpose.PRIVATE_AREA_AI)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});
```

5. Explicação do código.
   O teste confirma que o provider não deve ser chamado se a política estiver desligada.
6. Validação do passo.
   `npm run test:unit -- ai-model-policies`
7. Cenário negativo/erro esperado.
   Remover `enabled` de `resolveForUse` deve quebrar este teste.

#### Critérios de aceite

- Só admin altera políticas.
- Política define finalidade, provider, modelo e limites.
- A fachada resolve a política antes de limites, quota e invocação externa.
- Política desativada bloqueia com mensagem honesta.
- Alteração de política é auditada.

#### Validação final

- `npm run test:unit -- ai-model-policies`
- `npm run test:integration`
- Pesquisa por `resolveForUse` nos services IA.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de política criada.
- Evento de auditoria `AI_MODEL_POLICY_UPDATED`.
- Erro de política desativada.

#### Handoff

BK-MF4-10 usa `purpose` e a política resolvida para aplicar quotas antes da chamada ao provider.

#### Changelog

- `2026-06-16`: guia corrigido com políticas de modelos IA, limites técnicos e auditoria.
