# BK-MF1-02 - Criar salas de estudo com outros alunos (livres ou por disciplina).

## Header
- `doc_id`: `GUIA-BK-MF1-02`
- `bk_id`: `BK-MF1-02`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF14`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-03`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md`
- `last_updated`: `2026-07-10`

## Objetivo
Implementar `RF14`: permitir que alunos criem salas de estudo livres ou associadas a uma disciplina, convidem membros por email e vejam apenas salas onde são membros.

## Importância
Salas de estudo criam contexto colaborativo entre alunos. Tudo o que vem a seguir, como partilhas e IA da sala, depende de uma regra simples: só membros podem ler ou escrever no contexto da sala.

## Scope-in
- Criar `StudyRoom`.
- Associar o criador como primeiro membro.
- Criar sala `FREE` ou `SUBJECT`.
- Guardar o nome livre da disciplina quando a sala é `SUBJECT`, sem depender ainda da entidade oficial de disciplinas.
- Adicionar membro por email.
- Listar apenas salas do aluno autenticado.

## Scope-out
- Chat em tempo real.
- Moderação avançada.
- Papéis internos dentro da sala.
- IA da sala, que entra em `BK-MF1-04`.

## Estado antes
- Alunos autenticados existem.
- A aplicação ainda não tem espaços colaborativos persistentes.

## Estado depois
- Aluno cria sala.
- Criador fica em `memberIds`.
- Membro adiciona outro aluno por email.
- Não membro não vê nem manipula a sala.

## Pré-requisitos
- `BK-MF0-02` com `SessionGuard`.
- `BK-MF0-03` com perfil de aluno funcional.
- Decisão `DERIVADO`: antes de `BK-MF1-08`, a sala por disciplina usa `disciplineName?: string` em vez de um identificador oficial de disciplina.

## Glossário
- **Sala livre**: sala sem disciplina associada.
- **Sala por disciplina**: sala etiquetada com o nome textual de uma disciplina, sem ligação à entidade oficial de disciplinas neste BK.
- **Membro**: aluno autorizado a consultar e escrever na sala.

## Conceitos teóricos
**Sala de estudo.** Uma sala é um espaço partilhado entre alunos. Pode ser livre, para estudar qualquer tema, ou marcada como sala por disciplina através de `disciplineName`. Esta decisão é `DERIVADO` porque a entidade oficial de disciplinas só nasce em `BK-MF1-08`; por isso, este BK não importa nem valida schemas de disciplinas oficiais.

**Membership.** A lista `memberIds` guarda os IDs dos alunos que pertencem à sala. Esta lista vem da base de dados, não do frontend. Sempre que alguém tenta listar, convidar ou mais tarde usar a IA da sala, o backend confirma se `request.user.id` está dentro de `memberIds`.

**Criador como primeiro membro.** Quando a sala é criada, o aluno autenticado entra automaticamente em `memberIds`. Sem isto, o próprio criador criaria uma sala onde não conseguiria entrar.

**Sala por disciplina.** Quando `type` é `SUBJECT`, o frontend envia `disciplineName`. O backend valida que o nome não vem vazio e guarda esse texto apenas como etiqueta organizacional. Não há importação nem validação da entidade oficial de disciplinas neste BK, evitando uma dependência futura antes de `BK-MF1-08`.

**Convite por email.** Este BK não cria contas novas. O convite procura um utilizador existente com `role: "STUDENT"` e adiciona o seu `_id` a `memberIds`. Isto mantém o fluxo simples e verificável para os BKs seguintes.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
- `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`
- `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`
- `apps/api/src/modules/study-rooms/study-rooms.service.ts`
- `apps/api/src/modules/study-rooms/study-rooms.controller.ts`
- `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- `apps/web/src/lib/api/studyRooms.ts`
- `apps/web/src/pages/student/StudyRoomsPage.tsx`

Endpoints:
- `POST /api/study-rooms`
- `GET /api/study-rooms`
- `POST /api/study-rooms/:roomId/members`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF0-02` com `SessionGuard`.
- `BK-MF0-03` com perfil de aluno funcional.
- Decisão `DERIVADO`: salas `SUBJECT` usam `disciplineName?: string`; a associação a disciplinas oficiais só fica disponível a partir de `BK-MF1-08`.

### Passo 1 - Criar schema da sala

1. Explicação simples do objetivo.

    Neste passo vais criar schema da sala nos ficheiros `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoomDocument = HydratedDocument<StudyRoom>;
export type StudyRoomType = "FREE" | "SUBJECT";

@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    // `disciplineName` é textual para este BK não depender da entidade oficial de disciplinas, criada apenas em BK-MF1-08.
    @Prop({ trim: true, maxlength: 120 })
    disciplineName?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
```

5. Explicação do código.

    O schema define a responsabilidade persistente da sala: dono, nome, tipo, etiqueta textual de disciplina, descrição e membros. As entradas vêm sempre do aluno autenticado e do DTO validado; as saídas são documentos `StudyRoom` usados pelo service. A validação principal deste passo é estrutural: `memberIds` guarda membership real e `disciplineName` evita importar a entidade oficial de disciplinas antes de `BK-MF1-08`. O passo seguinte usa este contrato para validar criação e convites sem aceitar ownership vindo do body.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTOs

1. Explicação simples do objetivo.

    Neste passo vais criar dtos nos ficheiros `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`, `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts
import { IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

export class CreateStudyRoomDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsIn(["FREE", "SUBJECT"])
    type!: "FREE" | "SUBJECT";

    @ValidateIf((body: CreateStudyRoomDto) => body.type === "SUBJECT")
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    disciplineName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
```

```ts
// apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts
import { IsEmail } from "class-validator";

export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}
```

5. Explicação do código.

    Os DTOs delimitam as entradas HTTP: criação de sala e convite por email. `CreateStudyRoomDto` aceita `disciplineName` apenas quando `type` é `SUBJECT`, mantendo a sala por disciplina sem identificador oficial; `AddRoomMemberDto` obriga a email válido. As validações devolvem `400` antes do service quando o payload é inválido, e o service continua responsável por ownership, membership e erros `403`/`404`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { AddRoomMemberDto } from "./dto/add-room-member.dto";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoom, StudyRoomDocument } from "./schemas/study-room.schema";

@Injectable()
export class StudyRoomsService {
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async create(actor: AuthenticatedUser, dto: CreateStudyRoomDto) {
        this.assertStudent(actor);

        const disciplineName = this.resolveDisciplineName(dto);
        const room = await this.roomModel.create({
            ownerStudentId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            type: dto.type,
            disciplineName,
            description: dto.description?.trim(),
            memberIds: [new Types.ObjectId(actor.id)],
        });

        return this.toView(room);
    }

    async listMine(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const rooms = await this.roomModel
            .find({ memberIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return rooms.map((room) => this.toView(room));
    }

    async addMember(actor: AuthenticatedUser, roomId: string, dto: AddRoomMemberDto) {
        this.assertStudent(actor);
        const room = await this.ensureMember(actor.id, roomId);

        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        if (!student) {
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const exists = room.memberIds.some((id) => id.equals(studentId));

        if (!exists) {
            room.memberIds.push(studentId);
            await room.save();
        }

        return this.toView(room);
    }

    async ensureMember(studentId: string, roomId: string) {
        if (!Types.ObjectId.isValid(roomId)) {
            throw new NotFoundException("Sala não encontrada.");
        }

        const room = await this.roomModel.findOne({
            _id: new Types.ObjectId(roomId),
            memberIds: new Types.ObjectId(studentId),
        });

        if (!room) {
            throw new ForbiddenException("Só membros podem aceder a esta sala.");
        }

        return room;
    }

    private resolveDisciplineName(dto: CreateStudyRoomDto) {
        // Sala livre não fica presa a qualquer disciplina textual ou oficial.
        if (dto.type === "FREE") {
            return undefined;
        }

        const disciplineName = dto.disciplineName?.trim();
        if (!disciplineName) {
            throw new BadRequestException("Indica o nome da disciplina.");
        }

        return disciplineName;
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem gerir salas de estudo.");
        }
    }

    private toView(room: StudyRoom | StudyRoomDocument) {
        return {
            id: room._id.toString(),
            ownerStudentId: room.ownerStudentId.toString(),
            name: room.name,
            type: room.type,
            disciplineName: room.disciplineName ?? "",
            description: room.description ?? "",
            memberIds: room.memberIds.map((id) => id.toString()),
        };
    }
}
```

5. Explicação do código.

    O service é a fronteira de negócio do BK: recebe a sessão autenticada, cria salas apenas para alunos, adiciona o criador como primeiro membro e só permite convites por membros existentes. `ensureMember` devolve `403` quando o aluno não pertence à sala e `404` quando o ID da sala é inválido. A entrada `disciplineName` é normalizada no backend e nunca cria dependência de disciplinas oficiais; os BKs seguintes reutilizam `ensureMember` para partilhas e IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AddRoomMemberDto } from "./dto/add-room-member.dto";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoomsService } from "./study-rooms.service";

@Controller("api/study-rooms")
@UseGuards(SessionGuard)
export class StudyRoomsController {
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() dto: CreateStudyRoomDto) {
        return this.studyRoomsService.create(request.user as AuthenticatedUser, dto);
    }

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.studyRoomsService.listMine(request.user as AuthenticatedUser);
    }

    @Post(":roomId/members")
    addMember(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: AddRoomMemberDto,
    ) {
        return this.studyRoomsService.addMember(request.user as AuthenticatedUser, roomId, dto);
    }
}
```

5. Explicação do código.

    O controller expõe os três endpoints do BK e passa sempre `request.user` para o service. As entradas HTTP são DTOs validados e parâmetros de rota; as saídas são views normalizadas de sala. A segurança não depende de IDs enviados no body: a sessão decide quem cria, lista e convida, enquanto o service converte falhas em `400`, `403` ou `404`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [StudyRoomsController],
    providers: [StudyRoomsService],
    exports: [StudyRoomsService, MongooseModule],
})
export class StudyRoomsModule {}
```

5. Explicação do código.

    O módulo regista apenas os models que este BK possui ou já pode usar: `StudyRoom` e `User`. A ausência do schema de disciplinas oficiais é intencional e documenta a decisão `DERIVADO`. A exportação de `StudyRoomsService` permite que `BK-MF1-03` e `BK-MF1-04` validem membership antes de criarem partilhas ou chamadas de IA.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/studyRooms.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/studyRooms.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/studyRooms.ts
export type StudyRoomView = {
    id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName: string;
    description: string;
    memberIds: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createStudyRoom(input: {
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
}) {
    const response = await fetch("/api/study-rooms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<StudyRoomView>(response);
}

export async function listStudyRooms() {
    const response = await fetch("/api/study-rooms", {
        credentials: "include",
    });

    return parseResponse<StudyRoomView[]>(response);
}

export async function addRoomMember(roomId: string, email: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<StudyRoomView>(response);
}
```

5. Explicação do código.

    O cliente frontend define o contrato consumido pela página: cria salas, lista as salas do aluno e adiciona membros. Todas as chamadas usam `credentials: "include"` para transportar a sessão HttpOnly. A entrada `disciplineName` é só uma etiqueta textual; ownership e membership continuam a ser validados exclusivamente no backend.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do aluno

1. Explicação simples do objetivo.

    Neste passo vais criar página do aluno nos ficheiros `apps/web/src/pages/student/StudyRoomsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/StudyRoomsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/student/StudyRoomsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    StudyRoomView,
    addRoomMember,
    createStudyRoom,
    listStudyRooms,
} from "../../lib/api/studyRooms";

export function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoomView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setRooms(await listStudyRooms());
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);
        const form = new FormData(event.currentTarget);

        try {
            await createStudyRoom({
                name: String(form.get("name") ?? ""),
                type: String(form.get("type") ?? "FREE") as "FREE" | "SUBJECT",
                disciplineName: String(form.get("disciplineName") ?? "") || undefined,
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Sala criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a sala.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleInvite(roomId: string, email: string) {
        setError("");
        setNotice("");
        await addRoomMember(roomId, email);
        await refresh();
        setNotice("Membro adicionado à sala.");
    }

    return (
        <main>
            <h1>Salas de estudo</h1>
            <form onSubmit={handleCreate}>
                <input name="name" placeholder="Nome da sala" required />
                <select name="type">
                    <option value="FREE">Livre</option>
                    <option value="SUBJECT">Disciplina</option>
                </select>
                <input name="disciplineName" placeholder="Nome da disciplina" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A criar" : "Criar sala"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar salas.</p> : null}
            {!isLoading && rooms.length === 0 ? <p>Ainda não tens salas de estudo.</p> : null}

            {rooms.map((room) => (
                <article key={room.id}>
                    <h2>{room.name}</h2>
                    <p>{room.type} · {room.memberIds.length} membros</p>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            const form = new FormData(event.currentTarget);
                            handleInvite(room.id, String(form.get("email") ?? "")).catch(
                                (reason: Error) => setError(reason.message),
                            );
                            event.currentTarget.reset();
                        }}
                    >
                        <input name="email" type="email" placeholder="Email do colega" required />
                        <button type="submit">Adicionar</button>
                    </form>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    A página do aluno recolhe nome, tipo, disciplina textual opcional e email de convite, mas não decide permissões. A saída visível é a lista de salas onde a API confirmou membership, com estados explícitos de carregamento, lista vazia, sucesso e erro. O erro apresentado vem da resposta HTTP controlada pelo backend, permitindo testar `400` para disciplina textual em falta, `403` para utilizador não autorizado e `404` para aluno convidado inexistente.

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

    - Aluno cria sala `FREE`.
- Aluno cria sala `SUBJECT` com `disciplineName` preenchido.
- Sala `SUBJECT` sem `disciplineName` válido devolve `400`.
- Criador aparece em `memberIds`.
- Membro adiciona outro aluno por email.
- Não membro não consegue adicionar membros.
- Professor recebe `403`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Passos 1 e 2: confirmar que `StudyRoom` guarda dono, tipo, etiqueta textual de disciplina e membros sem importar disciplinas oficiais.
- Passos 3 e 4: validar criação de sala por aluno autenticado, inclusão automática do criador em `memberIds` e convite por email.
- Passos 5 e 6: confirmar que o módulo exporta `StudyRoomsService` para os BKs seguintes e que o cliente usa sessão HttpOnly.
- Passo 7: validar carregamento, lista vazia, sucesso ao criar/adicionar membro e erro vindo da API.

## Cenários negativos específicos

- Sala `SUBJECT` sem `disciplineName` válido devolve `400`.
- Não membro a adicionar aluno devolve `403`.
- Email sem aluno existente devolve `404`.
- Professor autenticado a usar fluxo de aluno devolve `403`.

## Expected results
- `POST /api/study-rooms` com aluno autenticado e sala `FREE` devolve `201` com `memberIds` a incluir o criador.
- `POST /api/study-rooms` com `type: "SUBJECT"` e `disciplineName` preenchido devolve `201` sem depender de disciplinas oficiais.
- `POST /api/study-rooms` com `type: "SUBJECT"` sem `disciplineName` válido devolve `400`.
- `GET /api/study-rooms` devolve apenas salas onde o aluno autenticado está em `memberIds`.
- `POST /api/study-rooms/:roomId/members` devolve `403` para não membros, `404` para aluno inexistente e a sala atualizada quando o convite é válido.
- Frontend mostra carregamento, lista vazia, sucesso ao criar/adicionar membro e erros vindos da API.

## Critérios de aceite
- `StudyRoom` guarda owner, tipo, `disciplineName` opcional e membros.
- Todas as ações usam sessão autenticada.
- `StudyRoomsService.ensureMember` fica exportável para BKs seguintes.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa uma sala com dois alunos e uma tentativa de acesso por terceiro aluno.

## Evidence para PR/defesa
- Screenshot de criação de sala.
- Screenshot de membro adicionado.
- Resposta `403` para não membro.
- Registo com `memberIds`.

## Handoff
`BK-MF1-03` deve reutilizar `StudyRoomsService.ensureMember` antes de criar ou listar partilhas. `BK-MF1-04` deve usar a mesma regra antes de chamar IA.

## Changelog
- 2026-05-30: Guia reescrito com módulo completo, validação de disciplina e membership reutilizável.
