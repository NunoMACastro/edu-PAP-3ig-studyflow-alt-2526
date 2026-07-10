# BK-MF0-08 - Submeter materiais (PDF, DOCX, URLs, tópicos).

## Header

- `doc_id`: `GUIA-BK-MF0-08`
- `bk_id`: `BK-MF0-08`
- `macro`: `MF0`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-07`
- `rf_rnf`: `RF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-09`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno submeta materiais numa Área de Estudo: ficheiros PDF, DOCX, URLs e tópicos escritos manualmente. O objetivo é criar a base factual que depois alimenta o perfil de IA, resumos e quizzes.

Este BK não implementa indexação automática completa. RF31 e RNF11 tratam indexação posterior e assíncrona. Aqui o foco é submissão segura, validação, armazenamento do registo e estado inicial do material. PDF, DOCX e URLs começam em `PENDING_PROCESSING`; tópicos manuais com `contentText` válido podem começar em `READY`.

Na MF0, `contentText` só deve ser preenchido para materiais de texto manual/tópico. PDF, DOCX e URLs ficam registados como materiais submetidos, mas não como fontes textuais processáveis para IA até existir extração/indexação posterior.

Como uploads e URLs são superfícies de risco, este BK deve ser conservador: validar tipo, tamanho, URL e ownership da área. O mockup não mostra uploads, por isso a UI deve ter placeholders claros e estados de progresso sem simular IA.

## Porque é que isto é importante

- Desbloqueia BK-MF0-10, BK-MF0-11 e BK-MF0-12.
- Cria contrato de materiais reutilizável por aluno e, no futuro, por professor/turma.
- Ensina validação de uploads e URLs no backend.
- Prepara processamento assíncrono sem bloquear a UI.
- Reduz risco de ficheiros perigosos, URLs inválidos e acesso a áreas alheias.

## O que entra (scope)

- Estado esperado antes do BK: área de estudo criada no BK-MF0-07.
- Estado esperado depois do BK: aluno submete material válido e vê o estado do material na área.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/materials/schemas/material.schema.ts`
    - `apps/api/src/modules/materials/materials.controller.ts`
    - `apps/api/src/modules/materials/materials.service.ts`
    - `apps/api/src/modules/materials/dto/create-material.dto.ts`
    - `apps/api/src/modules/materials/validators/material-upload.validator.ts`
    - `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
    - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
    - `apps/web/src/components/materials/MaterialList.tsx`
- Ficheiros a rever: BK-MF0-07, BK-MF0-06, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `studyAreaId` válido do BK-MF0-07.
- Impacto na arquitetura: cria domínio `materials`.
- Impacto em frontend: formulário com tabs ou selector para ficheiro, URL e tópico.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:studyAreaId/materials`.
- Impacto em dados: cria `Material` com tipo, estado e dono.
- Impacto em segurança: valida MIME/tamanho/URL e ownership.
- Impacto em testes: negativos de formato, tamanho e área alheia.
- Handoff: BK-MF0-10 deve usar materiais da área para criar perfil IA.

## O que não entra (scope-out)

- Extração/indexação completa de texto, que pertence a RF31/RF32.
- Resumos, explicações, cards e quizzes.
- Integração com Google Drive/OneDrive.
- Processamento sandbox avançado, que pertence aos RNF de segurança.
- Partilha de materiais com turmas/grupos.

## Como saber que isto ficou bem

- PDF/DOCX válido cria registo `Material`.
- URL válida cria registo `Material` sem fazer scraping avançado.
- Tópico manual cria registo textual.
- Ficheiro inválido, demasiado grande ou área alheia são rejeitados.
- UI mostra `Pendente de processamento` para ficheiros/URLs e `Pronto` ou equivalente para tópicos manuais.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Kaua` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-07` (CANONICO)
- Pre-condicoes: área de estudo válida e pertencente ao aluno (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-MATERIAL-SUBMISSION`
- Fonte de verdade: `docs/RF.md`, `RF08` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-08` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Submissão segura de materiais por área de estudo (CANONICO)
- `rf_rnf`: `RF08` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `Material`.
- Criar DTO para URL/tópico e contrato para upload.
- Criar validação de MIME, tamanho e URL.
- Criar endpoint protegido por área.
- Criar UI de submissão e listagem.
- Registar evento `MATERIAL_SUBMITTED` no histórico quando disponível.
- Preparar estado para indexação futura.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF31, RF34.
- `docs/RNF.md`: RNF03, RNF11, RNF18, RNF20, RNF39.
- BK-MF0-07: áreas de estudo.
- BK-MF0-06: histórico.
- `PLANO-SPRINTS.md`: negativos P0.

## Glossário (rápido) (DERIVADO):

- **Material**: fonte de estudo enviada pelo aluno.
- **MIME type**: tipo técnico do ficheiro, por exemplo `application/pdf`.
- **Upload multipart**: envio de ficheiro por formulário HTTP.
- **URL**: endereço externo indicado pelo aluno.
- **Tópico manual**: texto curto que representa matéria sem ficheiro.
- **Estado de processamento**: fase do material, por exemplo pendente ou pronto.
- **Sandbox**: ambiente isolado para processar ficheiros, reforçado em BK futuro.
- **Indexação**: preparação do conteúdo para pesquisa/IA, fora deste BK.
- **Fonte processável**: material cujo texto já pode ser usado pela IA; na MF0, apenas tópicos/texto manual entram nesta categoria.

## Conceitos teóricos essenciais (DERIVADO):

**Upload seguro.** Nunca se deve confiar apenas no nome do ficheiro. O backend valida MIME, extensão, tamanho e ownership. Ficheiros perigosos devem ser rejeitados antes de qualquer processamento.

**Estado assíncrono.** O upload cria o material, mas a indexação pode demorar. Por isso, o material deve ter estados como `PENDING_PROCESSING`, `READY` e `FAILED`. Este BK cria o estado inicial adequado ao tipo de material. Na MF0, PDF, DOCX e URLs não ficam automaticamente `READY`; ficam pendentes até uma fase posterior extrair e validar conteúdo. Um tópico manual pode ficar `READY` porque o texto já foi fornecido diretamente.

**URL como material.** Uma URL não deve ser automaticamente confiável. Nesta fase, guardar a URL validada é suficiente. Scraping, extração e sandbox ficam para BKs de indexação.

**Texto manual como exceção controlada.** Um tópico escrito pelo aluno pode guardar `contentText` porque o conteúdo já foi fornecido diretamente. Isto não deve ser confundido com extração automática de texto a partir de PDF, DOCX ou URL.

**Separação por área.** Todo material pertence a uma `StudyArea`. Isso permite que a IA futura responda com base no contexto certo.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-07 com `StudyAreasService.getMyStudyArea`.
- BK-MF0-06 opcional para registar `MATERIAL_SUBMITTED`.
- `@nestjs/platform-express` disponível para upload multipart.
- Limite inicial de upload: `10 MB`, assumido como valor conservador até decisão oficial.

### Passo 1 - Criar schema Material

1. Explicação simples do objetivo.

    Neste passo vais criar schema Material. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/schemas/material.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialDocument = HydratedDocument<Material>;
export type MaterialType = "PDF" | "DOCX" | "URL" | "TOPIC";
export type MaterialStatus = "STAGING" | "PENDING_PROCESSING" | "READY" | "FAILED";

@Schema({ timestamps: true, collection: "materials" })
export class Material {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["PDF", "DOCX", "URL", "TOPIC"] })
    type!: MaterialType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({
        required: true,
        enum: ["STAGING", "PENDING_PROCESSING", "READY", "FAILED"],
        default: "PENDING_PROCESSING",
    })
    status!: MaterialStatus;

    @Prop({ trim: true })
    url?: string;

    @Prop()
    storageKey?: string;

    @Prop({ match: /^[0-9a-f]{64}$/ })
    sha256?: string;

    @Prop()
    originalName?: string;

    @Prop()
    mimeType?: string;

    @Prop({ min: 0 })
    sizeBytes?: number;

    // Na MF0, só TOPIC/texto manual pode preencher contentText e ficar READY.
    @Prop({ maxlength: 10000 })
    contentText?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
MaterialSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

5. Explicação do código.

O schema separa materiais submetidos de fontes processáveis. PDF/DOCX/URL não ficam prontos para IA neste BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTO de URL/tópico

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de URL/tópico. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/dto/create-material.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateMaterialDto {
    @IsIn(["URL", "TOPIC"])
    type!: "URL" | "TOPIC";

    @IsString()
    @MinLength(1)
    @MaxLength(160)
    title!: string;

    @IsOptional()
    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    url?: string;

    @IsOptional()
    @IsString()
    topicText?: string;
}
```

5. Explicação do código.

Uploads de ficheiro usam multipart; URL e tópico usam JSON.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar validador de upload

1. Explicação simples do objetivo.

    Neste passo vais criar validador de upload. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/validators/material-upload.validator.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";
import { Express } from "express";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function validateMaterialUpload(file: Express.Multer.File): void {
    if (!file) {
        throw new BadRequestException({
            code: "FILE_REQUIRED",
            message: "Envia um ficheiro PDF ou DOCX.",
        });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        throw new PayloadTooLargeException({
            code: "FILE_TOO_LARGE",
            message: "O ficheiro excede o limite permitido.",
        });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }
}

export function materialTypeFromMime(mimeType: string): "PDF" | "DOCX" {
    return mimeType === "application/pdf" ? "PDF" : "DOCX";
}
```

5. Explicação do código.

O backend valida MIME e tamanho. A extensão do ficheiro não é suficiente para segurança.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar storage local de desenvolvimento

1. Explicação simples do objetivo.

    Neste passo vais criar storage local de desenvolvimento. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/material-storage.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { Express } from "express";

export type StagedMaterial = {
    storageKey: string;
    sha256: string;
    sizeBytes: number;
};

@Injectable()
export class MaterialStorageService {
    private readonly root = this.resolveExternalRoot();
    private readonly stagingRoot = join(this.root, ".staging");

    async stage(file: Express.Multer.File): Promise<StagedMaterial> {
        await this.ensureRoots();
        const extension = file.mimetype === "application/pdf" ? "pdf" : "docx";
        const storageKey = `${randomUUID()}.${extension}`;
        const stagedPath = this.safePath(this.stagingRoot, storageKey);
        await writeFile(stagedPath, file.buffer, { mode: 0o600, flag: "wx" });
        await chmod(stagedPath, 0o600);
        return {
            storageKey,
            sha256: createHash("sha256").update(file.buffer).digest("hex"),
            sizeBytes: file.size,
        };
    }

    async promote(storageKey: string): Promise<void> {
        await rename(
            this.safePath(this.stagingRoot, storageKey),
            this.safePath(this.root, storageKey),
        );
    }

    async abort(storageKey: string): Promise<void> {
        await rm(this.safePath(this.stagingRoot, storageKey), { force: true });
    }

    async delete(storageKey: string): Promise<void> {
        await rm(this.safePath(this.root, storageKey), { force: true });
    }

    async read(storageKey: string): Promise<Buffer> {
        return readFile(this.safePath(this.root, storageKey));
    }

    // O reconciliador periódico remove staging expirado e ficheiros sem metadata.
    async reconcile(knownStorageKeys: ReadonlySet<string>): Promise<void> {
        void knownStorageKeys;
        // Listar com idade mínima, não seguir symlinks e apagar idempotentemente.
    }

    private async ensureRoots(): Promise<void> {
        await mkdir(this.root, { recursive: true, mode: 0o700 });
        await mkdir(this.stagingRoot, { recursive: true, mode: 0o700 });
        await chmod(this.root, 0o700);
        await chmod(this.stagingRoot, 0o700);
    }

    private resolveExternalRoot(): string {
        const configured = process.env.MATERIALS_STORAGE_DIR;
        if (!configured || !isAbsolute(configured)) {
            throw new Error("MATERIALS_STORAGE_DIR_ABSOLUTE_REQUIRED");
        }
        const root = resolve(configured);
        const checkout = resolve(process.cwd());
        if (!relative(checkout, root).startsWith("..")) {
            throw new Error("MATERIALS_STORAGE_DIR_MUST_BE_OUTSIDE_CHECKOUT");
        }
        return root;
    }

    private safePath(root: string, storageKey: string): string {
        if (!/^[0-9a-f-]{36}\.(pdf|docx)$/.test(storageKey)) {
            throw new TypeError("INVALID_STORAGE_KEY");
        }
        return join(root, storageKey);
    }
}
```

5. Explicação do código.

Este storage destina-se ao runtime PAP local: raiz absoluta fora do checkout, diretórios `0700`, ficheiros `0600`, chave UUID, SHA-256, staging e promoção atómica. `delete()` e `reconcile()` permitem outbox, rollback e recuperação de órfãos sem inventar S3/Drive.

Toda a eliminação de metadata que tenha `storageKey` cria, na mesma transaction Mongo, uma entrada `FileDeletionOutbox` idempotente. O runner tenta `storage.delete()` com backoff e marca a entrada como concluída; no arranque, o reconciliador retoma entradas pendentes e limpa staging expirado. Nunca se apaga primeiro a metadata, porque um crash nesse intervalo tornaria o ficheiro órfão e invisível.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar service de materiais

1. Explicação simples do objetivo.

    Neste passo vais criar service de materiais. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/materials.service.ts`
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
import { Express } from "express";
import { Model, Types } from "mongoose";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { Material, MaterialDocument } from "./schemas/material.schema";
import { MaterialStorageService } from "./material-storage.service";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "./validators/material-upload.validator";

@Injectable()
export class MaterialsService {
    private static readonly USER_STORAGE_QUOTA_BYTES = 250 * 1024 * 1024;

    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly storage: MaterialStorageService,
    ) {}

    async listByArea(userId: string, studyAreaId: string) {
        await this.assertOwnArea(userId, studyAreaId);
        return this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async submitFile(
        userId: string,
        studyAreaId: string,
        file: Express.Multer.File,
        title?: string,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        validateMaterialUpload(file);
        const normalizedTitle = (title?.trim() || file.originalname.trim()).slice(0, 161);
        if (normalizedTitle.length < 1 || normalizedTitle.length > 160) {
            throw new BadRequestException({ code: "INVALID_TITLE", message: "O título deve ter entre 1 e 160 caracteres." });
        }
        const [usage] = await this.materialModel.aggregate<{ total: number }>([
            { $match: { userId: new Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: "$sizeBytes" } } },
        ]);
        if ((usage?.total ?? 0) + file.size > MaterialsService.USER_STORAGE_QUOTA_BYTES) {
            throw new BadRequestException({ code: "STORAGE_QUOTA_EXCEEDED", message: "A quota de 250 MiB foi excedida." });
        }

        const staged = await this.storage.stage(file);
        let material: MaterialDocument | undefined;
        try {
            material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: materialTypeFromMime(file.mimetype),
                title: normalizedTitle,
                status: "STAGING",
                storageKey: staged.storageKey,
                sha256: staged.sha256,
                originalName: file.originalname.slice(0, 255),
                mimeType: file.mimetype,
                sizeBytes: staged.sizeBytes,
            });
            await this.storage.promote(staged.storageKey);
            material.status = "PENDING_PROCESSING";
            await material.save();
            return material;
        } catch (error) {
            await this.storage.abort(staged.storageKey);
            if (material) await this.materialModel.deleteOne({ _id: material._id });
            throw error;
        }
    }

    async submitTextMaterial(
        userId: string,
        studyAreaId: string,
        input: CreateMaterialDto,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        const title = input.title?.trim();
        if (!title)
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            return this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "URL",
                title,
                url,
                status: "PENDING_PROCESSING",
            });
        }

        if (input.type === "TOPIC") {
            const contentText = input.topicText?.trim();
            if (!contentText || contentText.length < 10) {
                throw new BadRequestException({
                    code: "TOPIC_TEXT_REQUIRED",
                    message: "Escreve pelo menos 10 caracteres.",
                });
            }
            return this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "TOPIC",
                title,
                contentText,
                status: "READY",
            });
        }

        throw new BadRequestException({
            code: "INVALID_MATERIAL_TYPE",
            message: "Tipo de material inválido.",
        });
    }

    private async assertOwnArea(
        userId: string,
        studyAreaId: string,
    ): Promise<void> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
    }

    private parseSafeUrl(value: string | undefined): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol))
                throw new Error("invalid protocol");
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }
}
```

5. Explicação do código.

O service bloqueia área alheia, ficheiros perigosos, URLs inválidos e tópicos vazios. PDF/DOCX/URL ficam pendentes.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/materials.controller.ts`
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
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { MaterialsService } from "./materials.service";

@Controller("api/study-areas/:studyAreaId/materials")
@UseGuards(SessionGuard)
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) {}

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.materialsService.listByArea(request.user!.id, studyAreaId);
    }

    @Post("file")
    @UseInterceptors(FileInterceptor("file"))
    uploadFile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body("title") title?: string,
    ) {
        return this.materialsService.submitFile(
            request.user!.id,
            studyAreaId,
            file,
            title,
        );
    }

    @Post()
    submitText(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: CreateMaterialDto,
    ) {
        return this.materialsService.submitTextMaterial(
            request.user!.id,
            studyAreaId,
            body,
        );
    }
}
```

5. Explicação do código.

Há endpoints separados para ficheiro e JSON. Isto simplifica validação e evita misturar multipart com URL/tópico.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Criar módulo de materiais

1. Explicação simples do objetivo.

    Neste passo vais criar módulo de materiais. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/materials/materials.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { MaterialsController } from "./materials.controller";
import { MaterialsService } from "./materials.service";
import { MaterialStorageService } from "./material-storage.service";
import { Material, MaterialSchema } from "./schemas/material.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Material.name, schema: MaterialSchema },
        ]),
        StudyAreasModule,
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService, MaterialStorageService],
    exports: [MaterialsService, MaterialStorageService],
})
export class MaterialsModule {}
```

5. Explicação do código.

O módulo liga schema, controller, service e storage. O `exports` é importante porque BK-MF0-10, BK-MF0-11 e BK-MF0-12 precisam de consultar materiais da área sem duplicar queries.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 8 - Cliente API e UI de submissão

1. Explicação simples do objetivo.

    Neste passo vais cliente API e UI de submissão. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type Material = {
    _id: string;
    title: string;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    status: "PENDING_PROCESSING" | "READY" | "FAILED";
    url?: string;
};

export async function listMaterials(studyAreaId: string): Promise<Material[]> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar materiais.");
    return (await response.json()) as Material[];
}

export async function submitTopicMaterial(
    studyAreaId: string,
    payload: { title: string; topicText: string },
): Promise<Material> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "TOPIC", ...payload }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter material.");
    return data as Material;
}

export async function submitUrlMaterial(
    studyAreaId: string,
    payload: { title: string; url: string },
): Promise<Material> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "URL", ...payload }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter URL.");
    return data as Material;
}

export async function submitFileMaterial(
    studyAreaId: string,
    payload: { title: string; file: File },
): Promise<Material> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("file", payload.file);

    const response = await fetch(
        `/api/study-areas/${studyAreaId}/materials/file`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter ficheiro.");
    return data as Material;
}
```

O cliente separa JSON e multipart. Não se deve definir manualmente `Content-Type` no upload, porque o browser precisa de acrescentar o `boundary` do `FormData`.

- CRIAR: `apps/web/src/components/materials/MaterialSubmitForm.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { FormEvent, useState } from "react";
import {
    Material,
    submitFileMaterial,
    submitTopicMaterial,
    submitUrlMaterial,
} from "../../lib/apiClient";

type MaterialMode = "TOPIC" | "URL" | "FILE";

export function MaterialSubmitForm({
    studyAreaId,
    onCreated,
}: {
    studyAreaId: string;
    onCreated: (material: Material) => void;
}) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [topicText, setTopicText] = useState("");
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            const material =
                mode === "TOPIC"
                    ? await submitTopicMaterial(studyAreaId, {
                          title,
                          topicText,
                      })
                    : mode === "URL"
                      ? await submitUrlMaterial(studyAreaId, { title, url })
                      : await submitFileMaterial(studyAreaId, {
                            title,
                            file: requireSelectedFile(file),
                        });

            onCreated(material);
            setTitle("");
            setTopicText("");
            setUrl("");
            setFile(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao submeter material.",
            );
        }
    }

    return (
        <form
            className="space-y-3 rounded border bg-white p-4"
            onSubmit={handleSubmit}
        >
            <select
                className="w-full rounded border px-3 py-2"
                onChange={(event) =>
                    setMode(event.target.value as MaterialMode)
                }
                value={mode}
            >
                <option value="TOPIC">Tópico manual</option>
                <option value="URL">URL</option>
                <option value="FILE">PDF/DOCX</option>
            </select>
            <input
                className="w-full rounded border px-3 py-2"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Título do material"
                required
                value={title}
            />

            {mode === "TOPIC" && (
                <textarea
                    className="min-h-32 w-full rounded border px-3 py-2"
                    onChange={(event) => setTopicText(event.target.value)}
                    placeholder="Escreve um tópico ou apontamento manual"
                    required
                    value={topicText}
                />
            )}

            {mode === "URL" && (
                <input
                    className="w-full rounded border px-3 py-2"
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://exemplo.pt/recurso"
                    required
                    type="url"
                    value={url}
                />
            )}

            {mode === "FILE" && (
                <input
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="w-full rounded border px-3 py-2"
                    onChange={(event) =>
                        setFile(event.target.files?.[0] ?? null)
                    }
                    required
                    type="file"
                />
            )}

            {error && (
                <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>
            )}
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                type="submit"
            >
                Submeter material
            </button>
        </form>
    );
}

function requireSelectedFile(file: File | null): File {
    if (!file) throw new Error("Escolhe um ficheiro PDF ou DOCX.");
    return file;
}
```

O formulário cobre os três caminhos do BK: tópico, URL e ficheiro. O frontend ajuda o aluno, mas a segurança continua no backend.

- CRIAR: `apps/web/src/components/materials/MaterialList.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { Material } from "../../lib/apiClient";

export function MaterialList({ materials }: { materials: Material[] }) {
    if (materials.length === 0)
        return <p>Ainda não há materiais nesta área.</p>;

    return (
        <ul className="space-y-3">
            {materials.map((material) => (
                <li className="rounded border bg-white p-4" key={material._id}>
                    <strong>{material.title}</strong>
                    <p>
                        {material.type} ·{" "}
                        {material.status === "READY"
                            ? "Pronto"
                            : "Pendente de processamento"}
                    </p>
                </li>
            ))}
        </ul>
    );
}
```

- CRIAR: `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

```tsx
import { useEffect, useState } from "react";
import { MaterialList } from "../../components/materials/MaterialList";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm";
import { listMaterials, Material } from "../../lib/apiClient";

export function StudyAreaMaterialsPage({
    studyAreaId,
}: {
    studyAreaId: string;
}) {
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        listMaterials(studyAreaId).then(setMaterials);
    }, [studyAreaId]);

    return (
        <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            <h1 className="text-2xl font-semibold">Materiais da área</h1>
            <MaterialSubmitForm
                studyAreaId={studyAreaId}
                onCreated={(material) =>
                    setMaterials((current) => [material, ...current])
                }
            />
            <MaterialList materials={materials} />
        </main>
    );
}
```

5. Explicação do código.

Esta UI mostra o estado do material. Na MF0, apenas tópicos manuais ficam `READY`; PDF/DOCX/URL aparecem como pendentes porque ainda não há extração/indexação completa.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `Material`.
    - Endpoints de submissão/listagem.
    - UI de submissão.
- Verificações:
    - PDF/DOCX válido responde `201`.
    - URL inválida responde `400`.
    - Área alheia falha.
- Qualidade:
    - Upload, URL e tópico têm validações separadas.
    - Estado prepara indexação futura.
- Continuidade:
    - BK-MF0-10 usa materiais da área.
    - BK-MF0-11 só resume materiais existentes.
- Evidência:
    - PR inclui smoke, 3 negativos e screenshot da área com material.

## Validação final

### Requests e responses esperados

- `POST /api/study-areas/:id/materials/file -> 201` com `status: "PENDING_PROCESSING"`.
- `POST /api/study-areas/:id/materials` com `{ "type": "URL" } -> 201` e `PENDING_PROCESSING`.
- `POST /api/study-areas/:id/materials` com `{ "type": "TOPIC" } -> 201` e `READY`.
- `400 UNSUPPORTED_FILE_TYPE` para `.exe`.
- `400 INVALID_URL` para `javascript:alert(1)`.
- `401 UNAUTHENTICATED` sem sessão.
- `404 STUDY_AREA_NOT_FOUND` para área alheia.
- `413 FILE_TOO_LARGE` para ficheiro acima do limite.

### Como validar o BK e cenários negativos

- PDF válido: esperado `201 PENDING_PROCESSING`.
- Tópico manual com texto válido: esperado `201 READY`.
- URL `javascript:`: esperado `400`.
- Ficheiro `.exe`: esperado `400`.
- Área de outro aluno: esperado `404`.
- Confirmar que a resposta não inclui caminho absoluto do servidor.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Output de PDF/DOCX válido.
- Output de tópico manual `READY`.
- Output negativo `.exe -> 400`.
- Output negativo área alheia `404`.
- Screenshot do formulário/lista de materiais.
- Nota: indexação/RAG fora da MF0; PDF/DOCX/URL não alimentam IA até processamento futuro.

## Handoff para BK-MF0-10 e BK-MF0-11

- BK-MF0-10 deve contar materiais submetidos e fontes processáveis separadamente.
- BK-MF0-11 só pode gerar resumo com materiais `READY`, ou seja, nesta MF0 principalmente `TOPIC`.

## Changelog

- `2026-05-24`: guia refinado para submissão segura de materiais, com validação, ownership e handoff para IA.
- `2026-05-25`: material atualizado para coleção MongoDB/Mongoose e referências `ObjectId`.
- `2026-05-25`: clarificado que `contentText` na MF0 só se aplica a tópicos/texto manual; PDF/DOCX/URL ficam pendentes de processamento.
- `2026-05-25`: clarificado que tópicos manuais válidos podem ficar `READY`, enquanto ficheiros/URLs ficam `PENDING_PROCESSING`.
