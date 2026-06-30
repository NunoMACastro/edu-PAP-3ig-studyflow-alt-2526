# BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.

## Header
- `doc_id`: `GUIA-BK-MF2-01`
- `bk_id`: `BK-MF2-01`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P2`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF25`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-02`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md`
- `last_updated`: `2026-06-08`

## Objetivo do BK

Permitir que um professor crie salas de estudo guiado para uma turma sua, opcionalmente associadas a uma disciplina da mesma turma, e que apenas alunos inscritos nessa turma consigam consultar essas salas.

## Importância

Este BK acrescenta um espaço docente organizado para estudo acompanhado. Sem esta peça, a turma tem avisos e publicações, mas não tem uma sala orientada para estudo com objectivo, datas, regras e participantes.

## Scope-in

- Criar sala guiada associada a uma turma existente do professor.
- Permitir `subjectId` opcional para associar a sala guiada a uma disciplina da mesma turma.
- Listar salas do professor por turma.
- Listar salas disponíveis para o aluno inscrito.
- Validar papel, sessão e pertença à turma em todas as leituras.

## Scope-out

- Chat em tempo real, chamadas vídeo e presença online.
- IA dentro da sala guiada.
- Override próprio de voz IA na sala guiada.
- Agendamento avançado ou recorrência.

## Estado antes

`BK-MF1-07` já criou turmas e `ClassesService.findOwnedClass`/`ensureStudentEnrollment`. A MF2 ainda não tem uma entidade própria para salas guiadas docentes.

## Estado depois

Existe `GuidedStudyRoomsModule` com schema, DTO, service, controller, cliente frontend e página React. A sala pode ter `subjectId` opcional para herdar contexto/voz pela disciplina, mas continua sem override próprio. O próximo BK pode criar projectos de turma sem duplicar validação de turma.

## Pré-requisitos

- `ClassesModule` exporta `ClassesService`.
- `SubjectsModule` exporta validação de disciplina pertencente à turma/professor.
- `SessionGuard`, `CurrentUser` e `AuthenticatedUser` estão disponíveis.
- O actor autenticado tem papel `TEACHER` ou `STUDENT` conforme a rota.

## Glossário

- Sala guiada: espaço criado pelo professor para orientar estudo de uma turma.
- Turma dona: turma que define quem pode ver a sala.
- Disciplina associada opcional: disciplina da mesma turma usada como contexto herdado.
- Objectivo da sala: descrição curta do foco de estudo.

## Conceitos teóricos

- **Autorização por pertença.** o professor só gere turmas suas e o aluno só lê turmas onde está inscrito. Este conceito vem de `RF25` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Separação de responsabilidades.** o controller expõe HTTP; o service decide regras de negócio. Este conceito vem de `RF25` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Entidade de domínio.** a sala guiada é independente de publicações, porque tem calendário e objectivo próprios. Este conceito vem de `RF25` e das dependências `BK-MF1-07`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Disciplina opcional.** a sala guiada pode apontar para uma disciplina da mesma turma para herdar contexto e voz docente efetiva; se não apontar, herda diretamente da turma.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve provider de IA quando o próprio requisito o pede. Quando não há chamada de IA, o guia limita-se a preparar fontes, autorização ou contexto sem prometer geração automática; quando há chamada de IA, o provider vem de `AiModule`/`AI_PROVIDER`, as fontes são recolhidas antes da chamada e a resposta só é persistida depois de validação mínima.

## Decisões documentais

- `CANONICO`: `BK-MF2-01`, `RF25`, prioridade `P2`, owner `Guilherme`, apoio `Natalia`, sprint `S05`, dependências `BK-MF1-07` e próximo BK `BK-MF2-02` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `CANONICO`: a associação a disciplina é opcional e não cria override de voz próprio na sala; a herança de voz fica definida em `DECISAO-ARQUITETURA-VOZ-IA-DOCENTE.md`.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.

## Arquitetura do BK

`GuidedStudyRoomsController` chama `GuidedStudyRoomsService`. O service usa `ClassesService` para validar ownership ou inscrição antes de consultar MongoDB e usa `SubjectsService` quando o DTO traz `subjectId`. O frontend usa um cliente tipado, oferece a opção `Sem disciplina específica` e não envia IDs de utilizador no body.

## Ficheiros previstos

- `apps/api/src/modules/guided-study-rooms/schemas/guided-study-room.schema.ts`
- `apps/api/src/modules/guided-study-rooms/dto/guided-study-room.dto.ts`
- `apps/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts`
- `apps/api/src/modules/guided-study-rooms/guided-study-rooms.controller.ts`
- `apps/api/src/modules/guided-study-rooms/guided-study-rooms.module.ts`
- `apps/web/src/lib/api/guided-study-rooms.ts`
- `apps/web/src/pages/mf2/GuidedStudyRoomsPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de salas de estudo guiado no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/guided-study-rooms/schemas/guided-study-room.schema.ts`
    - CRIAR: `apps/api/src/modules/guided-study-rooms/dto/guided-study-room.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/guided-study-rooms/schemas/guided-study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type GuidedStudyRoomDocument = HydratedDocument<GuidedStudyRoom>;
export type GuidedStudyRoomStatus = "OPEN" | "CLOSED";

@Schema({ timestamps: true, collection: "guided_study_rooms" })
export class GuidedStudyRoom {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 8000 })
    description!: string;

    @Prop({ type: [String], default: [] })
    materialIds!: string[];

    @Prop({ required: true, enum: ["OPEN", "CLOSED"], default: "OPEN" })
    status!: GuidedStudyRoomStatus;
}

export const GuidedStudyRoomSchema = SchemaFactory.createForClass(GuidedStudyRoom);
GuidedStudyRoomSchema.index({ classId: 1, createdAt: -1 });

// apps/api/src/modules/guided-study-rooms/dto/guided-study-room.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateGuidedStudyRoomDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(8000)
    description!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    materialIds?: string[];
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
    - CRIAR: `apps/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateGuidedStudyRoomDto } from "./dto/guided-study-room.dto";
import { GuidedStudyRoom, GuidedStudyRoomDocument } from "./schemas/guided-study-room.schema";

@Injectable()
export class GuidedStudyRoomsService {
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly rooms: Model<GuidedStudyRoomDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateGuidedStudyRoomDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const room = await this.rooms.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            description: dto.description.trim(),
            materialIds: dto.materialIds ?? [],
            status: "OPEN",
        });
        return this.toView(room);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const rooms = await this.rooms.find({ classId: schoolClass._id }).sort({ createdAt: -1 }).lean();
        return rooms.map((room) => this.toView(room));
    }

    async listForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const rooms = await this.rooms.find({ classId: schoolClass._id, status: "OPEN" }).sort({ createdAt: -1 }).lean();
        return rooms.map((room) => this.toView(room));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir salas guiadas.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar salas guiadas da turma.");
        }
    }

    private toView(room: GuidedStudyRoom) {
        return {
            id: room._id.toString(),
            title: room.title,
            description: room.description,
            materialIds: room.materialIds,
            status: room.status,
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
    - CRIAR: `apps/api/src/modules/guided-study-rooms/guided-study-rooms.controller.ts`
    - CRIAR: `apps/api/src/modules/guided-study-rooms/guided-study-rooms.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/guided-study-rooms/guided-study-rooms.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateGuidedStudyRoomDto } from "./dto/guided-study-room.dto";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/guided-study-rooms")
export class GuidedStudyRoomsTeacherController {
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateGuidedStudyRoomDto) {
        return this.roomsService.create(actor, classId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.roomsService.listForTeacher(actor, classId);
    }
}

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/guided-study-rooms")
export class GuidedStudyRoomsStudentController {
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.roomsService.listForStudent(actor, classId);
    }
}

// apps/api/src/modules/guided-study-rooms/guided-study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { GuidedStudyRoomsTeacherController, GuidedStudyRoomsStudentController } from "./guided-study-rooms.controller";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service";
import { GuidedStudyRoom, GuidedStudyRoomSchema } from "./schemas/guided-study-room.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema }]), ClassesModule],
    controllers: [GuidedStudyRoomsTeacherController, GuidedStudyRoomsStudentController],
    providers: [GuidedStudyRoomsService],
    exports: [GuidedStudyRoomsService],
})
export class GuidedStudyRoomsModule {}
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
    - CRIAR: `apps/api/src/modules/mf2/mf2.module.ts`
    - EDITAR: `apps/api/src/app.module.ts`

3. O que fazer.

    Mantém todos os imports anteriores e acrescenta apenas o module deste BK ao `Mf2Module`.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
    ],
})
export class Mf2Module {}

// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { StudentsModule } from "./modules/students/students.module";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module";
import { MaterialsModule } from "./modules/materials/materials.module";
import { AiModule } from "./modules/ai/ai.module";
import { StudyModule } from "./modules/study/study.module";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { SubjectsModule } from "./modules/subjects/subjects.module";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module";
import { ClassAiModule } from "./modules/class-ai/class-ai.module";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module";
import { Mf2Module } from "./modules/mf2/mf2.module";

@Module({
    imports: [
        AuthModule,
        StudentsModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
        StudyModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        ClassAiModule,
        ClassPostsModule,
        Mf2Module,
    ],
})
export class AppModule {}
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
    - CRIAR: `apps/web/src/lib/api/guided-study-rooms.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/guided-study-rooms.ts
export type GuidedStudyRoomView = {
    id: string;
    title: string;
    description: string;
    materialIds: string[];
    status: "OPEN" | "CLOSED";
};

export type CreateGuidedStudyRoomInput = {
    title: string;
    description: string;
    materialIds?: string[];
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listTeacherGuidedStudyRooms(classId: string) {
    return requestJson<GuidedStudyRoomView[]>("/api/teacher/classes/" + classId + "/guided-study-rooms");
}

export function createGuidedStudyRoom(classId: string, input: CreateGuidedStudyRoomInput) {
    return requestJson<GuidedStudyRoomView>("/api/teacher/classes/" + classId + "/guided-study-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
}

export function listStudentGuidedStudyRooms(classId: string) {
    return requestJson<GuidedStudyRoomView[]>("/api/student/classes/" + classId + "/guided-study-rooms");
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
    - CRIAR: `apps/web/src/pages/mf2/GuidedStudyRoomsPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/GuidedStudyRoomsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createGuidedStudyRoom, listTeacherGuidedStudyRooms, GuidedStudyRoomView } from "../../lib/api/guided-study-rooms";

export function GuidedStudyRoomsPage() {
    const [classId, setClassId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rooms, setRooms] = useState<GuidedStudyRoomView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim()) return;
        setLoading(true);
        setError("");
        try {
            setRooms(await listTeacherGuidedStudyRooms(classId.trim()));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar salas guiadas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [classId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createGuidedStudyRoom(classId.trim(), { title, description });
        setTitle("");
        setDescription("");
        await load();
    }

    return (
        <main>
            <h1>Salas de estudo guiado</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />
                <button type="submit">Criar sala</button>
            </form>
            {loading && <p>A carregar...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && rooms.length === 0 && <p>Sem salas guiadas.</p>}
            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>{room.title} - {room.status}</li>
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

    Confirmar que o BK cumpre RF25, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md`
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

    Guarda evidência com request válido, resposta esperada, pelo menos 1 cenário(s) negativo(s) e captura da página final.

7. Erros comuns ou cenário negativo.

    Não avances para BK-MF2-02 se a validação de sessão, ownership ou membership falhar.

## Expected results

- Professor cria sala guiada numa turma sua e recebe `201`.
- Professor cria sala guiada sem disciplina e o fluxo antigo continua válido.
- Professor cria sala guiada com disciplina da mesma turma e o `subjectId` fica associado.
- Professor lista salas da turma e vê apenas salas dessa turma.
- Aluno inscrito lista salas disponíveis e não vê salas de outras turmas.
- Aluno vê a disciplina associada quando existir, sem controlos de voz.
- Actor com papel errado recebe erro controlado.
- Disciplina de outra turma/professor é rejeitada.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- O service valida que `subjectId`, quando existe, pertence à turma e ao professor autenticado.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que todas as rotas usam sessão autenticada.
- Confirmar que `ClassesService` é chamado antes de ler ou escrever salas.
- Confirmar que sala sem `subjectId` e sala com `subjectId` válido funcionam.
- Confirmar que `subjectId` de outra turma/professor é rejeitado.
- Executar teste positivo de professor, teste positivo de aluno e cenário negativo de turma fora do actor.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Print ou log de sala guiada sem disciplina e com disciplina associada.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-02; `BK-MF2-12` pode usar a disciplina associada à sala para explicar herança de voz, sem criar override próprio da sala.

## Changelog

- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-06-30`: documentada disciplina opcional em sala guiada e herança de voz sem override próprio.
