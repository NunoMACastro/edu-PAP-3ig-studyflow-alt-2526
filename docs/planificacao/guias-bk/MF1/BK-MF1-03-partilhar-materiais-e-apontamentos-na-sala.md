# BK-MF1-03 - Partilhar materiais e apontamentos na sala.

## Header
- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`
- `last_updated`: `2026-07-10`

## Objetivo
Implementar `RF15`: permitir que membros de uma sala partilhem apontamentos, URLs e referências de material dentro da sala.

## Importância
A partilha é a fonte colaborativa para a IA da sala. O sistema precisa de guardar quem partilhou, em que sala, e que conteúdo pode ser usado como fonte textual.

## Scope-in
- Criar `RoomShare`.
- Permitir tipos `NOTE`, `URL` e `MATERIAL_REF`.
- Validar que o autor é membro da sala.
- Validar que `MATERIAL_REF` aponta para material do próprio aluno criado na MF0.
- Listar partilhas apenas para membros.
- Expor partilhas textuais para `BK-MF1-04`.

## Scope-out
- Upload de ficheiros.
- Extração automática de páginas externas.
- Edição e remoção de partilhas.
- IA da sala.

## Estado antes
- `BK-MF1-02` criou salas e membership.
- Ainda não existem conteúdos partilhados.

## Estado depois
- Membro cria partilha.
- Membro lista partilhas.
- Não membro recebe erro.
- Partilhas textuais ficam identificadas para IA.

## Pré-requisitos
- `StudyRoomsModule` exporta `StudyRoomsService`.
- `BK-MF0-08` criou `Material` com `userId`, `status` e `contentText`.
- `SessionGuard`.
- Validação global de DTOs.

## Glossário
- **Partilha**: conteúdo colocado numa sala por um membro.
- **NOTE**: apontamento textual escrito diretamente.
- **URL**: ligação guardada como referência.
- **MATERIAL_REF**: referência a material já existente do próprio aluno autenticado.

## Conceitos teóricos
**Partilha dentro da sala.** Uma partilha é qualquer conteúdo que um membro coloca no espaço comum: apontamento escrito, URL ou referência a material. A partilha pertence à sala através de `roomId` e pertence ao aluno através de `authorStudentId`.

**Diferença entre referência e fonte.** Uma URL guardada não significa que o sistema leu a página. Enquanto não houver texto copiado ou extraído, a URL é apenas referência visual. A IA só pode usar texto que está guardado em `textContent`.

**`usableByAi`.** Este booleano indica se a partilha tem texto suficiente para alimentar a IA da sala. Ele é calculado no backend a partir de texto escrito no apontamento, texto copiado de uma URL ou `contentText` de um material próprio já processável. O frontend não decide sozinho se uma partilha é segura para IA.

**`MATERIAL_REF` e ownership.** Uma referência de material nunca prova ownership por texto colado. O backend consulta a coleção `materials` da MF0 com `_id` e `userId` do aluno autenticado. Se o material não existir para esse aluno, a partilha é rejeitada. Se existir mas não estiver `READY` ou não tiver `contentText`, a referência pode ser guardada, mas não alimenta IA.

**`copiedText`.** Este campo permite ao aluno colar um excerto textual quando partilha uma URL. O texto copiado fica em `textContent` e pode tornar a partilha elegível para IA, desde que passe a validação mínima. Para `MATERIAL_REF`, o texto usado pela IA vem sempre do material validado na base de dados.

**Membership antes de conteúdo.** Antes de criar ou listar partilhas, o service chama `StudyRoomsService.ensureMember`. Isto impede que um aluno coloque conteúdo numa sala onde não participa.

**Módulo acumulado.** Este BK edita `study-rooms.module.ts` a partir da versão criada em `BK-MF1-02`: mantém `StudyRoomsController` e `StudyRoomsService`, acrescenta `RoomSharesController` e `RoomSharesService`, e exporta `RoomSharesService` para `BK-MF1-04`. O BK seguinte deve partir desta versão, não voltar ao módulo de salas simples.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`
- `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`
- `apps/api/src/modules/study-rooms/room-shares.service.ts`
- `apps/api/src/modules/study-rooms/room-shares.controller.ts`
- `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- `apps/web/src/lib/api/roomShares.ts`
- `apps/web/src/pages/student/RoomSharesPage.tsx`

Endpoints:
- `POST /api/study-rooms/:roomId/shares`
- `GET /api/study-rooms/:roomId/shares`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `StudyRoomsModule` exporta `StudyRoomsService`.
- `BK-MF0-08` criou `Material` com `userId`, `status` e `contentText`.
- `SessionGuard`.
- Validação global de DTOs.

### Passo 1 - Criar schema da partilha

1. Explicação simples do objetivo.

    Neste passo vais criar schema da partilha nos ficheiros `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/schemas/room-share.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoomShareDocument = HydratedDocument<RoomShare>;
export type RoomShareType = "NOTE" | "URL" | "MATERIAL_REF";

@Schema({ timestamps: true, collection: "room_shares" })
export class RoomShare {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTE", "URL", "MATERIAL_REF"] })
    type!: RoomShareType;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 12000 })
    textContent?: string;

    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    @Prop({ type: Types.ObjectId, ref: "Material" })
    materialId?: Types.ObjectId;

    @Prop({ required: true, default: false })
    usableByAi!: boolean;
}

export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
RoomShareSchema.index({ roomId: 1, usableByAi: 1 });
```

5. Explicação do código.

    O schema define a persistência da partilha: sala, autor, tipo, título, texto, URL, material referenciado e elegibilidade para IA. As entradas chegam pelo DTO e pela sessão; as saídas são views usadas pela listagem e pelo `BK-MF1-04`. A validação de ownership não vive no schema, mas o campo `materialId` só pode ser preenchido depois de o service confirmar que o material pertence ao aluno autenticado.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts
import {
    IsIn,
    IsMongoId,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateRoomShareDto {
    @IsIn(["NOTE", "URL", "MATERIAL_REF"])
    type!: "NOTE" | "URL" | "MATERIAL_REF";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "NOTE")
    @IsString()
    @MinLength(10)
    @MaxLength(12000)
    textContent?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "MATERIAL_REF")
    @IsMongoId()
    materialId?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsString()
    @MaxLength(12000)
    copiedText?: string;
}
```

5. Explicação do código.

    O DTO valida a forma externa da partilha. `NOTE` exige texto próprio, `URL` exige URL com protocolo e pode receber `copiedText`, e `MATERIAL_REF` exige `materialId`. Esta validação devolve `400` para payloads mal formados, mas não substitui ownership: o service continua a confirmar membership da sala e pertença real do material ao aluno.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/study-rooms/room-shares.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-shares.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-shares.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Material, MaterialDocument } from "../materials/schemas/material.schema";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
export class RoomSharesService {
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    async create(actor: AuthenticatedUser, roomId: string, dto: CreateRoomShareDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const material = await this.resolveOwnedMaterial(actor.id, dto);
        const textContent = this.resolveTextContent(dto, material);
        const usableByAi = Boolean(textContent && textContent.length >= 10);

        const share = await this.shareModel.create({
            roomId: room._id,
            authorStudentId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            textContent,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            materialId: material?._id,
            usableByAi,
        });

        return this.toView(share);
    }

    async list(actor: AuthenticatedUser, roomId: string) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);

        const shares = await this.shareModel
            .find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .lean();

        return shares.map((share) => this.toView(share));
    }

    async findUsableSharesForRoom(roomId: string, sourceIds: string[] = []) {
        const filter: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
        };

        if (sourceIds.length > 0) {
            const validIds = sourceIds.filter((id) => Types.ObjectId.isValid(id));
            filter._id = { $in: validIds.map((id) => new Types.ObjectId(id)) };
        }

        return this.shareModel.find(filter).sort({ createdAt: -1 });
    }

    private async resolveOwnedMaterial(studentId: string, dto: CreateRoomShareDto) {
        if (dto.type !== "MATERIAL_REF") {
            return undefined;
        }

        if (!dto.materialId || !Types.ObjectId.isValid(dto.materialId)) {
            throw new BadRequestException("Material inválido.");
        }

        const material = await this.materialModel
            .findOne({
                _id: new Types.ObjectId(dto.materialId),
                userId: new Types.ObjectId(studentId),
            });

        if (!material) {
            throw new NotFoundException("Material não encontrado para este aluno.");
        }

        return material;
    }

    private resolveTextContent(dto: CreateRoomShareDto, material?: MaterialDocument) {
        if (dto.type === "NOTE") {
            return dto.textContent?.trim();
        }

        if (dto.type === "URL") {
            return dto.copiedText?.trim();
        }

        if (material?.status === "READY" && material.contentText?.trim()) {
            return material.contentText.trim();
        }

        return undefined;
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem partilhar na sala.");
        }
    }

    private toView(share: RoomShare | RoomShareDocument) {
        return {
            id: share._id.toString(),
            roomId: share.roomId.toString(),
            authorStudentId: share.authorStudentId.toString(),
            type: share.type,
            title: share.title,
            textContent: share.textContent ?? "",
            sourceUrl: share.sourceUrl ?? "",
            materialId: share.materialId?.toString() ?? "",
            usableByAi: share.usableByAi,
        };
    }
}
```

5. Explicação do código.

    O service aplica as regras críticas do BK. Primeiro confirma que o actor é aluno e membro da sala; depois valida `MATERIAL_REF` contra `materials.userId`, usando a sessão como fonte de ownership. As entradas são `roomId`, DTO e `request.user`; as saídas são partilhas normalizadas. Erros esperados: `400` para material inválido, `403` para professor/não membro e `404` para material que não pertence ao aluno. O `BK-MF1-04` consome apenas `findUsableSharesForRoom`, que filtra por sala, IDs válidos e `usableByAi`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/study-rooms/room-shares.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-shares.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-shares.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomSharesService } from "./room-shares.service";

@Controller("api/study-rooms/:roomId/shares")
@UseGuards(SessionGuard)
export class RoomSharesController {
    constructor(private readonly roomSharesService: RoomSharesService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: CreateRoomShareDto,
    ) {
        return this.roomSharesService.create(request.user as AuthenticatedUser, roomId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("roomId") roomId: string) {
        return this.roomSharesService.list(request.user as AuthenticatedUser, roomId);
    }
}
```

5. Explicação do código.

    O controller liga HTTP ao service sem aceitar ownership vindo do body. `roomId` vem da rota, o conteúdo vem do DTO e o aluno vem da sessão autenticada. Criar e listar partilhas devolvem `403` quando `StudyRoomsService.ensureMember` bloqueia acesso, mantendo o mesmo contrato de membership definido em `BK-MF1-02`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Atualizar módulo da sala

1. Explicação simples do objetivo.

    Neste passo vais atualizar módulo da sala nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios. Este ficheiro é acumulado sobre `BK-MF1-02`; não removas o service nem o controller de salas.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Material, MaterialSchema } from "../materials/schemas/material.schema";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { RoomSharesController } from "./room-shares.controller";
import { RoomSharesService } from "./room-shares.service";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: User.name, schema: UserSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController],
    providers: [StudyRoomsService, RoomSharesService],
    exports: [StudyRoomsService, RoomSharesService, MongooseModule],
})
export class StudyRoomsModule {}
```

5. Explicação do código.

    O módulo junta o contrato de salas com o contrato de materiais da MF0. Regista `MaterialSchema` para validar referências do próprio aluno e mantém `StudyRoomsService` exportado para membership. Também exporta `RoomSharesService`, que é a dependência direta de `BK-MF1-04` para obter fontes textuais validadas da sala. Não importa módulos de disciplinas oficiais, porque a cadeia `BK-MF1-02` a `BK-MF1-04` ainda não depende de disciplinas formais.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/roomShares.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/roomShares.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/roomShares.ts
export type RoomShareView = {
    id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent: string;
    sourceUrl: string;
    materialId: string;
    usableByAi: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createRoomShare(
    roomId: string,
    input: {
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        sourceUrl?: string;
        materialId?: string;
        copiedText?: string;
    },
) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<RoomShareView>(response);
}

export async function listRoomShares(roomId: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        credentials: "include",
    });

    return parseResponse<RoomShareView[]>(response);
}
```

5. Explicação do código.

    O cliente frontend envia apenas dados de criação e transporta a sessão por cookie. `materialId` identifica o material escolhido, mas não prova ownership; essa prova acontece no backend contra `materials.userId`. `copiedText` serve para URLs, não para legitimar referências a materiais.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página da sala

1. Explicação simples do objetivo.

    Neste passo vais criar página da sala nos ficheiros `apps/web/src/pages/student/RoomSharesPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/RoomSharesPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/student/RoomSharesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { RoomShareView, createRoomShare, listRoomShares } from "../../lib/api/roomShares";

type Props = {
    roomId: string;
};

export function RoomSharesPage({ roomId }: Props) {
    const [shares, setShares] = useState<RoomShareView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setShares(await listRoomShares(roomId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [roomId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createRoomShare(roomId, {
                type: String(form.get("type") ?? "NOTE") as "NOTE" | "URL" | "MATERIAL_REF",
                title: String(form.get("title") ?? ""),
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
                materialId: String(form.get("materialId") ?? ""),
                copiedText: String(form.get("copiedText") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Partilha criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível partilhar.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Partilhas da sala</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTE">Apontamento</option>
                    <option value="URL">URL</option>
                    <option value="MATERIAL_REF">Material</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="textContent" placeholder="Texto do apontamento" />
                <input name="sourceUrl" type="url" placeholder="URL" />
                <input name="materialId" placeholder="ID do material" />
                <textarea name="copiedText" placeholder="Texto copiado da URL para a IA" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A partilhar" : "Partilhar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar partilhas.</p> : null}
            {!isLoading && shares.length === 0 ? <p>Ainda não existem partilhas nesta sala.</p> : null}
            {shares.map((share) => (
                <article key={share.id}>
                    <h2>{share.title}</h2>
                    <p>{share.type} · {share.usableByAi ? "Fonte de IA" : "Referência"}</p>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    A página permite criar apontamentos, URLs e referências a materiais, mas a UI é apenas uma camada de entrada. A saída mostra se a partilha ficou elegível para IA e cobre carregamento, lista vazia, sucesso de criação e erro. O teste decisivo é backend: uma referência a material de outro aluno deve falhar, mesmo que o utilizador tente enviar texto copiado no formulário.

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

- Membro cria `NOTE` com texto e `usableByAi` fica verdadeiro.
- Membro cria `URL` e `usableByAi` fica falso sem texto copiado.
- Membro cria `MATERIAL_REF` para material próprio `READY` e `usableByAi` fica verdadeiro quando existe `contentText`.
- `MATERIAL_REF` para material de outro aluno devolve `404`.
- Não membro recebe `403`.
- Professor recebe `403`.
- Listagem só funciona para membros.
- `RoomSharesService.findUsableSharesForRoom` devolve apenas fontes textuais.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Passos 1 e 2: confirmar que a partilha guarda sala, autor, tipo, conteúdo e estado `usableByAi` coerente com o tipo.
- Passos 3 e 4: validar membership antes de criar/listar e validar `MATERIAL_REF` contra materiais do próprio aluno.
- Passos 5 e 6: confirmar export de `RoomSharesService` e cliente frontend com sessão HttpOnly.
- Passo 7: validar carregamento, lista vazia, sucesso ao criar partilha e erro de autorização/validação.

## Cenários negativos específicos

- Não membro ou professor recebe `403`.
- `MATERIAL_REF` para material de outro aluno devolve `404`.
- Partilha sem texto processável não alimenta IA.

## Expected results
- `POST /api/study-rooms/:roomId/shares` com `NOTE` válida devolve `201` e `usableByAi: true`.
- `POST /api/study-rooms/:roomId/shares` com `URL` sem `copiedText` devolve `201` e `usableByAi: false`.
- `POST /api/study-rooms/:roomId/shares` com `MATERIAL_REF` próprio e `READY` devolve `201` com `materialId` e texto derivado do material.
- `POST /api/study-rooms/:roomId/shares` com material de outro aluno devolve `404` e não cria partilha.
- `GET /api/study-rooms/:roomId/shares` devolve `403` para não membros e lista apenas para membros.
- Frontend mostra carregamento, lista vazia, sucesso ao criar partilha e erros de validação/autorização.

## Critérios de aceite
- `RoomShare` guarda autor, sala, tipo e conteúdo.
- Membership é validada antes de criar e listar.
- `MATERIAL_REF` é validado contra materiais do próprio aluno criados na MF0.
- Partilhas sem texto não alimentam IA.
- `StudyRoomsModule` exporta `RoomSharesService`.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Inclui teste com terceiro aluno fora da sala.

## Evidence para PR/defesa
- Screenshot de apontamento partilhado.
- Screenshot de URL como referência.
- Resposta `403` para não membro.
- Lista de fontes elegíveis para IA.

## Handoff
`BK-MF1-04` deve usar `RoomSharesService.findUsableSharesForRoom` e bloquear a IA se a sala não tiver fontes textuais.

## Changelog
- 2026-05-30: Guia reescrito com schema completo, módulo atualizado e fontes textuais explícitas.
