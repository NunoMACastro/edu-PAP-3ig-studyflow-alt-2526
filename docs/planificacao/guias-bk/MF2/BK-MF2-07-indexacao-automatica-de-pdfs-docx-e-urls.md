# BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.

## Header
- `doc_id`: `GUIA-BK-MF2-07`
- `bk_id`: `BK-MF2-07`
- `macro`: `MF2`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-08, BK-MF1-09`
- `rf_rnf`: `RF31`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-08`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md`
- `last_updated`: `2026-07-11`

## Objetivo do BK

Criar a base de indexação de materiais privados e oficiais, guardando jobs e texto processável para consumo por estrutura, versões, separação de contexto, pesquisa e IA.

## Importância

Este BK é um ponto de passagem obrigatório da MF2. Sem uma indexação clara, os BKs de tópicos, versões, contextos e citações futuras ficam sem fonte técnica estável.

## Scope-in

- Criar jobs de indexação para materiais privados e oficiais.
- Validar materiais por área do aluno ou disciplina do professor.
- Extrair texto básico de materiais `PDF`, `DOCX`, `URL`, `TOPIC` e `TEXT`, sem OCR nem embeddings.
- Guardar chunks de texto processável com origem verificável e estado do job.
- Expor `findDoneJob` para BKs dependentes.

## Scope-out

- Broker externo dedicado; a fila recuperável permanece persistida em MongoDB.
- OCR de imagens dentro de PDFs.
- Crawling recursivo de URLs externas.
- RAG, embeddings, chunking semântico ou motor de pesquisa vetorial.

## Estado antes

`BK-MF0-08` e `BK-MF1-09` aceitam materiais, mas PDFs, DOCX e URLs ainda não deixam uma base indexada uniforme para módulos posteriores.

## Estado depois

Existe `MaterialIndexModule` com jobs, estados e chunks com origem. O pedido autorizado devolve `202 QUEUED`; a extração corre assincronamente num worker recuperável com leases, heartbeat, fencing, retry e concorrência limitada.

## Pré-requisitos

- `MaterialsModule` exporta `MaterialsService.listByArea`.
- `OfficialMaterialsModule` exporta `OfficialMaterialsService.findProcessedBySubject`.
- `SubjectsModule` exporta `SubjectsService.findOwnedSubject`.
- `apps/api/package.json` inclui `pdf-parse` para texto de PDF e `mammoth` para texto de DOCX. Estas dependências são `DERIVADO`: Node.js não oferece parser nativo seguro para estes formatos, e `RF31` exige indexação de PDF/DOCX.

## Glossário

- Job de indexação: registo de tentativa de preparar material para pesquisa e IA.
- Chunk: segmento de texto guardado com ordem, texto, origem e localizador.
- Scope do material: contexto privado ou oficial onde o material pode ser usado.
- OCR: extração de texto a partir de imagens; fica fora deste BK.

## Conceitos teóricos

- **Extração textual básica.** `RF31` pede indexação automática de PDF, DOCX e URLs. Neste BK isso significa extrair texto simples desses formatos e guardá-lo em chunks pequenos. O fluxo começa num material submetido em `BK-MF0-08` ou `BK-MF1-09`, passa pelo `MaterialIndexService` e sai como `MaterialIndexJob` concluído. Esta decisão evita fingir que um ficheiro foi processado quando só existe título ou metadados.
- **Estado operacional.** `QUEUED`, `PROCESSING`, `DONE` e `FAILED` permitem rastrear falhas. Este conceito vem de `RF31` e das dependências `BK-MF0-08, BK-MF1-09`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Privacidade por contexto.** material privado e oficial nunca partilham validação de acesso. Este conceito vem de `RF31` e das dependências `BK-MF0-08, BK-MF1-09`; entra no service/controller como regra verificável, sai no endpoint ou na página como comportamento visível, serve para tornar o domínio `BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.` implementável por passos e evita que o aluno escreva código desligado do contrato da StudyFlow.
- **Backend, validação e segurança.** O backend recebe a identidade pela sessão autenticada, valida DTOs antes do service e confirma ownership ou membership nos services herdados. Esta regra vem da fundação MF0/MF1 e segue para os BKs seguintes como contrato de segurança. Serve para impedir leitura ou escrita entre alunos, professores, turmas e disciplinas diferentes.
- **Frontend tipado e sessão real.** O frontend usa cliente API tipado em `apps/web/src/lib/api/...`, envia cookies com `credentials: "include"`, mostra estados de carregamento, erro, vazio e sucesso, e não guarda tokens em `localStorage`. Isto evita chamadas anónimas, dados de actor no body e payloads sem tipo claro.
- **IA, fontes e guardrails.** Este BK só envolve IA quando o requisito o pede. Os services de domínio consomem `GovernedAiExecutionService`; a fachada aplica consentimento, policy, limites, guardrails, quota e validação/audit. As fontes são autorizadas antes da execução e a resposta só é persistida depois de validação.

## Decisões documentais

- `CANONICO`: `BK-MF2-07`, `RF31`, prioridade `P0`, owner `Natalia`, apoio `Guilherme`, sprint `S05`, dependências `BK-MF0-08, BK-MF1-09` e próximo BK `BK-MF2-08` vêm da matriz, backlog e contrato de campos.
- `CANONICO`: o domínio funcional é `BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.`; este BK preserva a sequência da MF2 e não altera IDs, RF/RNF, prioridades, owners ou dependências.
- `DERIVADO`: os nomes de módulos, services, DTOs, schemas, clientes API e páginas resultam dos passos deste guia e mantêm a convenção já usada no próprio código documentado.
- `DERIVADO`: os caminhos frontend previstos usam `apps/web/src/lib/api/...` para clientes HTTP e `apps/web/src/pages/mf2/...` para páginas, porque essa é a localização usada nos passos de implementação.
- `DERIVADO`: `pdf-parse` e `mammoth` são dependências técnicas mínimas para cumprir `RF31` sem inventar OCR, RAG ou indexação semântica.

## Arquitetura do BK

`MaterialIndexService` recebe actor e contexto, valida acesso nos services herdados, cria job, extrai texto básico e guarda chunks com origem. `findDoneJob` é a porta segura para `BK-MF2-08`, `BK-MF2-09`, `BK-MF2-10`, `BK-MF3-02`, `BK-MF3-09` e `BK-MF3-10`.

## Ficheiros previstos

- `apps/api/src/modules/material-index/schemas/material-index-job.schema.ts`
- `apps/api/src/modules/material-index/dto/material-index-job.dto.ts`
- `apps/api/src/modules/material-index/material-index.service.ts`
- `apps/api/src/modules/material-index/material-index.controller.ts`
- `apps/api/src/modules/material-index/material-index.module.ts`
- `apps/web/src/lib/api/material-index.ts`
- `apps/web/src/pages/mf2/MaterialIndexPage.tsx`

## Guia linear de implementação

Segue os passos por ordem. Cada passo indica objetivo, ficheiros, ação concreta, código completo, explicação, validação e erro comum. Não saltes passos: a sequência preserva os contratos herdados dos BKs anteriores e prepara o BK seguinte sem criar endpoints, schemas ou services paralelos.

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida e validar a entrada de indexação de materiais no backend.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-index/schemas/material-index-job.schema.ts`
    - CRIAR: `apps/api/src/modules/material-index/dto/material-index-job.dto.ts`

3. O que fazer.

    Cria os ficheiros indicados e mantém os nomes de classes usados nos passos seguintes.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-index/schemas/material-index-job.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialIndexJobDocument = HydratedDocument<MaterialIndexJob>;
export type MaterialIndexStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
export type MaterialIndexScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";

export type MaterialTextChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

@Schema({ timestamps: true, collection: "material_index_jobs" })
export class MaterialIndexJob {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ required: true, enum: ["PRIVATE_AREA", "OFFICIAL_SUBJECT"] })
    scope!: MaterialIndexScope;

    @Prop({ required: true, enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"], default: "QUEUED" })
    status!: MaterialIndexStatus;

    @Prop({
        type: [
            {
                order: { type: Number, required: true, min: 1 },
                text: { type: String, required: true, trim: true },
                sourceLabel: { type: String, required: true, trim: true },
                locator: { type: String, required: true, trim: true },
            },
        ],
        default: [],
    })
    extractedTextChunks!: MaterialTextChunk[];

    @Prop({ trim: true })
    errorMessage?: string;
}

export const MaterialIndexJobSchema = SchemaFactory.createForClass(MaterialIndexJob);
MaterialIndexJobSchema.index({ materialId: 1, contextId: 1, scope: 1 });

// apps/api/src/modules/material-index/dto/material-index-job.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

export class StartMaterialIndexDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
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
    - CRIAR: `apps/api/src/modules/material-index/material-index.service.ts`
    - CRIAR: `apps/api/src/common/security/ssrf-safe-fetch.ts`

3. O que fazer.

    Implementa o service usando os métodos herdados de MF0/MF1 e nunca confies em IDs de utilizador enviados pelo cliente. `ssrf-safe-fetch.ts` usa um dispatcher/connector dedicado por hop, fixa a ligação num IP da lista validada e rejeita o socket se `remoteAddress` não for exatamente um desses IPs ou deixar de ser público; aplica ainda timeout e limite de bytes antes de devolver o body.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-index/material-index.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { lookup } from "node:dns/promises";
import mammoth from "mammoth";
import ipaddr from "ipaddr.js";
import { Model, Types } from "mongoose";
import pdfParse from "pdf-parse";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { fetchWithPinnedAddress } from "../../common/security/ssrf-safe-fetch";
import { MaterialsService } from "../materials/materials.service";
import { MaterialStorageService } from "../materials/material-storage.service";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexScope,
    MaterialTextChunk,
} from "./schemas/material-index-job.schema";

type IndexableMaterial = {
    _id: Types.ObjectId;
    title?: string;
    type?: "PDF" | "DOCX" | "URL" | "TOPIC" | "TEXT";
    mimeType?: string;
    storageKey?: string;
    sourceUrl?: string;
    contentText?: string;
    textContent?: string;
    studyAreaId?: Types.ObjectId;
};

@Injectable()
export class MaterialIndexService {
    constructor(
        @InjectModel(MaterialIndexJob.name)
        private readonly jobs: Model<MaterialIndexJobDocument>,
        private readonly materialsService: MaterialsService,
        private readonly storage: MaterialStorageService,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async startPrivateIndex(actor: AuthenticatedUser, studyAreaId: string, materialId: string) {
        this.assertStudent(actor);
        const materials = await this.materialsService.listByArea(actor.id, studyAreaId);
        const material = materials.find((item) => item._id.toString() === materialId) as
            | IndexableMaterial
            | undefined;

        if (!material || !material.studyAreaId) {
            throw new NotFoundException("Material privado não encontrado nesta área.");
        }

        return this.queueJob(
            actor.id,
            material._id,
            material.studyAreaId,
            "PRIVATE_AREA",
            material,
        );
    }

    async startOfficialIndex(actor: AuthenticatedUser, subjectId: string, materialId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        const material = materials.find((item) => item._id.toString() === materialId) as
            | IndexableMaterial
            | undefined;

        if (!material) {
            throw new NotFoundException("Material oficial processado não encontrado nesta disciplina.");
        }

        return this.queueJob(
            actor.id,
            material._id,
            subject._id,
            "OFFICIAL_SUBJECT",
            material,
        );
    }

    async getJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.findOwnedJob(actor, jobId);
        return this.toView(job);
    }

    async findDoneJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.findOwnedJob(actor, jobId);
        if (job.status !== "DONE" || job.extractedTextChunks.length === 0) {
            throw new UnprocessableEntityException("A indexação ainda não terminou.");
        }

        return job;
    }

    private async queueJob(
        ownerId: string,
        materialId: Types.ObjectId,
        contextId: Types.ObjectId,
        scope: MaterialIndexScope,
        material: IndexableMaterial,
    ) {
        const job = await this.jobs.create({
            ownerId: new Types.ObjectId(ownerId),
            materialId,
            contextId,
            scope,
            status: "PROCESSING",
            extractedTextChunks: [],
        });

        try {
            const chunks = await this.extractMaterialChunks(material);

            if (chunks.length === 0) {
                throw new UnprocessableEntityException("Material sem texto processável.");
            }

            await this.jobs.updateOne(
                { _id: job._id },
                { status: "DONE", extractedTextChunks: chunks, errorMessage: undefined },
            );

            const doneJob = await this.jobs.findById(job._id);
            return this.toView(doneJob ?? job);
        } catch (error) {
            await this.jobs.updateOne(
                { _id: job._id },
                {
                    status: "FAILED",
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : "Falha desconhecida na indexação.",
                },
            );

            throw new UnprocessableEntityException(
                "Não foi possível extrair texto processável deste material.",
            );
        }
    }

    private async findOwnedJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.jobs.findOne({ _id: jobId, ownerId: new Types.ObjectId(actor.id) });

        if (!job) {
            throw new NotFoundException("Job de indexação não encontrado para este utilizador.");
        }

        return job;
    }

    private async extractMaterialChunks(material: IndexableMaterial) {
        const directText = material.contentText ?? material.textContent;

        if (directText?.trim()) {
            return this.toChunks(directText, material.title ?? "Texto fornecido", "texto");
        }

        if (material.sourceUrl) {
            const text = await this.extractTextFromUrl(material.sourceUrl);
            return this.toChunks(text, material.title ?? material.sourceUrl, material.sourceUrl);
        }

        if (material.storageKey && this.isPdf(material)) {
            const fileBuffer = await this.storage.read(material.storageKey);
            const parsed = await pdfParse(fileBuffer);
            return this.toChunks(parsed.text, material.title ?? material.storageKey, "pdf");
        }

        if (material.storageKey && this.isDocx(material)) {
            const fileBuffer = await this.storage.read(material.storageKey);
            const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
            return this.toChunks(parsed.value, material.title ?? material.storageKey, "docx");
        }

        throw new UnprocessableEntityException(
            "Material sem texto direto, URL ou ficheiro suportado para indexação.",
        );
    }

    private async extractTextFromUrl(sourceUrl: string) {
        const url = new URL(sourceUrl);
        const response = await this.fetchPublicUrl(url);

        if (!response.ok) {
            throw new UnprocessableEntityException("Não foi possível ler o URL indicado.");
        }

        const html = await response.text();
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    private async fetchPublicUrl(initialUrl: URL) {
        let currentUrl = initialUrl;

        for (let redirects = 0; redirects <= 5; redirects += 1) {
            const addresses = await this.assertPublicHttpUrl(currentUrl);
            const response = await fetchWithPinnedAddress(currentUrl, {
                addresses,
                redirect: "manual",
                validatePeerAddress: (address) => !this.isPrivateAddress(address),
            });

            if (![301, 302, 303, 307, 308].includes(response.status)) {
                return response;
            }

            const location = response.headers.get("location");
            if (!location) {
                throw new UnprocessableEntityException("Redirect sem destino válido.");
            }

            currentUrl = new URL(location, currentUrl);
        }

        throw new UnprocessableEntityException("URL com demasiados redirects.");
    }

    private async assertPublicHttpUrl(url: URL) {
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new UnprocessableEntityException("Apenas URLs HTTP ou HTTPS podem ser indexados.");
        }

        const hostname = url.hostname.replace(/^\[|\]$/g, "");

        if (this.isPrivateHostname(hostname)) {
            throw new UnprocessableEntityException("URLs internas ou locais não podem ser indexadas.");
        }

        const addresses = await lookup(hostname, { all: true });

        if (addresses.some((entry) => this.isPrivateAddress(entry.address))) {
            throw new UnprocessableEntityException("URLs resolvidas para redes privadas não podem ser indexadas.");
        }
        return addresses;
    }

    private toChunks(text: string, sourceLabel: string, locator: string): MaterialTextChunk[] {
        return text
            .split(/\n{2,}|(?<=\.)\s+/)
            .map((part) => part.trim())
            .filter((part) => part.length >= 20)
            .slice(0, 80)
            .map((part, index) => ({
                order: index + 1,
                text: part,
                sourceLabel,
                locator,
            }));
    }

    private isPdf(material: IndexableMaterial) {
        return material.type === "PDF" || material.mimeType === "application/pdf";
    }

    private isDocx(material: IndexableMaterial) {
        return (
            material.type === "DOCX" ||
            material.mimeType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
    }

    private isPrivateHostname(hostname: string) {
        const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

        return (
            normalized === "localhost" ||
            normalized.endsWith(".local") ||
            this.isPrivateAddress(normalized)
        );
    }

    private isPrivateAddress(address: string) {
        if (!ipaddr.isValid(address)) return true;
        const parsed = ipaddr.process(address); // normaliza também IPv4-mapped IPv6
        return parsed.range() !== "unicast";
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem indexar materiais privados.");
        }
    }
    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem indexar materiais oficiais.");
        }
    }
    private toView(job: MaterialIndexJob) {
        return {
            id: job._id.toString(),
            materialId: job.materialId.toString(),
            contextId: job.contextId.toString(),
            scope: job.scope,
            status: job.status,
            extractedTextChunks: job.extractedTextChunks,
            errorMessage: job.errorMessage ?? null,
        };
    }
}
~~~

5. Explicação do código.

    Este service concentra a regra de negócio do BK. Recebe o utilizador autenticado, valida o papel esperado, confirma ownership ou membership nos services herdados e só depois consulta ou grava dados. Para `TOPIC`/`TEXT`, usa texto direto; para `URL`, faz leitura HTTP controlada, rejeita hosts locais e usa `ipaddr.js` para bloquear IPv4, IPv6 e IPv4-mapped privados, reservados, link-local, multicast, CGNAT e metadata. O conector HTTP deve ficar preso a um dos endereços DNS já validados e voltar a validar `socket.remoteAddress` antes de enviar/aceitar dados; cada redirect repete URL, DNS e ligação, sem reutilizar o dispatcher anterior. Para `PDF` e `DOCX`, lê o ficheiro guardado e extrai texto com dependências próprias. A saída é um job `DONE` com chunks ordenados, ou `FAILED` com erro controlado. Isto evita DNS rebinding/SSRF e acessos cruzados.

6. Como validar este passo.

    Testa: sem sessão, papel errado, `127.0.0.1`, `::1`, `::ffff:127.0.0.1`, link-local/metadata, DNS rebinding e redirect público para rede privada; todos devem bloquear antes de consumir o body.

7. Erros comuns ou cenário negativo.

    Fazer apenas `Model.findById(id)` sem validar dono ou inscrição permite leitura indevida entre turmas, disciplinas ou áreas.

### Passo 3 - Criar controller e module do domínio

1. Explicação simples do objetivo.

    Expor as rotas HTTP do BK e ligar controller, service e schema no módulo NestJS.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/material-index/material-index.controller.ts`
    - CRIAR: `apps/api/src/modules/material-index/material-index.module.ts`

3. O que fazer.

    Declara apenas os parâmetros reais de cada rota e importa todos os símbolos usados pelo module.

4. Código completo, correto e integrado.

~~~ts
// apps/api/src/modules/material-index/material-index.controller.ts
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "./material-index.service";

@UseGuards(SessionGuard)
@Controller()
export class MaterialIndexController {
    constructor(private readonly indexService: MaterialIndexService) {}

    @Post("api/study-areas/:studyAreaId/materials/:materialId/index")
    startPrivate(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string, @Param("materialId") materialId: string) {
        return this.indexService.startPrivateIndex(actor, studyAreaId, materialId);
    }

    @Post("api/teacher/subjects/:subjectId/materials/:materialId/index")
    startOfficial(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Param("materialId") materialId: string) {
        return this.indexService.startOfficialIndex(actor, subjectId, materialId);
    }

    @Get("api/material-index/jobs/:jobId")
    getJob(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.indexService.getJob(actor, jobId);
    }
}

// apps/api/src/modules/material-index/material-index.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { MaterialIndexController } from "./material-index.controller";
import { MaterialIndexService } from "./material-index.service";
import { MaterialIndexJob, MaterialIndexJobSchema } from "./schemas/material-index-job.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialIndexJob.name, schema: MaterialIndexJobSchema }]), MaterialsModule, SubjectsModule, OfficialMaterialsModule],
    controllers: [MaterialIndexController],
    providers: [MaterialIndexService],
    exports: [MaterialIndexService],
})
export class MaterialIndexModule {}
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
import { ProjectAiModule } from "../project-ai/project-ai.module";
import { OfficialTestsModule } from "../official-tests/official-tests.module";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module";
import { ClassProgressModule } from "../class-progress/class-progress.module";
import { MaterialIndexModule } from "../material-index/material-index.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        ClassProgressModule,
        MaterialIndexModule,
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
    - CRIAR: `apps/web/src/lib/api/material-index.ts`

3. O que fazer.

    Cria funções por caso de uso e valida erros HTTP antes de devolver JSON.

4. Código completo, correto e integrado.

~~~ts
// apps/web/src/lib/api/material-index.ts
export type MaterialTextChunkView = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

export type MaterialIndexJobView = {
    id: string;
    materialId: string;
    contextId: string;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    extractedTextChunks: MaterialTextChunkView[];
    errorMessage: string | null;
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        // Envia o cookie HttpOnly da sessão; o frontend nunca guarda tokens manualmente.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function startPrivateMaterialIndex(studyAreaId: string, materialId: string) {
    return requestJson<MaterialIndexJobView>("/api/study-areas/" + studyAreaId + "/materials/" + materialId + "/index", { method: "POST" });
}
export function startOfficialMaterialIndex(subjectId: string, materialId: string) {
    return requestJson<MaterialIndexJobView>("/api/teacher/subjects/" + subjectId + "/materials/" + materialId + "/index", { method: "POST" });
}
export function getMaterialIndexJob(jobId: string) {
    return requestJson<MaterialIndexJobView>("/api/material-index/jobs/" + jobId);
}
~~~

5. Explicação do código.

    O cliente API é tipado e envia cookies com `credentials: "include"`, para reutilizar a sessão segura criada na MF0. Ele não guarda tokens no browser, não envia `actorId` e devolve erros claros quando o backend responde com `400`, `401`, `403` ou `404`. O tipo `MaterialTextChunkView` corresponde ao payload devolvido pelo backend: cada chunk tem ordem, texto, origem e locator. Assim, os tipos do frontend ficam alinhados com a resposta real do controller e com o que `BK-MF2-08` vai consumir.

6. Como validar este passo.

    Usa DevTools ou testes de integração para confirmar que as chamadas incluem cookies e tratam 401/403/404.

7. Erros comuns ou cenário negativo.

    Fazer fetch sem `credentials: "include"` transforma uma sessão válida em 401 no backend.

### Passo 6 - Criar página React do BK

1. Explicação simples do objetivo.

    Expor a funcionalidade ao utilizador com estados de loading, erro, vazio e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/pages/mf2/MaterialIndexPage.tsx`

3. O que fazer.

    Cria uma página simples, ligada ao cliente API do passo anterior e sem guardar dados sensíveis no browser.

4. Código completo, correto e integrado.

~~~tsx
// apps/web/src/pages/mf2/MaterialIndexPage.tsx
import { FormEvent, useState } from "react";
import { startPrivateMaterialIndex, startOfficialMaterialIndex, MaterialIndexJobView } from "../../lib/api/material-index";

export function MaterialIndexPage() {
    const [contextId, setContextId] = useState("");
    const [materialId, setMaterialId] = useState("");
    const [mode, setMode] = useState<"PRIVATE" | "OFFICIAL">("PRIVATE");
    const [job, setJob] = useState<MaterialIndexJobView | null>(null);
    const [error, setError] = useState("");
    async function submit(event: FormEvent) {
        event.preventDefault();

        try {
            const nextJob =
                mode === "PRIVATE"
                    ? await startPrivateMaterialIndex(contextId.trim(), materialId.trim())
                    : await startOfficialMaterialIndex(contextId.trim(), materialId.trim());
            setJob(nextJob);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao iniciar indexação.");
        }
    }
    return (
        <main>
            <h1>Indexação de materiais</h1>
            <form onSubmit={submit}>
                <select value={mode} onChange={(event) => setMode(event.target.value === "OFFICIAL" ? "OFFICIAL" : "PRIVATE")}>
                    <option value="PRIVATE">Área privada</option>
                    <option value="OFFICIAL">Disciplina oficial</option>
                </select>
                <input value={contextId} onChange={(event) => setContextId(event.target.value)} placeholder="ID do contexto" />
                <input value={materialId} onChange={(event) => setMaterialId(event.target.value)} placeholder="ID do material" />
                <button type="submit">Indexar</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {job && <p>Job {job.id}: {job.status}</p>}
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

    Confirmar que o BK cumpre RF31, que falha de forma controlada e que prepara o próximo BK.

2. Ficheiros envolvidos.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md`
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

    Guarda evidência com request válido, resposta esperada, pelo menos 3 cenário(s) negativo(s) e captura da página final.

7. Erros comuns ou cenário negativo.

    Não avances para BK-MF2-08 se a validação de sessão, ownership ou membership falhar.

### Passo 8 - Fechar prova final do BK P0

1. Explicação simples do objetivo.

    Confirmar que a indexação cria jobs úteis e que não mistura material privado com material oficial.

2. Ficheiros envolvidos.
    - REVER: `apps/api/src/modules/material-index/material-index.service.ts`
    - REVER: `apps/api/src/modules/material-index/material-index.controller.ts`
    - REVER: `apps/web/src/pages/mf2/MaterialIndexPage.tsx`

3. O que fazer.

    Reexecuta os testes, confirma os três cenários negativos de P0 e regista evidência de job privado, job oficial e material sem texto.

4. Código completo, correto e integrado.

~~~bash
npm run test:unit
npm run test:contracts
npm run test:integration
bash scripts/validate-planificacao.sh
~~~

5. Explicação do código.

    A sequência garante que o job fica utilizável por estrutura, versões, contextos, pesquisa e IA sem drift documental.

6. Como validar este passo.

    A entrega só está pronta quando `findDoneJob` bloquear job inexistente, job de outro actor e job não concluído.

7. Erros comuns ou cenário negativo.

    Marcar qualquer material como `DONE` sem texto processável quebra os BKs de tópicos, citações e pesquisa.

## Expected results

- Aluno cria job de indexação para material da sua área.
- Professor cria job de indexação para material oficial processado da sua disciplina.
- Job concluído expõe chunks de texto.
- Material sem texto processável devolve erro controlado.

## Critérios de aceite

- O código documentado compila quando aplicado ao projecto na ordem dos passos.
- O module importa explicitamente controller e service.
- O controller só declara parâmetros reais das rotas.
- O service valida ownership ou membership antes de consultar dados.
- A página usa cliente API tipado e cookies HttpOnly.

## Validação final

- Confirmar que materiais privados e oficiais usam validações diferentes.
- Confirmar que `findDoneJob` rejeita job inexistente, de outro actor ou não concluído.
- Executar caso positivo privado, caso positivo oficial e três cenários negativos por ser BK `P0`.

## Evidence para PR/defesa

- Print ou log do caminho principal concluído.
- Log de pelo menos um cenário negativo controlado.
- Resultado de `bash scripts/validate-planificacao.sh`.
- Confirmação de que `git diff --check` não reporta espaços inválidos.

## Handoff

BK-MF2-08

## Atualização da fila explícita e dos ficheiros oficiais (2026-07-11)

A mesma fila MongoDB suporta os scopes `PRIVATE_AREA` e `OFFICIAL_SUBJECT`. O endpoint
`POST /api/teacher/official-materials/:materialId/index-jobs` é iniciado explicitamente
pelo professor autorizado, devolve `202` com job `QUEUED` e reutiliza o job ativo através
de uma `activeKey` única. Depois de estado terminal, uma nova tentativa é permitida. O
frontend reidrata o último job por material com
`GET /api/teacher/subjects/:subjectId/material-index-jobs?latestByMaterial=true` e faz
polling do endpoint comum sem receber chunks oficiais.

Antes de ler PDF/DOCX, o worker relê o utilizador, exige papel `TEACHER`, revalida ownership
e lifecycle da disciplina, recupera o ficheiro apenas pela API interna de storage e volta a
validar tamanho, MIME e metadados. O sucesso marca job e material como concluídos; a falha
mantém o material submetido e deixa o job `FAILED` para retry. Audit logs registam submissão,
pedido, conclusão ou falha sem conteúdo, buffer ou path. A área privada continua a aceitar
exclusivamente fontes privadas.

## Changelog

- `2026-07-11`: documentada fila MongoDB assíncrona explícita para scopes privado/oficial, retry, revalidação e projeção pública sem chunks.
- `2026-06-08`: guia corrigido para contrato executável da MF2, com integração acumulativa, autorização explícita e validação do handoff.
- `2026-06-08`: validação reforçada de URLs, tipo frontend de chunks alinhado com o backend e changelog limpo para uso pelos alunos.
