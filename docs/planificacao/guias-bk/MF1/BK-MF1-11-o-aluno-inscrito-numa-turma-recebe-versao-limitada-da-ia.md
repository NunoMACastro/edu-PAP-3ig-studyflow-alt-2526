# BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.

## Header
- `doc_id`: `GUIA-BK-MF1-11`
- `bk_id`: `BK-MF1-11`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF23`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-12`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `last_updated`: `2026-05-31`

## Objetivo
Implementar `RF23`: permitir que um aluno inscrito numa turma use uma IA limitada aos materiais oficiais da disciplina.

## Importância
Este é um dos pontos de maior risco da MF1. A IA não pode misturar disciplinas, turmas ou alunos. A resposta tem de usar apenas materiais oficiais `PROCESSED` e deve aplicar a voz docente sem ultrapassar as fontes.

## Alteração extra-planificação - 2026-06-30

A voz docente usada por este BK deve ser a voz efetiva resolvida por `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`, seguindo `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.

Snippets antigos deste guia que chamem `findForSubject` devem ser tratados como legado e substituídos pelo resolvedor quando implementados em `real_dev`.

## Scope-in
- Criar interação de IA por disciplina.
- Confirmar inscrição do aluno na turma da disciplina.
- Usar apenas materiais oficiais processados.
- Aplicar voz docente.
- Guardar pergunta, resposta e fontes usadas.

## Scope-out
- Chat em tempo real.
- Materiais privados do aluno.
- Conhecimento externo sem fonte oficial.
- IA para aluno não inscrito.

## Estado antes
- Existem turmas com `studentIds`.
- Existem disciplinas.
- Existem materiais oficiais e voz docente.
- O aluno de desenvolvimento de `BK-MF1-07` pode estar inscrito numa turma criada pelo professor de desenvolvimento.

## Estado depois
- Aluno inscrito pergunta sobre uma disciplina.
- API responde com fontes oficiais.
- API devolve `422` se não houver material oficial processado.
- Interação fica registada.

## Pré-requisitos
- `BK-MF1-07` com aluno inscrito em `SchoolClass.studentIds`.
- Professor e aluno de desenvolvimento criados pela seed local de `BK-MF1-07`.
- `BK-MF1-08` com `SubjectsService.findSubjectForStudent`.
- `BK-MF1-09` com `OfficialMaterialsService.findProcessedBySubject`.
- `BK-MF1-10` com `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- `AiModule` final da MF0 com `AI_PROVIDER` exportado e `AiAreaProfileService`, `SummariesService` e `StudyToolsService` preservados.

## Glossário
- **IA limitada**: IA que responde apenas com fontes oficiais da disciplina.
- **Fonte oficial processada**: material `TEXT` submetido pelo professor e marcado como `PROCESSED`.
- **Interação**: pergunta e resposta guardadas para histórico e defesa.

## Conceitos teóricos
**IA limitada da disciplina.** Esta IA pertence ao contexto oficial professor-turma-disciplina. O aluno só a usa se estiver inscrito na turma da disciplina, e a resposta só pode usar materiais oficiais processados.

**De onde vem a inscrição.** A inscrição vem de `SchoolClass.studentIds`, preenchido no `BK-MF1-07` quando o professor adiciona um aluno por email. O aluno não envia esta lista; o backend consulta a turma associada à disciplina.

**Validação com aluno real.** Usa o aluno de desenvolvimento criado no `BK-MF1-07` depois de o professor o associar à turma. Assim, a IA limitada é testada com cookie HttpOnly, `role` `STUDENT` e inscrição persistida, não com IDs enviados livremente pelo browser.

**Percurso da pergunta.** O aluno escreve a pergunta no frontend. O controller recebe `subjectId` pela rota e `question` no body. O service encontra a disciplina, confirma que o aluno pertence à turma, recolhe materiais oficiais processados, aplica a voz docente, chama a IA e guarda a interação.

**Materiais oficiais processados.** Só materiais `OfficialMaterial` com `status: "PROCESSED"` entram no prompt. Materiais `REFERENCE_ONLY` aparecem como referência para humanos, mas não são base factual para resposta.

**Voz docente.** `TeacherAiVoice` entra no prompt para controlar tom, detalhe e regras pedagógicas. Ela não permite responder fora das fontes.

**Duas proteções.** A primeira proteção é programática: validar inscrição e fontes antes da IA. A segunda é textual: o prompt instrui a IA a responder apenas com as fontes fornecidas. Se uma das duas falhar, o risco de fuga ou invenção aumenta.

**Contrato de IA herdado.** Este BK importa o `AiModule` final em vez de redefinir `AI_PROVIDER` ou `OpenAiProvider`. A cadeia docente usa o mesmo contrato de IA fechado na MF0/MF1: provider exportado uma vez, services específicos em módulos próprios e sem duplicação de lógica de chamada à IA.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts`
- `apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`
- `apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.controller.ts`
- `apps/api/src/modules/class-ai/class-ai.module.ts`
- `apps/web/src/lib/api/classAi.ts`
- `apps/web/src/pages/student/StudentClassAiPage.tsx`

Endpoint:
- `POST /api/student/subjects/:subjectId/ai/answers`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF1-07` com aluno inscrito em `SchoolClass.studentIds`.
- Professor e aluno de desenvolvimento criados pela seed local de `BK-MF1-07`.
- `BK-MF1-08` com `SubjectsService.findSubjectForStudent`.
- `BK-MF1-09` com `OfficialMaterialsService.findProcessedBySubject`.
- `BK-MF1-10` com `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- `AiModule` final da MF0 com `AI_PROVIDER` exportado e services de IA da MF0 preservados.

### Passo 1 - Criar schema da interação

1. Explicação simples do objetivo.

    Neste passo vais criar schema da interação nos ficheiros `apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type ClassAiInteractionDocument = HydratedDocument<ClassAiInteraction>;

@Schema({ timestamps: true, collection: "class_ai_interactions" })
export class ClassAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 800 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;
}

export const ClassAiInteractionSchema = SchemaFactory.createForClass(ClassAiInteraction);
ClassAiInteractionSchema.index({ studentId: 1, subjectId: 1, createdAt: -1 });
```

5. Explicação do código.

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskClassAiDto {
    @IsString()
    @MinLength(10)
    @MaxLength(800)
    question!: string;
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar prompt

1. Explicação simples do objetivo.

    Neste passo vais criar prompt nos ficheiros `apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts
import { OfficialMaterialDocument } from "../../official-materials/schemas/official-material.schema";
import { TeacherAiVoiceDocument } from "../../teacher-ai/schemas/teacher-ai-voice.schema";

type BuildClassAiPromptInput = {
    question: string;
    materials: OfficialMaterialDocument[];
    voice: TeacherAiVoiceDocument | null;
};

export function buildClassAiPrompt(input: BuildClassAiPromptInput) {
    const tone = input.voice?.tone ?? "CALM";
    const detailLevel = input.voice?.detailLevel ?? "BALANCED";
    const rules = input.voice?.rules ?? [];
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.textContent ?? ""}`;
        })
        .join("\n\n");

    return [
        "Responde apenas com base nas fontes oficiais fornecidas.",
        "Se a pergunta não estiver coberta pelas fontes, diz que a disciplina ainda não tem material oficial suficiente.",
        `Tom docente: ${tone}.`,
        `Nível de detalhe: ${detailLevel}.`,
        rules.length > 0 ? `Regras do professor: ${rules.join(" | ")}` : "Sem regras adicionais do professor.",
        `Pergunta do aluno: ${input.question}`,
        sources,
        "Devolve JSON com as chaves answer e sourceMaterialIds.",
    ].join("\n\n");
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/class-ai/class-ai.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/class-ai.service.ts
import {
    ForbiddenException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";
import { buildClassAiPrompt } from "./prompts/class-ai.prompt";
import {
    ClassAiInteraction,
    ClassAiInteractionDocument,
} from "./schemas/class-ai-interaction.schema";

@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly teacherAiVoiceService: TeacherAiVoiceService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async answer(actor: AuthenticatedUser, subjectId: string, dto: AskClassAiDto) {
        this.assertStudent(actor);

        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta disciplina ainda não tem materiais oficiais processados.",
            );
        }

        const voice = await this.teacherAiVoiceService.resolveTeacherVoice({
            classId: subject.classId.toString(),
            subjectId: subject._id.toString(),
        });
        const prompt = buildClassAiPrompt({
            question: dto.question.trim(),
            materials,
            voice,
        });

        let result: Record<string, unknown>;
        try {
            result = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const { answer, sources } = this.normalizeAiResult(result, materials);

        const interaction = await this.interactionModel.create({
            studentId: new Types.ObjectId(actor.id),
            classId: subject.classId,
            subjectId: subject._id,
            question: dto.question.trim(),
            answer,
            sources,
        });

        return {
            id: interaction._id.toString(),
            answer: interaction.answer,
            sources: interaction.sources,
        };
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos inscritos podem usar a IA da disciplina.");
        }
    }

    private normalizeAiResult(result: Record<string, unknown>, materials: Array<{ _id: Types.ObjectId; title: string }>) {
        const answer = typeof result.answer === "string" ? result.answer.trim() : "";
        if (!answer) {
            throw new ServiceUnavailableException("A IA devolveu uma resposta inválida.");
        }

        const allowedSources = new Map(
            materials.map((material) => [
                material._id.toString(),
                { materialId: material._id.toString(), title: material.title },
            ]),
        );
        const rawSourceIds = Array.isArray(result.sourceMaterialIds)
            ? result.sourceMaterialIds
            : [];
        const sources = rawSourceIds
            .filter((sourceId): sourceId is string => typeof sourceId === "string")
            .map((sourceId) => allowedSources.get(sourceId))
            .filter((source): source is { materialId: string; title: string } => Boolean(source));

        if (sources.length === 0) {
            throw new ServiceUnavailableException("A IA devolveu fontes inválidas.");
        }

        return { answer, sources };
    }
}
```

5. Explicação do código.

    O service valida a cadeia docente inteira antes de chamar IA: `SubjectsService.findSubjectForStudent` confirma inscrição, `OfficialMaterialsService.findProcessedBySubject` limita fontes a materiais oficiais processados e `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })` aplica a voz efetiva do professor. A resposta do provider é runtime não confiável: `answer` tem de ser não vazio e `sourceMaterialIds` têm de pertencer aos materiais autorizados. Sem fontes há `422`; falha ou resposta inválida do provider devolve `503`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/class-ai/class-ai.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/class-ai.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/class-ai.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassAiService } from "./class-ai.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";

@Controller("api/student/subjects/:subjectId/ai/answers")
@UseGuards(SessionGuard)
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    answer(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: AskClassAiDto,
    ) {
        return this.classAiService.answer(request.user as AuthenticatedUser, subjectId, dto);
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/class-ai/class-ai.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios. Este módulo consome `AiModule`; não declares outro provider de IA dentro de `ClassAiModule`.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-ai/class-ai.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-ai/class-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module";
import { ClassAiController } from "./class-ai.controller";
import { ClassAiService } from "./class-ai.service";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "./schemas/class-ai-interaction.schema";

@Module({
    imports: [
        AiModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
        ]),
    ],
    controllers: [ClassAiController],
    providers: [ClassAiService],
})
export class ClassAiModule {}
```

5. Explicação do código.

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`. O import de `AiModule` é a fronteira correta: `ClassAiService` injeta `AI_PROVIDER`, mas o provider continua definido no módulo de IA, sem duplicação.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar cliente e página

1. Explicação simples do objetivo.

    Neste passo vais criar cliente e página nos ficheiros `apps/web/src/lib/api/classAi.ts`, `apps/web/src/pages/student/StudentClassAiPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/classAi.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/web/src/pages/student/StudentClassAiPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/classAi.ts
export type ClassAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
};

export async function askClassAi(subjectId: string, question: string) {
    const response = await fetch(`/api/student/subjects/${subjectId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<ClassAiAnswer>;
}
```

```tsx
// apps/web/src/pages/student/StudentClassAiPage.tsx
import { FormEvent, useState } from "react";
import { ClassAiAnswer, askClassAi } from "../../lib/api/classAi";

type Props = {
    subjectId: string;
};

export function StudentClassAiPage({ subjectId }: Props) {
    const [answer, setAnswer] = useState<ClassAiAnswer | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            setAnswer(await askClassAi(subjectId, String(form.get("question") ?? "")));
            setNotice("Resposta gerada com materiais oficiais.");
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível obter resposta.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>IA da disciplina</h1>
            <form onSubmit={handleSubmit}>
                <textarea name="question" minLength={10} required />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "A responder" : "Perguntar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {!isLoading && !answer ? <p>Ainda não há resposta gerada nesta sessão.</p> : null}
            {answer ? (
                <section>
                    <p>{answer.answer}</p>
                    <h2>Fontes usadas</h2>
                    <ul>
                        {answer.sources.map((source) => (
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

    Este passo pertence ao fluxo da IA limitada da turma: recebe sessão de aluno, `subjectId`, pergunta e fontes oficiais, devolve resposta com fontes autorizadas e grava a interação com `studentId`, `classId` e `subjectId`. A página mostra vazio inicial, carregamento, sucesso e erro. As validações esperadas são inscrição via turma, `422` sem materiais processados e `503` para provider inválido. O resultado fecha a cadeia `BK-MF1-08` a `BK-MF1-11`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Validar comportamento

1. Explicação simples do objetivo.

    Neste passo vais validar comportamento no fluxo de validação do BK. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- VALIDAR: este passo não cria ficheiros novos.
- LOCALIZAÇÃO: executa os cenários indicados neste passo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

Não há código novo neste passo. Usa-o para confirmar que os passos anteriores funcionam em conjunto.

5. Explicação do código.

    - Aluno inscrito recebe resposta com fontes.
- Aluno não inscrito recebe `403`.
- Professor recebe `403`.
- Disciplina sem materiais `PROCESSED` devolve `422`.
- Provider sem `answer` não vazio ou sem fontes oficiais autorizadas devolve `503`.
- A resposta guarda interação com `studentId`, `classId` e `subjectId`.
- A IA não usa materiais `REFERENCE_ONLY`.
- Frontend mostra vazio inicial, carregamento, sucesso da resposta e erro da API.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Antes dos passos técnicos: garante que o aluno de desenvolvimento criado no `BK-MF1-07` está inscrito na turma da disciplina.
- Passos 1 e 2: confirmar schema e DTO de interação da IA limitada ligados a aluno, turma e disciplina.
- Passos 3 e 4: validar inscrição do aluno antes de consultar materiais oficiais ou chamar IA.
- Passos 5 e 6: confirmar uso de materiais `PROCESSED`, voz docente e provider isolado com validação runtime.
- Passo 7: validar vazio inicial, carregamento, sucesso da resposta e erro da API.

## Cenários negativos específicos

- Aluno não inscrito ou professor recebe `403`.
- Disciplina sem materiais oficiais `PROCESSED` devolve `422`.
- Provider indisponível, resposta vazia ou fontes não autorizadas devolvem `503`.
- Materiais `REFERENCE_ONLY` não entram no prompt.

## Expected results
- `POST /api/student/subjects/:subjectId/ai/answers` por aluno inscrito devolve `201` com `answer` não vazio e fontes oficiais autorizadas.
- O aluno de desenvolvimento criado no `BK-MF1-07`, quando inscrito, consegue usar a IA limitada da disciplina.
- Aluno não inscrito ou professor devolve `403`.
- Disciplina sem materiais oficiais `PROCESSED` devolve `422` e não chama a IA.
- Provider indisponível, resposta vazia ou fontes não autorizadas devolvem `503` e não persistem interação.
- A interação gravada contém `studentId`, `classId`, `subjectId`, pergunta, resposta e fontes oficiais usadas.
- Frontend mostra vazio inicial, carregamento, sucesso da resposta e erro da API.

## Critérios de aceite
- Inscrição é validada via `SchoolClass.studentIds`.
- Fontes oficiais vêm de `OfficialMaterialsService`.
- Voz docente vem de `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`.
- Sem materiais processados há `422`.
- Resultado do provider é validado em runtime antes de persistir.
- Resposta mostra fontes usadas.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Inclui testes de acesso cruzado entre turmas.

## Evidence para PR/defesa
- Prova de login local com o aluno criado no `BK-MF1-07`.
- Pergunta de aluno inscrito com fontes visíveis.
- Resposta `422` sem material processado.
- Resposta `403` para aluno não inscrito.
- Registo de `ClassAiInteraction`.

## Handoff
`BK-MF1-12` usa a mesma inscrição por `studentIds` e o mesmo aluno de desenvolvimento para proteger leitura de publicações por alunos.

## Changelog
- 2026-05-31: Pré-requisitos e validação alinhados com a seed local de professor/aluno criada no BK-MF1-07.
- 2026-05-30: Guia reescrito para depender de inscrição real, materiais oficiais processados e voz docente.
