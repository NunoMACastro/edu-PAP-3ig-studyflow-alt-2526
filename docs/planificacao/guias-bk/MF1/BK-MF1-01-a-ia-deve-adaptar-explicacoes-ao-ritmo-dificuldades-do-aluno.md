# BK-MF1-01 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.

## Header
- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-12`
- `rf_rnf`: `RF13`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `last_updated`: `2026-07-10`

## Objetivo
Implementar `RF13`: permitir que a IA adapte explicações ao ritmo, dificuldades e estilo de estudo do aluno, usando apenas materiais processáveis da área de estudo do próprio aluno.

## Importância
Adaptação pedagógica só é segura se continuar baseada em fontes. O perfil do aluno altera a forma de explicar, mas não autoriza a IA a inventar factos nem a consultar materiais de outras áreas ou de outros alunos.

## Scope-in
- Criar perfil de aprendizagem por aluno e área de estudo.
- Guardar ritmo, nível, dificuldades e estilo preferido.
- Gerar explicação adaptada com base em materiais `READY`.
- Bloquear geração sem fontes.
- Guardar resposta e fontes usadas.

## Scope-out
- Diagnóstico clínico ou psicológico.
- Perfil global para todas as áreas.
- Materiais oficiais de turma.
- IA partilhada de sala.

## Estado antes
- `BK-MF0-07` criou áreas de estudo.
- `BK-MF0-08` criou materiais com `contentText` quando estão prontos.
- `BK-MF0-12` fechou a fundação de IA da MF0 com os services de domínio e `GovernedAiExecutionService` exportados.

## Estado depois
- Aluno configura perfil numa área.
- Aluno pede explicação adaptada.
- API responde com fontes da própria área.
- API devolve `422` se não houver materiais processáveis.

## Pré-requisitos
- `StudyAreasService.getMyStudyArea`.
- `Material` com `status: "READY"` e `contentText`.
- `SessionGuard`.
- `AiModule` final da MF0 com `GovernedAiExecutionService`, `AiAreaProfileService`, `SummariesService` e `StudyToolsService` preservados.

## Glossário
- **Perfil de aprendizagem**: preferências pedagógicas do aluno numa área.
- **Ritmo**: velocidade e granularidade da explicação.
- **Dificuldade**: ponto onde o aluno sente bloqueio.
- **Fonte processável**: material com texto guardado e pronto para IA.

## Conceitos teóricos
**Personalização pedagógica.** Personalizar uma explicação não significa mudar a verdade do conteúdo. Significa ajustar a forma: mais lenta, mais direta, com mais passos, com exemplos ou com linguagem mais simples. O conteúdo factual continua a vir dos materiais do aluno.

**Perfil por área de estudo.** O perfil não é global porque um aluno pode estar confortável em Matemática e ter dificuldades em Física. Por isso, `LearningProfile` guarda `userId` e `studyAreaId`: a combinação destes dois campos diz “este perfil pertence a este aluno nesta área”.

**Fontes processáveis.** Uma fonte processável é um material que já tem texto em `contentText` e estado `READY`. Um ficheiro enviado mas ainda sem texto extraído não pode ser usado pela IA, porque a aplicação não sabe realmente o que está lá dentro.

**Bloqueio sem fontes.** Se a área não tiver materiais prontos, o service devolve `422`. Isto ensina uma regra importante: é melhor falhar com uma mensagem clara do que gerar uma resposta bonita mas sem base factual.

**Extensão acumulada do `AiModule`.** Este BK não substitui a fundação de IA da MF0. Acrescenta perfil e explicações adaptadas, mantendo os services existentes e consumindo `GovernedAiExecutionService`; nenhum service de domínio recebe o provider.

**Fluxo de dados.** O aluno guarda o perfil, o controller recebe a sessão, o service confirma ownership e recolhe materiais autorizados; `GovernedAiExecutionService` limita fontes, constrói o prompt, executa os gates e devolve output validado para persistência.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`
- `apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- `apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts`
- `apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- `apps/api/src/modules/ai/providers/ai-provider.ts`
- `apps/api/src/modules/ai/adaptive-learning.service.ts`
- `apps/api/src/modules/ai/adaptive-learning.controller.ts`
- `apps/api/src/modules/ai/ai.module.ts`
- `apps/web/src/lib/api/adaptiveLearning.ts`
- `apps/web/src/pages/student/AdaptiveLearningPage.tsx`

Endpoints:
- `GET /api/study-areas/:studyAreaId/learning-profile`
- `PUT /api/study-areas/:studyAreaId/learning-profile`
- `POST /api/study-areas/:studyAreaId/adaptive-explanations`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `StudyAreasService.getMyStudyArea`.
- `Material` com `status: "READY"` e `contentText`.
- `SessionGuard`.
- `AiModule` final da MF0 com `GovernedAiExecutionService`, `AiAreaProfileService`, `SummariesService` e `StudyToolsService` preservados.

### Passo 1 - Criar schema do perfil

1. Explicação simples do objetivo.

    Neste passo vais criar schema do perfil nos ficheiros `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/schemas/learning-profile.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LearningProfileDocument = HydratedDocument<LearningProfile>;
export type LearningPace = "SLOW" | "BALANCED" | "FAST";
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

@Schema({ timestamps: true, collection: "learning_profiles" })
export class LearningProfile {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SLOW", "BALANCED", "FAST"], default: "BALANCED" })
    pace!: LearningPace;

    @Prop({ required: true, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" })
    level!: LearningLevel;

    @Prop({ type: [String], default: [] })
    difficulties!: string[];

    @Prop({ trim: true, maxlength: 200 })
    preferredExplanationStyle?: string;
}

export const LearningProfileSchema = SchemaFactory.createForClass(LearningProfile);
LearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });
```

5. Explicação do código.

    O prompt compõe apenas fontes `READY` do aluno e o perfil adaptativo validado para a área. A entrada é texto já autorizado pelo service; a saída esperada do provider é JSON com `answer`, `sourceMaterialIds` e `adaptationNotes`. O service valida esta saída antes de persistir, garantindo que a IA não responde sem fontes autorizadas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar schema da explicação

1. Explicação simples do objetivo.

    Neste passo vais criar schema da explicação nos ficheiros `apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

@Schema({ timestamps: true, collection: "adaptive_explanations" })
export class AdaptiveExplanation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 300 })
    topic!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;

    @Prop({ type: [String], default: [] })
    adaptationNotes!: string[];
}

export const AdaptiveExplanationSchema = SchemaFactory.createForClass(AdaptiveExplanation);
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

5. Explicação do código.

    Este passo pertence ao fluxo individual adaptativo: recebe dados da sessão e da área do aluno, devolve perfil, explicação ou fontes normalizadas, e deve preservar ownership via `StudyAreasService`. As validações esperadas são `404` para área fora do aluno, `422` sem materiais `READY` e `503` quando a IA falha ou devolve conteúdo inválido. O resultado prepara a transição para a cadeia colaborativa sem misturar salas, turmas ou disciplinas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar DTOs

1. Explicação simples do objetivo.

    Neste passo vais criar dtos nos ficheiros `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`, `apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateLearningProfileDto {
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace!: "SLOW" | "BALANCED" | "FAST";

    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level!: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    difficulties?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(200)
    preferredExplanationStyle?: string;
}
```

```ts
// apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskAdaptiveExplanationDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    topic!: string;
}
```

5. Explicação do código.

    Este passo pertence ao fluxo individual adaptativo: recebe dados da sessão e da área do aluno, devolve perfil, explicação ou fontes normalizadas, e deve preservar ownership via `StudyAreasService`. As validações esperadas são `404` para área fora do aluno, `422` sem materiais `READY` e `503` quando a IA falha ou devolve conteúdo inválido. O resultado prepara a transição para a cadeia colaborativa sem misturar salas, turmas ou disciplinas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar prompt

1. Explicação simples do objetivo.

    Neste passo vais criar prompt nos ficheiros `apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts
import { MaterialDocument } from "../../materials/schemas/material.schema";
import { LearningProfileDocument } from "../schemas/learning-profile.schema";

type BuildAdaptivePromptInput = {
    topic: string;
    profile: LearningProfileDocument;
    materials: MaterialDocument[];
};

export function buildAdaptiveExplanationPrompt(input: BuildAdaptivePromptInput) {
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.contentText ?? ""}`;
        })
        .join("\n\n");

    return [
        "Explica apenas com base nas fontes do aluno fornecidas.",
        "Adapta linguagem, ritmo e detalhe ao perfil, mas não acrescentes factos fora das fontes.",
        `Tópico pedido: ${input.topic}`,
        `Ritmo: ${input.profile.pace}`,
        `Nível: ${input.profile.level}`,
        `Dificuldades: ${input.profile.difficulties.join(" | ") || "sem dificuldades registadas"}`,
        `Estilo preferido: ${input.profile.preferredExplanationStyle ?? "claro e passo a passo"}`,
        sources,
        "Devolve JSON com answer, sourceMaterialIds e adaptationNotes.",
    ].join("\n\n");
}
```

5. Explicação do código.

    Este passo pertence ao fluxo individual adaptativo: recebe dados da sessão e da área do aluno, devolve perfil, explicação ou fontes normalizadas, e deve preservar ownership via `StudyAreasService`. As validações esperadas são `404` para área fora do aluno, `422` sem materiais `READY` e `503` quando a IA falha ou devolve conteúdo inválido. O resultado prepara a transição para a cadeia colaborativa sem misturar salas, turmas ou disciplinas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Alargar provider IA

1. Explicação simples do objetivo.

    Neste passo vais alargar provider ia nos ficheiros `apps/api/src/modules/ai/providers/ai-provider.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/ai/providers/ai-provider.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/providers/ai-provider.ts
import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
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

export type AdaptiveExplanationResult = {
    answer: string;
    sourceMaterialIds: string[];
    adaptationNotes: string[];
};

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const AI_PROVIDER = Symbol("AI_PROVIDER");

export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
    generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult>;
    generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        return this.createJsonResponse<SummaryResult>(input.prompt);
    }

    async generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult> {
        return this.createJsonResponse<AdaptiveExplanationResult>(input.prompt);
    }

    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>> {
        return this.createJsonResponse<Record<string, unknown>>(input.prompt);
    }

    private async createJsonResponse<T>(prompt: string): Promise<T> {
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL;

        if (!apiKey || !model) {
            throw new ServiceUnavailableException({
                code: "AI_EXECUTION_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const client = new OpenAI({ apiKey });
        const response = await client.responses.create({
            model,
            input: prompt,
        });

        try {
            return JSON.parse(response.output_text ?? "{}") as T;
        } catch {
            throw new BadGatewayException({
                code: "AI_EXECUTION_INVALID_OUTPUT",
                message: "A IA devolveu uma resposta inválida.",
            });
        }
    }
}
```

5. Explicação do código.

    Este BK parte do provider final da MF0 e acrescenta apenas o método específico para explicações adaptadas. O contrato herdado continua a expor `generateSummary` e `generateStudyTool`; MF1 aumenta capacidades, não troca o provider nem remove métodos usados por resumos e ferramentas de estudo.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/ai/adaptive-learning.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/adaptive-learning.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/adaptive-learning.service.ts
import {
    Inject,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Material, MaterialDocument } from "../materials/schemas/material.schema";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";
import { GovernedAiExecutionService } from "./governed-ai-execution.service";
import { buildAdaptiveExplanationPrompt } from "./prompts/adaptive-explanation.prompt";
import {
    AdaptiveExplanation,
    AdaptiveExplanationDocument,
} from "./schemas/adaptive-explanation.schema";
import { LearningProfile, LearningProfileDocument } from "./schemas/learning-profile.schema";

@Injectable()
export class AdaptiveLearningService {
    constructor(
        @InjectModel(LearningProfile.name)
        private readonly profileModel: Model<LearningProfileDocument>,
        @InjectModel(AdaptiveExplanation.name)
        private readonly explanationModel: Model<AdaptiveExplanationDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly aiExecution: GovernedAiExecutionService,
    ) {}

    async getProfile(userId: string, studyAreaId: string) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        return profile ? this.toProfileView(profile) : this.defaultProfile(studyAreaId);
    }

    async updateProfile(userId: string, studyAreaId: string, dto: UpdateLearningProfileDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            },
            {
                pace: dto.pace,
                level: dto.level,
                difficulties: this.cleanList(dto.difficulties ?? []),
                preferredExplanationStyle: dto.preferredExplanationStyle?.trim(),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toProfileView(profile);
    }

    async explain(userId: string, studyAreaId: string, dto: AskAdaptiveExplanationDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        const effectiveProfile =
            profile ??
            (await this.profileModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                pace: "BALANCED",
                level: "BEGINNER",
                difficulties: [],
            }));

        const materials = await this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                contentText: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .limit(8);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta área ainda não tem materiais processáveis para gerar explicação.",
            );
        }

        const prompt = buildAdaptiveExplanationPrompt({
            topic: dto.topic.trim(),
            profile: effectiveProfile,
            materials,
        });

        let result: unknown;
        try {
            ({ result } = await this.aiExecution.execute({
                userId,
                purpose: "ADAPTIVE_EXPLANATION",
                quota: { scope: "USER", targetId: userId },
                sources: materials,
                guardrailText: dto.topic,
                buildPrompt: () => prompt,
                invoke: ({ provider, prompt: governedPrompt, options }) =>
                    provider.generateAdaptiveExplanation({ prompt: governedPrompt, ...options }),
                validateResult: (value) => {
                    if (!value || typeof value !== "object") {
                        throw new TypeError("Explicação adaptativa inválida.");
                    }
                },
            }));
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const { answer, sources, adaptationNotes } = this.normalizeAdaptiveResult(result, materials);

        const explanation = await this.explanationModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            topic: dto.topic.trim(),
            answer,
            sources,
            adaptationNotes,
        });

        return {
            id: explanation._id.toString(),
            topic: explanation.topic,
            answer: explanation.answer,
            sources: explanation.sources,
            adaptationNotes: explanation.adaptationNotes,
        };
    }

    private async ensureStudyArea(userId: string, studyAreaId: string) {
        const studyArea = await this.studyAreasService.getMyStudyArea(userId, studyAreaId);

        if (!studyArea) {
            throw new NotFoundException("Área de estudo não encontrada.");
        }

        return studyArea;
    }

    private cleanList(values: string[]) {
        return values.map((value) => value.trim()).filter(Boolean).slice(0, 8);
    }

    private normalizeAdaptiveResult(result: unknown, materials: MaterialDocument[]) {
        if (!result || typeof result !== "object") {
            throw new ServiceUnavailableException("A IA devolveu uma resposta inválida.");
        }

        const payload = result as Record<string, unknown>;
        const answer = typeof payload.answer === "string" ? payload.answer.trim() : "";
        if (!answer) {
            throw new ServiceUnavailableException("A IA devolveu uma resposta vazia.");
        }

        const allowedSources = new Map(
            materials.map((material) => [
                material._id.toString(),
                { materialId: material._id.toString(), title: material.title },
            ]),
        );
        const rawSourceIds = Array.isArray(payload.sourceMaterialIds)
            ? payload.sourceMaterialIds
            : [];
        const sources = rawSourceIds
            .filter((sourceId): sourceId is string => typeof sourceId === "string")
            .map((sourceId) => allowedSources.get(sourceId))
            .filter((source): source is { materialId: string; title: string } => Boolean(source));

        if (sources.length === 0) {
            throw new ServiceUnavailableException("A IA devolveu fontes inválidas.");
        }

        const adaptationNotes = Array.isArray(payload.adaptationNotes)
            ? payload.adaptationNotes.filter((note): note is string => typeof note === "string")
            : [];

        return { answer, sources, adaptationNotes };
    }

    private defaultProfile(studyAreaId: string) {
        return {
            id: "",
            studyAreaId,
            pace: "BALANCED",
            level: "BEGINNER",
            difficulties: [],
            preferredExplanationStyle: "",
        };
    }

    private toProfileView(profile: LearningProfile | LearningProfileDocument) {
        return {
            id: profile._id.toString(),
            studyAreaId: profile.studyAreaId.toString(),
            pace: profile.pace,
            level: profile.level,
            difficulties: profile.difficulties,
            preferredExplanationStyle: profile.preferredExplanationStyle ?? "",
        };
    }
}
```

5. Explicação do código.

    O service garante ownership, recolhe materiais `READY` e bloqueia com `422` sem fontes. A fachada trata o output externo como não confiável e o domínio confirma `answer`/`sourceMaterialIds` antes de persistir. Falha governada devolve erro estável; área alheia devolve `404`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar controller e atualizar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar controller e atualizar módulo nos ficheiros `apps/api/src/modules/ai/adaptive-learning.controller.ts`, `apps/api/src/modules/ai/ai.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios. O módulo abaixo é acumulado sobre a versão final de `BK-MF0-12`: não removas controllers, services, schemas ou exports da MF0.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/ai/adaptive-learning.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.
- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista acumulada para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai/adaptive-learning.controller.ts
import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";

@Controller("api/study-areas/:studyAreaId")
@UseGuards(SessionGuard)
export class AdaptiveLearningController {
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    @Get("learning-profile")
    getProfile(@Req() request: AuthenticatedRequest, @Param("studyAreaId") studyAreaId: string) {
        return this.adaptiveLearningService.getProfile(request.user!.id, studyAreaId);
    }

    @Put("learning-profile")
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: UpdateLearningProfileDto,
    ) {
        return this.adaptiveLearningService.updateProfile(request.user!.id, studyAreaId, dto);
    }

    @Post("adaptive-explanations")
    explain(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: AskAdaptiveExplanationDto,
    ) {
        return this.adaptiveLearningService.explain(request.user!.id, studyAreaId, dto);
    }
}
```

```ts
// apps/api/src/modules/ai/ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { Material, MaterialSchema } from "../materials/schemas/material.schema";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AdaptiveLearningController } from "./adaptive-learning.controller";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { GovernedAiExecutionService } from "./governed-ai-execution.service";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "./schemas/adaptive-explanation.schema";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema";
import { LearningProfile, LearningProfileSchema } from "./schemas/learning-profile.schema";
import { StudyToolsController } from "./study-tools.controller";
import { StudyToolsService } from "./study-tools.service";
import { SummariesController } from "./summaries.controller";
import { SummariesService } from "./summaries.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
        StudyAreasModule,
        MaterialsModule,
    ],
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
        AdaptiveLearningController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        AdaptiveLearningService,
        GovernedAiExecutionService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [
        GovernedAiExecutionService,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        AdaptiveLearningService,
    ],
})
export class AiModule {}
```

5. Explicação do código.

    O controller novo expõe o fluxo adaptativo e o módulo preserva a fundação final da MF0. A MF1 acrescenta `AdaptiveLearningController`/`AdaptiveLearningService` e exporta `GovernedAiExecutionService`; módulos como `class-ai.module.ts` importam `AiModule` sem acesso direto ao provider.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Criar cliente e página

1. Explicação simples do objetivo.

    Neste passo vais criar cliente e página nos ficheiros `apps/web/src/lib/api/adaptiveLearning.ts`, `apps/web/src/pages/student/AdaptiveLearningPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/adaptiveLearning.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/web/src/pages/student/AdaptiveLearningPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/adaptiveLearning.ts
export type LearningProfileView = {
    id: string;
    studyAreaId: string;
    pace: "SLOW" | "BALANCED" | "FAST";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    difficulties: string[];
    preferredExplanationStyle: string;
};

export type AdaptiveExplanationView = {
    id: string;
    topic: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
    adaptationNotes: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function getLearningProfile(studyAreaId: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        credentials: "include",
    });

    return parseResponse<LearningProfileView>(response);
}

export async function updateLearningProfile(
    studyAreaId: string,
    input: Omit<LearningProfileView, "id" | "studyAreaId">,
) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<LearningProfileView>(response);
}

export async function askAdaptiveExplanation(studyAreaId: string, topic: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/adaptive-explanations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    });

    return parseResponse<AdaptiveExplanationView>(response);
}
```

```tsx
// apps/web/src/pages/student/AdaptiveLearningPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    AdaptiveExplanationView,
    LearningProfileView,
    askAdaptiveExplanation,
    getLearningProfile,
    updateLearningProfile,
} from "../../lib/api/adaptiveLearning";

type Props = {
    studyAreaId: string;
};

export function AdaptiveLearningPage({ studyAreaId }: Props) {
    const [profile, setProfile] = useState<LearningProfileView | null>(null);
    const [explanation, setExplanation] = useState<AdaptiveExplanationView | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setIsLoadingProfile(true);
        setError("");
        getLearningProfile(studyAreaId)
            .then(setProfile)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoadingProfile(false));
    }, [studyAreaId]);

    async function handleProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSavingProfile(true);
        const form = new FormData(event.currentTarget);
        const difficulties = String(form.get("difficulties") ?? "")
            .split("\n")
            .map((difficulty) => difficulty.trim())
            .filter(Boolean);

        try {
            const updated = await updateLearningProfile(studyAreaId, {
                pace: String(form.get("pace") ?? "BALANCED") as LearningProfileView["pace"],
                level: String(form.get("level") ?? "BEGINNER") as LearningProfileView["level"],
                difficulties,
                preferredExplanationStyle: String(form.get("preferredExplanationStyle") ?? ""),
            });

            setProfile(updated);
            setNotice("Perfil adaptativo guardado.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar o perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handleQuestion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsGenerating(true);
        const form = new FormData(event.currentTarget);

        try {
            setExplanation(await askAdaptiveExplanation(studyAreaId, String(form.get("topic") ?? "")));
            setNotice("Explicação gerada com fontes autorizadas.");
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível gerar explicação.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <main>
            <h1>Explicações adaptadas</h1>
            {isLoadingProfile ? <p>A carregar perfil adaptativo.</p> : null}
            <form key={profile?.id ?? "new-profile"} onSubmit={handleProfile}>
                <select name="pace" defaultValue={profile?.pace ?? "BALANCED"}>
                    <option value="SLOW">Devagar</option>
                    <option value="BALANCED">Equilibrado</option>
                    <option value="FAST">Rápido</option>
                </select>
                <select name="level" defaultValue={profile?.level ?? "BEGINNER"}>
                    <option value="BEGINNER">Inicial</option>
                    <option value="INTERMEDIATE">Intermédio</option>
                    <option value="ADVANCED">Avançado</option>
                </select>
                <textarea name="difficulties" defaultValue={profile?.difficulties.join("\n") ?? ""} />
                <input
                    name="preferredExplanationStyle"
                    defaultValue={profile?.preferredExplanationStyle ?? ""}
                    placeholder="Estilo preferido"
                />
                <button type="submit" disabled={isSavingProfile || isLoadingProfile}>
                    {isSavingProfile ? "A guardar" : "Guardar perfil"}
                </button>
            </form>

            <form onSubmit={handleQuestion}>
                <input name="topic" placeholder="Tópico" required />
                <button type="submit" disabled={isGenerating}>
                    {isGenerating ? "A gerar" : "Gerar explicação"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {!isGenerating && !explanation ? <p>Ainda não há explicação gerada.</p> : null}

            {explanation ? (
                <section>
                    <p>{explanation.answer}</p>
                    <h2>Fontes</h2>
                    <ul>
                        {explanation.sources.map((source) => (
                            <li key={source.materialId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}
```

5. Explicação do código.

    Este passo pertence ao fluxo individual adaptativo: recebe dados da sessão e da área do aluno, devolve perfil, explicação ou fontes normalizadas, e deve preservar ownership via `StudyAreasService`. A página cobre estados de carregamento do perfil, gravação, geração, vazio inicial, sucesso e erro. As validações esperadas são `404` para área fora do aluno, `422` sem materiais `READY` e `503` quando a IA falha ou devolve conteúdo inválido. O resultado prepara a transição para a cadeia colaborativa sem misturar salas, turmas ou disciplinas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Passos 1 a 3: confirmar que schemas e DTOs não aceitam ownership vindo do body e que o perfil fica ligado ao aluno e à área autenticada.
- Passos 4 e 5: validar que `StudyAreasService.getMyStudyArea` bloqueia área inexistente ou fora do aluno antes de consultar materiais ou IA.
- Passo 6: confirmar que o controller expõe apenas `/learning-profile` e `/adaptive-explanations` e que o módulo regista os schemas necessários.
- Passo 8: validar carregamento do perfil, vazio inicial sem explicação, sucesso de gravação/geração e erro vindo da API.

## Cenários negativos específicos

- Área de outro aluno devolve `404`.
- Área sem materiais `READY` com texto processável devolve `422`.
- Provider indisponível, resposta vazia ou fontes não autorizadas devolvem `503`.

## Expected results
- `GET /api/study-areas/:studyAreaId/learning-profile` devolve `200` com perfil existente ou defaults seguros.
- `PUT /api/study-areas/:studyAreaId/learning-profile` devolve `200` e guarda perfil apenas na área do aluno autenticado.
- `POST /api/study-areas/:studyAreaId/adaptive-explanations` sem materiais `READY` com `contentText` devolve `422`.
- Provider indisponível, `answer` vazio ou `sourceMaterialIds` não autorizados devolvem `503` e não persistem explicação.
- Área inexistente ou fora do aluno devolve `404`.
- Frontend mostra carregamento do perfil, vazio inicial sem explicação, sucesso de gravação/geração e erro de API.

## Critérios de aceite
- Perfil é único por aluno e área.
- Área é validada por `StudyAreasService.getMyStudyArea`.
- Só materiais `READY` com `contentText` entram no prompt.
- Sem fontes há `422`.
- Resultado do provider é validado em runtime antes de persistir.
- Resposta guarda fontes e notas de adaptação.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa área alheia, área sem materiais processáveis e área com pelo menos um material `READY`.

## Evidence para PR/defesa
- Screenshot de perfil guardado.
- Screenshot de explicação com fontes.
- Resposta `422` sem fontes.
- Resposta `404` para área fora do aluno.

## Handoff
`BK-MF1-02` inicia a cadeia colaborativa. Este BK fica no contexto individual do aluno e não deve usar turmas, disciplinas ou salas.

## Changelog
- 2026-05-30: Guia reescrito com perfil por área, fontes da MF0 e integração completa no módulo de IA.
