/**
 * Implementa as regras de negócio de indexação textual de materiais e concentra validações do domínio.
 */
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { DocumentProcessingSafetyService } from "./document-processing-safety.service.js";
import { InjectModel } from "@nestjs/mongoose";
import * as dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import mammoth from "mammoth";
import { Model, Types } from "mongoose";
import { isIP } from "net";
import { PDFParse } from "pdf-parse";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexScope,
    MaterialIndexStatus,
    MaterialTextChunk,
} from "./schemas/material-index-job.schema.js";

/**
 * Vista pública de indexação textual de materiais, sem detalhes internos de Mongoose.
 */
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

/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type IndexablePrivateMaterial = {
    _id: unknown;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    title: string;
    url?: string;
    storageKey?: string;
    contentText?: string;
};

/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type IndexableOfficialMaterial = {
    _id: string;
    subjectId: string;
    type: "TEXT" | "URL";
    title: string;
    sourceUrl?: string;
    textContent?: string;
};

const MAX_URL_TEXT_BYTES = 250_000;
const MAX_URL_REDIRECTS = 3;
const URL_FETCH_TIMEOUT_MS = 5_000;

/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type PublicResolvedHost = {
    hostname: string;
    address: string;
    family: 4 | 6;
};

/**
 * Resposta tipada de indexação textual de materiais devolvida pela API ou por um helper frontend.
 */
type PinnedTextResponse = {
    status: number;
    headers: http.IncomingHttpHeaders;
    body: string;
    remoteAddress?: string;
};

export const materialIndexUrlSafety = {
    /**
     * Executa a operação resolve host no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param host Host analisado para validações de rede pública e bloqueio de endereços privados.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    resolveHost(host: string) {
        return dns.lookup(host, { all: true, verbatim: true });
    },
    /**
     * Executa a operação request text no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param url url necessário para executar request text sem depender de estado global.
     * @param resolvedHost resolved host necessário para executar request text sem depender de estado global.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    requestText(url: string, resolvedHost: PublicResolvedHost) {
        return requestPinnedText(url, resolvedHost);
    },
};

/**
 * Executa a operação request pinned text no domínio de indexação textual de materiais com contrato explícito.
 *
 * @param value Valor bruto recebido antes de normalização, parsing ou validação.
 * @param resolvedHost resolved host necessário para executar request pinned text sem depender de estado global.
 * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
 */
function requestPinnedText(
    value: string,
    resolvedHost: PublicResolvedHost,
): Promise<PinnedTextResponse> {
    return new Promise((resolve, reject) => {
        const url = new URL(value);
        const client = url.protocol === "https:" ? https : http;
        const request = client.request(
            url,
            {
                method: "GET",
                headers: {
                    Accept: "text/plain,text/html,application/json;q=0.8",
                    Host: url.host,
                },
                servername: url.hostname,
                timeout: URL_FETCH_TIMEOUT_MS,
                lookup: (_hostname, _options, callback) => {
                    // A resolução DNS foi feita antes e fica fixa aqui para reduzir risco de DNS rebinding.
                    callback(null, resolvedHost.address, resolvedHost.family);
                },
            },
            (response) => {
                const chunks: Buffer[] = [];
                let byteLength = 0;
                response.on("data", (chunk: Buffer | string) => {
                    const buffer = Buffer.isBuffer(chunk)
                        ? chunk
                        : Buffer.from(chunk);
                    byteLength += buffer.byteLength;
                    // O limite impede que uma URL externa force a API a carregar texto ilimitado em memória.
                    if (byteLength > MAX_URL_TEXT_BYTES) {
                        request.destroy(
                            new Error("URL excede o tamanho máximo permitido para indexação."),
                        );
                        return;
                    }
                    chunks.push(buffer);
                });
                response.on("end", () => {
                    resolve({
                        status: response.statusCode ?? 0,
                        headers: response.headers,
                        body: Buffer.concat(chunks).toString("utf8"),
                        remoteAddress: response.socket.remoteAddress,
                    });
                });
            },
        );

        request.on("timeout", () => {
            request.destroy(new Error("Tempo esgotado ao obter texto do material."));
        });
        request.on("error", reject);
        request.end();
    });
}

/**
 * Serviço de indexação textual básica de materiais.
 */
@Injectable()
export class MaterialIndexService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param jobModel Modelo Mongoose injetado para ler e persistir indexação textual de materiais.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param officialMaterialsService Service injetado para reutilizar regras de materiais oficiais sem duplicar validações.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
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
    
    /**
     * Cria um job observável antes de iniciar a extração pesada do material privado.
     *
     * @param actor Utilizador autenticado vindo da sessão.
     * @param studyAreaId Área privada do aluno.
     * @param materialId Material a indexar.
     * @returns Job persistido em estado QUEUED para a UI poder acompanhar.
     */
    async createQueuedPrivateJob(
        actor: AuthenticatedUser,
        studyAreaId: string,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const material = (await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        )) as IndexablePrivateMaterial;

        const job = await this.jobModel.create({
            scope: "PRIVATE_AREA",
            materialId: new Types.ObjectId(String(material._id)),
            studyAreaId: new Types.ObjectId(studyAreaId),
            userId: new Types.ObjectId(actor.id),
            status: "QUEUED",
            extractedTextChunks: [],
        });

        // A resposta fica leve: só expõe metadados do job, nunca o conteúdo privado do material.
        return this.toView(job.toObject());
    }

    /**
     * Consulta um job autorizado em qualquer estado para a UI poder fazer polling.
     *
     * @param actor Utilizador autenticado vindo da sessão.
     * @param jobId Job de indexação a consultar.
     * @returns Job autorizado, mesmo que ainda esteja QUEUED ou PROCESSING.
     */
    async findOwnedJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialIndexJobView> {
        const view = await this.loadJobView(jobId);
        this.assertOwnedJob(actor, view);
        return view;
    }

    /**
     * Processa um job previamente criado e atualiza o estado persistido.
     *
     * @param actor Utilizador autenticado preservado pelo controller.
     * @param studyAreaId Área privada do aluno.
     * @param materialId Material a indexar.
     * @param jobId Job QUEUED criado antes da resposta HTTP.
     * @returns Job atualizado para DONE ou FAILED.
     */
    async processQueuedPrivateJob(
        actor: AuthenticatedUser,
        studyAreaId: string,
        materialId: string,
        jobId: string,
    ): Promise<MaterialIndexJobView> {
        const material = (await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        )) as IndexablePrivateMaterial;

        const job = await this.jobModel.findOne({
            _id: new Types.ObjectId(jobId),
            scope: "PRIVATE_AREA",
            materialId: new Types.ObjectId(materialId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            userId: new Types.ObjectId(actor.id),
        });
        if (!job) throw this.notFound();

        job.status = "PROCESSING";
        job.errorMessage = undefined;
        job.extractedTextChunks = [];
        await job.save();

        try {
            const extraction = await this.extractPrivateMaterial(actor.id, material);
            if (extraction.text) {
                // O texto extraído fica no material do próprio aluno e prepara os fluxos de IA baseados em fontes.
                await this.materialsService.markIndexedText(
                    actor.id,
                    materialId,
                    extraction.text,
                );
            }

            job.status = extraction.text ? "DONE" : "FAILED";
            job.extractedTextChunks = this.createChunks(extraction.text, material.title);
            job.errorMessage =
                extraction.text
                    ? undefined
                    : extraction.errorMessage ?? "O material ainda não tem texto processável disponível.";
        } catch (error) {
            // A UI faz polling; por isso qualquer falha técnica depois de PROCESSING precisa de estado terminal.
            job.status = "FAILED";
            job.extractedTextChunks = [];
            job.errorMessage =
                error instanceof Error && error.message.includes("processável")
                    ? error.message
                    : "Não foi possível indexar o material neste momento.";
        }

        const savedJob = await job.save();
        return this.toView(savedJob.toObject());
    }

    /**
     * Executa a operação index private material no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    async indexPrivateMaterial(
        actor: AuthenticatedUser,
        studyAreaId: string,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const material = (await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        )) as IndexablePrivateMaterial;
        const extraction = await this.extractPrivateMaterial(actor.id, material);
        if (extraction.text) {
            // Guardar o texto no material evita repetir extração pesada em fluxos de IA posteriores.
            await this.materialsService.markIndexedText(
                actor.id,
                materialId,
                extraction.text,
            );
        }
        return this.createJob({
            scope: "PRIVATE_AREA",
            materialId,
            studyAreaId,
            userId: actor.id,
            chunks: this.createChunks(extraction.text, material.title),
            errorMessage: extraction.errorMessage,
        });
    }

    /**
     * Executa a operação index official material no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    async indexOfficialMaterial(
        actor: AuthenticatedUser,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            materialId,
        ) as IndexableOfficialMaterial;
        const extraction = await this.extractOfficialMaterial(material);
        if (extraction.text) {
            await this.officialMaterialsService.markIndexedText(
                actor.id,
                materialId,
                extraction.text,
            );
        }
        return this.createJob({
            scope: "OFFICIAL_SUBJECT",
            materialId,
            subjectId: material.subjectId,
            teacherId: actor.id,
            chunks: this.createChunks(extraction.text, material.title),
            errorMessage: extraction.errorMessage,
        });
    }

    /**
     * Procura indexação textual de materiais com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
     */
    async findDoneJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialIndexJobView> {
        const view = await this.loadJobView(jobId);
        this.assertOwnedJob(actor, view);
        this.assertDone(view);
        return view;
    }

    /**
     * Obtém um job concluído para fluxos de leitura pedagógica.
     *
     * Materiais privados continuam limitados ao dono. Materiais oficiais podem
     * ser lidos pelo professor dono ou por alunos inscritos na disciplina,
     * preservando o contrato MF3 de pesquisa/citações sem abrir endpoints MF2
     * de versionamento e estrutura a alunos.
     *
     * @param actor Utilizador autenticado.
     * @param jobId Job de indexação.
     * @returns Job concluído e autorizado para leitura.
     */
    async findReadableDoneJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialIndexJobView> {
        const view = await this.loadJobView(jobId);
        await this.assertReadableJob(actor, view);
        this.assertDone(view);
        return view;
    }

    /**
     * Carrega indexação textual de materiais no formato necessário ao próximo passo do fluxo.
     *
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
     */
    private async loadJobView(jobId: string): Promise<MaterialIndexJobView> {
        if (!Types.ObjectId.isValid(jobId)) throw this.notFound();
        const job = await this.jobModel.findById(jobId).lean();
        if (!job) throw this.notFound();
        return this.toView(job);
    }

    /**
     * Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param view Documento ou vista interna que será validada ou convertida para contrato público.
     */
    private assertOwnedJob(
        actor: AuthenticatedUser,
        view: MaterialIndexJobView,
    ): void {
        if (
            (view.scope === "PRIVATE_AREA" && view.userId !== actor.id) ||
            (view.scope === "OFFICIAL_SUBJECT" && view.teacherId !== actor.id)
        ) {
            throw this.accessDenied();
        }
    }

    /**
     * Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param view Documento ou vista interna que será validada ou convertida para contrato público.
     */
    private async assertReadableJob(
        actor: AuthenticatedUser,
        view: MaterialIndexJobView,
    ): Promise<void> {
        if (view.scope === "PRIVATE_AREA") {
            if (view.userId !== actor.id) throw this.accessDenied();
            return;
        }
        if (view.teacherId === actor.id) return;

        if (actor.role === "STUDENT" && view.subjectId) {
            // Alunos só leem material oficial se estiverem inscritos na disciplina associada ao job.
            await this.subjectsService.findSubjectForStudent(
                actor.id,
                view.subjectId,
            );
            return;
        }

        throw this.accessDenied();
    }

    /**
     * Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos.
     *
     * @param view Documento ou vista interna que será validada ou convertida para contrato público.
     */
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
                text: await this.documentSafety.runWithTimeout({
                    label: material.title,
                    // O timeout impede que um PDF problemático prenda a fila de indexação indefinidamente.
                    operation: () => this.extractPdfText(buffer),
                }),
            };
        }
        if (material.type === "DOCX") {
            return {
                text: await this.documentSafety.runWithTimeout({
                    label: material.title,
                    // DOCX usa o mesmo limite operacional para manter comportamento previsível entre formatos.
                    operation: () => this.extractDocxText(buffer),
                }),
            };
        }
        return { errorMessage: "Tipo de material privado não suportado." };
    } catch (error) {
        return { errorMessage: this.toExtractionError(error) };
    }
}

    /**
     * Cria indexação textual de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de indexação textual de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    private async createJob(input: {
        scope: MaterialIndexScope;
        materialId: string;
        studyAreaId?: string;
        subjectId?: string;
        userId?: string;
        teacherId?: string;
        chunks: MaterialTextChunk[];
        errorMessage?: string;
    }): Promise<MaterialIndexJobView> {
        const base = {
            scope: input.scope,
            materialId: new Types.ObjectId(input.materialId),
            studyAreaId: input.studyAreaId
                ? new Types.ObjectId(input.studyAreaId)
                : undefined,
            subjectId: input.subjectId
                ? new Types.ObjectId(input.subjectId)
                : undefined,
            userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
            teacherId: input.teacherId ? new Types.ObjectId(input.teacherId) : undefined,
        };
        const job = await this.jobModel.create(
            input.chunks.length === 0
                ? {
                      ...base,
                      status: "FAILED",
                      errorMessage:
                          input.errorMessage ??
                          "O material ainda não tem texto processável disponível.",
                  }
                : { ...base, status: "DONE", extractedTextChunks: input.chunks },
        );
        return this.toView(job.toObject());
    }

    /**
     * Executa a operação extract private material no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param userId Identificador de user que delimita ownership, membership ou relação de domínio.
     * @param material material necessário para executar extract private material sem depender de estado global.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
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
            const buffer = await this.materialsService.readStoredFile(
                material.storageKey,
            );
            if (material.type === "PDF") {
                return { text: await this.extractPdfText(buffer) };
            }
            if (material.type === "DOCX") {
                return { text: await this.extractDocxText(buffer) };
            }
            return { errorMessage: "Tipo de material privado não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    /**
     * Executa a operação extract official material no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param material material necessário para executar extract official material sem depender de estado global.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private async extractOfficialMaterial(
        material: IndexableOfficialMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            if (material.type === "TEXT") {
                return { text: material.textContent };
            }
            if (material.type === "URL") {
                return { text: await this.fetchTextFromUrl(material.sourceUrl) };
            }
            return { errorMessage: "Tipo de material oficial não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    /**
     * Executa a operação extract pdf text no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param buffer Conteúdo binário do ficheiro já carregado para extração textual.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private async extractPdfText(buffer: Buffer): Promise<string> {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
            const result = await parser.getText();
            return result.text.trim();
        } finally {
            await parser.destroy();
        }
    }

    /**
     * Executa a operação extract docx text no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param buffer Conteúdo binário do ficheiro já carregado para extração textual.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private async extractDocxText(buffer: Buffer): Promise<string> {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }

    /**
     * Executa a operação fetch text from url no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param value Valor bruto recebido antes de normalização, parsing ou validação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private async fetchTextFromUrl(value: string | undefined): Promise<string> {
        let url = this.parseSafeHttpUrl(value);
        let response: PinnedTextResponse | undefined;
        for (let redirectCount = 0; redirectCount <= MAX_URL_REDIRECTS; redirectCount += 1) {
            // Cada redirect é revalidado para impedir que uma URL pública salte para rede privada.
            const resolvedHost = await this.resolvePublicHost(url);
            response = await materialIndexUrlSafety.requestText(url, resolvedHost);
            if (
                response.remoteAddress &&
                this.isPrivateIp(response.remoteAddress)
            ) {
                // A verificação pós-ligação cobre divergências entre DNS resolvido e socket final.
                throw new Error("URL ligou a rede local ou privada.");
            }
            if (!this.isRedirect(response.status)) break;

            const location = this.getHeaderValue(response.headers.location);
            if (!location) {
                throw new Error("Redirect sem destino válido.");
            }
            if (redirectCount === MAX_URL_REDIRECTS) {
                throw new Error("URL excede o limite de redirects permitido.");
            }
            url = this.parseSafeHttpUrl(new URL(location, url).toString());
        }
        if (!response) {
            throw new Error("Não foi possível obter a URL.");
        }
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`URL devolveu HTTP ${response.status}`);
        }
        const contentLength = Number(
            this.getHeaderValue(response.headers["content-length"]) ?? 0,
        );
        if (contentLength > MAX_URL_TEXT_BYTES) {
            throw new Error("URL excede o tamanho máximo permitido para indexação.");
        }
        const contentType =
            this.getHeaderValue(response.headers["content-type"]) ?? "";
        if (
            contentType &&
            !/(text\/|application\/json|application\/xml|application\/xhtml\+xml)/i.test(
                contentType,
            )
        ) {
            // A indexação pedagógica só aceita texto; binários ficam fora para evitar parsing inseguro.
            throw new Error("URL não devolveu conteúdo textual indexável.");
        }
        if (Buffer.byteLength(response.body, "utf8") > MAX_URL_TEXT_BYTES) {
            throw new Error("URL excede o tamanho máximo permitido para indexação.");
        }
        return this.stripHtml(response.body).trim();
    }

    /**
     * Executa a operação is redirect no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param status Estado de domínio usado para filtrar, decidir ou validar a operação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private isRedirect(status: number): boolean {
        return [301, 302, 303, 307, 308].includes(status);
    }

    /**
     * Converte e valida valores de indexação textual de materiais, rejeitando entradas que poderiam quebrar segurança ou consistência.
     *
     * @param value Valor bruto recebido antes de normalização, parsing ou validação.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private parseSafeHttpUrl(value: string | undefined): string {
        const url = new URL(String(value ?? ""));
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("URL deve usar http ou https.");
        }
        const host = url.hostname.toLowerCase();
        if (
            host === "localhost" ||
            host.endsWith(".localhost") ||
            this.isPrivateIp(host)
        ) {
            throw new Error("URL local ou privada não pode ser indexada.");
        }
        return url.toString();
    }

    /**
     * Executa a operação resolve public host no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param value Valor bruto recebido antes de normalização, parsing ou validação.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private async resolvePublicHost(value: string): Promise<PublicResolvedHost> {
        const { hostname } = new URL(value);
        const host = hostname.toLowerCase();
        if (this.isPrivateIp(host)) {
            throw new Error("URL local ou privada não pode ser indexada.");
        }
        const ipFamily = isIP(host);
        if (ipFamily !== 0) {
            return { hostname: host, address: host, family: ipFamily === 6 ? 6 : 4 };
        }

        const addresses = await materialIndexUrlSafety.resolveHost(host);
        if (addresses.length === 0) {
            throw new Error("URL não resolveu para nenhum endereço.");
        }
        // Basta um endereço privado na resposta DNS para rejeitar o host inteiro.
        if (addresses.some((address) => this.isPrivateIp(address.address))) {
            throw new Error("URL resolve para rede local ou privada.");
        }
        const [firstAddress] = addresses;
        return {
            hostname: host,
            address: firstAddress.address,
            family: firstAddress.family === 6 ? 6 : 4,
        };
    }

    /**
     * Executa a operação is private ip no domínio de indexação textual de materiais com contrato explícito.
     *
     * @param host Host analisado para validações de rede pública e bloqueio de endereços privados.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private isPrivateIp(host: string): boolean {
        if (isIP(host) === 0) return false;
        if (host === "::1" || host === "0.0.0.0") return true;
        if (host.startsWith("127.") || host.startsWith("10.")) return true;
        if (host.startsWith("192.168.")) return true;
        if (host.startsWith("169.254.") || host === "169.254.169.254") return true;
        if (host.startsWith("100.64.")) return true;
        const parts = host.split(".").map(Number);
        if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
            return true;
        }
        return host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
    }

    /**
     * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de indexação textual de materiais.
     *
     * @param text text necessário para executar strip html sem depender de estado global.
     * @returns Valor de indexação textual de materiais no contrato esperado pelo chamador.
     */
    private stripHtml(text: string): string {
        return text
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ");
    }

    /**
     * Carrega indexação textual de materiais no formato necessário ao próximo passo do fluxo.
     *
     * @param header Cabeçalhos HTTP usados para ler metadados sem depender do formato original.
     * @returns Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
     */
    private getHeaderValue(header: string | string[] | undefined): string | undefined {
        return Array.isArray(header) ? header[0] : header;
    }

    /**
     * Mapeia o documento interno de indexação textual de materiais para uma forma pública estável e simples de consumir.
     *
     * @param error Erro capturado para ser convertido numa resposta controlada ou relançado com segurança.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private toExtractionError(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message.slice(0, 1000);
        }
        return "Não foi possível extrair texto do material.";
    }

    /**
     * Cria indexação textual de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param text text necessário para executar create chunks sem depender de estado global.
     * @param sourceLabel source label necessário para executar create chunks sem depender de estado global.
     * @returns Registo de indexação textual de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    private createChunks(
        text: string | undefined,
        sourceLabel: string,
    ): MaterialTextChunk[] {
        const cleanText = text?.trim();
        if (!cleanText) return [];
        // Chunks pequenos tornam citações e pesquisa previsíveis sem introduzir embeddings nesta fase.
        const paragraphs = cleanText
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
        const parts = paragraphs.length > 0 ? paragraphs : [cleanText];
        return parts.slice(0, 40).map((part, index) => ({
            order: index + 1,
            text: part.slice(0, 2000),
            sourceLabel,
            locator: `chunk-${index + 1}`,
        }));
    }

    /**
     * Constrói uma exceção de indexação textual de materiais com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_INDEX_JOB_NOT_FOUND",
            message: "Job de indexação não encontrado.",
        });
    }

    /**
     * Constrói uma exceção de indexação textual de materiais com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private accessDenied(): ForbiddenException {
        return new ForbiddenException({
            code: "MATERIAL_INDEX_ACCESS_DENIED",
            message: "Não tens acesso a este job de indexação.",
        });
    }

    /**
     * Mapeia o documento interno de indexação textual de materiais para uma forma pública estável e simples de consumir.
     *
     * @param job Documento ou vista interna que será validada ou convertida para contrato público.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toView(job: {
        _id: unknown;
        scope: MaterialIndexScope;
        materialId: unknown;
        studyAreaId?: unknown;
        subjectId?: unknown;
        userId?: unknown;
        teacherId?: unknown;
        status: MaterialIndexStatus;
        extractedTextChunks?: MaterialTextChunk[];
        errorMessage?: string;
        createdAt?: Date;
    }): MaterialIndexJobView {
        return {
            _id: String(job._id),
            scope: job.scope,
            materialId: String(job.materialId),
            studyAreaId: job.studyAreaId ? String(job.studyAreaId) : undefined,
            subjectId: job.subjectId ? String(job.subjectId) : undefined,
            userId: job.userId ? String(job.userId) : undefined,
            teacherId: job.teacherId ? String(job.teacherId) : undefined,
            status: job.status,
            extractedTextChunks: job.extractedTextChunks ?? [],
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
        };
    }
}
