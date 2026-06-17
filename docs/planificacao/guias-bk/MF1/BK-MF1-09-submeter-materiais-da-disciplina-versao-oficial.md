# BK-MF1-09 - Submeter materiais da disciplina (versão oficial).

## Header
- `doc_id`: `GUIA-BK-MF1-09`
- `bk_id`: `BK-MF1-09`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF1-08`
- `rf_rnf`: `RF21`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-10`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF21`: permitir que professores submetam materiais oficiais de uma disciplina. Estes materiais são a fonte autorizada para a IA limitada de `BK-MF1-11`.

## Importância
Materiais oficiais são diferentes dos materiais privados do aluno. A IA docente só deve responder com base em fontes aprovadas pelo professor da disciplina. Este BK cria essa fronteira de dados.

## Scope-in
- Criar `OfficialMaterial`.
- Submeter material `TEXT` ou `URL`.
- Marcar `TEXT` como `PROCESSED`.
- Marcar `URL` como `REFERENCE_ONLY`.
- Listar materiais oficiais de uma disciplina do professor.

## Scope-out
- Upload de ficheiros pesados.
- Extração automática de PDF/DOCX.
- Versionamento e reversão de materiais.
- Aprovação por coordenação escolar.

## Estado antes
- `BK-MF1-08` criou disciplinas associadas a turmas.
- O professor de desenvolvimento de `BK-MF1-07` consegue autenticar-se e gerir uma disciplina sua.
- Ainda não existe fonte oficial por disciplina.

## Estado depois
- Professor submete texto oficial processável.
- Professor submete URL como referência.
- IA limitada só pode usar materiais `PROCESSED`.
- Materiais ficam ligados a `subjectId`, `classId` e `teacherId`.

## Pré-requisitos
- `SubjectsModule` exporta `SubjectsService`.
- `SessionGuard` funcional.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Disciplina criada por esse professor no `BK-MF1-08`.
- Validação global de DTOs ativa.

## Glossário
- **Material oficial**: conteúdo fornecido pelo professor para uma disciplina.
- **PROCESSED**: texto pronto para ser usado por IA.
- **REFERENCE_ONLY**: referência guardada, mas sem texto suficiente para resposta factual.

## Conceitos teóricos
**Material oficial.** É conteúdo fornecido pelo professor para uma disciplina. O aluno pode confiar que este material representa a versão oficial usada pela turma.

**Texto vs URL.** `textContent` guarda texto que o sistema pode ler diretamente. `sourceUrl` guarda uma ligação. Uma ligação não é automaticamente conhecimento, por isso fica como referência até existir texto associado.

**Estado do material.** `PROCESSED` significa que o material pode alimentar IA. `REFERENCE_ONLY` significa que o material aparece para consulta humana, mas não deve ser usado como base factual pela IA.

**Ligação à disciplina e turma.** O material guarda `subjectId`, `classId` e `teacherId`. Assim, a IA limitada consegue procurar fontes por disciplina e ainda manter rasto da turma e do professor.

**Validação com professor real.** Usa o professor de desenvolvimento criado no `BK-MF1-07` para submeter materiais. Isto confirma que o `teacherId` vem da sessão e que o service rejeita alunos ou professores sem ownership da disciplina.

**Guardrail contra invenção.** A IA de `BK-MF1-11` só consulta materiais `PROCESSED`. Esta regra reduz o risco de respostas baseadas em URLs que o sistema nunca leu.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/official-materials/schemas/official-material.schema.ts`
- `apps/api/src/modules/official-materials/dto/create-official-material.dto.ts`
- `apps/api/src/modules/official-materials/official-materials.service.ts`
- `apps/api/src/modules/official-materials/official-materials.controller.ts`
- `apps/api/src/modules/official-materials/official-materials.module.ts`
- `apps/web/src/lib/api/officialMaterials.ts`
- `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`

Endpoints:
- `POST /api/teacher/subjects/:subjectId/materials`
- `GET /api/teacher/subjects/:subjectId/materials`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `SubjectsModule` exporta `SubjectsService`.
- `SessionGuard` funcional.
- Professor de desenvolvimento criado pela seed local de `BK-MF1-07`.
- Disciplina criada por esse professor no `BK-MF1-08`.
- Validação global de DTOs ativa.

### Passo 1 - Criar schema

1. Explicação simples do objetivo.

    Neste passo vais criar schema nos ficheiros `apps/api/src/modules/official-materials/schemas/official-material.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/official-materials/schemas/official-material.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/official-materials/schemas/official-material.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OfficialMaterialDocument = HydratedDocument<OfficialMaterial>;
export type OfficialMaterialType = "TEXT" | "URL";
export type OfficialMaterialStatus = "PROCESSED" | "REFERENCE_ONLY";

@Schema({ timestamps: true, collection: "official_materials" })
export class OfficialMaterial {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["TEXT", "URL"] })
    type!: OfficialMaterialType;

    @Prop({ trim: true, maxlength: 20000 })
    textContent?: string;

    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    @Prop({ required: true, enum: ["PROCESSED", "REFERENCE_ONLY"] })
    status!: OfficialMaterialStatus;
}

export const OfficialMaterialSchema = SchemaFactory.createForClass(OfficialMaterial);
OfficialMaterialSchema.index({ subjectId: 1, createdAt: -1 });
OfficialMaterialSchema.index({ teacherId: 1, subjectId: 1 });
```

5. Explicação do código.

    Este passo pertence ao fluxo de materiais oficiais: recebe sessão de professor, `subjectId` e conteúdo validado, devolve material ligado a `subjectId`, `classId` e `teacherId`, e separa texto processado de URL de referência. As validações esperadas são `403` para aluno, `404` para disciplina fora do professor e exclusão de campos não persistidos. O resultado é a fonte oficial que `BK-MF1-11` pode consultar.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/official-materials/dto/create-official-material.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/official-materials/dto/create-official-material.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/official-materials/dto/create-official-material.dto.ts
import {
    IsIn,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateOfficialMaterialDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsIn(["TEXT", "URL"])
    type!: "TEXT" | "URL";

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "TEXT")
    @IsString()
    @MinLength(20)
    @MaxLength(20000)
    textContent?: string;

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;
}
```

5. Explicação do código.

    O DTO aceita apenas os campos persistidos e justificados pelo RF: título, tipo, texto ou URL. O campo livre de notas foi removido porque não era guardado no schema nem usado por `BK-MF1-11`, criando drift silencioso entre frontend e backend. Payload inválido devolve `400`; ownership da disciplina continua a ser validado no service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/official-materials/official-materials.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/official-materials/official-materials.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/official-materials/official-materials.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
} from "./schemas/official-material.schema";

@Injectable()
export class OfficialMaterialsService {
    constructor(
        @InjectModel(OfficialMaterial.name)
        private readonly materialModel: Model<OfficialMaterialDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialMaterialDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const material = await this.materialModel.create({
            subjectId: subject._id,
            classId: subject.classId,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            type: dto.type,
            textContent: dto.type === "TEXT" ? dto.textContent?.trim() : undefined,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            status: dto.type === "TEXT" ? "PROCESSED" : "REFERENCE_ONLY",
        });

        return this.toView(material);
    }

    async listForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const materials = await this.materialModel
            .find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return materials.map((material) => this.toView(material));
    }

    async findProcessedBySubject(subject: Subject) {
        return this.materialModel
            .find({ subjectId: subject._id, status: "PROCESSED" })
            .sort({ createdAt: -1 });
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir materiais oficiais.");
        }
    }

    private toView(material: OfficialMaterial | OfficialMaterialDocument) {
        return {
            id: material._id.toString(),
            subjectId: material.subjectId.toString(),
            classId: material.classId.toString(),
            teacherId: material.teacherId.toString(),
            title: material.title,
            type: material.type,
            textContent: material.textContent ?? "",
            sourceUrl: material.sourceUrl ?? "",
            status: material.status,
        };
    }
}
```

5. Explicação do código.

    A página do professor envia apenas o contrato suportado pelo backend. Para `TEXT`, envia `textContent`; para `URL`, envia `sourceUrl`. Não existe campo livre de notas no formulário, evitando prometer metadados que a API não persiste. A sessão e o `subjectId` da rota continuam a ser validados pelo backend.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/official-materials/official-materials.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/official-materials/official-materials.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/official-materials/official-materials.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import { OfficialMaterialsService } from "./official-materials.service";

@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    constructor(private readonly officialMaterialsService: OfficialMaterialsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: CreateOfficialMaterialDto,
    ) {
        return this.officialMaterialsService.create(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.officialMaterialsService.listForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de materiais oficiais: recebe sessão de professor, `subjectId` e conteúdo validado, devolve material ligado a `subjectId`, `classId` e `teacherId`, e separa texto processado de URL de referência. As validações esperadas são `403` para aluno, `404` para disciplina fora do professor e exclusão de campos não persistidos. O resultado é a fonte oficial que `BK-MF1-11` pode consultar.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/official-materials/official-materials.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/official-materials/official-materials.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/official-materials/official-materials.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { OfficialMaterialsController } from "./official-materials.controller";
import { OfficialMaterialsService } from "./official-materials.service";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "./schemas/official-material.schema";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
        ]),
    ],
    controllers: [OfficialMaterialsController],
    providers: [OfficialMaterialsService],
    exports: [OfficialMaterialsService, MongooseModule],
})
export class OfficialMaterialsModule {}
```

5. Explicação do código.

    Este passo pertence ao fluxo de materiais oficiais: recebe sessão de professor, `subjectId` e conteúdo validado, devolve material ligado a `subjectId`, `classId` e `teacherId`, e separa texto processado de URL de referência. As validações esperadas são `403` para aluno, `404` para disciplina fora do professor e exclusão de campos não persistidos. O resultado é a fonte oficial que `BK-MF1-11` pode consultar.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/officialMaterials.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/officialMaterials.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/officialMaterials.ts
export type OfficialMaterialView = {
    id: string;
    subjectId: string;
    classId: string;
    title: string;
    type: "TEXT" | "URL";
    textContent: string;
    sourceUrl: string;
    status: "PROCESSED" | "REFERENCE_ONLY";
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createOfficialMaterial(
    subjectId: string,
    input: { title: string; type: "TEXT" | "URL"; textContent?: string; sourceUrl?: string },
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<OfficialMaterialView>(response);
}

export async function listOfficialMaterials(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        credentials: "include",
    });

    return parseResponse<OfficialMaterialView[]>(response);
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de materiais oficiais: recebe sessão de professor, `subjectId` e conteúdo validado, devolve material ligado a `subjectId`, `classId` e `teacherId`, e separa texto processado de URL de referência. As validações esperadas são `403` para aluno, `404` para disciplina fora do professor e exclusão de campos não persistidos. O resultado é a fonte oficial que `BK-MF1-11` pode consultar.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do professor

1. Explicação simples do objetivo.

    Neste passo vais criar página do professor nos ficheiros `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    OfficialMaterialView,
    createOfficialMaterial,
    listOfficialMaterials,
} from "../../lib/api/officialMaterials";

type Props = {
    subjectId: string;
};

export function TeacherOfficialMaterialsPage({ subjectId }: Props) {
    const [materials, setMaterials] = useState<OfficialMaterialView[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setMaterials(await listOfficialMaterials(subjectId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createOfficialMaterial(subjectId, {
                title: String(form.get("title") ?? ""),
                type,
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Material oficial guardado.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar o material.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Materiais oficiais</h1>
            <form onSubmit={handleSubmit}>
                <input name="title" placeholder="Título" required />
                <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                    <option value="TEXT">Texto</option>
                    <option value="URL">URL</option>
                </select>
                {type === "TEXT" ? <textarea name="textContent" required /> : null}
                {type === "URL" ? <input name="sourceUrl" type="url" required /> : null}
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A guardar" : "Guardar material"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar materiais.</p> : null}
            {!isLoading && materials.length === 0 ? <p>Ainda não existem materiais oficiais.</p> : null}

            {materials.map((material) => (
                <article key={material.id}>
                    <h2>{material.title}</h2>
                    <p>{material.type} · {material.status}</p>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    Este passo pertence ao fluxo de materiais oficiais: recebe sessão de professor, `subjectId` e conteúdo validado, devolve material ligado a `subjectId`, `classId` e `teacherId`, e separa texto processado de URL de referência. A página mostra carregamento, vazio, sucesso de gravação e erro. As validações esperadas são `403` para aluno, `404` para disciplina fora do professor e exclusão de campos não persistidos. O resultado é a fonte oficial que `BK-MF1-11` pode consultar.

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

    - Professor dono da disciplina cria material `TEXT`.
- Material `TEXT` fica `PROCESSED`.
- Material `URL` fica `REFERENCE_ONLY`.
- Professor sem ownership recebe `404`.
- Aluno recebe `403`.
- `BK-MF1-11` usa apenas materiais `PROCESSED`.
- Frontend mostra carregamento, vazio, sucesso de gravação e erros da API.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Validação operacional por passo

- Antes dos passos técnicos: inicia sessão com o professor de desenvolvimento criado no `BK-MF1-07`.
- Passos 1 e 2: confirmar schema e DTOs apenas com campos persistidos: título, tipo, texto ou URL.
- Passos 3 e 4: validar ownership da disciplina antes de criar/listar materiais oficiais.
- Passos 5 e 6: confirmar export de `OfficialMaterialsService` e cliente frontend sem campos não suportados.
- Passo 7: validar carregamento, vazio, sucesso de gravação e erros da API.

## Cenários negativos específicos

- Professor sem ownership da disciplina recebe `404`.
- Aluno recebe `403`.
- Material `URL` fica `REFERENCE_ONLY` e não alimenta `BK-MF1-11`.
- Payload com campo livre de notas não faz parte do contrato frontend.

## Expected results
- `POST /api/teacher/subjects/:subjectId/materials` com professor dono e `TEXT` válido devolve `201` com `status: "PROCESSED"`.
- `POST /api/teacher/subjects/:subjectId/materials` com `URL` válido devolve `201` com `status: "REFERENCE_ONLY"`.
- O professor de desenvolvimento criado no `BK-MF1-07` consegue criar materiais apenas em disciplina sua.
- Professor sem ownership da disciplina devolve `404`; aluno devolve `403`.
- Payload com campo livre de notas não faz parte do contrato e não é enviado pelo frontend.
- `GET /api/teacher/subjects/:subjectId/materials` lista apenas materiais da disciplina do professor autenticado.
- Frontend mostra carregamento, vazio, sucesso de gravação e erros da API.

## Critérios de aceite
- Não existe campo duplicado para conteúdo.
- Não existe campo livre de notas no DTO nem no frontend.
- `textContent` e `sourceUrl` têm responsabilidades separadas.
- O material guarda `subjectId`, `classId` e `teacherId`.
- `OfficialMaterialsModule` exporta service e schema.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Confirma que um material `URL` não alimenta a IA como texto processado.

## Evidence para PR/defesa
- Prova de login local com o professor criado no `BK-MF1-07`.
- Screenshot de material `TEXT` criado.
- Screenshot de material `URL` criado.
- Resposta `403` para aluno.
- Diff do schema sem campo genérico duplicado.

## Handoff
`BK-MF1-10` associa voz docente à mesma disciplina criada pelo professor de desenvolvimento. `BK-MF1-11` consulta `OfficialMaterialsService.findProcessedBySubject`.

## Changelog
- 2026-05-31: Pré-requisitos e validação alinhados com a seed local de professor criada no BK-MF1-07.
- 2026-05-30: Guia reescrito com schema sem campo duplicado, módulo exportado e estados de fonte explícitos.
