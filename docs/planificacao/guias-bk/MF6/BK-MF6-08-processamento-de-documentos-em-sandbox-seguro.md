# BK-MF6-08 - Processamento de documentos em sandbox seguro.

## Header

- `doc_id`: `GUIA-BK-MF6-08`
- `bk_id`: `BK-MF6-08`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF18`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-09`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais proteger a extração de texto de PDF, DOCX e URLs antes de esses conteúdos entrarem no pipeline de materiais, pesquisa e IA.

No fim, o backend valida tipo, tamanho e origem, e executa PDF/DOCX em `worker_threads`. O timeout chama realmente `worker.terminate()`, os workers têm limites de memória/stack e a concorrência global de parsing é 2.

URLs usam `ipaddr.js`, bloqueiam IPv4, IPv6 e IPv4-mapped privados, reservados, link-local e metadata antes e depois da ligação, e repetem a validação em cada redirect. A ligação usa o endereço público validado, evitando DNS rebinding.

#### Importância

`RNF18` exige processamento de documentos em sandbox seguro. Em StudyFlow, isso é crítico porque materiais privados, materiais oficiais, URLs e texto extraído podem alimentar pesquisa, quizzes e IA. Um ficheiro demasiado grande, um MIME enganador, uma URL interna ou um parser preso não pode bloquear a API nem expor dados.

Este guia prepara `BK-MF6-09` porque os guardrails da IA só são defensáveis se as fontes chegarem ao modelo depois de validação, ownership e limites técnicos claros.

#### Scope-in

- Criar `DocumentProcessingSafetyService` e `document-parser.worker.ts` para validar e isolar parsing.
- Reutilizar `MAX_UPLOAD_BYTES` e os MIME types já aceites pelo upload de materiais.
- Integrar o service em `MaterialIndexService` antes de `PDFParse` e `mammoth`.
- Registar o provider em `MaterialIndexModule`.
- Confirmar que URLs continuam protegidas por validação de protocolo, host público, DNS fixado, redirects, timeout e limite de bytes.
- Adicionar testes unitários para ficheiro demasiado grande, MIME incompatível e timeout.
- Preservar sessão HttpOnly, CSRF, ownership, membership e privacidade já entregues em BKs anteriores.

#### Scope-out

- Criar antivirus, OCR, embeddings, RAG ou análise semântica avançada.
- Criar child processes ou containers; o isolamento aprovado neste alvo é `worker_threads`.
- Alterar upload de materiais, controllers, schemas de domínio ou endpoints canónicos sem necessidade deste BK.
- Indexar ficheiros que não sejam PDF ou DOCX.
- Permitir URLs locais, privadas ou sem protocolo `http`/`https`.
- Guardar cookies, hashes, tokens, prompts privados, URLs sensíveis ou dados pessoais em evidence.

#### Estado antes e depois

- Estado antes: materiais privados e oficiais já têm fluxos de ownership, upload e indexação textual, mas a extração PDF/DOCX ainda não tem um contrato dedicado de segurança antes do parser.
- Estado depois: a indexação textual rejeita documentos incoerentes antes do parser, aborta extrações demoradas e mantém as proteções de URL já existentes.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`

#### Glossário

- **Sandbox aplicacional:** conjunto de validações e limites dentro da API que reduz o risco de processar ficheiros ou URLs perigosos.
- **Parser:** biblioteca que lê PDF ou DOCX e tenta extrair texto.
- **Timeout:** limite de tempo para uma operação terminar antes de ser abortada com erro controlado.
- **MIME type:** tipo declarado do ficheiro, como `application/pdf`.
- **Assinatura binária:** primeiros bytes do ficheiro usados para confirmar que o conteúdo combina com o tipo declarado.
- **Ownership:** regra que garante que um aluno só processa materiais privados que lhe pertencem.
- **SSRF:** ataque em que uma URL externa tenta forçar o servidor a chamar redes internas ou privadas.
- **DNS rebinding:** técnica em que um domínio aparentemente público muda para endereço privado entre resolução e ligação.
- **Fallback honesto:** erro controlado que assume a falha em vez de inventar texto processado.

#### Conceitos teóricos essenciais

- **Defesa em profundidade:** upload, ownership, CSRF, validação de URL e parser protegido trabalham em camadas. Nenhuma camada substitui as outras.
- **Validação antes do parser:** PDF e DOCX são formatos complexos. O backend deve confirmar tamanho, tipo e consistência antes de chamar bibliotecas externas.
- **Timeout de parser:** rejeitar uma Promise não termina CPU síncrono. O timeout só é válido se terminar o worker e libertar recursos.
- **URLs como entrada perigosa:** uma URL pode apontar para redes locais, metadados cloud, ficheiros enormes ou conteúdo binário. A indexação só deve aceitar texto vindo de hosts públicos.
- **Erro seguro:** a API pode dizer que a extração falhou, mas não deve expor paths internos, stack traces, cookies, IPs privados ou dados de materiais.
- **Contrato pedagógico:** `worker_threads` não é containerização, mas separa CPU/heap do event loop principal e permite terminação real e limites explícitos.

#### Arquitetura do BK

- Endpoint privado: `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs`.
- Endpoint oficial: `POST /api/teacher/official-materials/:materialId/index-jobs`.
- Service novo: `apps/api/src/modules/material-index/document-processing-safety.service.ts`.
- Service editado: `apps/api/src/modules/material-index/material-index.service.ts`.
- Module editado: `apps/api/src/modules/material-index/material-index.module.ts`.
- Teste novo: `apps/api/src/modules/material-index/document-processing-safety.service.spec.ts`.
- Contratos reutilizados: `MAX_UPLOAD_BYTES`, `ALLOWED_MIME_TYPES`, `materialIndexUrlSafety`, `URL_FETCH_TIMEOUT_MS`, `MAX_URL_TEXT_BYTES`, ownership de materiais privados e materiais oficiais.
- Handoff para o próximo BK: `BK-MF6-09` pode assumir que fontes indexadas passaram por limites de tipo, tamanho, origem e tempo de processamento.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/material-index/document-processing-safety.service.ts`
- CRIAR: `apps/api/src/modules/material-index/document-parser.worker.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`
- EDITAR: `apps/api/src/modules/material-index/material-index.module.ts`
- CRIAR: `apps/api/src/modules/material-index/document-processing-safety.service.spec.ts`
- REVER: `apps/api/src/modules/materials/validators/material-upload.validator.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-08` entrega `RNF18` sem alterar ID, owner, apoio, sprint, prioridade ou próximo BK.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

3. Instruções do que fazer.

Confirma que `RNF18` é "Processamento de documentos em sandbox seguro" e que a matriz coloca este BK em `MF6`, `P0`, `S10`, `Reforco`, com `Natalia` como owner e `Guilherme` como apoio.

`CANONICO`: título, requisito, prioridade, sprint, owner e apoio vêm da matriz e do backlog.

`DERIVADO`: a sandbox usa `worker_threads` com `maxOldGenerationSizeMb: 128`, `maxYoungGenerationSizeMb: 32`, `codeRangeSizeMb: 16` e `stackSizeMb: 4`; qualquer alteração destes limites exige teste de carga e reauditoria.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é travar drift documental. Antes de programar segurança, tens de saber exatamente que requisito estás a entregar.

6. Validação do passo.

Confirma que o header deste guia continua com `RNF18`, `P0`, `S10`, `Reforco` e `proximo_bk: BK-MF6-09`.

7. Cenário negativo/erro esperado.

Se alguém mudar o owner, apoio, sprint ou requisito sem alteração canónica nos backlogs, rejeita essa mudança neste BK.

### Passo 2 - Mapear as proteções que já existem

1. Objetivo funcional do passo no contexto da app.

Perceber que este BK não começa do zero. A app já tem validação de upload, ownership de material, indexação textual e proteção de URLs. O trabalho é fechar a parte que falta antes do parser.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/modules/materials/validators/material-upload.validator.ts`
- REVER: `apps/api/src/modules/materials/materials.service.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `apps/api/src/modules/material-index/material-index.module.ts`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md`

3. Instruções do que fazer.

Lê o validador de upload e confirma estes contratos:

- `MAX_UPLOAD_BYTES` define o limite de ficheiro aceite.
- `ALLOWED_MIME_TYPES` aceita PDF e DOCX.
- `validateMaterialUpload` valida MIME, extensão e assinatura binária.
- `MaterialIndexService` lê o ficheiro armazenado e chama `PDFParse` ou `mammoth`.
- `fetchTextFromUrl` já rejeita URLs locais/privadas, limita redirects, fixa DNS, aplica timeout e limita bytes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo evita duplicar regras. Se o upload já tem limite de 10 MB, o processamento deve reutilizar esse limite para não criar dois contratos diferentes para o mesmo material.

6. Validação do passo.

Regista na tua evidence que o BK vai criar apenas uma proteção adicional para documentos armazenados e não vai reescrever a proteção de URLs.

7. Cenário negativo/erro esperado.

Se encontrares uma segunda lista de MIME types criada sem ligação ao upload, elimina essa duplicação e reutiliza o contrato existente.

### Passo 3 - Criar o service de segurança de documentos

1. Objetivo funcional do passo no contexto da app.

Criar a peça central do BK: um service que valida o documento armazenado antes do parser e limita o tempo de extração.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/material-index/document-processing-safety.service.ts`

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém as mensagens públicas curtas e sem detalhes internos. O service não decide ownership; isso continua nos services de materiais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/document-processing-safety.service.ts
/**
 * Aplica limites de segurança antes de processar PDF/DOCX com parsers externos.
 */
import {
    BadRequestException,
    Injectable,
    PayloadTooLargeException,
    RequestTimeoutException,
} from "@nestjs/common";
import { Worker } from "node:worker_threads";
import {
    ALLOWED_MIME_TYPES,
    MAX_UPLOAD_BYTES,
} from "../materials/validators/material-upload.validator.js";

export const DOCUMENT_PROCESSING_TIMEOUT_MS = 5_000;

export type SafeStoredDocumentInput = {
    type: "PDF" | "DOCX";
    mimeType?: string;
    byteLength: number;
    declaredSizeBytes?: number;
    title: string;
};

export type WorkerDocumentProcessingInput = {
    type: "PDF" | "DOCX";
    bytes: Uint8Array;
    timeoutMs?: number;
};

const MIME_BY_TYPE = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

/**
 * Centraliza validação e isolamento por worker dos documentos indexados.
 */
@Injectable()
export class DocumentProcessingSafetyService {
    /**
     * Rejeita documentos incoerentes antes de qualquer parser externo ler bytes.
     *
     * @param input Metadados e tamanho do documento já carregado pelo backend.
     */
    assertSafeStoredDocument(input: SafeStoredDocumentInput): void {
        const expectedMimeType = MIME_BY_TYPE[input.type];

        if (!ALLOWED_MIME_TYPES.includes(expectedMimeType)) {
            throw new BadRequestException({
                code: "UNSUPPORTED_DOCUMENT_TYPE",
                message: "Tipo de documento não suportado.",
            });
        }

        if (input.mimeType && input.mimeType !== expectedMimeType) {
            throw new BadRequestException({
                code: "DOCUMENT_MIME_MISMATCH",
                message: "O documento não corresponde ao tipo esperado.",
            });
        }

        if (input.byteLength <= 0) {
            throw new BadRequestException({
                code: "DOCUMENT_EMPTY",
                message: "O documento não tem conteúdo processável.",
            });
        }

        if (
            input.byteLength > MAX_UPLOAD_BYTES ||
            (input.declaredSizeBytes ?? input.byteLength) > MAX_UPLOAD_BYTES
        ) {
            throw new PayloadTooLargeException({
                code: "DOCUMENT_TOO_LARGE",
                message: "O documento excede o tamanho máximo permitido.",
            });
        }
    }

    /**
     * Executa o parser num worker terminável e com heap/stack limitados.
     *
     * @param input Operação de parsing e limite temporal opcional.
     * @returns Resultado produzido pelo parser antes do timeout.
     */
    async parseInWorker(input: WorkerDocumentProcessingInput): Promise<string> {
        const worker = new Worker(
            new URL("./document-parser.worker.js", import.meta.url),
            {
                workerData: { type: input.type, bytes: input.bytes },
                resourceLimits: {
                    maxOldGenerationSizeMb: 128,
                    maxYoungGenerationSizeMb: 32,
                    codeRangeSizeMb: 16,
                    stackSizeMb: 4,
                },
            },
        );

        return new Promise<string>((resolve, reject) => {
            let settled = false;
            const finish = (callback: () => void) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                worker.removeAllListeners();
                callback();
            };
            const timer = setTimeout(() => {
                worker.terminate().then(() => {
                    finish(() => reject(new RequestTimeoutException({
                        code: "DOCUMENT_PROCESSING_TIMEOUT",
                        message: "O documento demorou demasiado a processar.",
                    })));
                }, (error) => finish(() => reject(error)));
            }, input.timeoutMs ?? DOCUMENT_PROCESSING_TIMEOUT_MS);

            worker.once("message", (message: { ok: boolean; text?: string; code?: string }) => {
                finish(() => message.ok && typeof message.text === "string"
                    ? resolve(message.text)
                    : reject(new Error(message.code ?? "DOCUMENT_PROCESSING_FAILED")));
            });
            worker.once("error", (error) => finish(() => reject(error)));
            worker.once("exit", (code) => {
                if (code !== 0) finish(() => reject(new Error("DOCUMENT_WORKER_EXITED")));
            });
        });
    }
}
```

5. Explicação do código.

O método `assertSafeStoredDocument` cria a barreira antes do parser. Ele compara tipo de material, MIME type e tamanho real do buffer com o contrato já usado no upload. Isto evita que o parser seja chamado com conteúdo vazio, demasiado grande ou incoerente.

`parseInWorker` transfere o parsing para um worker com limites. No timeout, espera por `terminate()` antes de rejeitar; assim o parser não continua a consumir CPU depois da resposta. O runner limita a dois parsings simultâneos.

6. Validação do passo.

Executa `npm --prefix apps/api run build` depois de integrar o service no módulo.

7. Cenário negativo/erro esperado.

Um PDF com `byteLength` acima de `MAX_UPLOAD_BYTES` deve lançar `DOCUMENT_TOO_LARGE`. Um DOCX com MIME de PDF deve lançar `DOCUMENT_MIME_MISMATCH`.

### Passo 4 - Integrar o service em MaterialIndexService

1. Objetivo funcional do passo no contexto da app.

Garantir que a proteção é chamada no fluxo real antes de `PDFParse` e `mammoth`.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/material-index/material-index.service.ts`

3. Instruções do que fazer.

Edita apenas as zonas abaixo. Mantém a lógica de URL existente: ela já valida protocolo, hosts privados, DNS, redirects, content-type, timeout e tamanho.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/material-index.service.ts
import { DocumentProcessingSafetyService } from "./document-processing-safety.service.js";
```

```ts
// apps/api/src/modules/material-index/material-index.service.ts
type IndexablePrivateMaterial = {
    _id: unknown;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    title: string;
    url?: string;
    storageKey?: string;
    contentText?: string;
    // Estes metadados permitem validar o ficheiro antes de qualquer parser tocar no conteúdo.
    mimeType?: string;
    sizeBytes?: number;
};
```

```ts
// apps/api/src/modules/material-index/material-index.service.ts
constructor(
    @InjectModel(MaterialIndexJob.name)
    private readonly jobModel: Model<MaterialIndexJobDocument>,
    private readonly materialsService: MaterialsService,
    private readonly officialMaterialsService: OfficialMaterialsService,
    private readonly subjectsService: SubjectsService,
    // A proteção de documentos fica injetada para ser testável e reutilizável noutros fluxos de materiais.
    private readonly documentSafety: DocumentProcessingSafetyService,
) {}
```

```ts
// apps/api/src/modules/material-index/material-index.service.ts
private async extractPrivateMaterial(
    userId: string,
    material: IndexablePrivateMaterial,
): Promise<{ text?: string; errorMessage?: string }> {
    try {
        if (material.type === "TOPIC") {
            return { text: material.contentText };
        }
        if (material.type === "URL") {
            return { text: await this.fetchTextFromUrl(material.url) };
        }
        if (!material.storageKey) {
            return { errorMessage: "O ficheiro do material não está disponível." };
        }

        // Primeiro lê-se o ficheiro guardado; a validação seguinte decide se é seguro processá-lo.
        const buffer = await this.materialsService.readStoredFile(
            material.storageKey,
        );
        // A validação acontece antes do parser para bloquear MIME, tamanho e metadados incoerentes.
        this.documentSafety.assertSafeStoredDocument({
            type: material.type,
            mimeType: material.mimeType,
            byteLength: buffer.byteLength,
            declaredSizeBytes: material.sizeBytes,
            title: material.title,
        });

        if (material.type === "PDF") {
            return {
                text: await this.documentSafety.parseInWorker({
                    type: "PDF",
                    bytes: buffer,
                }),
            };
        }
        if (material.type === "DOCX") {
            return {
                text: await this.documentSafety.parseInWorker({
                    type: "DOCX",
                    bytes: buffer,
                }),
            };
        }
        return { errorMessage: "Tipo de material privado não suportado." };
    } catch (error) {
        return { errorMessage: this.toExtractionError(error) };
    }
}
```

5. Explicação do código.

O constructor recebe `DocumentProcessingSafetyService` por injeção de dependência. Assim, o service é testável e não é criado manualmente dentro da classe.

O type `IndexablePrivateMaterial` passa a documentar `mimeType` e `sizeBytes`, que já pertencem ao material guardado. A extração lê o ficheiro, valida os metadados e só depois chama o parser.

6. Validação do passo.

Confirma que `material.type` só chega a `assertSafeStoredDocument` quando é `PDF` ou `DOCX`. `TOPIC` e `URL` continuam nos seus ramos próprios.

7. Cenário negativo/erro esperado.

Se `readStoredFile` devolver um buffer vazio, o job deve falhar com mensagem controlada de documento sem conteúdo processável.

### Passo 5 - Registar o provider no módulo

1. Objetivo funcional do passo no contexto da app.

Garantir que o Nest consegue injetar `DocumentProcessingSafetyService` em `MaterialIndexService`.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/material-index/material-index.module.ts`

3. Instruções do que fazer.

Adiciona o import e o provider novo. Não alteres controllers nem imports de domínio.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/material-index.module.ts
/**
 * Regista providers, controllers e schemas necessários ao módulo de indexação textual de materiais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { DocumentProcessingSafetyService } from "./document-processing-safety.service.js";
import { MaterialIndexController } from "./material-index.controller.js";
import { MaterialIndexService } from "./material-index.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobSchema,
} from "./schemas/material-index-job.schema.js";

/**
 * Módulo de indexação textual básica.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: MaterialIndexJob.name, schema: MaterialIndexJobSchema },
        ]),
    ],
    controllers: [MaterialIndexController],
    providers: [MaterialIndexService, DocumentProcessingSafetyService],
    exports: [MaterialIndexService],
})
export class MaterialIndexModule {}
```

5. Explicação do código.

Sem este registo, a app compila o ficheiro novo mas falha em runtime quando tentar construir `MaterialIndexService`.

6. Validação do passo.

Executa `npm --prefix apps/api run build`.

7. Cenário negativo/erro esperado.

Se o provider não for registado, o Nest deve indicar que não consegue resolver a dependência `DocumentProcessingSafetyService`.

### Passo 6 - Adicionar testes negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Criar provas pequenas que falham se a proteção de `RNF18` for removida.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/material-index/document-processing-safety.service.spec.ts`

3. Instruções do que fazer.

Adiciona testes ao service novo. Mantém os testes focados na regra de segurança, sem MongoDB nem HTTP.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/material-index/document-processing-safety.service.spec.ts
import {
    DocumentProcessingSafetyService,
} from "./document-processing-safety.service.js";
import { MAX_UPLOAD_BYTES } from "../materials/validators/material-upload.validator.js";
import { installBlockedWorkerFixture } from "./testing/blocked-worker.fixture.js";

describe("DocumentProcessingSafetyService", () => {
    let service: DocumentProcessingSafetyService;

    beforeEach(() => {
        service = new DocumentProcessingSafetyService();
    });

    it("aceita PDF dentro do limite com MIME coerente", () => {
        // O caminho feliz prova que a proteção não bloqueia documentos válidos da StudyFlow.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: 1024,
                declaredSizeBytes: 1024,
                title: "Resumo de biologia",
            }),
        ).not.toThrow();
    });

    it("bloqueia documentos maiores do que o limite de upload", () => {
        // Este negativo impede que um ficheiro pesado chegue ao parser e consuma recursos da API.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: MAX_UPLOAD_BYTES + 1,
                declaredSizeBytes: MAX_UPLOAD_BYTES + 1,
                title: "Documento demasiado grande",
            }),
        ).toThrow("tamanho máximo");
    });

    it("bloqueia MIME incompatível com o tipo do material", () => {
        // MIME incoerente é bloqueado para evitar que a extensão esconda conteúdo de outro formato.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "DOCX",
                mimeType: "application/pdf",
                byteLength: 1024,
                declaredSizeBytes: 1024,
                title: "Documento incoerente",
            }),
        ).toThrow("tipo esperado");
    });

    it("termina realmente o worker quando o parser excede o timeout", async () => {
        const worker = installBlockedWorkerFixture();
        await expect(service.parseInWorker({
            type: "PDF",
            bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
            timeoutMs: 5,
        })).rejects.toThrow("demorou demasiado");
        expect(worker.terminate).toHaveBeenCalledTimes(1);
    });
});
```

5. Explicação do código.

O primeiro teste confirma o caminho válido. Os restantes cobrem os negativos que defendem `RNF18`: tamanho excessivo, MIME incoerente e parser preso.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit
```

7. Cenário negativo/erro esperado.

Remove temporariamente a chamada a `assertSafeStoredDocument` no fluxo de indexação e confirma que a revisão deve rejeitar a alteração, mesmo que o teste isolado do service continue verde.

### Passo 7 - Rever URLs, evidence e handoff para IA

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova técnica e garantir que `BK-MF6-09` recebe fontes mais seguras.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`

3. Instruções do que fazer.

Confirma que a lógica de URL continua a rejeitar:

- protocolo diferente de `http` ou `https`;
- `localhost`;
- IPs privados;
- DNS que resolve para rede privada;
- redirects excessivos;
- conteúdo não textual;
- resposta maior do que o limite de indexação;
- pedidos que excedem timeout.

Depois escreve a evidence com comandos, resultado e interpretação. Não copies dados pessoais nem URLs privadas.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. A proteção de URL já existe em `MaterialIndexService`.

5. Explicação do código.

Este BK tem duas entradas perigosas: ficheiros e URLs. Os ficheiros ficam protegidos pelo service novo; as URLs ficam protegidas pelo código já existente. A revisão final confirma que ambas as entradas têm limites antes de entrarem em pesquisa ou IA.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
```

Regista também uma verificação textual:

```bash
rg -n "DocumentProcessingSafetyService|DOCUMENT_PROCESSING_TIMEOUT_MS|MAX_UPLOAD_BYTES|materialIndexUrlSafety" apps/api/src/modules/material-index apps/api/src/modules/materials/validators/material-upload.validator.ts
```

7. Cenário negativo/erro esperado.

Se a URL apontar para `localhost`, rede privada ou conteúdo binário, a indexação deve falhar com erro controlado em vez de devolver texto inventado.

#### Critérios de aceite

- O header mantém `BK-MF6-08`, `RNF18`, `P0`, `S10`, `Reforco`, owner `Natalia`, apoio `Guilherme` e `proximo_bk: BK-MF6-09`.
- Existe `DocumentProcessingSafetyService` com validação de tipo, MIME, tamanho e timeout.
- `MaterialIndexService` injeta o service novo e chama a validação antes de `PDFParse` e `mammoth`.
- `MaterialIndexModule` regista `DocumentProcessingSafetyService`.
- URLs continuam protegidas por validação de protocolo, host público, DNS, redirects, content-type, timeout e limite de bytes.
- Testes cobrem caminho válido, ficheiro grande, MIME incoerente e timeout.
- A evidence não inclui segredos, cookies, hashes, prompts privados, paths internos de máquina ou dados pessoais.

#### Validação final

Executa, no mínimo:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
rg -n "DocumentProcessingSafetyService|parseInWorker|worker.terminate|resourceLimits" apps/api/src/modules/material-index
```

Depois confirma manualmente:

- não criaste endpoints duplicados;
- não moveste autorização para frontend;
- não aceitaste ficheiros fora de PDF/DOCX;
- não removeste as proteções de URL;
- não registaste dados sensíveis em evidence.

#### Evidence para PR/defesa

Regista no PR ou no relatório técnico:

- comando executado;
- resultado observado;
- cenário negativo;
- interpretação curta ligada a `RNF18`;
- nota explícita de que a sandbox deste BK é aplicacional e não isolamento por processo.

Exemplo de formato:

```md
Comando: npm --prefix apps/api run test:unit
Resultado: PASS na suite de material-index/document-processing-safety
Negativo validado: PDF acima do limite e parser acima do timeout são rejeitados
Interpretação: RNF18 passa a ter barreira antes de parsing e timeout observável
```

#### Handoff

- `BK-MF6-09` pode assumir que texto vindo de PDF/DOCX passa por validação de tipo, MIME, tamanho e timeout.
- `BK-MF6-09` pode assumir que texto vindo de URL passa por validação de host público, limite de redirects, content-type textual, timeout e limite de bytes.
- Guardrails de IA continuam obrigatórios mesmo com esta proteção. Este BK reduz risco na entrada das fontes, mas não substitui validação de prompts, políticas de resposta ou limites de privacidade da IA.

#### Changelog

- `2026-07-10`: sandbox endurecida com `worker_threads`, terminação real, resource limits, concorrência 2 e SSRF normalizado com `ipaddr.js`.
