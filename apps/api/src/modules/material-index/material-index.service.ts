/**
 * Implementa as regras de negócio de indexação textual de materiais e concentra validações do domínio.
 */
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import ipaddr from "ipaddr.js";
import { Model, Types } from "mongoose";
import {
    executeWithMongoLeaseHeartbeat,
    MongoLeaseLostError,
} from "../../common/reliability/mongo-lease-heartbeat.js";
import {
    isTransientNetworkError,
    retryWithRecovery,
} from "../../common/reliability/retry-with-recovery.js";
import { normalizePortugueseStudyText } from "../../common/text/pt-text-normalization.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { DocumentProcessingSafetyService } from "./document-processing-safety.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexScope,
    MaterialIndexStatus,
    MaterialTextChunk,
} from "./schemas/material-index-job.schema.js";

export type { MaterialTextChunk } from "./schemas/material-index-job.schema.js";

/**
 * Vista pública de indexação textual de materiais, sem detalhes internos de Mongoose.
 */
export type MaterialIndexJobView = {
    _id: string;
    scope: MaterialIndexScope;
    materialId: string;
    studyAreaId?: string;
    subjectId?: string;
    userId?: string;
    teacherId?: string;
    status: MaterialIndexStatus;
    extractedTextChunks: MaterialTextChunk[];
    errorMessage?: string;
    attempts?: number;
    maxAttempts?: number;
    createdAt?: Date;
};

/**
 * Job interno reclamado atomicamente por um runner Mongo.
 */
export type ClaimedMaterialIndexJob = {
    _id: string;
    materialId: string;
    studyAreaId: string;
    userId: string;
    attempts: number;
    maxAttempts: number;
    leaseOwner: string;
    leaseToken: number;
    leaseMs: number;
};

/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type IndexablePrivateMaterial = {
    _id: unknown;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    title: string;
    status?: "PENDING_PROCESSING" | "READY" | "FAILED";
    url?: string;
    storageKey?: string;
    contentText?: string;
    mimeType?: string;
    sizeBytes?: number;
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param host Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    resolveHost(host: string) {
        return dns.lookup(host, { all: true, verbatim: true });
    },
    /**
     * Executa a operação request text no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param url URL validado ou a validar antes de qualquer pedido de rede.
     * @param resolvedHost Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    requestText(url: string, resolvedHost: PublicResolvedHost) {
        return requestPinnedText(url, resolvedHost);
    },
};

/**
 * Executa a operação request pinned text no domínio de indexação textual de materiais com contrato explícito.
 * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @param resolvedHost Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
                /**
                 * Executa lookup no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa.
                 *
                 * @param _hostname Valor de hostname usado pela função para executar lookup com dados explícitos.
                 * @param _options Opções de execução que permitem configurar a operação sem depender de estado global.
                 * @param callback Callback chamado pela API externa para concluir a operação assíncrona simulada.
                 * @returns Resultado da operação no formato esperado pelo chamador.
                 */
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
     * @param documentSafety Service que valida ficheiros antes dos parsers externos.
     */
    constructor(
        @InjectModel(MaterialIndexJob.name)
        private readonly jobModel: Model<MaterialIndexJobDocument>,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly subjectsService: SubjectsService,
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

        await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        );

        const activeKey = this.privateActiveKey(
            actor.id,
            studyAreaId,
            materialId,
        );

        const activeJob = await this.jobModel
            .findOne({
                scope: "PRIVATE_AREA",
                $or: [
                    { activeKey },
                    {
                        materialId: new Types.ObjectId(materialId),
                        studyAreaId: new Types.ObjectId(studyAreaId),
                        userId: new Types.ObjectId(actor.id),
                        activeKey: { $exists: false },
                    },
                ],
                status: { $in: ["QUEUED", "PROCESSING"] },
            })
            .sort({ createdAt: -1 })
            .lean();
        if (activeJob) {
            return this.toView(activeJob as MaterialIndexJob & { _id: unknown });
        }

        let job: MaterialIndexJobDocument;
        try {
            job = await this.jobModel.create({
                scope: "PRIVATE_AREA",
                materialId: new Types.ObjectId(materialId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(actor.id),
                status: "QUEUED",
                extractedTextChunks: [],
                attempts: 0,
                maxAttempts: 3,
                availableAt: new Date(),
                activeKey,
            });
        } catch (error) {
            if (!this.isDuplicateKey(error)) throw error;
            const concurrentJob = await this.jobModel
                .findOne({
                    activeKey,
                    status: { $in: ["QUEUED", "PROCESSING"] },
                })
                .lean();
            if (!concurrentJob) throw error;
            return this.toView(
                concurrentJob as MaterialIndexJob & { _id: unknown },
            );
        }

        // A resposta fica leve: só expõe metadados do job, nunca o conteúdo privado do material.
        return this.toView(job.toObject());
    }

    /**
     * Executa a operação index private material no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param studyAreaId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param materialId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
     * Reidrata a UI com o job mais recente do material depois de refresh.
     */
    async findLatestOwnedJobForMaterial(
        actor: AuthenticatedUser,
        studyAreaId: string,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        );
        const job = await this.jobModel
            .findOne({
                scope: "PRIVATE_AREA",
                materialId: new Types.ObjectId(materialId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(actor.id),
            })
            .sort({ createdAt: -1 })
            .lean();
        if (!job) throw this.notFound();
        return this.toView(job as MaterialIndexJob & { _id: unknown });
    }

    /** Devolve no máximo um job por material, já ordenado do mais recente. */
    async listLatestOwnedJobsForArea(
        actor: AuthenticatedUser,
        studyAreaId: string,
    ): Promise<MaterialIndexJobView[]> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const materials = await this.materialsService.listByArea(
            actor.id,
            studyAreaId,
        );
        if (materials.length === 0) return [];
        const materialIds = materials.map(
            (material) => new Types.ObjectId(material._id),
        );
        const jobs = await this.jobModel
            .find({
                scope: "PRIVATE_AREA",
                materialId: { $in: materialIds },
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(actor.id),
            })
            .sort({ createdAt: -1, _id: -1 })
            .lean();
        const latest = new Map<string, MaterialIndexJobView>();
        for (const job of jobs) {
            const view = this.toView(
                job as MaterialIndexJob & { _id: unknown },
            );
            if (!latest.has(view.materialId)) latest.set(view.materialId, view);
        }
        return [...latest.values()];
    }

    /**
     * Reclama o próximo job elegível, incluindo PROCESSING cujo lease expirou.
     */
    async claimNextPrivateJob(
        leaseOwner: string,
        now = new Date(),
        leaseMs = 30_000,
    ): Promise<ClaimedMaterialIndexJob | null> {
        await this.jobModel.updateMany(
            {
                scope: "PRIVATE_AREA",
                $expr: { $gte: ["$attempts", "$maxAttempts"] },
                $or: [
                    { status: "QUEUED" },
                    {
                        status: "PROCESSING",
                        leaseExpiresAt: { $lte: now },
                    },
                ],
            },
            {
                $set: {
                    status: "FAILED",
                    errorMessage:
                        "Não foi possível indexar o material neste momento.",
                    completedAt: now,
                },
                $unset: {
                    leaseOwner: "",
                    leaseExpiresAt: "",
                    activeKey: "",
                },
            },
        );
        const claimed = await this.jobModel
            .findOneAndUpdate(
                {
                    scope: "PRIVATE_AREA",
                    $expr: { $lt: ["$attempts", "$maxAttempts"] },
                    $or: [
                        { status: "QUEUED", availableAt: { $lte: now } },
                        {
                            status: "PROCESSING",
                            leaseExpiresAt: { $lte: now },
                        },
                    ],
                },
                {
                    $set: {
                        status: "PROCESSING",
                        leaseOwner,
                        leaseExpiresAt: new Date(now.getTime() + leaseMs),
                    },
                    $inc: { attempts: 1, leaseToken: 1 },
                    $unset: { errorMessage: "" },
                },
                { new: true, sort: { createdAt: 1 } },
            )
            .lean();
        if (!claimed) return null;
        return {
            _id: String(claimed._id),
            materialId: String(claimed.materialId),
            studyAreaId: String(claimed.studyAreaId),
            userId: String(claimed.userId),
            attempts: claimed.attempts ?? 1,
            maxAttempts: claimed.maxAttempts ?? 3,
            leaseOwner,
            leaseToken: claimed.leaseToken ?? 1,
            leaseMs,
        };
    }

    /**
     * Processa apenas um job reclamado e fecha/reagenda com compare-and-set do lease.
     */
    async processClaimedPrivateJob(
        claimed: ClaimedMaterialIndexJob,
    ): Promise<void> {
        try {
            const { material, extraction } =
                await executeWithMongoLeaseHeartbeat({
                    leaseMs: claimed.leaseMs,
                    heartbeat: () => this.renewPrivateJobLease(claimed),
                    operation: async () => {
                        const material = (await this.materialsService.findOwnedTextMaterial(
                            claimed.userId,
                            claimed.studyAreaId,
                            claimed.materialId,
                        )) as IndexablePrivateMaterial;
                        const extraction = await this.extractPrivateMaterial(
                            claimed.userId,
                            material,
                        );
                        if (extraction.text) {
                            // $set do mesmo texto é idempotente; retries depois de
                            // crash reutilizam contentText e não repetem o parser.
                            await this.materialsService.markIndexedText(
                                claimed.userId,
                                claimed.materialId,
                                extraction.text,
                            );
                        }
                        return { material, extraction };
                    },
                });
            const completedAt = new Date();
            await this.jobModel.updateOne(
                this.privateLeaseFilter(claimed, completedAt),
                {
                    $set: {
                        status: extraction.text ? "DONE" : "FAILED",
                        extractedTextChunks: this.createChunks(
                            extraction.text,
                            material.title,
                        ),
                        ...(extraction.text
                            ? {}
                            : {
                                  errorMessage:
                                      extraction.errorMessage ??
                                      "O material ainda não tem texto processável disponível.",
                              }),
                        completedAt: new Date(),
                    },
                    $unset: {
                        leaseOwner: "",
                        leaseExpiresAt: "",
                        activeKey: "",
                        ...(extraction.text ? { errorMessage: "" } : {}),
                    },
                },
            );
        } catch (error) {
            if (error instanceof MongoLeaseLostError) return;
            const exhausted = claimed.attempts >= claimed.maxAttempts;
            const transitionAt = new Date();
            await this.jobModel.updateOne(
                this.privateLeaseFilter(claimed, transitionAt),
                exhausted
                    ? {
                          $set: {
                              status: "FAILED",
                              errorMessage:
                                  "Não foi possível indexar o material neste momento.",
                              completedAt: new Date(),
                          },
                          $unset: {
                              leaseOwner: "",
                              leaseExpiresAt: "",
                              activeKey: "",
                          },
                      }
                    : {
                          $set: {
                              status: "QUEUED",
                              errorMessage:
                                  "Falha transitória; a indexação será repetida.",
                              availableAt: new Date(
                                  Date.now() +
                                      this.retryDelayMs(claimed.attempts),
                              ),
                          },
                          $unset: { leaseOwner: "", leaseExpiresAt: "" },
                      },
            );
        }
    }

    /** Renova apenas o lease ainda válido que conserva o mesmo fencing token. */
    private async renewPrivateJobLease(
        claimed: ClaimedMaterialIndexJob,
    ): Promise<boolean> {
        const now = new Date();
        const result = await this.jobModel.updateOne(
            this.privateLeaseFilter(claimed, now),
            {
                $set: {
                    leaseExpiresAt: new Date(now.getTime() + claimed.leaseMs),
                },
            },
        );
        return (result.matchedCount ?? result.modifiedCount) === 1;
    }

    /** Filtro CAS obrigatório para heartbeat e transições terminais. */
    private privateLeaseFilter(claimed: ClaimedMaterialIndexJob, now: Date) {
        return {
            _id: new Types.ObjectId(claimed._id),
            status: "PROCESSING",
            leaseOwner: claimed.leaseOwner,
            leaseToken: claimed.leaseToken,
            leaseExpiresAt: { $gt: now },
        };
    }

    /** Backoff operacional exato: 1 s, 5 s e depois 30 s. */
    private retryDelayMs(attempt: number): number {
        return [1_000, 5_000, 30_000][Math.min(Math.max(attempt - 1, 0), 2)];
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
                // O texto extraído fica no material do próprio aluno e prepara fluxos de IA baseados em fontes.
                await this.materialsService.markIndexedText(
                    actor.id,
                    materialId,
                    extraction.text,
                );
            }

            job.status = extraction.text ? "DONE" : "FAILED";
            job.extractedTextChunks = this.createChunks(
                extraction.text,
                material.title,
            );
            job.errorMessage = extraction.text
                ? undefined
                : extraction.errorMessage ??
                  "O material ainda não tem texto processável disponível.";
        } catch (error) {
            // A UI faz polling; qualquer falha técnica posterior precisa de estado terminal.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param view Valor de view usado pela função para executar assert owned job com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param view Valor de view usado pela função para executar assert readable job com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param view Valor de view usado pela função para executar assert done com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertDone(view: MaterialIndexJobView): void {
        if (view.status !== "DONE") {
            throw new UnprocessableEntityException({
                code: "MATERIAL_INDEX_NOT_DONE",
                message: "O material ainda não tem indexação concluída.",
            });
        }
    }

    /**
     * Cria indexação textual de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param userId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param material Valor de material usado pela função para executar extract private material com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async extractPrivateMaterial(
        userId: string,
        material: IndexablePrivateMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            // Um retry depois de `markIndexedText` mas antes do fecho do job não
            // volta a abrir o ficheiro, executar parser ou contactar um URL.
            if (material.status === "READY" && material.contentText) {
                return this.toReadableExtraction(material.contentText);
            }
            if (material.type === "TOPIC") {
                return this.toReadableExtraction(material.contentText);
            }
            if (material.type === "URL") {
                return this.toReadableExtraction(
                    await this.fetchTextFromUrl(material.url),
                );
            }
            if (!material.storageKey) {
                return { errorMessage: "O ficheiro do material não está disponível." };
            }
            const buffer = await this.materialsService.readStoredFile(
                material.storageKey,
            );
            this.documentSafety.assertSafeStoredDocument({
                type: material.type,
                mimeType: material.mimeType,
                byteLength: buffer.byteLength,
                declaredSizeBytes: material.sizeBytes,
                title: material.title,
            });
            if (material.type === "PDF") {
                return this.toReadableExtraction(
                    await this.documentSafety.parseDocument({
                        type: "PDF",
                        buffer,
                        label: material.title,
                    }),
                );
            }
            if (material.type === "DOCX") {
                return this.toReadableExtraction(
                    await this.documentSafety.parseDocument({
                        type: "DOCX",
                        buffer,
                        label: material.title,
                    }),
                );
            }
            return { errorMessage: "Tipo de material privado não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    /**
     * Executa a operação extract official material no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param material Valor de material usado pela função para executar extract official material com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async extractOfficialMaterial(
        material: IndexableOfficialMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            if (material.type === "TEXT") {
                return this.toReadableExtraction(material.textContent);
            }
            if (material.type === "URL") {
                return this.toReadableExtraction(
                    await this.fetchTextFromUrl(material.sourceUrl),
                );
            }
            return { errorMessage: "Tipo de material oficial não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    /**
     * Converte texto bruto em texto processável ou falha controlada para o job.
     *
     * @param value Texto bruto extraído de TOPIC, URL, PDF, DOCX ou material oficial.
     * @returns Texto normalizado quando existe conteúdo legível.
     */
    private toReadableExtraction(
        value: string | undefined,
    ): { text?: string; errorMessage?: string } {
        const normalized = normalizePortugueseStudyText(value ?? "");
        if (!normalized.hasReadableContent) {
            // O job falha sem gravar excertos privados em logs ou na mensagem pública.
            return { errorMessage: "O material não tem texto legível para estudar." };
        }

        return { text: normalized.text };
    }

    /**
     * Executa a operação fetch text from url no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async fetchTextFromUrl(value: string | undefined): Promise<string> {
        let url = this.parseSafeHttpUrl(value);
        let response: PinnedTextResponse | undefined;
        for (let redirectCount = 0; redirectCount <= MAX_URL_REDIRECTS; redirectCount += 1) {
            // Cada redirect é revalidado para impedir que uma URL pública salte para rede privada.
            const resolvedHost = await this.resolvePublicHost(url);
            response = await retryWithRecovery(
                async () => {
                    const candidate = await materialIndexUrlSafety.requestText(
                        url,
                        resolvedHost,
                    );
                    if ([502, 503, 504].includes(candidate.status)) {
                        throw new Error(`TRANSIENT_HTTP_${candidate.status}`);
                    }
                    return candidate;
                },
                {
                    attempts: 3,
                    baseDelayMs: 200,
                    maxDelayMs: 1_000,
                    /**
                     * Avalia should retry no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa.
                     *
                     * @param error Erro capturado para ser convertido numa mensagem segura e compreensível.
                     * @returns Valor booleano que indica se a regra avaliada é verdadeira.
                     */
                    shouldRetry: (error) => this.isRecoverableUrlReadError(error),
                },
            );
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
     * Decide se uma leitura externa falhou por motivo temporário e recuperável.
     *
     * @param error Erro capturado pela camada de leitura URL.
     * @returns `true` apenas para falhas transitórias conhecidas.
     */
    private isRecoverableUrlReadError(error: unknown): boolean {
        return isTransientNetworkError(error);
    }

    /**
     * Executa a operação is redirect no domínio de indexação textual de materiais com contrato explícito.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param status Estado funcional usado para decidir o próximo passo ou a resposta pública.
     * @returns Valor booleano que indica se a regra avaliada é verdadeira.
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
        if (url.username || url.password) {
            throw new Error("URL não pode conter credenciais.");
        }
        const permittedPort = url.protocol === "http:" ? "80" : "443";
        if (url.port && url.port !== permittedPort) {
            throw new Error("URL só pode usar as portas 80 ou 443.");
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    private async resolvePublicHost(value: string): Promise<PublicResolvedHost> {
        const { hostname } = new URL(value);
        const host = hostname.toLowerCase();
        if (this.isPrivateIp(host)) {
            throw new Error("URL local ou privada não pode ser indexada.");
        }
        const ipLiteral = this.normaliseIpLiteral(host);
        if (ipaddr.isValid(ipLiteral)) {
            const address = ipaddr.parse(ipLiteral);
            return {
                hostname: host,
                address: ipLiteral,
                family: address.kind() === "ipv6" ? 6 : 4,
            };
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param host Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF.
     * @returns Valor booleano que indica se a regra avaliada é verdadeira.
     */
    private isPrivateIp(host: string): boolean {
        const candidate = this.normaliseIpLiteral(host);
        if (!ipaddr.isValid(candidate)) return false;
        let address = ipaddr.parse(candidate);
        if (address instanceof ipaddr.IPv6 && address.isIPv4MappedAddress()) {
            address = address.toIPv4Address();
        }
        // `unicast` é a única classe adequada a uma origem pública. Isto também
        // rejeita loopback, private, link-local, CGNAT, multicast, unspecified,
        // reserved e mecanismos de transição IPv6.
        return address.range() !== "unicast";
    }

    /**
     * Remove brackets de literais IPv6 devolvidos por `URL.hostname` antes de
     * os entregar ao parser canónico.
     *
     * @param host Host ou endereço recebido do URL/socket.
     * @returns Candidato normalizado para `ipaddr.js`.
     */
    private normaliseIpLiteral(host: string): string {
        if (host.startsWith("[") && host.endsWith("]")) {
            return host.slice(1, -1);
        }
        return host;
    }

    /**
     * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de indexação textual de materiais.
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
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
     * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
     *
     * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @param sourceLabel Valor de sourceLabel usado pela função para executar create chunks com dados explícitos.
     * @returns Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
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
        attempts?: number;
        maxAttempts?: number;
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
            attempts: job.attempts,
            maxAttempts: job.maxAttempts,
            createdAt: job.createdAt,
        };
    }

    /** Chave idempotente libertada apenas quando o job fica terminal. */
    private privateActiveKey(
        userId: string,
        studyAreaId: string,
        materialId: string,
    ): string {
        return `private:${userId}:${studyAreaId}:${materialId}`;
    }

    private isDuplicateKey(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === 11000
        );
    }
}
