# BK-MF0-11 - Obter resumos IA baseados nos materiais enviados.

## Header

- `doc_id`: `GUIA-BK-MF0-11`
- `bk_id`: `BK-MF0-11`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF0-08, BK-MF0-10`
- `rf_rnf`: `RF11`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-12`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md`
- `last_updated`: `2026-06-01`

## O que vamos fazer neste BK

Neste BK vamos criar o primeiro fluxo de IA visível: gerar um resumo para uma Área de Estudo com base nos materiais enviados pelo aluno. O resumo deve depender de fontes da própria área e nunca deve inventar conteúdo quando o material ainda não está processado.

Como a indexação automática completa aparece mais tarde em RF31/RF32, este BK deve ser honesto tecnicamente. A geração só pode usar fontes já disponíveis e processáveis no sistema, como materiais que já tenham texto extraído ou conteúdo manual do tipo `TOPIC`. PDF/DOCX em estado `PENDING_PROCESSING`, sem texto extraído ou sem indexação completa devem bloquear a geração com mensagem clara, em vez de produzir resumo fictício.

Decisão explícita de escopo MF0: este BK não implementa RAG, embeddings, chunking semântico, OCR nem pipeline completo de indexação. Esses temas pertencem a fases posteriores; no MF0, se o material não estiver processável, a resposta correta é bloquear a geração e explicar o motivo ao aluno.

O perfil IA do BK-MF0-10 fornece o estado e as preferências pedagógicas da área. A “voz” do BK-MF0-09, quando existir, pode influenciar o estilo do resumo, mas não pode substituir as fontes.

## Porque é que isto é importante

- Entrega valor central da StudyFlow: estudar a partir dos próprios materiais.
- Introduz guardrail contra alucinação desde o primeiro fluxo de IA.
- Reutiliza materiais, área e perfil IA sem duplicar contratos.
- Prepara explicações, cards e quizzes do BK-MF0-12.
- Ensina separação entre prompt, service e provider externo.

## O que entra (scope)

- Estado esperado antes do BK: materiais submetidos e perfil IA criado.
- Estado esperado depois do BK: aluno gera ou tenta gerar resumo com estado controlado.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
    - `apps/api/src/modules/ai/summaries.controller.ts`
    - `apps/api/src/modules/ai/summaries.service.ts`
    - `apps/api/src/modules/ai/providers/ai-provider.ts`
    - `apps/api/src/modules/ai/prompts/summary.prompt.ts`
    - `apps/api/src/modules/ai/dto/create-summary.dto.ts`
    - `apps/web/src/pages/student/StudyAreaSummariesPage.tsx`
    - `apps/web/src/components/ai/SummaryPanel.tsx`
- Ficheiros a rever: BK-MF0-08, BK-MF0-10, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: materiais do BK-MF0-08 e perfil IA do BK-MF0-10.
- Impacto na arquitetura: cria provider IA isolado, sem espalhar chamadas externas pelo código.
- Impacto em frontend: botão de gerar resumo, estados loading/error/empty/success e fontes.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/summaries`.
- Impacto em dados: cria `AiArtifact` ou `Summary` com fontes.
- Impacto em segurança: não gerar sem fontes processadas e não misturar áreas.
- Impacto em testes: negativos contra ausência de fontes e área alheia.
- Handoff: BK-MF0-12 reutiliza artefactos e fontes para quizzes/cards.

## O que não entra (scope-out)

- Indexação automática completa de PDF/DOCX.
- RAG, embeddings, chunking semântico, OCR ou pipeline completo de indexação.
- Resumos factuais de PDF/DOCX sem texto extraído/processável.
- Conhecimento externo sem permissão.
- Aprovação docente de conteúdos IA.
- Quotas, custos e seleção avançada de modelo.
- Exportação PDF/MD.

## Como saber que isto ficou bem

- Resumo válido referencia materiais usados.
- Se não houver texto fonte, a API bloqueia com erro pedagógico claro.
- PDF/DOCX sem texto extraído ou indexação completa não gera resposta IA.
- O guia deixa explícito que RAG/indexação completa pertence a fases posteriores.
- Área alheia não pode ser resumida.
- Resposta da IA fica guardada como artefacto da área.
- UI mostra fontes e não apresenta resumo falso.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-08, BK-MF0-10` (CANONICO)
- Pre-condicoes: materiais com texto disponível ou bloqueio claro se estiverem pendentes (DERIVADO)
- Ref. Plano: `Fase 1`, `S02`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-SUMMARY`
- Fonte de verdade: `docs/RF.md`, `RF11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Resumos IA baseados nos materiais enviados (CANONICO)
- `rf_rnf`: `RF11` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo de artefacto IA.
- Criar provider IA isolado por interface.
- Criar prompt de resumo com fontes obrigatórias.
- Criar endpoint de geração de resumo.
- Bloquear geração sem material processado.
- Bloquear PDF/DOCX sem texto extraído ou indexação completa, sem fallback para resposta genérica.
- Criar UI de geração e visualização.
- Guardar resumo e fontes.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF10, RF11, RF31, RF38.
- `docs/RNF.md`: RNF09, RNF19, RNF20, RNF31, RNF35, RNF37.
- BK-MF0-08: materiais.
- BK-MF0-10: perfil IA.
- Critérios de aceitação dos RF: resumos devem indicar página/secção quando disponível.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: confirmar que RAG/indexação completa não pertence ao contrato MF0.

## Glossário (rápido) (DERIVADO):

- **Artefacto IA**: conteúdo gerado e guardado, como resumo.
- **Provider IA**: camada que chama o serviço de IA.
- **Prompt**: instrução enviada ao modelo.
- **Fonte**: material usado como base factual.
- **Alucinação**: conteúdo inventado sem suporte.
- **Fallback**: comportamento quando a IA não pode responder.
- **Citação**: referência à origem do conteúdo.
- **Material processado**: material com texto utilizável pela IA.
- **Texto extraído**: representação textual já obtida a partir de um ficheiro; sem isto, PDF/DOCX deve bloquear geração no MF0.
- **RAG**: padrão em que a IA consulta uma base documental indexada antes de responder; fica fora do MF0.

## Conceitos teóricos essenciais (DERIVADO):

**IA baseada em fontes.** O resumo deve ser criado a partir de textos disponíveis. Se o PDF ainda não foi extraído, o sistema não deve adivinhar o conteúdo.

**Provider isolado.** Chamadas a OpenAI ou outro serviço devem ficar atrás de uma interface. Assim, testes podem usar stub e a app não fica dependente de detalhes do fornecedor.

**Guardrails de geração.** O prompt deve dizer explicitamente para resumir apenas as fontes fornecidas. O service também deve validar fontes antes de chamar a IA.

**Fallback honesto.** Quando faltam fontes, a resposta correta é bloquear e explicar o que falta, não criar conteúdo genérico.

**Limite MF0 para PDF/DOCX.** Um ficheiro carregado não é automaticamente uma fonte utilizável. Se ainda não existe texto extraído ou indexação completa, a app deve responder com uma mensagem como "Este material ainda não tem texto processável para gerar resumo." RAG e indexação completa devem ficar documentados como trabalho futuro, não como promessa deste BK.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-08 com materiais.
- BK-MF0-10 com perfil IA.
- Pelo menos um material `TOPIC` ou outro material com `status: "READY"` e `contentText`.
- `OPENAI_API_KEY` e `OPENAI_MODEL` definidos no ambiente quando a geração real estiver ativa.
- Sem RAG, embeddings, OCR ou indexação completa nesta MF0.

### Passo 1 - Criar schema AiArtifact

1. Explicação simples do objetivo.

    Neste passo vais criar schema AiArtifact. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type AiArtifactDocument = HydratedDocument<AiArtifact>;
export type AiArtifactType = "SUMMARY" | "EXPLANATION" | "FLASHCARDS" | "QUIZ";

@Schema({ timestamps: true, collection: "ai_artifacts" })
export class AiArtifact {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: ["SUMMARY", "EXPLANATION", "FLASHCARDS", "QUIZ"],
    })
    type!: AiArtifactType;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sourcesJson!: Array<Record<string, unknown>>;
}

export const AiArtifactSchema = SchemaFactory.createForClass(AiArtifact);
```

5. Explicação do código.

Os artefactos guardam conteúdo e fontes para defesa e consulta futura.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar provider IA isolado

1. Explicação simples do objetivo.

    Neste passo vais criar provider IA isolado. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/providers/ai-provider.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import OpenAI from "openai";

export type AiSource = {
    materialId: string;
    title: string;
    contentText: string;
};

export type SummaryResult = {
    title: string;
    bullets: string[];
    sourceMaterialIds: string[];
};

export const AI_PROVIDER = Symbol("AI_PROVIDER");

export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
    private readonly client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const response = await this.client.responses.create({
            model: process.env.OPENAI_MODEL,
            input: input.prompt,
        });

        // A Responses API expõe output_text no SDK oficial de JavaScript.
        return JSON.parse(response.output_text ?? "{}") as SummaryResult;
    }
}
```

5. Explicação do código.

O provider é o único ficheiro que conhece OpenAI. O service recebe apenas `SummaryResult`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar prompt de resumo

1. Explicação simples do objetivo.

    Neste passo vais criar prompt de resumo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/prompts/summary.prompt.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { AiSource } from "../providers/ai-provider";

export function buildSummaryPrompt(
    areaName: string,
    sources: AiSource[],
    voiceTone?: string,
): string {
    const sourceText = sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    return `
És a IA privada do StudyFlow para a área "${areaName}".
Resume apenas as fontes fornecidas. Se a informação não estiver nas fontes, não inventes.
Tom pedagógico pretendido: ${voiceTone ?? "normal"}.

Devolve apenas JSON válido neste formato:
{
  "title": "string",
  "bullets": ["string"],
  "sourceMaterialIds": ["string"]
}

Fontes:
${sourceText}
`.trim();
}
```

5. Explicação do código.

O prompt exige JSON e obriga fontes. Isto não substitui validação no service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar service de resumos

1. Explicação simples do objetivo.

    Neste passo vais criar service de resumos. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/summaries.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { buildSummaryPrompt } from "./prompts/summary.prompt";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider";
import { AiArtifact, AiArtifactDocument } from "./schemas/ai-artifact.schema";

@Injectable()
export class SummariesService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
    ) {}

    async generateSummary(userId: string, studyAreaId: string) {
        const area = await this.areasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        const profile = await this.profileService.prepareProfile(
            userId,
            studyAreaId,
        );
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar resumo.",
            });
        }

        try {
            const result = await this.aiProvider.generateSummary({
                prompt: buildSummaryPrompt(
                    area.name,
                    sources,
                    profile.voiceTone,
                ),
            });

            return this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "SUMMARY",
                contentJson: result,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });
        } catch (error) {
            if (error instanceof UnprocessableEntityException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    private async getProcessableSources(
        userId: string,
        studyAreaId: string,
    ): Promise<AiSource[]> {
        const materials = await this.materialsService.listByArea(
            userId,
            studyAreaId,
        );
        return materials
            .filter(
                (material) =>
                    material.status === "READY" && material.contentText,
            )
            .map((material) => ({
                materialId: material._id.toString(),
                title: material.title,
                contentText: material.contentText,
            }));
    }
}
```

5. Explicação do código.

O service bloqueia antes de chamar o provider se não houver fontes. PDF/DOCX pendentes não passam no filtro.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/summaries.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SummariesService } from "./summaries.service";

@Controller("api/study-areas/:id/summaries")
@UseGuards(SessionGuard)
export class SummariesController {
    constructor(private readonly summariesService: SummariesService) {}

    @Post()
    generate(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.summariesService.generateSummary(request.user!.id, id);
    }
}
```

5. Explicação do código.

O controller é pequeno de propósito: validação de fontes e ownership fica no service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Editar AiModule

1. Explicação simples do objetivo.

    Neste passo vais editar AiModule. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- LOCALIZAÇÃO: substituir o ficheiro pelo módulo completo, mantendo os imports equivalentes se o scaffold final ordenar caminhos de forma diferente.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { SummariesController } from "./summaries.controller";
import { SummariesService } from "./summaries.service";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
        ]),
        StudyAreasModule,
        MaterialsModule,
    ],
    controllers: [AiAreaProfileController, SummariesController],
    providers: [
        AiAreaProfileService,
        SummariesService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [AiAreaProfileService, SummariesService],
})
export class AiModule {}
```

5. Explicação do código.

Este módulo liga perfil IA, artefactos, materiais e provider. O provider fica registado por token para permitir stub em testes sem trocar o service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Cliente API e UI

1. Explicação simples do objetivo.

    Neste passo vais cliente API e UI. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export async function generateSummary(studyAreaId: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/summaries`, {
        method: "POST",
        credentials: "include",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível gerar resumo.");
    return data;
}
```

- CRIAR: `apps/web/src/components/ai/SummaryPanel.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { useState } from "react";
import { generateSummary } from "../../lib/apiClient";

export function SummaryPanel({ studyAreaId }: { studyAreaId: string }) {
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        setError(null);
        try {
            setSummary(await generateSummary(studyAreaId));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao gerar resumo.",
            );
        }
    }

    return (
        <section className="rounded border bg-white p-4">
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                onClick={handleGenerate}
                type="button"
            >
                Gerar resumo
            </button>
            {error && (
                <p className="mt-3 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}
            {summary && (
                <pre className="mt-3 overflow-auto rounded bg-slate-50 p-3 text-sm">
                    {JSON.stringify(summary.contentJson, null, 2)}
                </pre>
            )}
        </section>
    );
}
```

5. Explicação do código.

A UI mostra erro quando não há fontes, em vez de apresentar resumo falso.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `AiArtifact`.
    - Endpoint de resumos.
    - UI de geração/consulta.
    - Exclusão explícita de RAG/indexação completa no MF0.
- Verificações:
    - Resumo válido responde `201`.
    - Sem fontes responde erro controlado.
- Qualidade:
    - IA só usa fontes da área.
    - PDF/DOCX não processável não faz fallback para resumo genérico.
    - Erros externos tratados explicitamente.
- Continuidade:
    - BK-MF0-12 reutiliza artefacto/fonte.
- Evidência:
    - PR inclui resumo, fontes e 3 negativos.

## Validação final

### Requests e responses esperados

- `POST /api/study-areas/:id/summaries -> 201` com artefacto `SUMMARY`.
- `422 NO_PROCESSABLE_SOURCES` se a área não tiver fonte `READY`.
- `422 NO_PROCESSABLE_SOURCES` para PDF/DOCX sem texto extraído.
- `401 UNAUTHENTICATED` sem sessão.
- `404 STUDY_AREA_NOT_FOUND` para área alheia.
- `503 AI_PROVIDER_UNAVAILABLE` quando o provider falha.

### Como validar o BK e cenários negativos

- Tópico manual `READY`: esperado resumo com `sourcesJson`.
- Área só com PDF pendente: esperado `422` e nenhuma chamada ao provider.
- Área alheia: esperado `404`.
- Provider indisponível: esperado `503` sem expor API key.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_PROVIDER_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, provider IA não configurado e JSON IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- JSON de resumo com `sourcesJson`.
- Output `422 NO_PROCESSABLE_SOURCES`.
- Output `503 AI_PROVIDER_UNAVAILABLE`.
- Screenshot do painel com resumo ou erro pedagógico.

## Handoff para BK-MF0-12

- BK-MF0-12 deve reutilizar `AiArtifact` e a mesma regra `NO_PROCESSABLE_SOURCES`.
- Explicações/cards/quizzes não podem usar PDF/DOCX pendente.

## Changelog

- `2026-05-24`: guia refinado para resumos IA com fontes obrigatórias, fallback honesto e provider isolado.
- `2026-05-25`: escopo IA MF0 reforçado: apenas fontes processáveis; PDF/DOCX sem texto extraído bloqueia; RAG/indexação completa fica para fases posteriores.
- `2026-05-25`: artefactos IA atualizados para coleção MongoDB/Mongoose.
