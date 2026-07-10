# BK-MF1-10 - Configurar voz da IA docente por turma, com override opcional por disciplina.

## Header
- `doc_id`: `GUIA-BK-MF1-10`
- `bk_id`: `BK-MF1-10`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-09`
- `rf_rnf`: `RF22`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-11`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md`
- `last_updated`: `2026-07-10`

## Objetivo
Implementar `RF22`: permitir que o professor configure a voz pedagógica base da IA para uma turma, mantendo override opcional por disciplina.

## Importância
A IA limitada do aluno não deve soar genérica. Deve respeitar o tom, nível de detalhe e regras definidos pelo professor, mas sem ignorar guardrails: a voz altera forma e pedagogia, não autoriza respostas sem fontes.

## Scope-in
- Criar `TeacherClassAiVoice` para voz base por turma.
- Manter `TeacherAiVoice` como override opcional por disciplina.
- Guardar tom, nível de detalhe e regras.
- Ter uma configuração base por turma e, quando necessário, uma configuração por disciplina.
- Expor `PUT` para criação/atualização e `DELETE` para remover override de disciplina.
- Disponibilizar leitura para a IA limitada.

## Scope-out
- Voz por aluno.
- Voz global da escola.
- Configuração de modelo externo.
- Permissão para responder sem materiais oficiais.

## Estado antes
- Existem disciplinas e materiais oficiais.
- O professor de desenvolvimento de `BK-MF1-07` consegue autenticar-se e gerir uma disciplina sua.
- Ainda não existe configuração docente de IA.

## Estado depois
- Professor configura voz base da IA numa turma sua.
- Professor pode configurar ou remover override de voz numa disciplina sua.
- A configuração pode ser atualizada com `PUT`.
- `BK-MF1-11` consegue aplicar a voz efetiva ao prompt.

## Pré-requisitos
- `BK-MF1-07` com `ClassesService.findOwnedClass`.
- `BK-MF1-08` com `SubjectsService.findOwnedSubject`.
- `SessionGuard`.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Disciplina criada por esse professor no `BK-MF1-08`.
- Validação global de DTOs.

## Glossário
- **Tom**: estilo de comunicação, por exemplo calmo ou direto.
- **Nível de detalhe**: profundidade esperada da explicação.
- **Regra pedagógica**: instrução curta definida pelo professor.

## Conceitos teóricos
**Voz da IA.** A voz define como a IA deve explicar: tom, nível de detalhe e regras pedagógicas. Ela não muda as permissões nem substitui os materiais oficiais.

**Tom.** `tone` controla o estilo geral da explicação. `CALM` pode ser mais paciente, `DIRECT` mais objetivo e `SOCRATIC` mais orientado por perguntas.

**Nível de detalhe.** `detailLevel` controla a extensão da resposta. `SHORT` pede síntese, `BALANCED` mantém equilíbrio e `DETAILED` pede explicação mais completa.

**Regras pedagógicas.** `rules` são instruções curtas do professor, como “usar exemplos do quotidiano” ou “não dar a resposta final sem explicar passos”. O backend remove regras vazias e limita a quantidade para manter o prompt controlado.

**Voz não é fonte.** Mesmo que o professor peça uma resposta detalhada, a IA continua limitada aos materiais oficiais `PROCESSED`. A voz muda forma; as fontes definem conteúdo.

**Herança da voz docente.** A turma define a voz base da IA docente. A disciplina pode ter override opcional. Em runtime, a voz efetiva segue a ordem `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.

**Validação com professor real.** Usa o professor de desenvolvimento criado no `BK-MF1-07` para configurar a voz. Isto confirma que a configuração pertence ao professor autenticado e que um aluno não consegue alterar a voz docente.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/teacher-ai/schemas/teacher-class-ai-voice.schema.ts`
- `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`
- `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`
- `apps/web/src/lib/api/teacherAiVoice.ts`
- `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`

Endpoints:
- `GET /api/teacher/classes/:classId/ai-voice`
- `PUT /api/teacher/classes/:classId/ai-voice`
- `DELETE /api/teacher/subjects/:subjectId/ai-voice`
- `PUT /api/teacher/subjects/:subjectId/ai-voice`
- `GET /api/teacher/subjects/:subjectId/ai-voice`

## Alteração extra-planificação - 2026-06-30

A decisão ativa para a app final está em `docs/planificacao/guias-bk/DECISAO-ARQUITETURA-VOZ-IA-DOCENTE.md`.

Este guia nasceu com snippets orientados a uma configuração única por disciplina. Esses snippets devem ser tratados como legado sempre que mostrarem apenas `subjectId` ou `findForSubject`. A implementação real deve usar:

- voz base da turma em `TeacherClassAiVoice`;
- override opcional de disciplina em `TeacherAiVoice`;
- resolvedor `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })`;
- metadata pública `scope`, `source`, `hasOverride`, `classId`, `subjectId?`, `teacherId?`, `tone`, `detailLevel` e `rules`;
- UI docente em `/app/professor/turmas/:classId/voz` para a voz base;
- UI docente em `/app/professor/disciplinas/:subjectId/voz` para override da disciplina.

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF1-08` com `SubjectsService.findOwnedSubject`.
- `SessionGuard`.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Disciplina criada por esse professor no `BK-MF1-08`.
- Validação global de DTOs.

### Passo 1 - Criar schema

1. Explicação simples do objetivo.

    Neste passo vais criar schema nos ficheiros `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TeacherAiVoiceDocument = HydratedDocument<TeacherAiVoice>;
export type TeacherAiTone = "CALM" | "DIRECT" | "SOCRATIC";
export type TeacherAiDetailLevel = "SHORT" | "BALANCED" | "DETAILED";

@Schema({ timestamps: true, collection: "teacher_ai_voices" })
export class TeacherAiVoice {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, unique: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"], default: "CALM" })
    tone!: TeacherAiTone;

    @Prop({ required: true, enum: ["SHORT", "BALANCED", "DETAILED"], default: "BALANCED" })
    detailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    rules!: string[];
}

export const TeacherAiVoiceSchema = SchemaFactory.createForClass(TeacherAiVoice);
TeacherAiVoiceSchema.index({ teacherId: 1, subjectId: 1 });
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTeacherAiVoiceDto {
    @IsIn(["CALM", "DIRECT", "SOCRATIC"])
    tone!: "CALM" | "DIRECT" | "SOCRATIC";

    @IsIn(["SHORT", "BALANCED", "DETAILED"])
    detailLevel!: "SHORT" | "BALANCED" | "DETAILED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(180, { each: true })
    rules?: string[];
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoice, TeacherAiVoiceDocument } from "./schemas/teacher-ai-voice.schema";

@Injectable()
export class TeacherAiVoiceService {
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async upsert(actor: AuthenticatedUser, subjectId: string, dto: UpdateTeacherAiVoiceDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const voice = await this.voiceModel.findOneAndUpdate(
            { subjectId: subject._id },
            {
                teacherId: new Types.ObjectId(actor.id),
                subjectId: subject._id,
                tone: dto.tone,
                detailLevel: dto.detailLevel,
                rules: this.cleanRules(dto.rules ?? []),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toView(voice);
    }

    async getForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const voice = await this.voiceModel.findOne({ subjectId: subject._id });
        return voice ? this.toView(voice) : this.defaultVoice(subject);
    }

    async resolveTeacherVoice(params: { classId: string; subjectId?: string }) {
        if (params.subjectId) {
            const subjectOverride = await this.voiceModel
                .findOne({ subjectId: new Types.ObjectId(params.subjectId) })
                .lean();
            if (subjectOverride) {
                return subjectOverride;
            }
        }

        return this.defaultVoiceForClass(params.classId);
    }

    private cleanRules(rules: string[]) {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, 8);
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem configurar a voz da IA.");
        }
    }

    private defaultVoice(subject: Subject) {
        return {
            id: "",
            subjectId: subject._id.toString(),
            teacherId: subject.teacherId.toString(),
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    private defaultVoiceForClass(classId: string) {
        return {
            id: "",
            classId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
            scope: "CLASS",
            source: "DEFAULT",
            hasOverride: false,
        };
    }

    private toView(voice: TeacherAiVoice | TeacherAiVoiceDocument) {
        return {
            id: voice._id.toString(),
            subjectId: voice.subjectId.toString(),
            teacherId: voice.teacherId.toString(),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules,
        };
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller com método PUT

1. Explicação simples do objetivo.

    Neste passo vais criar controller com método put nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Controller("api/teacher/subjects/:subjectId/ai-voice")
@UseGuards(SessionGuard)
export class TeacherAiVoiceController {
    constructor(private readonly teacherAiVoiceService: TeacherAiVoiceService) {}

    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: UpdateTeacherAiVoiceDto,
    ) {
        return this.teacherAiVoiceService.upsert(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.teacherAiVoiceService.getForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiVoice, TeacherAiVoiceSchema } from "./schemas/teacher-ai-voice.schema";
import { TeacherAiVoiceController } from "./teacher-ai-voice.controller";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: TeacherAiVoice.name, schema: TeacherAiVoiceSchema },
        ]),
    ],
    controllers: [TeacherAiVoiceController],
    providers: [TeacherAiVoiceService],
    exports: [TeacherAiVoiceService, MongooseModule],
})
export class TeacherAiModule {}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend com PUT

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend com put nos ficheiros `apps/web/src/lib/api/teacherAiVoice.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/teacherAiVoice.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/teacherAiVoice.ts
export type TeacherAiVoiceView = {
    id: string;
    subjectId: string;
    teacherId: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function updateTeacherAiVoice(
    subjectId: string,
    input: Pick<TeacherAiVoiceView, "tone" | "detailLevel" | "rules">,
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<TeacherAiVoiceView>(response);
}

export async function getTeacherAiVoice(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        credentials: "include",
    });

    return parseResponse<TeacherAiVoiceView>(response);
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do professor

1. Explicação simples do objetivo.

    Neste passo vais criar página do professor nos ficheiros `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/teacher/TeacherAiVoicePage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    TeacherAiVoiceView,
    getTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/api/teacherAiVoice";

type Props = {
    subjectId: string;
};

export function TeacherAiVoicePage({ subjectId }: Props) {
    const [voice, setVoice] = useState<TeacherAiVoiceView | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError("");
        getTeacherAiVoice(subjectId)
            .then(setVoice)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);
        const rules = String(form.get("rules") ?? "")
            .split("\n")
            .map((rule) => rule.trim())
            .filter(Boolean);

        try {
            const updated = await updateTeacherAiVoice(subjectId, {
                tone: String(form.get("tone") ?? "CALM") as TeacherAiVoiceView["tone"],
                detailLevel: String(form.get("detailLevel") ?? "BALANCED") as TeacherAiVoiceView["detailLevel"],
                rules,
            });
            setVoice(updated);
            setNotice("Voz da IA docente guardada.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar a voz.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Voz da IA docente</h1>
            {isLoading ? <p>A carregar voz da IA.</p> : null}
            {!isLoading && !voice ? <p>Ainda não existe voz personalizada para esta disciplina.</p> : null}
            <form key={voice?.id ?? "new-voice"} onSubmit={handleSubmit}>
                <select name="tone" defaultValue={voice?.tone ?? "CALM"}>
                    <option value="CALM">Calma</option>
                    <option value="DIRECT">Direta</option>
                    <option value="SOCRATIC">Socrática</option>
                </select>
                <select name="detailLevel" defaultValue={voice?.detailLevel ?? "BALANCED"}>
                    <option value="SHORT">Curta</option>
                    <option value="BALANCED">Equilibrada</option>
                    <option value="DETAILED">Detalhada</option>
                </select>
                <textarea name="rules" defaultValue={voice?.rules.join("\n") ?? ""} />
                <button type="submit" disabled={isSaving || isLoading}>
                    {isSaving ? "A guardar" : "Guardar voz"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
        </main>
    );
}
```

5. Explicação do código.

    Este passo pertence ao fluxo da voz docente: recebe sessão de professor, `classId` ou `subjectId` e regras textuais, devolve voz base de turma ou override de disciplina e normaliza listas antes de persistir. A página cobre carregamento, vazio inicial, sucesso de gravação e erro. As validações esperadas são `403` para aluno, `404` para turma ou disciplina fora do professor, remoção de override por `DELETE` e atualização idempotente por `PUT`. O resultado é consumido pelo `BK-MF1-11` para orientar a IA limitada da turma.

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

    - O frontend usa `PUT`, tal como o controller.
- Professor cria configuração na primeira gravação.
- Segunda gravação atualiza a mesma configuração.
- Regras vazias são removidas.
- Aluno recebe `403`.
- Professor sem ownership recebe `404`.
- Frontend mostra carregamento, vazio inicial, sucesso de gravação e erros da API.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Antes dos passos técnicos: inicia sessão com o professor de desenvolvimento criado no `BK-MF1-07`.
- Passos 1 e 2: confirmar schemas e DTO de voz docente com base por turma e override opcional por disciplina.
- Passos 3 e 4: validar `PUT` idempotente, normalização de regras, ownership da turma e ownership da disciplina.
- Passos 5 e 6: confirmar export de `TeacherAiVoiceService` para `BK-MF1-11` e cliente frontend alinhado com o controller.
- Passo 7: validar carregamento, vazio inicial, sucesso de gravação e erros da API.

## Cenários negativos específicos

- Aluno recebe `403`.
- Professor sem ownership da turma recebe `404`.
- Professor sem ownership da disciplina recebe `404`.
- Regras vazias são removidas antes de persistir.
- Segunda gravação atualiza o mesmo registo, sem duplicar configuração.
- Remover override da disciplina volta a herdar a voz base da turma.

## Expected results
- `PUT /api/teacher/classes/:classId/ai-voice` com professor dono devolve `200` e cria ou atualiza a voz base da turma.
- `PUT /api/teacher/subjects/:subjectId/ai-voice` com professor dono devolve `200` e cria ou atualiza uma única configuração.
- `DELETE /api/teacher/subjects/:subjectId/ai-voice` remove o override e a disciplina volta a herdar da turma.
- O professor de desenvolvimento criado no `BK-MF1-07` consegue configurar voz apenas numa turma/disciplina sua.
- Segundo `PUT` para a mesma turma ou disciplina atualiza o mesmo registo, sem duplicar.
- Regras vazias são removidas antes de persistir.
- Aluno autenticado devolve `403`.
- Professor sem ownership da turma/disciplina devolve `404`.
- Frontend mostra carregamento, vazio inicial, sucesso de gravação e erros da API.

## Critérios de aceite
- Uma configuração base por turma.
- Override opcional por disciplina.
- `teacherId` vem da sessão.
- Cliente e controller usam `PUT`.
- `TeacherAiModule` exporta `TeacherAiVoiceService`.
- `TeacherAiVoiceService` resolve `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.
- Regras são normalizadas antes de gravar.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Confirma no diff que não existe chamada `POST` para a rota de atualização de voz e que existe `DELETE` para remover override da disciplina.

## Evidence para PR/defesa
- Prova de login local com o professor criado no `BK-MF1-07`.
- Screenshot da voz base da turma guardada.
- Screenshot do override de disciplina guardado e removido.
- Segundo pedido `PUT` a atualizar a mesma configuração.
- Resposta `403` para aluno.
- Demonstração de regras vazias removidas.

## Handoff
`BK-MF1-11` deve ler `TeacherAiVoiceService.resolveTeacherVoice({ classId, subjectId })` e usar tom, nível de detalhe e regras efetivas no prompt da IA limitada, validando com a turma e a disciplina criadas pelo professor de desenvolvimento.

## Changelog
- 2026-06-30: Documentada alteração extra-planificação para voz base por turma com override opcional por disciplina.
- 2026-05-31: Pré-requisitos e validação alinhados com a seed local de professor criada no BK-MF1-07.
- 2026-05-30: Guia reescrito com endpoint `PUT`, sanitização de regras e módulo exportado.
