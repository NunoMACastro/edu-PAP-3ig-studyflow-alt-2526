# BK-MF0-05 - O aluno pode criar rotinas e objetivos de estudo.

## Header

- `doc_id`: `GUIA-BK-MF0-05`
- `bk_id`: `BK-MF0-05`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-06`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md`
- `last_updated`: `2026-06-01`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno crie rotinas e objetivos de estudo pessoais. Uma rotina representa uma repetição planeada, por exemplo estudar 30 minutos à segunda e quarta. Um objetivo representa uma meta, por exemplo concluir revisão de funções até uma data.

Este BK continua o modo individual definido no BK-MF0-04. As rotinas e objetivos pertencem ao aluno autenticado, não à turma. Mais tarde, notificações e alertas poderão usar estes dados, mas este BK só cria o contrato base.

Não existe mockup específico para esta funcionalidade. A UI deve ser simples, com formulário, lista e estados vazios, sem inventar gamificação, rankings ou regras de produtividade não documentadas.

## Porque é que isto é importante

- Dá utilidade prática imediata ao modo individual.
- Prepara o histórico do BK-MF0-06 e notificações futuras.
- Ensina modelação de dados simples com dono (`userId`).
- Reforça validação de datas e duração.
- Evita misturar rotinas pessoais com tarefas de turma.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil e acesso ao modo individual.
- Estado esperado depois do BK: aluno cria, lista, edita estado e remove rotinas/objetivos pessoais.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/study/schemas/study-routine.schema.ts`
    - `apps/api/src/modules/study/schemas/study-goal.schema.ts`
    - `apps/api/src/modules/study/routines.controller.ts`
    - `apps/api/src/modules/study/routines.service.ts`
    - `apps/api/src/modules/study/dto/create-routine.dto.ts`
    - `apps/api/src/modules/study/dto/create-goal.dto.ts`
    - `apps/web/src/pages/student/RoutinesPage.tsx`
    - `apps/web/src/components/study/RoutineForm.tsx`
    - `apps/web/src/components/study/GoalForm.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, `docs/RF.md`.
- Dependências de BK anteriores: perfil do BK-MF0-03 e dashboard individual do BK-MF0-04 quando disponível.
- Impacto na arquitetura: expande domínio `study`.
- Impacto em frontend: cria CRUD simples com estados loading/error/empty/success.
- Impacto em backend: endpoints derivados `GET/POST/PATCH/DELETE /api/study/routines` e `GET/POST/PATCH/DELETE /api/study/goals`.
- Impacto em dados: cria `StudyRoutine` e `StudyGoal`.
- Impacto em segurança: cada registo pertence ao aluno autenticado.
- Impacto em testes: valida datas, duração e ownership.
- Handoff: BK-MF0-06 usa rotinas/objetivos como eventos no histórico.

## O que não entra (scope-out)

- Notificações automáticas, que pertencem a BKs futuros.
- Calendário avançado, ICS ou integração externa.
- Métricas de progresso de turma.
- Recomendações de IA para criar rotinas.
- Regras de gamificação, streaks ou pontuação não documentadas.

## Como saber que isto ficou bem

- Aluno cria rotina com título, frequência simples e duração.
- Aluno cria objetivo com título e data alvo opcional.
- Aluno só vê as suas rotinas e objetivos.
- Dados inválidos são rejeitados com erro claro.
- Dashboard individual consegue mostrar contadores de rotinas/objetivos.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Natalia` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: aluno autenticado e perfil criado (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-ROUTINES-GOALS`
- Fonte de verdade: `docs/RF.md`, `RF05` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-05` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Rotinas e objetivos pessoais de estudo (CANONICO)
- `rf_rnf`: `RF05` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelos `StudyRoutine` e `StudyGoal`.
- Criar DTOs de criação/edição.
- Criar endpoints protegidos.
- Criar página de rotinas e objetivos.
- Validar datas, duração e ownership.
- Atualizar contadores do dashboard individual.
- Preparar eventos para histórico.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF05 e RF48.
- `docs/RNF.md`: RNF03, RNF06, RNF42, RNF43.
- BK-MF0-03: perfil do aluno.
- BK-MF0-04: dashboard individual.
- `PLANO-SPRINTS.md`: testes P1 e negativos mínimos.

## Glossário (rápido) (DERIVADO):

- **Rotina**: plano repetível de estudo.
- **Objetivo**: meta de estudo a alcançar.
- **CRUD**: criar, ler, atualizar e apagar.
- **Ownership**: registo pertence a um utilizador.
- **Validação de data**: garantir formato e coerência temporal.
- **Estado vazio**: ecrã quando ainda não há rotinas.
- **Soft delete**: marcar como inativo em vez de apagar fisicamente, se a equipa decidir manter histórico.

## Conceitos teóricos essenciais (DERIVADO):

**CRUD com ownership.** Rotinas e objetivos são dados pessoais. Todas as queries devem usar `userId` da sessão para impedir que um aluno aceda a registos de outro.

**Datas e localização.** O RNF43 exige datas no formato `dd/mm/aaaa` na interface. Internamente, a API pode guardar ISO date, mas a UI deve apresentar datas em PT-PT.

**Validação backend.** A UI pode impedir duração negativa, mas o backend também tem de validar. Isto evita que pedidos diretos à API criem dados impossíveis.

**Soft delete vs hard delete.** Para histórico futuro, faz sentido marcar uma rotina como `archived` em vez de apagar. Esta decisão preserva histórico e evita perder dados que podem ser úteis nos BKs de acompanhamento.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-04 com dashboard individual.
- Não existem turmas neste fluxo; não usar `classId`.

### Passo 1 - Criar schemas

1. Explicação simples do objetivo.

    Neste passo vais criar schemas. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/schemas/study-routine.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoutineDocument = HydratedDocument<StudyRoutine>;

@Schema({ timestamps: true, collection: "study_routines" })
export class StudyRoutine {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, enum: ["daily", "weekly"] })
    frequency!: "daily" | "weekly";

    @Prop({ required: true, min: 1, max: 480 })
    targetMinutes!: number;

    // Arquivar preserva histórico futuro sem apagar definitivamente.
    @Prop({ default: true })
    active!: boolean;
}

export const StudyRoutineSchema = SchemaFactory.createForClass(StudyRoutine);
```

- CRIAR: `apps/api/src/modules/study/schemas/study-goal.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyGoalDocument = HydratedDocument<StudyGoal>;

@Schema({ timestamps: true, collection: "study_goals" })
export class StudyGoal {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, min: 1 })
    targetValue!: number;

    @Prop({ required: true, enum: ["minutes", "sessions", "materials"] })
    metric!: "minutes" | "sessions" | "materials";

    @Prop({ default: false })
    completed!: boolean;
}

export const StudyGoalSchema = SchemaFactory.createForClass(StudyGoal);
```

5. Explicação do código.

Os dois schemas têm `userId`, garantindo ownership. `active` e `completed` evitam apagar dados necessários ao histórico.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTOs

1. Explicação simples do objetivo.

    Neste passo vais criar DTOs. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/dto/create-routine.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export class CreateRoutineDto {
    title!: string;
    frequency!: "daily" | "weekly";
    targetMinutes!: number;
}
```

- CRIAR: `apps/api/src/modules/study/dto/create-goal.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

```ts
export class CreateGoalDto {
    title!: string;
    targetValue!: number;
    metric!: "minutes" | "sessions" | "materials";
}
```

5. Explicação do código.

Os DTOs não têm `userId`; o dono vem sempre da sessão.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/routines.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { CreateRoutineDto } from "./dto/create-routine.dto";
import { StudyGoal, StudyGoalDocument } from "./schemas/study-goal.schema";
import {
    StudyRoutine,
    StudyRoutineDocument,
} from "./schemas/study-routine.schema";

@Injectable()
export class RoutinesService {
    constructor(
        @InjectModel(StudyRoutine.name)
        private readonly routineModel: Model<StudyRoutineDocument>,
        @InjectModel(StudyGoal.name)
        private readonly goalModel: Model<StudyGoalDocument>,
    ) {}

    async listMyRoutines(userId: string) {
        return this.routineModel
            .find({ userId: new Types.ObjectId(userId), active: true })
            .sort({ createdAt: -1 })
            .lean();
    }

    async createRoutine(userId: string, input: CreateRoutineDto) {
        this.assertRoutine(input);
        return this.routineModel.create({
            ...input,
            title: input.title.trim(),
            userId: new Types.ObjectId(userId),
        });
    }

    async archiveRoutine(userId: string, routineId: string) {
        const updated = await this.routineModel
            .findOneAndUpdate(
                { _id: routineId, userId: new Types.ObjectId(userId) },
                { $set: { active: false } },
                { new: true },
            )
            .lean();
        if (!updated)
            throw new NotFoundException({
                code: "ROUTINE_NOT_FOUND",
                message: "Rotina não encontrada.",
            });
        return updated;
    }

    async listMyGoals(userId: string) {
        return this.goalModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean();
    }

    async createGoal(userId: string, input: CreateGoalDto) {
        this.assertGoal(input);
        return this.goalModel.create({
            ...input,
            title: input.title.trim(),
            userId: new Types.ObjectId(userId),
        });
    }

    private assertRoutine(input: CreateRoutineDto): void {
        if (!input.title?.trim())
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });
        if (!["daily", "weekly"].includes(input.frequency))
            throw new BadRequestException({
                code: "INVALID_FREQUENCY",
                message: "Escolhe uma frequência válida.",
            });
        if (!Number.isInteger(input.targetMinutes) || input.targetMinutes < 1)
            throw new BadRequestException({
                code: "INVALID_DURATION",
                message: "A duração deve ser positiva.",
            });
    }

    private assertGoal(input: CreateGoalDto): void {
        if (!input.title?.trim())
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });
        if (!Number.isInteger(input.targetValue) || input.targetValue < 1)
            throw new BadRequestException({
                code: "INVALID_TARGET",
                message: "O objetivo deve ser positivo.",
            });
        if (!["minutes", "sessions", "materials"].includes(input.metric))
            throw new BadRequestException({
                code: "INVALID_METRIC",
                message: "Escolhe uma métrica válida.",
            });
    }
}
```

5. Explicação do código.

O service valida dados e filtra sempre por `userId`. Ao arquivar uma rotina de outro aluno, a query não encontra o documento e devolve `404`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/routines.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { CreateRoutineDto } from "./dto/create-routine.dto";
import { RoutinesService } from "./routines.service";

@Controller("api/study")
@UseGuards(SessionGuard)
export class RoutinesController {
    constructor(private readonly routinesService: RoutinesService) {}

    @Get("routines")
    listRoutines(@Req() request: AuthenticatedRequest) {
        return this.routinesService.listMyRoutines(request.user!.id);
    }

    @Post("routines")
    createRoutine(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateRoutineDto,
    ) {
        return this.routinesService.createRoutine(request.user!.id, body);
    }

    @Delete("routines/:id")
    archiveRoutine(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
    ) {
        return this.routinesService.archiveRoutine(request.user!.id, id);
    }

    @Get("goals")
    listGoals(@Req() request: AuthenticatedRequest) {
        return this.routinesService.listMyGoals(request.user!.id);
    }

    @Post("goals")
    createGoal(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateGoalDto,
    ) {
        return this.routinesService.createGoal(request.user!.id, body);
    }
}
```

5. Explicação do código.

O controller expõe CRUD mínimo sem permitir escolher o dono dos dados.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Editar cliente API

1. Explicação simples do objetivo.

    Neste passo vais editar cliente API. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type StudyRoutine = {
    _id: string;
    title: string;
    frequency: "daily" | "weekly";
    targetMinutes: number;
    active: boolean;
};

export async function listRoutines(): Promise<StudyRoutine[]> {
    const response = await fetch("/api/study/routines", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar rotinas.");
    return (await response.json()) as StudyRoutine[];
}

export async function createRoutine(
    payload: Omit<StudyRoutine, "_id" | "active">,
): Promise<StudyRoutine> {
    const response = await fetch("/api/study/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível criar rotina.");
    return data as StudyRoutine;
}
```

5. Explicação do código.

Estas funções mantêm a UI pequena e impedem que componentes montem URLs manualmente.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar página de rotinas

1. Explicação simples do objetivo.

    Neste passo vais criar página de rotinas. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/RoutinesPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { FormEvent, useEffect, useState } from "react";
import { createRoutine, listRoutines, StudyRoutine } from "../../lib/apiClient";

export function RoutinesPage() {
    const [routines, setRoutines] = useState<StudyRoutine[]>([]);
    const [title, setTitle] = useState("");
    const [targetMinutes, setTargetMinutes] = useState(30);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listRoutines()
            .then(setRoutines)
            .catch((err) => setError(err.message));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        try {
            const created = await createRoutine({
                title,
                frequency: "weekly",
                targetMinutes,
            });
            setRoutines((current) => [created, ...current]);
            setTitle("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao criar rotina.",
            );
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Rotinas e objetivos</h1>
            <form className="mt-6 flex gap-3" onSubmit={handleSubmit}>
                <input
                    className="flex-1 rounded border px-3 py-2"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex.: Rever Matemática"
                    required
                    value={title}
                />
                <input
                    className="w-28 rounded border px-3 py-2"
                    min={1}
                    onChange={(event) =>
                        setTargetMinutes(Number(event.target.value))
                    }
                    type="number"
                    value={targetMinutes}
                />
                <button
                    className="rounded bg-slate-900 px-4 py-2 text-white"
                    type="submit"
                >
                    Guardar
                </button>
            </form>
            {error && (
                <p className="mt-4 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}
            <ul className="mt-6 space-y-3">
                {routines.map((routine) => (
                    <li
                        className="rounded border bg-white p-4"
                        key={routine._id}
                    >
                        <strong>{routine.title}</strong>
                        <p>
                            {routine.targetMinutes} min ·{" "}
                            {routine.frequency === "weekly"
                                ? "semanal"
                                : "diária"}
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
```

5. Explicação do código.

A UI cobre criação e listagem. A edição avançada pode ser adicionada sem mudar o contrato de ownership.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schemas Mongoose de rotina e objetivo.
    - API protegida.
    - Página de rotinas.
- Verificações:
    - Criação válida responde `201`.
    - Duração inválida responde `400`.
- Qualidade:
    - DTOs limitam campos aceites.
    - UI mostra loading/error/success.
- Continuidade:
    - BK-MF0-06 consegue listar eventos derivados de rotinas/objetivos.
- Evidência:
    - PR inclui smoke e 2 negativos.

## Validação final

### Requests e responses esperados

- `POST /api/study/routines -> 201` com rotina criada.
- `GET /api/study/routines -> 200` com lista do aluno autenticado.
- `POST /api/study/goals -> 201` com objetivo criado.
- `400 INVALID_DURATION` se `targetMinutes <= 0`.
- `401 UNAUTHENTICATED` sem sessão.
- `404 ROUTINE_NOT_FOUND` ao tentar arquivar rotina de outro aluno.

### Como validar o BK e cenários negativos

- Criar rotina `{ "title": "Matemática", "frequency": "weekly", "targetMinutes": 45 }`: esperado `201`.
- Criar rotina com `targetMinutes: 0`: esperado `400`.
- Enviar `userId` no body: esperado ignorar; o dono continua a ser `request.user.id`.
- Arquivar rotina de outro aluno: esperado `404`.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_PROVIDER_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, provider IA não configurado e JSON IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Output de criação de rotina e objetivo.
- Output negativo `400 INVALID_DURATION`.
- Output negativo de rotina alheia `404`.
- Screenshot da lista de rotinas.

## Handoff para BK-MF0-06

- Ao criar/arquivar rotinas, BK-MF0-06 poderá registar eventos `ROUTINE_CREATED` e `ROUTINE_ARCHIVED`.
- Não remover dados fisicamente facilita histórico.

## Changelog

- `2026-05-24`: guia refinado para rotinas e objetivos pessoais com CRUD, ownership e validação P1.
- `2026-05-25`: modelos de dados atualizados para schemas MongoDB/Mongoose.
- `2026-05-25`: adicionado código mínimo de `StudyGoalSchema` para tornar o passo de modelos totalmente executável.
