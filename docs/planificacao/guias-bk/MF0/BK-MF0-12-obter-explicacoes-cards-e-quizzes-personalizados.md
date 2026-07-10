# BK-MF0-12 - Obter explicações, cards e quizzes personalizados.

## Header

- `doc_id`: `GUIA-BK-MF0-12`
- `bk_id`: `BK-MF0-12`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-11`
- `rf_rnf`: `RF12`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-01`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos criar ferramentas de estudo geradas por IA a partir dos materiais e resumos da Área de Estudo: explicações, cards e quizzes personalizados. Tal como no BK-MF0-11, a geração deve ser baseada em fontes disponíveis e não pode inventar matéria.

O requisito RF12 fala em personalização, mas a adaptação profunda ao ritmo/dificuldades do aluno só entra no BK-MF1-01/RF13. Nesta fase, “personalizado” significa respeitar a área de estudo, os materiais, o tom configurado e o histórico básico disponível, sem criar perfis psicológicos ou métricas não definidas.

Decisão explícita de escopo MF0: a IA só pode usar fontes já disponíveis e processáveis no sistema. PDF/DOCX sem texto extraído, sem estado processável ou sem indexação completa devem bloquear a geração com mensagem clara. RAG, embeddings, chunking semântico, OCR e indexação completa pertencem a fases posteriores e não devem ser prometidos por este BK.

O output deste BK fecha tecnicamente a fundação de IA da MF0 e prepara a MF1. O próximo BK vai melhorar a adaptação ao ritmo e dificuldades, por isso este BK deve guardar resultados e feedback mínimo para reutilização futura. O `AiModule` preserva os services de domínio e exporta `GovernedAiExecutionService`; o provider fica privado à fachada.

## Porque é que isto é importante

- Completa o fluxo individual: área -> materiais -> perfil IA -> resumo -> ferramentas de estudo.
- Cria formatos úteis para aprendizagem autónoma.
- Prepara dados para adaptação futura ao aluno.
- Reforça guardrails contra alucinação e respostas sem fontes.
- Introduz validação específica de quizzes, incluindo resposta correta e distratores.

## O que entra (scope)

- Estado esperado antes do BK: resumo/fonte processável criado no BK-MF0-11.
- Estado esperado depois do BK: aluno gera explicação, cards e quiz com fontes.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
    - `apps/api/src/modules/ai/study-tools.controller.ts`
    - `apps/api/src/modules/ai/study-tools.service.ts`
    - `apps/api/src/modules/ai/prompts/study-tools.prompt.ts`
    - `apps/api/src/modules/ai/dto/create-study-tool.dto.ts`
    - `apps/api/src/modules/ai/validators/quiz.validator.ts`
    - `apps/web/src/pages/student/StudyToolsPage.tsx`
    - `apps/web/src/components/ai/ExplanationPanel.tsx`
    - `apps/web/src/components/ai/FlashcardsPanel.tsx`
    - `apps/web/src/components/ai/QuizPanel.tsx`
- Ficheiros a rever: BK-MF0-11, BK-MF0-10, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `BK-MF0-11`.
- Impacto na arquitetura: reutiliza `AiArtifact` com tipos `EXPLANATION`, `FLASHCARDS`, `QUIZ`.
- Impacto em frontend: páginas/painéis de estudo interativo.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/study-tools`.
- Impacto em dados: artefactos IA guardados com fontes e tipo.
- Impacto em segurança: não gerar sem fontes e validar estrutura do quiz.
- Impacto em testes: negativos contra fonte ausente, quiz inválido e área alheia.
- Handoff: BK-MF1-01 usa feedback e histórico para adaptação ao ritmo e deve estender o provider sem remover `generateSummary` nem `generateStudyTool`.

## O que não entra (scope-out)

- Adaptação avançada ao ritmo/dificuldades, que pertence ao BK-MF1-01.
- Testes oficiais de professor, que pertencem a RF28.
- Aprovação docente de conteúdos IA, que pertence a RF29.
- Exportação PDF/MD.
- RAG, embeddings, OCR, chunking semântico ou pipeline completo de indexação.
- Geração a partir de PDF/DOCX sem texto extraído/processável.
- Conhecimento externo ou web search.

## Como saber que isto ficou bem

- Explicação, cards e quiz são gerados apenas com fontes da área.
- Quiz tem perguntas de escolha múltipla com 1 resposta correta e 3 distratores.
- PDF/DOCX sem texto extraído ou indexação completa não origina explicações, cards nem quizzes.
- O guia deixa explícito que RAG/indexação completa pertence a fases posteriores.
- Artefactos guardam fontes.
- UI mostra loading, erro sem fontes e resultado.
- Área alheia ou fonte ausente não gera conteúdo.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-11` (CANONICO)
- Pre-condicoes: resumo ou fontes processáveis disponíveis (DERIVADO)
- Ref. Plano: `Fase 1`, `S02`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-STUDY-TOOLS`
- Fonte de verdade: `docs/RF.md`, `RF12` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-12` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Explicações, cards e quizzes personalizados por área (CANONICO)
- `rf_rnf`: `RF12` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Reutilizar `AiArtifact` para novos tipos.
- Criar prompts separados para explicação, cards e quiz.
- Validar fontes antes de gerar.
- Validar estrutura do quiz depois de gerar.
- Criar UI para cada tipo de ferramenta.
- Guardar artefactos e fontes.
- Bloquear PDF/DOCX sem texto extraído ou indexação completa, sem fallback para resposta genérica.
- Preparar feedback/histórico para MF1.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF11, RF12, RF13, RF28, RF29.
- Critérios de aceitação em `docs/RF.md`: quizzes e resumos.
- `docs/RNF.md`: RNF19, RNF31, RNF35, RNF36.
- BK-MF0-11: resumo e fontes.
- BK-MF0-10: perfil IA.
- BK-MF0-06: histórico.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: confirmar que RAG/indexação completa não pertence ao contrato MF0.

## Glossário (rápido) (DERIVADO):

- **Explicação**: texto didático sobre um tópico/fonte.
- **Flashcard/Card**: par pergunta-resposta curto para revisão.
- **Quiz**: conjunto de perguntas com opções.
- **Distrator**: opção errada mas plausível num MCQ.
- **MCQ**: pergunta de escolha múltipla.
- **Fonte**: material que justifica o conteúdo gerado.
- **Fonte processável**: material que a app consegue ler como texto no MF0.
- **Texto extraído**: conteúdo textual já disponível a partir de um ficheiro; sem isto, PDF/DOCX bloqueia geração.
- **RAG**: consulta a uma base documental indexada antes da resposta IA; fica fora do MF0.
- **Validador de output**: código que confirma se a resposta da IA tem formato aceitável.
- **Feedback**: resposta do aluno a uma ferramenta, útil para adaptação futura.

## Conceitos teóricos essenciais (DERIVADO):

**Geração estruturada.** Cards e quizzes devem sair num formato previsível, por exemplo JSON validado. Texto livre é difícil de testar e pode partir a UI.

**Validação pós-IA.** Mesmo que o prompt peça 1 resposta correta e 3 distratores, o backend deve validar. A IA pode falhar o formato; nesse caso a API deve devolver erro controlado ou tentar novamente dentro de limites definidos.

**Personalização inicial.** Nesta fase a personalização usa área, tom e fontes. A adaptação ao ritmo/dificuldades fica para o próximo BK para não inventar métricas ainda inexistentes.

**Separação entre recomendação e avaliação oficial.** Quizzes deste BK são ferramentas de estudo, não testes oficiais de professor. Essa distinção evita confusão com RF28/RF29.

**Limite MF0 para fontes.** Um ficheiro carregado mas ainda sem texto extraído ou indexação completa não é fonte suficiente para IA. O comportamento correto é bloquear e explicar ao aluno que o material ainda não está pronto para gerar conteúdo de estudo. RAG e indexação completa ficam para fases posteriores.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-07 com `StudyAreasService.getMyStudyArea`.
- BK-MF0-08 com `MaterialsModule` exportando `MaterialsService`.
- BK-MF0-10 com `AiAreaProfileService.prepareProfile`.
- BK-MF0-11 com `AiArtifact` e `GovernedAiExecutionService`.
- Pelo menos um material `READY` com `contentText` na área.
- Contrato final esperado: `AiModule` exporta `GovernedAiExecutionService`, `AiAreaProfileService`, `SummariesService` e `StudyToolsService`.

### Passo 1 - Criar DTO de pedido

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de pedido. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/dto/create-study-tool.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const STUDY_TOOL_TYPES: StudyToolType[] = [
    "EXPLANATION",
    "FLASHCARDS",
    "QUIZ",
];

export class CreateStudyToolDto {
    @IsIn(STUDY_TOOL_TYPES)
    type!: StudyToolType;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}
```

5. Explicação do código.

O DTO define o contrato de entrada. `topic` é opcional: serve para o aluno pedir foco num subtema, mas nunca substitui as fontes.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar prompt por tipo

1. Explicação simples do objetivo.

    Neste passo vais criar prompt por tipo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/prompts/study-tools.prompt.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { StudyToolType } from "../dto/create-study-tool.dto";
import { AiSource } from "../providers/ai-provider";

type StudyToolPromptInput = {
    areaName: string;
    type: StudyToolType;
    sources: AiSource[];
    topic?: string;
    voiceTone?: string;
};

const OUTPUT_CONTRACTS: Record<StudyToolType, string> = {
    EXPLANATION: `{
  "title": "string",
  "sections": [
    { "heading": "string", "body": "string", "sourceMaterialIds": ["string"] }
  ]
}`,
    FLASHCARDS: `{
  "cards": [
    { "front": "string", "back": "string", "sourceMaterialIds": ["string"] }
  ]
}`,
    QUIZ: `{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctOptionIndex": 0,
      "explanation": "string",
      "sourceMaterialIds": ["string"]
    }
  ]
}`,
};

export function buildStudyToolPrompt(input: StudyToolPromptInput): string {
    const sourceText = input.sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    return `
És a IA privada do StudyFlow para a área "${input.areaName}".
Cria uma ferramenta de estudo do tipo ${input.type}.
Usa apenas as fontes fornecidas. Não uses conhecimento externo, web search ou matéria inventada.
Tom pedagógico pretendido: ${input.voiceTone ?? "normal"}.
Foco pedido pelo aluno: ${input.topic?.trim() || "sem foco específico"}.

Regras:
- Se a fonte não sustentar uma afirmação, não escrevas essa afirmação.
- Cada resultado deve indicar sourceMaterialIds.
- Para QUIZ, cria perguntas de escolha múltipla com exatamente 4 opções e apenas 1 índice correto.
- Estes quizzes são ferramentas de estudo, não testes oficiais de professor.

Devolve apenas JSON válido neste formato:
${OUTPUT_CONTRACTS[input.type]}

Fontes:
${sourceText}
`.trim();
}
```

5. Explicação do código.

O prompt dá formato concreto ao output e reforça os guardrails. Mesmo assim, o backend valida o quiz depois da IA responder.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar validador de quiz

1. Explicação simples do objetivo.

    Neste passo vais criar validador de quiz. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/validators/quiz.validator.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { BadGatewayException } from "@nestjs/common";

type QuizQuestion = {
    question?: unknown;
    options?: unknown;
    correctOptionIndex?: unknown;
    explanation?: unknown;
    sourceMaterialIds?: unknown;
};

export function validateQuizArtifact(content: Record<string, unknown>): void {
    const questions = content.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
        rejectInvalidQuiz("QUIZ_WITHOUT_QUESTIONS");
    }

    for (const rawQuestion of questions as QuizQuestion[]) {
        if (
            typeof rawQuestion.question !== "string" ||
            rawQuestion.question.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_QUESTION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.options) ||
            rawQuestion.options.length !== 4
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTIONS");
        }

        if (
            !rawQuestion.options.every(
                (option) =>
                    typeof option === "string" && option.trim().length > 0,
            )
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTION_TEXT");
        }

        if (
            !Number.isInteger(rawQuestion.correctOptionIndex) ||
            rawQuestion.correctOptionIndex < 0 ||
            rawQuestion.correctOptionIndex > 3
        ) {
            rejectInvalidQuiz("INVALID_CORRECT_OPTION_INDEX");
        }

        if (
            typeof rawQuestion.explanation !== "string" ||
            rawQuestion.explanation.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_EXPLANATION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.sourceMaterialIds) ||
            rawQuestion.sourceMaterialIds.length === 0
        ) {
            rejectInvalidQuiz("QUIZ_SOURCE_REQUIRED");
        }
    }
}

function rejectInvalidQuiz(code: string): never {
    throw new BadGatewayException({
        code,
        message: "A IA devolveu um quiz com formato inválido. Tenta novamente.",
    });
}
```

5. Explicação do código.

Este validador impede que a UI receba quizzes impossíveis de corrigir. A IA pode falhar o formato; por isso o backend não confia cegamente no output.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Editar provider IA

1. Explicação simples do objetivo.

    Neste passo vais editar provider IA. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios. Esta versão fecha o contrato MF0: MF1 pode acrescentar métodos ao provider, mas não deve substituir `generateSummary` nem `generateStudyTool`.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/ai/providers/ai-provider.ts`
- LOCALIZAÇÃO: substituir o ficheiro criado no BK-MF0-11 por esta versão completa.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import OpenAI from "openai";
import { StudyToolType } from "../dto/create-study-tool.dto";

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

O provider continua isolado. O modelo e a chave ficam no ambiente; o guia não hardcodeia credenciais nem modelo operacional.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar service de study tools

1. Explicação simples do objetivo.

    Neste passo vais criar service de study tools. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/study-tools.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    BadGatewayException,
    BadRequestException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import {
    CreateStudyToolDto,
    STUDY_TOOL_TYPES,
    StudyToolType,
} from "./dto/create-study-tool.dto";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { buildStudyToolPrompt } from "./prompts/study-tools.prompt";
import { GovernedAiExecutionService } from "./governed-ai-execution.service";
import type { AiSource } from "./providers/ai-provider";
import { AiArtifact, AiArtifactDocument } from "./schemas/ai-artifact.schema";
import { validateQuizArtifact } from "./validators/quiz.validator";

@Injectable()
export class StudyToolsService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
    ) {}

    async listTools(userId: string, studyAreaId: string, type?: StudyToolType) {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const query: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: { $in: ["EXPLANATION", "FLASHCARDS", "QUIZ"] },
        };
        if (type) query.type = type;
        return this.artifactModel.find(query).sort({ createdAt: -1 }).lean();
    }

    async generateStudyTool(
        userId: string,
        studyAreaId: string,
        input: CreateStudyToolDto,
    ) {
        if (!STUDY_TOOL_TYPES.includes(input.type)) {
            throw new BadRequestException({
                code: "INVALID_STUDY_TOOL_TYPE",
                message: "Tipo de ferramenta inválido.",
            });
        }

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
                    "Este material ainda não tem texto processável para gerar conteúdo de estudo.",
            });
        }

        try {
            const { result: contentJson, sources: usedSources } =
                await this.aiExecution.execute({
                    userId,
                    purpose: "STUDY_TOOL",
                    quota: { scope: "USER", targetId: userId },
                    sources,
                    guardrailText: input.topic ?? area.name,
                    buildPrompt: (limitedSources) =>
                        buildStudyToolPrompt({
                            areaName: area.name,
                            type: input.type,
                            topic: input.topic,
                            voiceTone: profile.voiceTone,
                            sources: limitedSources,
                        }),
                    invoke: ({ provider, prompt, options }) =>
                        provider.generateStudyTool({ type: input.type, prompt, ...options }),
                    validateResult: (value) => {
                        if (!value || typeof value !== "object") {
                            throw new TypeError("Artefacto IA inválido.");
                        }
                    },
                });

            if (input.type === "QUIZ") {
                validateQuizArtifact(contentJson);
            }

            return this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: input.type,
                contentJson,
                sourcesJson: usedSources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });
        } catch (error) {
            if (
                error instanceof BadGatewayException ||
                error instanceof BadRequestException ||
                error instanceof UnprocessableEntityException
            ) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_EXECUTION_UNAVAILABLE",
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

O service concentra as regras críticas: ownership, fontes, perfil pronto, validação de tipo, validação do quiz e persistência do artefacto.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/ai/study-tools.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateStudyToolDto, StudyToolType } from "./dto/create-study-tool.dto";
import { StudyToolsService } from "./study-tools.service";
import { GovernedAiExecutionService } from "./governed-ai-execution.service";

@Controller("api/study-areas/:id/study-tools")
@UseGuards(SessionGuard)
export class StudyToolsController {
    constructor(private readonly studyToolsService: StudyToolsService) {}

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Query("type") type?: StudyToolType,
    ) {
        return this.studyToolsService.listTools(request.user!.id, id, type);
    }

    @Post()
    generate(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateStudyToolDto,
    ) {
        return this.studyToolsService.generateStudyTool(
            request.user!.id,
            id,
            body,
        );
    }
}
```

5. Explicação do código.

O controller exige sessão em todas as rotas. A query `type` serve para filtrar, mas a segurança continua no service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Editar AiModule

1. Explicação simples do objetivo.

    Neste passo vais editar AiModule. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/ai/ai.module.ts`
- LOCALIZAÇÃO: substituir a versão do BK-MF0-11 por esta versão final da MF0.

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
import { StudyToolsController } from "./study-tools.controller";
import { StudyToolsService } from "./study-tools.service";
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
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        GovernedAiExecutionService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [
        GovernedAiExecutionService,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
    ],
})
export class AiModule {}
```

5. Explicação do código.

Este módulo fecha a MF0 de IA: perfil, resumos e ferramentas usam a mesma fachada governada e os mesmos artefactos. A MF1 importa `AiModule` e injeta apenas `GovernedAiExecutionService`; o provider nunca atravessa a fronteira do módulo.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 8 - Cliente API

1. Explicação simples do objetivo.

    Neste passo vais cliente API. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export type AiArtifact = {
    _id: string;
    type: "SUMMARY" | StudyToolType;
    contentJson: Record<string, unknown>;
    sourcesJson: Array<{ materialId: string; title: string }>;
};

export async function listStudyTools(
    studyAreaId: string,
    type?: StudyToolType,
): Promise<AiArtifact[]> {
    const suffix = type ? `?type=${type}` : "";
    const response = await fetch(
        `/api/study-areas/${studyAreaId}/study-tools${suffix}`,
        { credentials: "include" },
    );
    if (!response.ok)
        throw new Error("Não foi possível carregar ferramentas de estudo.");
    return (await response.json()) as AiArtifact[];
}

export async function generateStudyTool(
    studyAreaId: string,
    payload: { type: StudyToolType; topic?: string },
): Promise<AiArtifact> {
    const response = await fetch(
        `/api/study-areas/${studyAreaId}/study-tools`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(
            data?.message ?? "Não foi possível gerar ferramenta de estudo.",
        );
    return data as AiArtifact;
}
```

5. Explicação do código.

O frontend envia apenas tipo e foco. O aluno nunca envia `userId`, `studyAreaId` fora da rota, fontes ou resultado esperado.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 9 - Criar componentes de resultado

1. Explicação simples do objetivo.

    Neste passo vais criar componentes de resultado. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/components/ai/ExplanationPanel.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { AiArtifact } from "../../lib/apiClient";

export function ExplanationPanel({
    artifact,
}: {
    artifact: AiArtifact | null;
}) {
    if (!artifact) return <p>Gera uma explicação para começares.</p>;

    const content = artifact.contentJson as {
        title?: string;
        sections?: Array<{ heading: string; body: string }>;
    };

    return (
        <article className="space-y-4 rounded border bg-white p-4">
            <h2 className="text-xl font-semibold">
                {content.title ?? "Explicação"}
            </h2>
            {(content.sections ?? []).map((section) => (
                <section key={section.heading}>
                    <h3 className="font-semibold">{section.heading}</h3>
                    <p>{section.body}</p>
                </section>
            ))}
        </article>
    );
}
```

- CRIAR: `apps/web/src/components/ai/FlashcardsPanel.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { AiArtifact } from "../../lib/apiClient";

export function FlashcardsPanel({ artifact }: { artifact: AiArtifact | null }) {
    if (!artifact) return <p>Gera flashcards para reveres a matéria.</p>;

    const content = artifact.contentJson as {
        cards?: Array<{ front: string; back: string }>;
    };

    return (
        <ul className="grid gap-3 md:grid-cols-2">
            {(content.cards ?? []).map((card) => (
                <li className="rounded border bg-white p-4" key={card.front}>
                    <strong>{card.front}</strong>
                    <p className="mt-2">{card.back}</p>
                </li>
            ))}
        </ul>
    );
}
```

- CRIAR: `apps/web/src/components/ai/QuizPanel.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { AiArtifact } from "../../lib/apiClient";

export function QuizPanel({ artifact }: { artifact: AiArtifact | null }) {
    if (!artifact) return <p>Gera um quiz para praticares.</p>;

    const content = artifact.contentJson as {
        questions?: Array<{
            question: string;
            options: string[];
            correctOptionIndex: number;
            explanation: string;
        }>;
    };

    return (
        <ol className="space-y-4">
            {(content.questions ?? []).map((question, index) => (
                <li
                    className="rounded border bg-white p-4"
                    key={question.question}
                >
                    <strong>
                        {index + 1}. {question.question}
                    </strong>
                    <ul className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => (
                            <li
                                className={
                                    optionIndex === question.correctOptionIndex
                                        ? "font-semibold text-green-700"
                                        : ""
                                }
                                key={option}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-sm">{question.explanation}</p>
                </li>
            ))}
        </ol>
    );
}
```

5. Explicação do código.

Os componentes são simples e não tentam fazer avaliação oficial. Mostram estudo guiado e deixam a adaptação avançada para MF1.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 10 - Criar página de Study Tools

1. Explicação simples do objetivo.

    Neste passo vais criar página de Study Tools. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/StudyToolsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel";
import { QuizPanel } from "../../components/ai/QuizPanel";
import {
    AiArtifact,
    generateStudyTool,
    StudyToolType,
} from "../../lib/apiClient";

export function StudyToolsPage({ studyAreaId }: { studyAreaId: string }) {
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleGenerate() {
        setError(null);
        setIsLoading(true);
        try {
            setArtifact(
                await generateStudyTool(studyAreaId, {
                    type,
                    topic: topic || undefined,
                }),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao gerar ferramenta.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            <h1 className="text-2xl font-semibold">Ferramentas de estudo</h1>
            <div className="flex flex-wrap gap-3">
                {(["EXPLANATION", "FLASHCARDS", "QUIZ"] as StudyToolType[]).map(
                    (option) => (
                        <button
                            className={
                                option === type
                                    ? "rounded bg-slate-900 px-4 py-2 text-white"
                                    : "rounded border px-4 py-2"
                            }
                            key={option}
                            onClick={() => setType(option)}
                            type="button"
                        >
                            {option}
                        </button>
                    ),
                )}
            </div>
            <input
                className="w-full rounded border px-3 py-2"
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Foco opcional, por exemplo: funções quadráticas"
                value={topic}
            />
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                disabled={isLoading}
                onClick={handleGenerate}
                type="button"
            >
                {isLoading ? "A gerar..." : "Gerar"}
            </button>
            {error && (
                <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>
            )}
            {type === "EXPLANATION" && (
                <ExplanationPanel
                    artifact={
                        artifact?.type === "EXPLANATION" ? artifact : null
                    }
                />
            )}
            {type === "FLASHCARDS" && (
                <FlashcardsPanel
                    artifact={artifact?.type === "FLASHCARDS" ? artifact : null}
                />
            )}
            {type === "QUIZ" && (
                <QuizPanel
                    artifact={artifact?.type === "QUIZ" ? artifact : null}
                />
            )}
        </main>
    );
}
```

5. Explicação do código.

A página trata loading, erro e resultado. Se não houver fontes, mostra a mensagem do backend em vez de apresentar conteúdo inventado.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Endpoint de study tools.
    - UI de explicações, cards e quizzes.
    - Validador de quiz.
    - Exclusão explícita de RAG/indexação completa no MF0.
- Verificações:
    - Cada tipo gera artefacto com fontes.
    - Quiz tem 1 correta e 3 distratores por pergunta.
    - Sem fontes bloqueia.
- Qualidade:
    - Prompts separados por tipo.
    - Provider isolado.
    - Personalização limitada ao contexto existente.
    - PDF/DOCX não processável não faz fallback para conteúdo genérico.
- Continuidade:
    - BK-MF1-01 consegue reutilizar histórico/feedback mínimo.
    - MF1 não precisa reescrever materiais, perfil IA ou artefactos.
- Evidência:
    - PR inclui outputs dos 3 tipos e 3 negativos.

## Validação final

### Requests e responses esperados

- `POST /api/study-areas/:id/study-tools` com `{ "type": "EXPLANATION" }` -> `201` com `type: "EXPLANATION"` e `sourcesJson`.
- `POST /api/study-areas/:id/study-tools` com `{ "type": "FLASHCARDS" }` -> `201` com `contentJson.cards`.
- `POST /api/study-areas/:id/study-tools` com `{ "type": "QUIZ" }` -> `201` com `contentJson.questions`, 4 opções e `correctOptionIndex`.
- `GET /api/study-areas/:id/study-tools?type=QUIZ` -> `200` com quizzes da área do aluno.
- `400 INVALID_STUDY_TOOL_TYPE` para tipo fora de `EXPLANATION`, `FLASHCARDS`, `QUIZ`.
- `401 UNAUTHENTICATED` sem sessão.
- `404 STUDY_AREA_NOT_FOUND` para área inexistente ou área de outro aluno.
- `422 NO_PROCESSABLE_SOURCES` se não houver materiais `READY` com `contentText`.
- `502 INVALID_QUIZ_OPTIONS` ou código equivalente se a IA devolver quiz inválido.
- `503 AI_EXECUTION_UNAVAILABLE` se a execução governada falhar.
- `409` não é aplicável neste BK porque não há regra de unicidade ou conflito de versão para artefactos.

### Como validar o BK e cenários negativos

- Caminho feliz: criar tópico manual no BK-MF0-08, preparar perfil no BK-MF0-10 e gerar os três tipos.
- Sem fontes: área só com PDF pendente deve devolver `422` e não deve chamar o provider.
- Área alheia: outro aluno deve receber `404`.
- Quiz inválido: stub de provider com 2 opções deve devolver `502`.
- Provider indisponível: sem `OPENAI_API_KEY`/`OPENAI_MODEL` deve devolver `503`.
- Regressão: resumos do BK-MF0-11 continuam a usar `AiArtifact` e não quebram.

### Teste unitário mínimo

Ficheiro: `apps/api/src/modules/ai/study-tools.spec.ts`
Ação: `CRIAR`
Onde colocar: ficheiro completo de referência para a camada de service.

```ts
import { UnprocessableEntityException } from "@nestjs/common";
import { StudyToolsService } from "./study-tools.service";

describe("StudyToolsService", () => {
    it("bloqueia geração quando não há fontes processáveis", async () => {
        const service = new StudyToolsService(
            { create: jest.fn(), find: jest.fn() } as any,
            { generateStudyTool: jest.fn() } as any,
            { listByArea: jest.fn().mockResolvedValue([]) } as any,
            {
                getMyStudyArea: jest
                    .fn()
                    .mockResolvedValue({ name: "Matemática" }),
            } as any,
            {
                prepareProfile: jest
                    .fn()
                    .mockResolvedValue({ status: "READY_FOR_GENERATION" }),
            } as any,
        );

        await expect(
            service.generateStudyTool("user-1", "area-1", { type: "QUIZ" }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});
```

Este teste prova a regra mais importante: sem fontes, não há chamada útil à IA nem conteúdo inventado.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Output `201` de explicação com `sourcesJson`.
- Output `201` de flashcards com `cards`.
- Output `201` de quiz validado com 4 opções por pergunta.
- Output `422 NO_PROCESSABLE_SOURCES`.
- Output `502` para quiz inválido via stub.
- Screenshot da página com os três modos.
- Nota explícita no PR: adaptação avançada ao ritmo/dificuldades passa para BK-MF1-01.

## Handoff para BK-MF1-01

- BK-MF1-01 pode reutilizar `AiArtifact`, `StudyEvent`, `type`, `StudyToolsService` e `GovernedAiExecutionService` para adaptar ritmo/dificuldades.
- Este BK não cria métricas avançadas de aprendizagem. Se for necessário feedback detalhado, MF1 deve definir o contrato antes de persistir novas métricas.
- O `AiProvider` herdado pela MF1 mantém `generateSummary` e `generateStudyTool`; novos métodos devem ser acrescentados de forma acumulada.

## Changelog

- `2026-05-24`: guia refinado para explicações, cards e quizzes com fontes, validador e handoff para MF1.
- `2026-05-25`: escopo IA MF0 reforçado: apenas fontes processáveis; PDF/DOCX sem texto extraído bloqueia; RAG/indexação completa fica para fases posteriores.
- `2026-05-25`: reutilização de `AiArtifact` alinhada com schema MongoDB/Mongoose.
