# BK-MF4-06 - Gestão de consentimentos para IA.

## Header

- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF54`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-07`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Criar gestão versionada de consentimentos para funcionalidades de IA. O utilizador consegue conceder e revogar consentimento por finalidade, e os services de IA passam a ter um método claro para bloquear tratamento sem consentimento activo.

#### Importância

RF54 protege privacidade e confiança. Sem consentimento explícito, funcionalidades de IA podem tratar materiais, preferências ou interacções de forma indevida.

#### Scope-in

- Criar DTO e schema `AiConsent`.
- Guardar finalidade, versão, estado, datas e actor.
- Expor endpoints para listar, conceder e revogar.
- Criar método `assertGranted`.
- Integrar o método nos services de IA já existentes.
- Criar frontend de gestão de consentimentos.
- Testar bloqueio sem consentimento.

#### Scope-out

- Alterar prompts dos providers.
- Definir modelos e limites de IA, coberto por BK-MF4-09.
- Quotas de IA, cobertas por BK-MF4-10.
- Consentimentos de encarregados de educação.

#### Estado antes e depois

##### Estado antes

Os módulos de IA já existem e usam `AI_PROVIDER`, ownership e fontes. Não existe verificação transversal de consentimento por finalidade.

##### Estado depois

Fica um módulo `ai-consents` com histórico versionado e método de enforcement para ser chamado antes de cada tratamento IA.

##### Decisões de escopo

- `CANONICO`: RF54 pertence a todos os utilizadores.
- `CANONICO`: revogar consentimento bloqueia chamadas futuras de IA.
- `DERIVADO`: `policyVersion` começa em `2026-06-16` para tornar consentimentos comparáveis.
- `DERIVADO`: cada finalidade é separada para não transformar um consentimento amplo numa permissão global.

#### Pre-requisitos

- `SessionGuard`.
- `AuthenticatedUser`.
- Services IA existentes: `PrivateAreaAiService`, `StudyGroupAiService`, `ClassAiService`, `ProjectAiService`.
- `requestMf3Json`.

#### Glossário

- Finalidade: motivo específico para tratamento IA.
- Versão de política: identificador textual do texto de consentimento aceite.
- Consentimento activo: último registo da finalidade com estado `GRANTED`.
- Enforcement: bloqueio no service antes de chamar o provider.

#### Conceitos teóricos essenciais

Consentimento não é uma flag global. Deve ser específico, revogável e verificável no backend. O frontend ajuda o utilizador a escolher, mas o service de IA é quem bloqueia a chamada se a finalidade não estiver activa.

#### Arquitetura do BK

- Endpoint: `GET /api/ai-consents`, `PUT /api/ai-consents/:purpose`, `DELETE /api/ai-consents/:purpose`.
- Modelo/schema: `AiConsent`.
- Service: `AiConsentsService`.
- Controller: `AiConsentsController`.
- Integração: services IA chamam `assertGranted`.
- Cliente: `ai-consents-client.ts`.
- Componente: `AiConsentsPanel`.
- Testes: `ai-consents.service.spec.ts`.
- Handoff: BK-MF4-07 recebe um modelo de permissões mais claro para administração.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts`
- CRIAR: `apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.controller.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.module.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.spec.ts`
- EDITAR: services IA que chamam `AI_PROVIDER`
- CRIAR: `apps/web/src/features/ai-consents/ai-consents-client.ts`
- CRIAR: `apps/web/src/features/ai-consents/ai-consents-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Definir DTO e schema versionado

1. Objetivo funcional do passo no contexto da app.
   Persistir consentimentos por finalidade e versão.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts`
   - CRIAR: `apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts`
3. Instruções do que fazer.
   Modela finalidades explícitas e estado revogável.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export enum AiConsentPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
    STUDY_GROUP_AI = "STUDY_GROUP_AI",
    CLASS_AI = "CLASS_AI",
    PROJECT_AI = "PROJECT_AI",
}

export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

/**
 * Entrada para conceder consentimento IA numa finalidade.
 */
export class UpsertAiConsentDto {
    @IsEnum(AiConsentPurpose)
    purpose!: AiConsentPurpose;

    /** Versão aceite pelo utilizador, registada para auditoria futura. */
    @IsString()
    @MinLength(10)
    @MaxLength(40)
    policyVersion!: string;
}
```

```ts
// apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiConsentPurpose } from "../dto/upsert-ai-consent.dto.js";

export type AiConsentDocument = HydratedDocument<AiConsent>;
export type AiConsentStatus = "GRANTED" | "REVOKED";

/**
 * Consentimento IA por utilizador, finalidade e versão.
 */
@Schema({ timestamps: true, collection: "ai_consents" })
export class AiConsent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiConsentPurpose), index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, trim: true, maxlength: 40 })
    policyVersion!: string;

    @Prop({ required: true, enum: ["GRANTED", "REVOKED"], default: "GRANTED" })
    status!: AiConsentStatus;

    @Prop({ required: true, default: Date.now })
    decidedAt!: Date;
}

export const AiConsentSchema = SchemaFactory.createForClass(AiConsent);
AiConsentSchema.index({ userId: 1, purpose: 1, decidedAt: -1 });
```

5. Explicação do código.
   O schema permite histórico. Em vez de actualizar uma flag, cada decisão fica rastreável por data, finalidade e versão.
6. Validação do passo.
   Uma finalidade fora do enum deve falhar.
7. Cenário negativo/erro esperado.
   Consentimento sem `policyVersion` deve ser rejeitado.

### Passo 2 - Implementar service com enforcement

1. Objetivo funcional do passo no contexto da app.
   Listar, conceder, revogar e bloquear IA sem consentimento.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
3. Instruções do que fazer.
   O método `assertGranted` deve ser pequeno e reutilizável.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiConsentPurpose, UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";
import { AiConsent, AiConsentDocument } from "./schemas/ai-consent.schema.js";

export type AiConsentView = { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: Date };

/**
 * Serviço de consentimentos IA com bloqueio centralizado.
 */
@Injectable()
export class AiConsentsService {
    constructor(
        @InjectModel(AiConsent.name)
        private readonly consentModel: Model<AiConsentDocument>,
    ) {}

    async listMine(actor: AuthenticatedUser): Promise<AiConsentView[]> {
        const rows = await this.consentModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ decidedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    async grant(actor: AuthenticatedUser, input: UpsertAiConsentDto): Promise<AiConsentView> {
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose: input.purpose,
            policyVersion: input.policyVersion,
            status: "GRANTED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    async revoke(actor: AuthenticatedUser, purpose: AiConsentPurpose): Promise<AiConsentView> {
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose,
            policyVersion: "revoked",
            status: "REVOKED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    /**
     * Bloqueia qualquer chamada IA sem consentimento activo para a finalidade.
     */
    async assertGranted(userId: string, purpose: AiConsentPurpose): Promise<void> {
        const latest = await this.consentModel
            .findOne({ userId: new Types.ObjectId(userId), purpose })
            .sort({ decidedAt: -1 })
            .lean();
        if (latest?.status !== "GRANTED") {
            throw new ForbiddenException({ code: "AI_CONSENT_REQUIRED", message: "É necessário consentimento activo para usar esta funcionalidade de IA." });
        }
    }

    private toView(row: { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: Date }): AiConsentView {
        return { purpose: row.purpose, policyVersion: row.policyVersion, status: row.status, decidedAt: row.decidedAt };
    }
}
```

5. Explicação do código.
   `assertGranted` é o ponto de segurança. Os services IA não devem consultar a base directamente; chamam este método antes de construir prompt ou contactar provider.
6. Validação do passo.
   Último registo `REVOKED` deve bloquear.
7. Cenário negativo/erro esperado.
   Sem qualquer consentimento, `assertGranted` devolve `AI_CONSENT_REQUIRED`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Permitir ao utilizador gerir os próprios consentimentos.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.controller.ts`
   - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   As rotas usam a sessão; nenhuma recebe `userId`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.controller.ts
import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsentPurpose, UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";

/**
 * API de consentimentos IA do próprio utilizador.
 */
@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    constructor(private readonly consentsService: AiConsentsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.consentsService.listMine(request.user!);
    }

    @Put(":purpose")
    grant(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose, @Body() input: UpsertAiConsentDto) {
        return this.consentsService.grant(request.user!, { ...input, purpose });
    }

    @Delete(":purpose")
    revoke(@Req() request: AuthenticatedRequest, @Param("purpose") purpose: AiConsentPurpose) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}
```

```ts
// apps/api/src/modules/ai-consents/ai-consents.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiConsentsController } from "./ai-consents.controller.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsent, AiConsentSchema } from "./schemas/ai-consent.schema.js";

/**
 * Módulo de consentimentos IA.
 */
@Module({
    imports: [AuthModule, MongooseModule.forFeature([{ name: AiConsent.name, schema: AiConsentSchema }])],
    controllers: [AiConsentsController],
    providers: [AiConsentsService],
    exports: [AiConsentsService],
})
export class AiConsentsModule {}
```

5. Explicação do código.
   O módulo exporta o service para os módulos IA. O controller mantém a API simples e centrada no utilizador autenticado.
6. Validação do passo.
   `GET /api/ai-consents` deve listar só decisões do actor.
7. Cenário negativo/erro esperado.
   Pedido sem sessão deve falhar antes de tocar na base de dados.

### Passo 4 - Integrar nos services IA

1. Objetivo funcional do passo no contexto da app.
   Bloquear chamadas a IA sem consentimento activo.
2. Ficheiros envolvidos:
   - EDITAR: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
   - EDITAR: `apps/api/src/modules/study-group-ai/study-group-ai.service.ts`
   - EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
   - EDITAR: `apps/api/src/modules/project-ai/project-ai.service.ts`
3. Instruções do que fazer.
   Injeta `AiConsentsService` e chama `assertGranted` antes de preparar prompt.
4. Código completo, correto e integrado com a app final.

```ts
// Trecho final a inserir em private-area-ai.service.ts
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiConsentPurpose } from "../ai-consents/dto/upsert-ai-consent.dto.js";

/**
 * Valida consentimento antes de ler fontes privadas ou chamar `AI_PROVIDER`.
 */
private async assertPrivateAreaAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(actor.id, AiConsentPurpose.PRIVATE_AREA_AI);
}
```

5. Explicação do código.
   A chamada fica antes da leitura de fontes e antes do provider. Assim, a app não trata material privado com IA se o consentimento não existir.
6. Validação do passo.
   Teste do service IA deve esperar `AI_CONSENT_REQUIRED` sem consentimento.
7. Cenário negativo/erro esperado.
   Se a chamada ao provider ocorrer antes de `assertGranted`, o teste deve falhar.

### Passo 5 - Criar cliente e painel

1. Objetivo funcional do passo no contexto da app.
   Dar controlo visível ao utilizador.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/ai-consents/ai-consents-client.ts`
   - CRIAR: `apps/web/src/features/ai-consents/ai-consents-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e expõe conceder/revogar por finalidade.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/ai-consents/ai-consents-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AiConsentPurpose = "PRIVATE_AREA_AI" | "STUDY_GROUP_AI" | "CLASS_AI" | "PROJECT_AI";
export type AiConsent = { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: string };
export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

export function loadAiConsents() {
    return requestMf3Json<AiConsent[]>("/api/ai-consents");
}

export function grantAiConsent(purpose: AiConsentPurpose) {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({ purpose, policyVersion: CURRENT_AI_CONSENT_VERSION }),
    });
}

export function revokeAiConsent(purpose: AiConsentPurpose) {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, { method: "DELETE" });
}
```

```tsx
// apps/web/src/features/ai-consents/ai-consents-panel.tsx
import { useEffect, useState } from "react";
import { AiConsent, AiConsentPurpose, grantAiConsent, loadAiConsents, revokeAiConsent } from "./ai-consents-client.js";

const PURPOSES: AiConsentPurpose[] = ["PRIVATE_AREA_AI", "STUDY_GROUP_AI", "CLASS_AI", "PROJECT_AI"];

/**
 * Painel de consentimentos IA por finalidade.
 */
export function AiConsentsPanel() {
    const [items, setItems] = useState<AiConsent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiConsents().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function toggle(purpose: AiConsentPurpose, granted: boolean) {
        const saved = granted ? await revokeAiConsent(purpose) : await grantAiConsent(purpose);
        // Mantém o histórico visível colocando a decisão mais recente no topo.
        setItems((current) => [saved, ...current]);
    }

    return (
        <section aria-labelledby="ai-consents-title">
            <h2 id="ai-consents-title">Consentimentos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {PURPOSES.map((purpose) => {
                const latest = items.find((item) => item.purpose === purpose);
                const granted = latest?.status === "GRANTED";
                return <button key={purpose} type="button" onClick={() => toggle(purpose, granted)}>{purpose}: {granted ? "revogar" : "conceder"}</button>;
            })}
        </section>
    );
}
```

5. Explicação do código.
   O painel reflecte a decisão mais recente por finalidade e não guarda estado em storage. O histórico continua disponível pela lista completa recebida.
6. Validação do passo.
   Conceder e revogar a mesma finalidade deve criar duas decisões ordenadas.
7. Cenário negativo/erro esperado.
   Falha da API deve aparecer em `role="alert"` após adicionar tratamento `try/catch` se a equipa quiser feedback por botão.

### Passo 6 - Testar bloqueio sem consentimento

1. Objetivo funcional do passo no contexto da app.
   Garantir que IA fica bloqueada até haver consentimento.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.spec.ts`
3. Instruções do que fazer.
   Testa ausência, concessão e revogação.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsentPurpose } from "./dto/upsert-ai-consent.dto.js";

describe("AiConsentsService", () => {
    it("bloqueia IA sem consentimento activo", async () => {
        const consentModel = { findOne: jest.fn(() => ({ sort: () => ({ lean: async () => null }) })) };
        const service = new AiConsentsService(consentModel as never);

        await expect(
            service.assertGranted("507f1f77bcf86cd799439010", AiConsentPurpose.PRIVATE_AREA_AI),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});
```

5. Explicação do código.
   O teste cobre o default seguro: sem decisão, a IA não pode correr.
6. Validação do passo.
   `npm run test:unit -- ai-consents`
7. Cenário negativo/erro esperado.
   Se `assertGranted` aceitar ausência de registo, o teste falha.

### Passo 7 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF54 e preparar políticas/quotas IA.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros deste BK e services IA editados
3. Instruções do que fazer.
   Confirma que todas as chamadas a `AI_PROVIDER` passam por consentimento.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final liga privacidade ao runtime de IA. O consentimento não pode ficar apenas no painel.
6. Validação do passo.
   `rg -n "AI_PROVIDER|assertGranted" apps/api/src/modules`.
7. Cenário negativo/erro esperado.
   Um service IA que chama provider sem `assertGranted` deve ser corrigido antes do PR.

#### Critérios de aceite

- Consentimentos são por finalidade e versão.
- Revogação bloqueia chamadas futuras.
- Nenhum endpoint recebe `targetUserId`.
- Services IA chamam `assertGranted`.
- Teste cobre ausência de consentimento.

#### Validação final

- `npm run test:unit -- ai-consents`
- `npm run test:integration`
- Pesquisa por `AI_PROVIDER` e `assertGranted`.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de consentimento concedido e revogado.
- Erro `AI_CONSENT_REQUIRED`.
- Lista dos services IA integrados.

#### Handoff

BK-MF4-07 continua a administração de utilizadores; BK-MF4-09 deve configurar modelos IA apenas depois de consentimento estar validado.

#### Changelog

- `2026-06-16`: guia corrigido com consentimento IA versionado e enforcement nos services IA.
