# BK-MF0-10 - Criar perfil IA da Área de Estudo.

## Header

- `doc_id`: `GUIA-BK-MF0-10`
- `bk_id`: `BK-MF0-10`
- `macro`: `MF0`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-08`
- `rf_rnf`: `RF10`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-11`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos criar o perfil IA de uma Área de Estudo. O perfil IA é um contrato interno que junta a área, os materiais submetidos, o tom configurado e regras mínimas para futuras respostas. Ainda não é uma chamada real ao modelo, é a preparação estruturada do contexto.

O perfil IA deve ser criado apenas para uma área que pertença ao aluno e que tenha materiais submetidos ou, no mínimo, um estado claro de ausência de materiais. O perfil deve distinguir materiais submetidos de fontes processáveis: PDF, DOCX e URLs em `PENDING_PROCESSING` contam como materiais submetidos, mas ainda não autorizam geração de resumos. Isto prepara o BK-MF0-11, onde os resumos devem ser baseados apenas em conteúdo processável.

Este BK deve evitar promessas de IA que ainda não existem. Se não houver provider de IA configurado, o perfil fica num estado operacional como `MISSING_MATERIALS`, `PENDING_PROCESSING` ou `READY_FOR_GENERATION`, mas não inventa respostas.

## Porque é que isto é importante

- Cria a ponte entre materiais e geração de conteúdos.
- Define limites para a IA antes de a usar.
- Reutiliza a voz/tom do BK-MF0-09 quando existir.
- Prepara citações e isolamento por área para fases futuras.
- Evita que cada endpoint de IA construa contexto de forma diferente.

## O que entra (scope)

- Estado esperado antes do BK: área criada e, opcionalmente, materiais submetidos.
- Estado esperado depois do BK: área tem `AiAreaProfile` reutilizável.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/ai/schemas/ai-area-profile.schema.ts`
    - `apps/api/src/modules/ai/ai-area-profile.controller.ts`
    - `apps/api/src/modules/ai/ai-area-profile.service.ts`
    - `apps/api/src/modules/ai/dto/ai-area-profile.dto.ts`
    - `apps/web/src/components/ai/AiAreaProfilePanel.tsx`
    - `apps/web/src/pages/student/StudyAreaDetailPage.tsx`
- Ficheiros a rever: BK-MF0-08, BK-MF0-09, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `BK-MF0-08`; opcionalmente consome `BK-MF0-09`.
- Impacto na arquitetura: cria domínio `ai` sem acoplar diretamente aos controllers de materiais.
- Impacto em frontend: painel de estado do perfil IA da área.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/ai-profile`.
- Impacto em dados: cria `AiAreaProfile`.
- Impacto em segurança: contexto só inclui materiais da área do aluno.
- Impacto em testes: validar área alheia, área sem materiais e perfil duplicado.
- Handoff: BK-MF0-11 usa este perfil para criar resumo.

## O que não entra (scope-out)

- Chamada real a IA para gerar resumo.
- Vetores/embeddings e indexação completa.
- Conhecimento externo.
- Guardrails avançados por grupo/turma.
- Configuração de modelos e quotas.

## Como saber que isto ficou bem

- Área válida gera perfil IA.
- Perfil inclui referências a materiais da área, não de outras áreas.
- Perfil reutiliza tom/estilo quando existir.
- Área sem materiais tem estado controlado.
- Criar perfil repetido não duplica dados indevidamente.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Daniel` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-08` (CANONICO)
- Pre-condicoes: área válida, com materiais submetidos ou com ausência de materiais tratada explicitamente (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-AREA-PROFILE`
- Fonte de verdade: `docs/RF.md`, `RF10` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-10` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Perfil IA privado da Área de Estudo (CANONICO)
- `rf_rnf`: `RF10` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `AiAreaProfile`.
- Criar service de construção do perfil.
- Ler materiais da área.
- Ler preferências de voz/tom quando existirem.
- Criar endpoint protegido.
- Criar painel de estado no frontend.
- Preparar contrato para resumos.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF09, RF10, RF11, RF35, RF38.
- `docs/RNF.md`: RNF19, RNF20, RNF31, RNF35.
- BK-MF0-07: áreas.
- BK-MF0-08: materiais.
- BK-MF0-09: voz/tom, se implementado.

## Glossário (rápido) (DERIVADO):

- **Perfil IA**: configuração e contexto que a IA usará numa área.
- **Contexto**: materiais e preferências disponíveis para responder.
- **Fonte**: material usado como base factual.
- **Fonte processável**: material cujo texto já está disponível para IA; na MF0, tópicos/texto manual podem entrar aqui, mas PDF/DOCX/URL pendentes não entram.
- **Estado do perfil**: pronto, sem materiais, erro ou pendente.
- **Guardrail**: regra que limita respostas da IA.
- **Alucinação**: resposta factual inventada pela IA.
- **Provider IA**: serviço externo/interno que gera texto, ainda fora deste BK.

## Conceitos teóricos essenciais (DERIVADO):

**Preparar contexto antes de gerar.** Uma IA só deve responder com base em dados autorizados. O perfil IA ajuda a centralizar os materiais e limites que serão usados por resumos e quizzes.

**Separação entre configuração e execução.** Criar perfil IA não significa chamar um modelo. Esta separação facilita testes sem custos externos e evita depender de API externa para validar o BK.

**Isolamento por área.** O perfil só pode incluir materiais cujo `studyAreaId` pertence ao aluno. Misturar áreas pode gerar respostas erradas e violar privacidade.

**Estados explícitos.** Se faltarem materiais, o perfil deve dizer isso. Se houver apenas materiais pendentes de processamento, o perfil também deve dizer isso. Estados claros evitam UI confusa e ajudam o próximo BK a decidir se pode gerar resumo.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-07 com áreas privadas.
- BK-MF0-08 com materiais e distinção entre `PENDING_PROCESSING` e `READY`.
- BK-MF0-09 opcional para campos de voz.
- Não existe RAG/indexação completa no MF0.

### Passo 1 - Criar schema do perfil IA

1. Explicação simples do objetivo.

    Neste passo vais criar schema do perfil IA. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/schemas/ai-area-profile.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiAreaProfileDocument = HydratedDocument<AiAreaProfile>;
export type AiAreaProfileStatus =
    | "MISSING_MATERIALS"
    | "PENDING_PROCESSING"
    | "READY_FOR_GENERATION";

@Schema({ timestamps: true, collection: "ai_area_profiles" })
export class AiAreaProfile {
    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        unique: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: [
            "MISSING_MATERIALS",
            "PENDING_PROCESSING",
            "READY_FOR_GENERATION",
        ],
    })
    status!: AiAreaProfileStatus;

    @Prop({ default: 0, min: 0 })
    sourceCount!: number;

    @Prop({ default: 0, min: 0 })
    processableSourceCount!: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Material" }], default: [] })
    materialIds!: Types.ObjectId[];

    @Prop()
    voiceTone?: string;
}

export const AiAreaProfileSchema = SchemaFactory.createForClass(AiAreaProfile);
```

5. Explicação do código.

O índice único em `studyAreaId` torna a operação idempotente: uma área tem um perfil IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTO de resposta

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de resposta. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/dto/ai-area-profile.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { AiAreaProfileStatus } from "../schemas/ai-area-profile.schema";

export type AiAreaProfileDto = {
    id: string;
    studyAreaId: string;
    status: AiAreaProfileStatus;
    sourceCount: number;
    processableSourceCount: number;
    voiceTone?: string;
};
```

5. Explicação do código.

O DTO não expõe ficheiros brutos nem caminhos de storage.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/ai-area-profile.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AiAreaProfileDto } from "./dto/ai-area-profile.dto";
import {
    AiAreaProfile,
    AiAreaProfileDocument,
    AiAreaProfileStatus,
} from "./schemas/ai-area-profile.schema";

@Injectable()
export class AiAreaProfileService {
    constructor(
        @InjectModel(AiAreaProfile.name)
        private readonly profileModel: Model<AiAreaProfileDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
    ) {}

    async prepareProfile(
        userId: string,
        studyAreaId: string,
    ): Promise<AiAreaProfileDto> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área não encontrada.",
            });

        const materials = await this.materialsService.listByArea(
            userId,
            studyAreaId,
        );
        const processable = materials.filter(
            (material) => material.status === "READY",
        );
        const status = this.calculateStatus(
            materials.length,
            processable.length,
        );

        const profile = await this.profileModel.findOneAndUpdate(
            {
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(userId),
            },
            {
                $set: {
                    status,
                    sourceCount: materials.length,
                    processableSourceCount: processable.length,
                    materialIds: materials.map((material) => material._id),
                    voiceTone: area.voiceTone,
                },
            },
            { new: true, upsert: true, runValidators: true },
        );

        return this.toDto(profile);
    }

    private calculateStatus(
        sourceCount: number,
        processableCount: number,
    ): AiAreaProfileStatus {
        if (sourceCount === 0) return "MISSING_MATERIALS";
        if (processableCount === 0) return "PENDING_PROCESSING";
        return "READY_FOR_GENERATION";
    }

    private toDto(profile: AiAreaProfileDocument): AiAreaProfileDto {
        return {
            id: profile._id.toString(),
            studyAreaId: profile.studyAreaId.toString(),
            status: profile.status,
            sourceCount: profile.sourceCount,
            processableSourceCount: profile.processableSourceCount,
            voiceTone: profile.voiceTone,
        };
    }
}
```

5. Explicação do código.

O service conta materiais submetidos e fontes processáveis separadamente. Isto impede desbloquear IA com PDF/DOCX/URL pendentes.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar controller e módulo

1. Explicação simples do objetivo.

    Neste passo vais criar controller e módulo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/ai-area-profile.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { AiAreaProfileService } from "./ai-area-profile.service";

@Controller("api/study-areas/:id/ai-profile")
@UseGuards(SessionGuard)
export class AiAreaProfileController {
    constructor(private readonly profileService: AiAreaProfileService) {}

    @Post()
    prepare(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.profileService.prepareProfile(request.user!.id, id);
    }
}
```

- CRIAR: `apps/api/src/modules/ai/ai.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";

@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
        ]),
    ],
    controllers: [AiAreaProfileController],
    providers: [AiAreaProfileService],
    exports: [AiAreaProfileService],
})
export class AiModule {}
```

5. Explicação do código.

O módulo depende de áreas e materiais, mas não de provider IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Cliente API e painel

1. Explicação simples do objetivo.

    Neste passo vais cliente API e painel. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type AiAreaProfile = {
    id: string;
    studyAreaId: string;
    status: "MISSING_MATERIALS" | "PENDING_PROCESSING" | "READY_FOR_GENERATION";
    sourceCount: number;
    processableSourceCount: number;
    voiceTone?: string;
};

export async function prepareAiAreaProfile(
    studyAreaId: string,
): Promise<AiAreaProfile> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/ai-profile`, {
        method: "POST",
        credentials: "include",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(
            data?.message ?? "Não foi possível preparar o perfil IA.",
        );
    return data as AiAreaProfile;
}
```

- CRIAR: `apps/web/src/components/ai/AiAreaProfilePanel.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { useState } from "react";
import { AiAreaProfile, prepareAiAreaProfile } from "../../lib/apiClient";

export function AiAreaProfilePanel({ studyAreaId }: { studyAreaId: string }) {
    const [profile, setProfile] = useState<AiAreaProfile | null>(null);

    async function handlePrepare() {
        setProfile(await prepareAiAreaProfile(studyAreaId));
    }

    return (
        <section className="rounded border bg-white p-4">
            <h2 className="font-semibold">Perfil IA da área</h2>
            <button
                className="mt-3 rounded bg-slate-900 px-4 py-2 text-white"
                onClick={handlePrepare}
                type="button"
            >
                Preparar perfil IA
            </button>
            {profile?.status === "MISSING_MATERIALS" && (
                <p className="mt-3">Adiciona materiais para preparar a IA.</p>
            )}
            {profile?.status === "PENDING_PROCESSING" && (
                <p className="mt-3">
                    Há materiais, mas ainda não há fontes processáveis.
                </p>
            )}
            {profile?.status === "READY_FOR_GENERATION" && (
                <p className="mt-3">
                    A área tem fontes processáveis para gerar conteúdos.
                </p>
            )}
        </section>
    );
}
```

5. Explicação do código.

O painel não mostra resumo falso. Só comunica o estado real do perfil.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `AiAreaProfile`.
    - Endpoint de criação/atualização.
    - Painel de estado no frontend.
- Verificações:
    - Área com fontes processáveis fica `READY_FOR_GENERATION`.
    - Área apenas com materiais pendentes fica `PENDING_PROCESSING`.
    - Área sem materiais fica `MISSING_MATERIALS`.
- Qualidade:
    - Perfil separado de geração real.
    - Sem dados sensíveis na resposta.
- Continuidade:
    - BK-MF0-11 usa o perfil para resumos.
- Evidência:
    - PR inclui JSON do perfil e 3 negativos.

## Validação final

### Requests e responses esperados

- Área sem materiais: `200 { "status": "MISSING_MATERIALS" }`.
- Área só com PDF/DOCX/URL pendente: `200 { "status": "PENDING_PROCESSING" }`.
- Área com TOPIC `READY`: `200 { "status": "READY_FOR_GENERATION" }`.
- Área alheia: `404 STUDY_AREA_NOT_FOUND`.
- Sem sessão: `401 UNAUTHENTICATED`.

### Como validar o BK e cenários negativos

- Criar perfil duas vezes: esperado atualizar o mesmo documento, sem duplicar.
- Área sem materiais: esperado `MISSING_MATERIALS`.
- Área com material pendente: esperado `PENDING_PROCESSING`.
- Área de outro aluno: esperado `404`.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- JSON dos três estados possíveis.
- Screenshot do painel.
- Output de chamada repetida sem duplicação.
- Nota: este BK não chama provider IA.

## Handoff para BK-MF0-11

- BK-MF0-11 só pode gerar resumo quando `status === "READY_FOR_GENERATION"`.
- `PENDING_PROCESSING` e `MISSING_MATERIALS` devem bloquear geração.

## Changelog

- `2026-05-24`: guia refinado para perfil IA por área, sem geração real e com contratos para resumos.
- `2026-05-25`: perfil IA atualizado para MongoDB/Mongoose com `studyAreaId` único.
- `2026-05-25`: clarificada a diferença entre materiais submetidos e fontes processáveis para impedir geração IA com materiais pendentes.
