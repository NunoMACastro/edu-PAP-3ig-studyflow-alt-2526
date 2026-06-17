# BK-MF0-07 - Criar “Áreas de Estudo” (auto-disciplina independente).

## Header

- `doc_id`: `GUIA-BK-MF0-07`
- `bk_id`: `BK-MF0-07`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF07`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-08`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md`
- `last_updated`: `2026-06-01`

## O que vamos fazer neste BK

Neste BK vamos criar as Áreas de Estudo pessoais do aluno. Uma área é uma auto-disciplina independente, por exemplo `Matemática A`, `Português` ou `Projeto PAP`, criada pelo aluno para organizar materiais, preferências e interações futuras com IA.

Este BK corrige uma decisão importante: áreas de estudo não são turmas nem disciplinas oficiais de professor. São contexto privado do aluno e devem ficar isoladas dos módulos de turma que só surgem depois.

O mockup não tem ecrã de áreas. A UI deve ser simples e extensível: lista de áreas, formulário de criação, página de detalhe e estado vazio. O design final pode evoluir sem mudar o contrato.

## Porque é que isto é importante

- Desbloqueia submissão de materiais do BK-MF0-08.
- Cria o contexto do perfil de IA no BK-MF0-10.
- Separa estudo individual de turmas oficiais.
- Ajuda a manter materiais e respostas da IA organizados por tema.
- Prepara isolamento de dados, essencial para segurança e privacidade.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil.
- Estado esperado depois do BK: aluno cria, lista, edita e arquiva áreas de estudo próprias.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/study-areas/schemas/study-area.schema.ts`
    - `apps/api/src/modules/study-areas/study-areas.controller.ts`
    - `apps/api/src/modules/study-areas/study-areas.service.ts`
    - `apps/api/src/modules/study-areas/dto/create-study-area.dto.ts`
    - `apps/api/src/modules/study-areas/dto/update-study-area.dto.ts`
    - `apps/web/src/pages/student/StudyAreasPage.tsx`
    - `apps/web/src/pages/student/StudyAreaDetailPage.tsx`
    - `apps/web/src/components/study/StudyAreaForm.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, BK-MF0-06.
- Dependências de BK anteriores: perfil do BK-MF0-03; dashboard do BK-MF0-04 se já implementado.
- Impacto na arquitetura: cria domínio `study-areas`.
- Impacto em frontend: lista e detalhe de áreas.
- Impacto em backend: endpoints derivados `GET/POST/PATCH /api/study-areas`.
- Impacto em dados: cria `StudyArea` com dono `userId`.
- Impacto em segurança: cada área é privada do aluno.
- Impacto em testes: validar duplicação, ownership e campos obrigatórios.
- Handoff: BK-MF0-08 deve receber `studyAreaId` válido.

## O que não entra (scope-out)

- Materiais da área, que pertencem ao BK-MF0-08.
- Perfil de IA da área, que pertence ao BK-MF0-10.
- Disciplinas oficiais e turmas, que pertencem à MF1.
- Partilha com colegas ou salas de estudo.
- IA privada funcional, que vem depois.

## Como saber que isto ficou bem

- Aluno cria uma área com nome válido.
- Aluno vê apenas as suas áreas.
- Detalhe da área mostra placeholders para materiais e IA.
- Nome duplicado no mesmo aluno é tratado.
- Tentativa de aceder a área de outro aluno falha.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: aluno autenticado com perfil (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-AREAS`
- Fonte de verdade: `docs/RF.md`, `RF07` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-07` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Áreas de Estudo privadas do aluno (CANONICO)
- `rf_rnf`: `RF07` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudyArea`.
- Criar DTOs de criação e edição.
- Criar endpoints protegidos.
- Criar lista e detalhe no frontend.
- Registar evento `STUDY_AREA_CREATED` no histórico, se BK-MF0-06 estiver disponível.
- Preparar placeholders para materiais e IA.
- Garantir isolamento por `userId`.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF07, RF08, RF10, RF35.
- `docs/RNF.md`: RNF20, RNF25, RNF26, RNF42.
- BK-MF0-03: perfil do aluno.
- BK-MF0-04: dashboard individual.
- BK-MF0-06: histórico, se implementado.

## Glossário (rápido) (DERIVADO):

- **Área de Estudo**: espaço privado para organizar estudo de um tema/disciplina informal.
- **Auto-disciplina**: área criada pelo aluno, não oficializada por professor.
- **Contexto**: conjunto de dados que limita materiais e IA a uma área.
- **Slug**: versão curta do nome para URL, se a equipa decidir usar.
- **Arquivar**: esconder sem apagar definitivamente.
- **Ownership**: área pertence a um aluno.
- **IDOR**: ataque em que se tenta aceder a recurso de outro utilizador mudando o ID.

## Conceitos teóricos essenciais (DERIVADO):

**Contexto de estudo.** A área de estudo é o primeiro contexto real da IA privada. Materiais, voz, perfil IA, resumos e quizzes devem ficar ligados a uma área para evitar mistura de assuntos.

**CRUD com autorização.** Criar e listar é simples, mas editar ou abrir detalhe exige confirmar que a área pertence ao aluno autenticado. Isto evita IDOR.

**Separação de domínio.** `study-areas` deve ficar separado de `students` e `auth`. Auth responde a quem é o utilizador; study-areas responde ao que ele está a estudar.

**Placeholder controlado.** A página de detalhe pode mostrar zonas `Materiais` e `IA`, mas deve indicar que serão ativadas nos BKs seguintes, sem simular resultados.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-03 com perfil autenticado.
- BK-MF0-06 opcional para registo de evento; se não estiver implementado, a criação da área não deve falhar.

### Passo 1 - Criar schema StudyArea

1. Explicação simples do objetivo.

    Neste passo vais criar schema StudyArea. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-areas/schemas/study-area.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyAreaDocument = HydratedDocument<StudyArea>;

@Schema({ timestamps: true, collection: "study_areas" })
export class StudyArea {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ trim: true, maxlength: 24 })
    color?: string;

    @Prop({ default: false })
    archived!: boolean;

    @Prop({ enum: ["simple", "rigorous", "step_by_step", "examples_first"] })
    voiceTone?: string;

    @Prop({ enum: ["short", "normal", "detailed"], default: "normal" })
    voiceDetailLevel?: string;

    @Prop({ trim: true, maxlength: 500 })
    voiceNotes?: string;
}

export const StudyAreaSchema = SchemaFactory.createForClass(StudyArea);
StudyAreaSchema.index({ userId: 1, name: 1 }, { unique: true });
```

5. Explicação do código.

O índice impede duas áreas com o mesmo nome para o mesmo aluno. Campos de voz já ficam preparados para BK-MF0-09, sem ativar IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTOs

1. Explicação simples do objetivo.

    Neste passo vais criar DTOs. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-areas/dto/create-study-area.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export class CreateStudyAreaDto {
    name!: string;
    description?: string;
    color?: string;
}
```

- CRIAR: `apps/api/src/modules/study-areas/dto/update-study-area.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

```ts
export class UpdateStudyAreaDto {
    name?: string;
    description?: string;
    color?: string;
    archived?: boolean;
}
```

5. Explicação do código.

Os DTOs não têm `userId`, `classId` ou campos de turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service com ownership

1. Explicação simples do objetivo.

    Neste passo vais criar service com ownership. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-areas/study-areas.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto";
import { StudyArea, StudyAreaDocument } from "./schemas/study-area.schema";

@Injectable()
export class StudyAreasService {
    constructor(
        @InjectModel(StudyArea.name)
        private readonly areaModel: Model<StudyAreaDocument>,
    ) {}

    async listMyStudyAreas(userId: string) {
        return this.areaModel
            .find({ userId: new Types.ObjectId(userId), archived: false })
            .sort({ name: 1 })
            .lean();
    }

    async getMyStudyArea(userId: string, areaId: string) {
        if (!Types.ObjectId.isValid(areaId)) {
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        }
        return this.areaModel
            .findOne({
                _id: areaId,
                userId: new Types.ObjectId(userId),
                archived: false,
            })
            .lean();
    }

    async createStudyArea(userId: string, input: CreateStudyAreaDto) {
        const name = input.name?.trim();
        if (!name)
            throw new BadRequestException({
                code: "AREA_NAME_REQUIRED",
                message: "Indica o nome da área.",
            });

        const duplicate = await this.areaModel.exists({
            userId: new Types.ObjectId(userId),
            name,
        });
        if (duplicate)
            throw new ConflictException({
                code: "AREA_NAME_DUPLICATED",
                message: "Já tens uma área com esse nome.",
            });

        return this.areaModel.create({
            userId: new Types.ObjectId(userId),
            name,
            description: input.description?.trim(),
            color: input.color?.trim(),
        });
    }

    async updateStudyArea(
        userId: string,
        areaId: string,
        input: UpdateStudyAreaDto,
    ) {
        const updated = await this.areaModel
            .findOneAndUpdate(
                { _id: areaId, userId: new Types.ObjectId(userId) },
                {
                    $set: {
                        ...input,
                        name: input.name?.trim(),
                        description: input.description?.trim(),
                    },
                },
                { new: true, runValidators: true },
            )
            .lean();
        if (!updated)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        return updated;
    }
}
```

5. Explicação do código.

Todas as operações filtram por `userId`. Uma área de outro aluno parece “não encontrada”, o que evita expor a existência do recurso.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-areas/study-areas.controller.ts`
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
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto";
import { StudyAreasService } from "./study-areas.service";

@Controller("api/study-areas")
@UseGuards(SessionGuard)
export class StudyAreasController {
    constructor(private readonly studyAreasService: StudyAreasService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyAreasService.listMyStudyAreas(request.user!.id);
    }

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudyAreaDto,
    ) {
        return this.studyAreasService.createStudyArea(request.user!.id, body);
    }

    @Get(":id")
    detail(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.studyAreasService.getMyStudyArea(request.user!.id, id);
    }

    @Patch(":id")
    update(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateStudyAreaDto,
    ) {
        return this.studyAreasService.updateStudyArea(
            request.user!.id,
            id,
            body,
        );
    }
}
```

5. Explicação do código.

O controller cria o contrato usado por materiais e perfil IA: `studyAreaId` só é válido se pertencer ao aluno autenticado.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-areas/study-areas.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { StudyArea, StudyAreaSchema } from "./schemas/study-area.schema";
import { StudyAreasController } from "./study-areas.controller";
import { StudyAreasService } from "./study-areas.service";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: StudyArea.name, schema: StudyAreaSchema },
        ]),
    ],
    controllers: [StudyAreasController],
    providers: [StudyAreasService],
    exports: [StudyAreasService],
})
export class StudyAreasModule {}
```

5. Explicação do código.

O `exports` permite ao BK-MF0-08 validar ownership da área antes de criar materiais.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Cliente API e UI mínima

1. Explicação simples do objetivo.

    Neste passo vais cliente API e UI mínima. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type StudyArea = {
    _id: string;
    name: string;
    description?: string;
    archived: boolean;
};

export async function listStudyAreas(): Promise<StudyArea[]> {
    const response = await fetch("/api/study-areas", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar áreas.");
    return (await response.json()) as StudyArea[];
}

export async function createStudyArea(payload: {
    name: string;
    description?: string;
}): Promise<StudyArea> {
    const response = await fetch("/api/study-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível criar área.");
    return data as StudyArea;
}
```

- CRIAR: `apps/web/src/pages/student/StudyAreasPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { FormEvent, useEffect, useState } from "react";
import {
    createStudyArea,
    listStudyAreas,
    StudyArea,
} from "../../lib/apiClient";

export function StudyAreasPage() {
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudyAreas()
            .then(setAreas)
            .catch((err) => setError(err.message));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        try {
            const created = await createStudyArea({ name });
            setAreas((current) => [...current, created]);
            setName("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao criar área.",
            );
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Áreas de estudo</h1>
            <form className="mt-6 flex gap-3" onSubmit={handleSubmit}>
                <input
                    className="flex-1 rounded border px-3 py-2"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Matemática A"
                    required
                    value={name}
                />
                <button
                    className="rounded bg-slate-900 px-4 py-2 text-white"
                    type="submit"
                >
                    Criar área
                </button>
            </form>
            {error && (
                <p className="mt-4 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}
            <ul className="mt-6 space-y-3">
                {areas.map((area) => (
                    <li className="rounded border bg-white p-4" key={area._id}>
                        {area.name}
                    </li>
                ))}
            </ul>
        </main>
    );
}
```

- CRIAR: `apps/web/src/pages/student/StudyAreaDetailPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
export function StudyAreaDetailPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Detalhe da área</h1>
            <p className="mt-2 text-slate-600">
                Materiais, voz da IA e perfil IA serão ativados nos próximos
                BKs.
            </p>
        </main>
    );
}
```

5. Explicação do código.

A página de detalhe é honesta: mostra placeholders, mas não simula materiais nem IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `StudyArea`.
    - API de áreas protegida.
    - Lista e detalhe no frontend.
- Verificações:
    - Criação válida responde `201`.
    - Acesso a área alheia falha.
- Qualidade:
    - Áreas não dependem de turmas.
    - Código separado por domínio.
- Continuidade:
    - BK-MF0-08 usa `studyAreaId`.
    - BK-MF0-10 cria perfil IA por área.
- Evidência:
    - PR inclui smoke, 3 negativos e screenshot da lista.

## Validação final

### Requests e responses esperados

- `POST /api/study-areas -> 201` com `{ _id, name, userId, archived }`.
- `GET /api/study-areas -> 200` com áreas do aluno autenticado.
- `GET /api/study-areas/:id -> 200` se a área for do aluno.
- `400 AREA_NAME_REQUIRED` para nome vazio.
- `401 UNAUTHENTICATED` sem sessão.
- `404 STUDY_AREA_NOT_FOUND` para área alheia ou id inválido.
- `409 AREA_NAME_DUPLICATED` para nome repetido no mesmo aluno.

### Como validar o BK e cenários negativos

- Criar `Matemática A`: esperado `201`.
- Criar nome vazio: esperado `400`.
- Repetir nome no mesmo aluno: esperado `409`.
- Abrir área de outro aluno: esperado `404`.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_PROVIDER_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, provider IA não configurado e JSON IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Screenshot da lista de áreas.
- Output de criação válida.
- Output de nome duplicado `409`.
- Output de área alheia `404`.

## Handoff para BK-MF0-08

- O próximo BK deve validar `studyAreaId` através de `StudyAreasService.getMyStudyArea`.
- Materiais nunca podem ser criados numa área de outro aluno.

## Changelog

- `2026-05-24`: guia refinado para áreas privadas, ownership e handoff para materiais/IA.
- `2026-05-25`: área de estudo atualizada para schema MongoDB/Mongoose com referência `userId`.
