# BK-MF2-02 - Professores podem criar projetos para a turma.

## Header
- `doc_id`: `GUIA-BK-MF2-02`
- `bk_id`: `BK-MF2-02`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF26`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-03`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md`
- `last_updated`: `2026-07-11`

## Objetivo do BK

Permitir que professores criem projectos para uma turma e que alunos inscritos consultem apenas projectos publicados para essa turma.

## Importância

Este BK cria a base para trabalho de projecto acompanhado. O `BK-MF2-03` depende directamente desta entidade para a IA dividir o trabalho em passos graduais sem inventar o enunciado.

## Scope-in

- Criar projectos docentes por turma.
- Guardar título, enunciado, datas e estado de publicação.
- Listar projectos do professor e projectos visíveis ao aluno.
- Expor `findPublishedForStudent` para o BK seguinte.

## Scope-out

- Submissão de entregas por alunos.
- Avaliação, rubricas e feedback.
- Geração automática do projecto por IA.

## Estado antes

Existem turmas e validação de inscrição, mas não existe recurso de projecto nem método seguro para um aluno ler um projecto publicado.

## Estado depois

Existe `ClassProjectsModule` com entidade e método `findPublishedForStudent(actor, classId, projectId)`. O BK seguinte usa este método para garantir que a IA só trabalha sobre projectos publicados da turma do aluno.

## Pré-requisitos

- `BK-MF1-07` concluído.
- `ClassesService.findOwnedClass` e `ClassesService.ensureStudentEnrollment` disponíveis.
- Sessão autenticada com papel `TEACHER` ou `STUDENT`.

## Glossário

- Projecto da turma: proposta de trabalho criada pelo professor.
- Publicado: estado que torna o projecto visível aos alunos inscritos.
- Enunciado: texto oficial que a IA e o aluno devem seguir.

## Conceitos teóricos

- **Estado de publicação.** separa rascunhos docentes de conteúdo visível ao aluno. Este conceito vem de `RF26` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-02 - Professores podem criar projetos para a turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Método de leitura segura.** uma função de service encapsula autorização e evita duplicação em módulos futuros. Este conceito vem de `RF26` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-02 - Professores podem criar projetos para a turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Cadeia de dependência.** o BK seguinte consome o projecto, não recria a regra de acesso. Este conceito vem de `RF26` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-02 - Professores podem criar projetos para a turma.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-02`, `RF26`, prioridade `P1`, owner `Guilherme`, apoio `Natalia`, sprint `S05`, dependências `BK-MF1-07` e próximo BK `BK-MF2-03` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-02 - Professores podem criar projetos para a turma.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`ClassProjectsController` expõe rotas para professor e aluno. `ClassProjectsService` valida a turma com `ClassesService`, persiste projectos e exporta `findPublishedForStudent`. O frontend mostra criação para professores e leitura para alunos.

## Ficheiros previstos

- `apps/api/src/modules/class-projects/schemas/class-project.schema.ts`
- `apps/api/src/modules/class-projects/dto/class-project.dto.ts`
- `apps/api/src/modules/class-projects/class-projects.service.ts`
- `apps/api/src/modules/class-projects/class-projects.controller.ts`
- `apps/api/src/modules/class-projects/class-projects.module.ts`
- `apps/web/src/lib/api/class-projects.ts`
- `apps/web/src/pages/mf2/ClassProjectsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de projetos de turma no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/class-projects/schemas/class-project.schema.ts`
    - CRIAR: `apps/api/src/modules/class-projects/dto/class-project.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-projects/schemas/class-project.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassProjectDocument = HydratedDocument<ClassProject>;
export type ClassProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

@Schema({ timestamps: true, collection: "class_projects" })
export class ClassProject {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 20, maxlength: 12000 })
    brief!: string;

    @Prop({ type: Date })
    dueDate?: Date;

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" })
    status!: ClassProjectStatus;
}

export const ClassProjectSchema = SchemaFactory.createForClass(ClassProject);
ClassProjectSchema.index({ classId: 1, status: 1, createdAt: -1 });

// apps/api/src/modules/class-projects/dto/class-project.dto.ts
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassProjectDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(20)
    @MaxLength(12000)
    brief!: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}
~~~

5. Explicação do código.

    Este bloco separa persistência e entrada HTTP. O schema define os campos guardados em MongoDB, índices e estados que os BKs seguintes podem consultar. O DTO valida o corpo do pedido antes de chegar ao service, por isso dados vazios, demasiado longos ou com formato errado falham com `400 Bad Request`. A regra de segurança é simples: IDs de utilizador, aluno ou professor nunca vêm do body; vêm sempre da sessão autenticada.

6. Como validar este passo.

    Arranca a API depois de integrar o module e confirma que um body vazio devolve 400.

7. Erros comuns ou cenário negativo.

    Não aceites actorId, teacherId ou studentId no body; esses valores vêm da sessão autenticada.

### Passo 2 - Criar service com autorização

1. Explicação simples do objetivo.

    Centralizar regras de negócio, validação de contexto e erros de domínio.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/class-projects/class-projects.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-projects/class-projects.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateClassProjectDto } from "./dto/class-project.dto";
import { ClassProject, ClassProjectDocument } from "./schemas/class-project.schema";

@Injectable()
export class ClassProjectsService {
    constructor(
        @InjectModel(ClassProject.name)
        private readonly projects: Model<ClassProjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateClassProjectDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const project = await this.projects.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            brief: dto.brief.trim(),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            status: "DRAFT",
        });
        return this.toView(project);
    }

    async publish(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const project = await this.projects.findOneAndUpdate(
            { _id: projectId, classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) },
            { status: "PUBLISHED" },
            { new: true },
        );
        if (!project) {
            throw new NotFoundException("Projeto não encontrado para esta turma.");
        }
        return this.toView(project);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const projects = await this.projects.find({ classId: schoolClass._id }).sort({ createdAt: -1 }).lean();
        return projects.map((project) => this.toView(project));
    }

    async listPublishedForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const projects = await this.projects.find({ classId: schoolClass._id, status: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
        return projects.map((project) => this.toView(project));
    }

    async findPublishedForStudent(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const project = await this.projects.findOne({ _id: projectId, classId: schoolClass._id, status: "PUBLISHED" });
        if (!project) {
            throw new NotFoundException("Projeto publicado não encontrado para este aluno.");
        }
        return project;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir projetos.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar projetos publicados.");
        }
    }

    private toView(project: ClassProject) {
        return {
            id: project._id.toString(),
            title: project.title,
            brief: project.brief,
            dueDate: project.dueDate?.toISOString() ?? null,
            status: project.status,
        };
    }
}
~~~

5. Explicação do código.

    Este service concentra a regra de negócio do BK. Recebe o utilizador autenticado, valida o papel esperado, confirma ownership ou membership nos services herdados e só depois consulta ou grava dados. A entrada principal vem do controller; a saída é uma resposta já filtrada para o frontend. Isto evita duplicar segurança em componentes React e impede acessos cruzados entre alunos, professores, turmas, disciplinas e áreas de estudo.

6. Como validar este passo.

    Testa três casos: sem sessão, sessão com papel errado e sessão válida com contexto pertencente ao actor.

7. Erros comuns ou cenário negativo.

    Fazer apenas `Model.findById(id)` sem validar dono ou inscrição permite leitura indevida entre turmas, disciplinas ou áreas.

### Passo 3 - Criar controller e module do domínio

1. Explicação simples do objetivo.

    Expor as rotas HTTP do BK e ligar controller, service e schema no módulo NestJS.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/class-projects/class-projects.controller.ts`
    - CRIAR: `apps/api/src/modules/class-projects/class-projects.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/class-projects/class-projects.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassProjectsService } from "./class-projects.service";
import { CreateClassProjectDto } from "./dto/class-project.dto";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/projects")
export class ClassProjectsTeacherController {
    constructor(private readonly projectsService: ClassProjectsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateClassProjectDto) {
        return this.projectsService.create(actor, classId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.projectsService.listForTeacher(actor, classId);
    }

    @Patch(":projectId/publish")
    publish(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string) {
        return this.projectsService.publish(actor, classId, projectId);
    }
}

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/projects")
export class ClassProjectsStudentController {
    constructor(private readonly projectsService: ClassProjectsService) {}

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.projectsService.listPublishedForStudent(actor, classId);
    }
}

// apps/api/src/modules/class-projects/class-projects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { ClassProjectsTeacherController, ClassProjectsStudentController } from "./class-projects.controller";
import { ClassProjectsService } from "./class-projects.service";
import { ClassProject, ClassProjectSchema } from "./schemas/class-project.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassProject.name, schema: ClassProjectSchema }]), ClassesModule],
    controllers: [ClassProjectsTeacherController, ClassProjectsStudentController],
    providers: [ClassProjectsService],
    exports: [ClassProjectsService],
})
export class ClassProjectsModule {}
~~~

5. Explicação do código.

    O controller transforma pedidos HTTP autenticados em chamadas ao service, sem colocar regras de negócio na rota. O module liga controller, service, schema Mongoose e módulos herdados, garantindo dependency injection correta. Se faltar um import no module, a app não arranca; se faltar o guard no controller, o endpoint deixa de proteger sessão e permissões.

6. Como validar este passo.

    Confirma que a aplicação arranca sem erros de provider desconhecido e que as rotas aparecem com o prefixo esperado.

7. Erros comuns ou cenário negativo.

    Usar fallback genérico de parâmetros esconde bugs de rota e pode passar `undefined` para o service.

### Passo 4 - Integrar no módulo acumulativo da MF2

1. Explicação simples do objetivo.

    Garantir que o endpoint fica activo sem apagar modules criados em BKs anteriores.

2. Ficheiros envolvidos.
    - EDITAR: `apps/api/src/modules/mf2/mf2.module.ts`
    - REVER: `apps/api/src/app.module.ts` já deve importar Mf2Module desde BK-MF2-01

3. O que fazer.

    Mantém todos os imports anteriores e acrescenta apenas o module deste BK ao `Mf2Module`.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
    ],
})
export class Mf2Module {}

~~~

5. Explicação do código.

    O `Mf2Module` organiza a macrofase inteira. O `AppModule` só precisa de o importar uma vez, evitando edições repetidas e arriscadas.

6. Como validar este passo.

    Arranca a API e confirma que o Nest resolve providers do module acabado de criar.

7. Erros comuns ou cenário negativo.

    Não troques o array de imports por uma lista só com o module novo; isso desligaria funcionalidades anteriores.

### Passo 5 - Criar cliente frontend tipado

1. Explicação simples do objetivo.

    Dar ao frontend funções pequenas para chamar a API com cookies HttpOnly.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/lib/api/class-projects.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/class-projects.ts
export type ClassProjectView = { id: string; title: string; brief: string; dueDate: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };
export type CreateClassProjectInput = { title: string; brief: string; dueDate?: string };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listClassProjects(classId: string) {
    return requestJson<ClassProjectView[]>("/api/teacher/classes/" + classId + "/projects");
}

export function createClassProject(classId: string, input: CreateClassProjectInput) {
    return requestJson<ClassProjectView>("/api/teacher/classes/" + classId + "/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function publishClassProject(classId: string, projectId: string) {
    return requestJson<ClassProjectView>("/api/teacher/classes/" + classId + "/projects/" + projectId + "/publish", { method: "PATCH" });
}

export function listStudentClassProjects(classId: string) {
    return requestJson<ClassProjectView[]>("/api/student/classes/" + classId + "/projects");
}
~~~

5. Explicação do código.

    O cliente API é tipado e envia cookies com `credentials: "include"`, para reutilizar a sessão segura criada na MF0. Ele não guarda tokens no browser, não envia `actorId` e devolve erros claros quando o backend responde com `400`, `401`, `403` ou `404`. Assim, os tipos do frontend ficam alinhados com o payload e com a resposta real do controller.

6. Como validar este passo.

    Usa DevTools ou testes de integração para confirmar que as chamadas incluem cookies e tratam 401/403/404.

7. Erros comuns ou cenário negativo.

    Fazer fetch sem `credentials: "include"` transforma uma sessão válida em 401 no backend.

### Passo 6 - Criar página React do BK

1. Explicação simples do objetivo.

    Expor a funcionalidade ao utilizador com estados de loading, erro, vazio e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/pages/mf2/ClassProjectsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/ClassProjectsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createClassProject, listClassProjects, publishClassProject, ClassProjectView } from "../../lib/api/class-projects";

export function ClassProjectsPage() {
    const [classId, setClassId] = useState("");
    const [title, setTitle] = useState("");
    const [brief, setBrief] = useState("");
    const [projects, setProjects] = useState<ClassProjectView[]>([]);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim()) return;
        try { setProjects(await listClassProjects(classId.trim())); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar projetos."); }
    }

    useEffect(() => {
        void load();
    }, [classId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createClassProject(classId.trim(), { title, brief });
        setTitle("");
        setBrief("");
        await load();
    }

    return (
        <main>
            <h1>Projetos da turma</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Enunciado" />
                <button type="submit">Criar projeto</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        {project.title} - {project.status}
                        <button type="button" onClick={() => publishClassProject(classId, project.id).then(load)}>
                            Publicar
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
~~~

5. Explicação do código.

    A página separa estado de formulário, estado de lista e mensagens de erro para ser fácil de testar e manter.

6. Como validar este passo.

    Abre a página com sessão válida, executa o fluxo principal e confirma que a lista actualiza sem refresh manual.

7. Erros comuns ou cenário negativo.

    Não escondas erros HTTP genéricos; mostra mensagem controlada para o utilizador e mantém o detalhe técnico no backend.

### Passo 7 - Validar contrato, negativos e handoff

1. Explicação simples do objetivo.

    Confirmar que o BK cumpre RF26, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md`
    - REVER: testes backend e frontend criados para este BK

3. O que fazer.

    Executa validações automáticas e regista evidência de caminho feliz e cenários negativos.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    Estes comandos cobrem regressões unitárias, contratos API, fluxo integrado e coerência documental.

6. Como validar este passo.

    Guarda evidência com request válido, resposta esperada, pelo menos 2 cenário(s) negativo(s) e captura da página final.

7. Erros comuns ou cenário negativo.

    Não avances para BK-MF2-03 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Professor cria projecto em turma sua e recebe `201`.
- Projecto em rascunho não aparece para alunos.
- Projecto publicado aparece para aluno inscrito.
- `findPublishedForStudent` bloqueia aluno fora da turma.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que `ClassProjectsModule` exporta `ClassProjectsService`.
- Confirmar que o método `findPublishedForStudent` valida inscrição antes de devolver o projecto.
- Executar um teste de criação, um teste de listagem do aluno e dois cenários negativos.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-03

## Atualização de paridade professor → aluno (2026-07-11)

Projetos são sempre criados em `DRAFT`, podem ser editados nesse estado e têm uma
transição idempotente para `PUBLISHED`. Podem referir uma disciplina oficial opcional e
guardar `subjectNameSnapshot`, prazo e data de publicação. O aluno recebe um contrato sem
`teacherId`; em turma arquivada o projeto é histórico read-only. A publicação cria uma
notificação in-app e o plano IA herda a voz da disciplina/turma.

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-07-11`: acrescentados draft/publish, disciplina oficial opcional, prazo, histórico e voz herdada.
