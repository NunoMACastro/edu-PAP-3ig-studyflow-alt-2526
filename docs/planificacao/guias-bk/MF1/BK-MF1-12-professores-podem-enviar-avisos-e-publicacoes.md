# BK-MF1-12 - Professores podem enviar avisos e publicações.

## Header
- `doc_id`: `GUIA-BK-MF1-12`
- `bk_id`: `BK-MF1-12`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF24`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF24`: permitir que professores publiquem avisos e publicações numa turma, e que alunos inscritos os consultem.

## Importância
Publicações docentes são comunicação oficial. A leitura por alunos tem de usar a inscrição real da turma, não uma rota pública nem um `classId` sem validação.

## Scope-in
- Criar `ClassPost`.
- Criar aviso ou publicação.
- Listar publicações para professor dono da turma.
- Listar publicações para aluno inscrito.
- Separar cliente frontend de criação e cliente de leitura do aluno.

## Scope-out
- Notificações push.
- Comentários e reações.
- Anexos.
- Agendamento de publicações.

## Estado antes
- `BK-MF1-07` criou turmas e inscrição por aluno.
- Professor e aluno de desenvolvimento de `BK-MF1-07` conseguem autenticar-se com sessão real.
- Ainda não existe canal oficial de avisos.

## Estado depois
- Professor cria publicações.
- Professor lista publicações da sua turma.
- Aluno inscrito lista publicações da turma.
- Aluno não inscrito recebe erro.

## Pré-requisitos
- `ClassesService.findOwnedClass`.
- `ClassesService.ensureStudentEnrollment`.
- `SessionGuard`.
- Professor e aluno de desenvolvimento criados pela seed local de `BK-MF1-07`.
- Aluno de desenvolvimento inscrito numa turma do professor de desenvolvimento.

## Glossário
- **Aviso**: mensagem curta e importante.
- **Publicação**: conteúdo informativo mais geral.
- **Autor**: professor autenticado que criou o conteúdo.

## Conceitos teóricos
**Publicação oficial da turma.** Uma publicação é uma mensagem criada por professor para uma turma. Pode ser aviso curto (`NOTICE`) ou publicação mais geral (`POST`).

**Diferença entre escrita e leitura.** A escrita pertence ao professor dono da turma. A leitura pertence aos alunos inscritos. Isto significa que a mesma entidade (`ClassPost`) tem duas regras de autorização diferentes.

**Origem de `studentIds`.** A lista de alunos inscritos vem do `BK-MF1-07`. Quando o aluno pede `GET /api/student/classes/:classId/posts`, o backend confirma se `request.user.id` está em `studentIds` da turma.

**Validação com sessões reais.** Usa o professor e o aluno de desenvolvimento criados no `BK-MF1-07`. O professor valida a escrita; o aluno inscrito valida a leitura. Esta separação mostra que a autorização depende do papel e da inscrição persistida, não de IDs enviados no body.

**Porque não basta conhecer o `classId`.** Um aluno pode copiar o ID de uma turma de outro contexto. O service não pode confiar no ID vindo da URL sem consultar a turma e confirmar a inscrição.

**Separação de clientes frontend.** O cliente `createClassPost` é para professor. O cliente `listClassPostsForStudent` é para aluno. Separar chamadas evita confundir permissões e torna os fluxos mais fáceis de testar.

**Auditoria simples.** Cada publicação guarda `teacherId`, `classId`, `type`, `title` e `body`. Com isto é possível responder: quem publicou, onde publicou e que tipo de comunicação foi feita.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/class-posts/schemas/class-post.schema.ts`
- `apps/api/src/modules/class-posts/dto/create-class-post.dto.ts`
- `apps/api/src/modules/class-posts/class-posts.service.ts`
- `apps/api/src/modules/class-posts/class-posts.controller.ts`
- `apps/api/src/modules/class-posts/class-posts.module.ts`
- `apps/web/src/lib/api/classPosts.ts`
- `apps/web/src/pages/teacher/TeacherClassPostsPage.tsx`
- `apps/web/src/pages/student/StudentClassPostsPage.tsx`

Endpoints:
- `POST /api/teacher/classes/:classId/posts`
- `GET /api/teacher/classes/:classId/posts`
- `GET /api/student/classes/:classId/posts`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `ClassesService.findOwnedClass`.
- `ClassesService.ensureStudentEnrollment`.
- `SessionGuard`.
- Professor e aluno de desenvolvimento criados pela seed local de `BK-MF1-07`.
- Aluno de desenvolvimento inscrito numa turma do professor de desenvolvimento.

### Passo 1 - Criar schema

1. Explicação simples do objetivo.

    Neste passo vais criar schema nos ficheiros `apps/api/src/modules/class-posts/schemas/class-post.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-posts/schemas/class-post.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-posts/schemas/class-post.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassPostDocument = HydratedDocument<ClassPost>;
export type ClassPostType = "NOTICE" | "POST";

@Schema({ timestamps: true, collection: "class_posts" })
export class ClassPost {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTICE", "POST"] })
    type!: ClassPostType;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 4000 })
    body!: string;
}

export const ClassPostSchema = SchemaFactory.createForClass(ClassPost);
ClassPostSchema.index({ classId: 1, createdAt: -1 });
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/class-posts/dto/create-class-post.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-posts/dto/create-class-post.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-posts/dto/create-class-post.dto.ts
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassPostDto {
    @IsIn(["NOTICE", "POST"])
    type!: "NOTICE" | "POST";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    body!: string;
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/class-posts/class-posts.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-posts/class-posts.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-posts/class-posts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";
import { ClassPost, ClassPostDocument } from "./schemas/class-post.schema";

@Injectable()
export class ClassPostsService {
    constructor(
        @InjectModel(ClassPost.name)
        private readonly postModel: Model<ClassPostDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateClassPostDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const post = await this.postModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            body: dto.body.trim(),
        });

        return this.toView(post);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    async listForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem criar publicações.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos inscritos podem ler publicações.");
        }
    }

    private toView(post: ClassPost | ClassPostDocument) {
        return {
            id: post._id.toString(),
            classId: post.classId.toString(),
            teacherId: post.teacherId.toString(),
            type: post.type,
            title: post.title,
            body: post.body,
        };
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/class-posts/class-posts.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-posts/class-posts.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-posts/class-posts.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassPostsService } from "./class-posts.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";

@Controller("api")
@UseGuards(SessionGuard)
export class ClassPostsController {
    constructor(private readonly classPostsService: ClassPostsService) {}

    @Post("teacher/classes/:classId/posts")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateClassPostDto,
    ) {
        return this.classPostsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get("teacher/classes/:classId/posts")
    listForTeacher(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }

    @Get("student/classes/:classId/posts")
    listForStudent(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForStudent(request.user as AuthenticatedUser, classId);
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/class-posts/class-posts.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/class-posts/class-posts.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/class-posts/class-posts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { ClassPostsController } from "./class-posts.controller";
import { ClassPostsService } from "./class-posts.service";
import { ClassPost, ClassPostSchema } from "./schemas/class-post.schema";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: ClassPost.name, schema: ClassPostSchema }]),
    ],
    controllers: [ClassPostsController],
    providers: [ClassPostsService],
})
export class ClassPostsModule {}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/classPosts.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/classPosts.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/classPosts.ts
export type ClassPostView = {
    id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string;
    body: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createClassPost(
    classId: string,
    input: { type: "NOTICE" | "POST"; title: string; body: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<ClassPostView>(response);
}

export async function listTeacherClassPosts(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}

export async function listClassPostsForStudent(classId: string) {
    const response = await fetch(`/api/student/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do professor

1. Explicação simples do objetivo.

    Neste passo vais criar página do professor nos ficheiros `apps/web/src/pages/teacher/TeacherClassPostsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherClassPostsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/teacher/TeacherClassPostsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    ClassPostView,
    createClassPost,
    listTeacherClassPosts,
} from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function TeacherClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setPosts(await listTeacherClassPosts(classId));
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
            await createClassPost(classId, {
                type: String(form.get("type") ?? "NOTICE") as "NOTICE" | "POST",
                title: String(form.get("title") ?? ""),
                body: String(form.get("body") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Publicação enviada.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível publicar.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Publicações da turma</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTICE">Aviso</option>
                    <option value="POST">Publicação</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="body" required />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A publicar" : "Publicar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar publicações.</p> : null}
            {!isLoading && posts.length === 0 ? <p>Ainda não existem publicações nesta turma.</p> : null}
            {posts.map((post) => (
                <article key={post.id}>
                    <strong>{post.type}</strong>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de publicações da turma: recebe sessão, `classId` e conteúdo validado, devolve publicações oficiais apenas para professor dono ou alunos inscritos. A página docente mostra carregamento, vazio, sucesso e erro. As validações esperadas são `403` para aluno a escrever ou aluno não inscrito, `404` para professor sem ownership e listagem limitada por membership. O resultado deixa a comunicação oficial pronta para a MF2.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Criar página do aluno e validar

1. Explicação simples do objetivo.

    Neste passo vais criar página do aluno e validar nos ficheiros `apps/web/src/pages/student/StudentClassPostsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/StudentClassPostsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/student/StudentClassPostsPage.tsx
import { useEffect, useState } from "react";
import { ClassPostView, listClassPostsForStudent } from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function StudentClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        listClassPostsForStudent(classId)
            .then(setPosts)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [classId]);

    return (
        <main>
            <h1>Avisos e publicações</h1>
            {error ? <p role="alert">{error}</p> : null}
            {isLoading ? <p>A carregar publicações.</p> : null}
            {!isLoading && posts.length === 0 ? <p>Ainda não existem publicações para esta turma.</p> : null}
            {posts.map((post) => (
                <article key={post.id}>
                    <strong>{post.type}</strong>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    A página do aluno cobre carregamento, vazio e erro antes de listar publicações. Valida:
- Professor dono cria publicação.
- Professor sem ownership recebe `404`.
- Aluno inscrito lê publicações.
- Aluno não inscrito recebe `403`.
- Aluno não consegue criar publicação.
- Frontend docente mostra carregamento, vazio, sucesso e erro; frontend do aluno mostra carregamento, vazio e erro.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Antes dos passos técnicos: inicia sessão com o professor de desenvolvimento para criar publicações e com o aluno de desenvolvimento inscrito para as ler.
- Passos 1 e 2: confirmar schema e DTO de publicação com `classId`, `teacherId`, tipo, título e corpo.
- Passos 3 e 4: validar escrita apenas por professor dono e leitura apenas por aluno inscrito.
- Passos 5 e 6: confirmar clientes separados para professor e aluno com sessão HttpOnly.
- Passos 7 e 8: validar carregamento, vazio, sucesso/erro na página docente e carregamento, vazio/erro na página do aluno.

## Cenários negativos específicos

- Professor sem ownership da turma recebe `404`.
- Aluno a criar publicação recebe `403`.
- Aluno não inscrito a listar publicações recebe `403`.
- Publicações de uma turma não aparecem noutra turma.

## Expected results
- `POST /api/teacher/classes/:classId/posts` com professor dono devolve `201`.
- O professor de desenvolvimento criado no `BK-MF1-07` consegue publicar apenas numa turma sua.
- Professor sem ownership da turma devolve `404`.
- Aluno autenticado a criar publicação devolve `403`.
- `GET /api/student/classes/:classId/posts` devolve `200` para aluno inscrito.
- O aluno de desenvolvimento criado no `BK-MF1-07`, quando inscrito, consegue ler publicações da sua turma.
- Aluno não inscrito devolve `403` e não recebe publicações da turma.
- Frontend docente mostra carregamento, vazio, sucesso e erro; frontend do aluno mostra carregamento, vazio e erro.

## Critérios de aceite
- Escrita exige professor dono da turma.
- Leitura de aluno exige inscrição.
- `ClassPost` guarda `classId`, `teacherId`, `type`, `title` e `body`.
- Frontend separa criação docente e leitura do aluno.
- Chamadas usam `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa cruzamento entre duas turmas para garantir que publicações não vazam.

## Evidence para PR/defesa
- Prova de login local com professor e aluno criados no `BK-MF1-07`.
- Screenshot de aviso criado por professor.
- Screenshot de aluno inscrito a ler o aviso.
- Resposta `403` para aluno não inscrito.
- Resposta `403` para aluno a tentar criar publicação.

## Handoff
`BK-MF2-01` pode partir de uma turma com comunicação oficial funcional, professor autenticado e acesso por aluno inscrito.

## Changelog
- 2026-05-31: Pré-requisitos e validação alinhados com a seed local de professor/aluno criada no BK-MF1-07.
- 2026-05-30: Guia reescrito com leitura protegida por inscrição e clientes frontend separados.
