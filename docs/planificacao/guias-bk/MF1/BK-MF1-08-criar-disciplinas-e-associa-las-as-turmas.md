# BK-MF1-08 - Criar disciplinas e associá-las às turmas.

## Header
- `doc_id`: `GUIA-BK-MF1-08`
- `bk_id`: `BK-MF1-08`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-09`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF20`: permitir que o professor crie disciplinas dentro de uma turma sua e liste as disciplinas dessa turma.

## Importância
A disciplina é o contexto oficial para materiais, voz da IA e IA limitada. Se a disciplina não estiver ligada a uma turma validada, os BKs seguintes não conseguem provar que um professor é dono do conteúdo nem que um aluno está autorizado a consultar esse conteúdo.

## Scope-in
- Criar `Subject`.
- Associar disciplina a `SchoolClass`.
- Validar que a turma pertence ao professor autenticado.
- Evitar nomes duplicados dentro da mesma turma.
- Exportar service e schema para BKs seguintes.

## Scope-out
- Catálogo global de disciplinas.
- Vários professores por disciplina.
- Programa curricular completo.
- Materiais oficiais, que entram em `BK-MF1-09`.

## Estado antes
- `BK-MF1-07` criou `SchoolClass`.
- Professor consegue criar turmas.
- A seed local de `BK-MF1-07` permite iniciar sessão como professor de desenvolvimento.
- Ainda não existe contexto disciplinar oficial.

## Estado depois
- Professor cria disciplinas numa turma sua.
- Professor lista disciplinas por turma.
- Aluno não consegue criar disciplinas.
- Professor de outra turma não recebe dados dessa turma.

## Pré-requisitos
- `ClassesModule` disponível e exportável.
- `SessionGuard` e `AuthenticatedRequest`.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Turma criada por esse professor.
- Validação global de DTOs ativa.

## Glossário
- **Disciplina oficial**: unidade curricular criada por professor dentro de uma turma.
- **Turma dona**: turma onde a disciplina foi criada.
- **Ownership docente**: relação entre professor autenticado e turma/disciplina.

## Conceitos teóricos
**Disciplina dentro de turma.** Uma disciplina não é um catálogo solto. Ela pertence a uma turma (`classId`) e a um professor (`teacherId`). Isto permite saber que materiais, voz da IA e interações pertencem a um contexto oficial específico.

**Validação em cadeia.** O backend valida por ordem: sessão válida, papel `TEACHER`, turma pertencente ao professor, e só depois disciplina. Esta ordem evita expor se uma turma de outro professor existe.

**Validação com professor real.** A conta local criada no `BK-MF1-07` permite testar este fluxo com cookie HttpOnly e `role` `TEACHER`, sem depender de uma alteração manual na base de dados. O frontend nunca envia `teacherId`; o backend retira o professor da sessão.

**Duplicados por turma.** O índice `{ classId, name }` impede duas disciplinas com o mesmo nome dentro da mesma turma. A mesma disciplina pode existir em turmas diferentes porque cada turma é um contexto independente.

**`findOwnedSubject`.** Este método é usado por materiais e voz docente. Ele confirma que a disciplina pertence ao professor autenticado antes de permitir escrita.

**`findSubjectForStudent`.** Este método é usado pela IA limitada. Ele encontra a disciplina e confirma que o aluno está inscrito na turma dessa disciplina.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/subjects/schemas/subject.schema.ts`
- `apps/api/src/modules/subjects/dto/create-subject.dto.ts`
- `apps/api/src/modules/subjects/subjects.service.ts`
- `apps/api/src/modules/subjects/subjects.controller.ts`
- `apps/api/src/modules/subjects/subjects.module.ts`
- `apps/web/src/lib/api/subjects.ts`
- `apps/web/src/pages/teacher/TeacherSubjectsPage.tsx`

Endpoints:
- `POST /api/teacher/classes/:classId/subjects`
- `GET /api/teacher/classes/:classId/subjects`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `ClassesModule` disponível e exportável.
- `SessionGuard` e `AuthenticatedRequest`.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Turma criada por esse professor.
- Validação global de DTOs ativa.

### Passo 1 - Criar schema da disciplina

1. Explicação simples do objetivo.

    Neste passo vais criar schema da disciplina nos ficheiros `apps/api/src/modules/subjects/schemas/subject.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/subjects/schemas/subject.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/subjects/schemas/subject.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true, collection: "subjects" })
export class Subject {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 24 })
    code?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true });
SubjectSchema.index({ teacherId: 1, createdAt: -1 });
```

5. Explicação do código.

    Guarda a disciplina com ligação à turma e ao professor.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/subjects/dto/create-subject.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/subjects/dto/create-subject.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/subjects/dto/create-subject.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSubjectDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(24)
    code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
```

5. Explicação do código.

    O DTO aceita apenas campos da disciplina. O `classId` vem da rota e o `teacherId` vem da sessão.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/subjects/subjects.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/subjects/subjects.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/subjects/subjects.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { Subject, SubjectDocument } from "./schemas/subject.schema";

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateSubjectDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const duplicate = await this.subjectModel.exists({
            classId: schoolClass._id,
            name: dto.name.trim(),
        });

        if (duplicate) {
            throw new ConflictException("Já existe uma disciplina com este nome nesta turma.");
        }

        const subject = await this.subjectModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            code: dto.code?.trim().toUpperCase(),
            description: dto.description?.trim(),
        });

        return this.toView(subject);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const subjects = await this.subjectModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ name: 1 })
            .lean();

        return subjects.map((subject) => this.toView(subject));
    }

    async findOwnedSubject(teacherId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findOne({
            _id: new Types.ObjectId(subjectId),
            teacherId: new Types.ObjectId(teacherId),
        });

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada para este professor.");
        }

        return subject;
    }

    async findSubjectForStudent(studentId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findById(subjectId);

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        await this.classesService.ensureStudentEnrollment(studentId, subject.classId.toString());
        return subject;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir disciplinas.");
        }
    }

    private toView(subject: Subject | SubjectDocument) {
        return {
            id: subject._id.toString(),
            classId: subject.classId.toString(),
            teacherId: subject.teacherId.toString(),
            name: subject.name,
            code: subject.code ?? "",
            description: subject.description ?? "",
        };
    }
}
```

5. Explicação do código.

    O service usa `ClassesService.findOwnedClass` para reaproveitar a regra de ownership criada no BK anterior.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/subjects/subjects.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/subjects/subjects.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/subjects/subjects.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectsService } from "./subjects.service";

@Controller("api/teacher/classes/:classId/subjects")
@UseGuards(SessionGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateSubjectDto,
    ) {
        return this.subjectsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.subjectsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }
}
```

5. Explicação do código.

    As rotas ficam dentro de `teacher/classes/:classId` para deixar claro que a disciplina pertence a uma turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/subjects/subjects.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/subjects/subjects.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/subjects/subjects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { Subject, SubjectSchema } from "./schemas/subject.schema";
import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}
```

5. Explicação do código.

    Exporta `SubjectsService` para materiais, voz docente e IA limitada.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/subjects.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/subjects.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/subjects.ts
export type SubjectView = {
    id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createSubject(
    classId: string,
    input: { name: string; code?: string; description?: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<SubjectView>(response);
}

export async function listSubjects(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        credentials: "include",
    });

    return parseResponse<SubjectView[]>(response);
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de disciplinas oficiais: recebe `classId`, `subjectId` ou dados de criação, devolve entidades associadas à turma do professor e valida ownership com `ClassesService` ou `SubjectsService`. Erros esperados incluem `403` para papel errado, `404` para turma ou disciplina fora do professor e `409` para duplicados. O resultado alimenta materiais oficiais, voz docente e IA limitada dos BKs seguintes.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do professor

1. Explicação simples do objetivo.

    Neste passo vais criar página do professor nos ficheiros `apps/web/src/pages/teacher/TeacherSubjectsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherSubjectsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/teacher/TeacherSubjectsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { SubjectView, createSubject, listSubjects } from "../../lib/api/subjects";

type Props = {
    classId: string;
};

export function TeacherSubjectsPage({ classId }: Props) {
    const [subjects, setSubjects] = useState<SubjectView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setSubjects(await listSubjects(classId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [classId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createSubject(classId, {
                name: String(form.get("name") ?? ""),
                code: String(form.get("code") ?? ""),
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Disciplina criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a disciplina.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Disciplinas da turma</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da disciplina" required />
                <input name="code" placeholder="Código curto" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A criar" : "Criar disciplina"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}

            <section>
                {isLoading ? <p>A carregar disciplinas.</p> : null}
                {!isLoading && subjects.length === 0 ? <p>Ainda não existem disciplinas nesta turma.</p> : null}
                {subjects.map((subject) => (
                    <article key={subject.id}>
                        <h2>{subject.name}</h2>
                        <p>{subject.code}</p>
                        <p>{subject.description}</p>
                    </article>
                ))}
            </section>
        </main>
    );
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de disciplinas oficiais: recebe `classId`, `subjectId` ou dados de criação, devolve entidades associadas à turma do professor e valida ownership com `ClassesService` ou `SubjectsService`. A página cobre carregamento, vazio, sucesso e erro para a gestão da lista. Erros esperados incluem `403` para papel errado, `404` para turma ou disciplina fora do professor e `409` para duplicados. O resultado alimenta materiais oficiais, voz docente e IA limitada dos BKs seguintes.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Validar comportamento e integração

1. Explicação simples do objetivo.

    Neste passo vais validar comportamento e integração no fluxo de validação do BK. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- VALIDAR: este passo não cria ficheiros novos.
- LOCALIZAÇÃO: executa os cenários indicados neste passo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

Não há código novo neste passo. Usa-o para confirmar que os passos anteriores funcionam em conjunto.

5. Explicação do código.

    Confirma estes cenários:

- Professor cria disciplina numa turma sua.
- Professor de outra turma recebe `404`.
- Aluno recebe `403`.
- Nome duplicado na mesma turma recebe `409`.
- `SubjectsModule` exporta `SubjectsService`.
- `BK-MF1-09`, `BK-MF1-10` e `BK-MF1-11` conseguem localizar disciplina por `subjectId`.
- Frontend mostra carregamento, vazio, sucesso de criação e erros da API.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Antes dos passos técnicos: inicia sessão com o professor de desenvolvimento criado no `BK-MF1-07`.
- Passos 1 e 2: confirmar schema e DTOs de disciplina ligados a turma existente do professor.
- Passos 3 e 4: validar ownership da turma antes de criar/listar disciplinas e duplicados na mesma turma.
- Passos 5 e 6: confirmar export de `SubjectsService` para materiais, voz docente e IA limitada.
- Passo 7: validar carregamento, vazio, sucesso de criação e erros da API na página docente.

## Cenários negativos específicos

- Professor sem ownership da turma recebe `404`.
- Aluno recebe `403`.
- Nome duplicado na mesma turma recebe `409`.

## Expected results
- `POST /api/teacher/classes/:classId/subjects` com professor dono da turma devolve `201`.
- O professor de desenvolvimento criado no `BK-MF1-07` consegue criar disciplina numa turma sua.
- Professor sem ownership da turma devolve `404`.
- Aluno autenticado devolve `403`.
- Nome duplicado na mesma turma devolve `409`.
- `GET /api/teacher/classes/:classId/subjects` devolve `200` apenas com disciplinas da turma do professor autenticado.
- Frontend mostra carregamento, vazio, sucesso de criação e erros da API.

## Critérios de aceite
- A disciplina guarda `classId` e `teacherId`.
- A rota usa `classId` vindo do URL.
- O `teacherId` vem da sessão.
- Não existe criação de disciplina fora de turma.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Regista evidência de criação, listagem, duplicado e professor sem ownership.

## Evidence para PR/defesa
- Prova de login local com o professor criado no `BK-MF1-07`.
- Screenshot da lista de disciplinas dentro da turma.
- Resposta `409` para disciplina duplicada.
- Resposta `404` para professor sem acesso à turma.
- Diff mostrando `SubjectsModule` exportado.

## Handoff
`BK-MF1-09` deve usar `SubjectsService.findOwnedSubject` com o mesmo professor de desenvolvimento. `BK-MF1-11` deve usar `SubjectsService.findSubjectForStudent` para validar inscrição antes de consultar materiais oficiais.

## Changelog
- 2026-05-31: Pré-requisitos e validação alinhados com a seed local de professor criada no BK-MF1-07.
- 2026-05-30: Guia reescrito com módulo completo, ownership por turma e integração explícita para materiais e IA.
