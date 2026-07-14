/**
 * Implementa as regras de negócio de material versions e concentra validações do domínio.
 */
import { ForbiddenException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import type { ClientSession, Connection, Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexService,
    type WritableMaterialIndexJob,
} from "../material-index/material-index.service.js";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
} from "../official-materials/schemas/official-material.schema.js";
import { CreateMaterialVersionDto } from "./dto/material-version.dto.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import {
    MaterialVersion,
    MaterialVersionChunk,
    MaterialVersionDocument,
    MaterialVersionScope,
} from "./schemas/material-version.schema.js";

/**
 * Vista pública de versões de materiais, sem detalhes internos de Mongoose.
 */
export type MaterialVersionView = {
    _id: string;
    scope: MaterialVersionScope;
    materialId: string;
    jobId: string;
    versionNumber: number;
    title: string;
    textSnapshot: string;
    chunksSnapshot: MaterialVersionChunk[];
    changeSummary?: string;
    active: boolean;
    createdAt?: Date;
};

/**
 * Serviço de versões rastreáveis criadas a partir de jobs concluídos.
 */
@Injectable()
export class MaterialVersionsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param versionModel Modelo Mongoose injetado para ler e persistir versões de materiais.
     * @param indexService Service injetado para reutilizar regras de index sem duplicar validações.
     * @param connection Ligação Mongoose usada nas mudanças atómicas de versão ativa.
     */
    constructor(
        @InjectModel(MaterialVersion.name)
        private readonly versionModel: Model<MaterialVersionDocument>,
        @InjectModel(OfficialMaterial.name)
        private readonly officialMaterialModel: Model<OfficialMaterialDocument>,
        private readonly indexService: MaterialIndexService,
        @InjectConnection() private readonly connection: Connection,
        @Optional()
        private readonly notificationsService?: ContextNotificationsService,
    ) {}

    /**
     * Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param jobId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async createFromJob(
        actor: AuthenticatedUser,
        jobId: string,
        input: CreateMaterialVersionDto = {},
    ): Promise<MaterialVersionView> {
        const context = await this.indexService.findWritableDoneJob(actor, jobId);
        return this.createWithDuplicateRetry(actor, context, input);
    }

    /**
     * Lista versões de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Coleção de versões de materiais visível para o contexto autorizado.
     */
    async listForJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialVersionView[]> {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const versions = await this.versionModel
            .find({
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            })
            .sort({ versionNumber: -1 })
            .lean();
        return versions.map((version) => this.toView(version));
    }

    /**
     * Executa a operação restore version no domínio de versões de materiais com contrato explícito.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param jobId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param versionId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async restoreVersion(
        actor: AuthenticatedUser,
        jobId: string,
        versionId: string,
    ): Promise<MaterialVersionView> {
        const context = await this.indexService.findWritableDoneJob(actor, jobId);
        const { job } = context;
        if (!Types.ObjectId.isValid(versionId)) throw this.notFound();
        return this.connection.transaction(async (session) => {
            await this.indexService.reserveWritableJob(actor, context, session);
            const identity = {
                _id: versionId,
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            };
            const version = await this.versionModel.findOne(
                identity,
                null,
                { session },
            );
            if (!version) throw this.notFound();

            await this.versionModel.updateMany(
                {
                    materialId: new Types.ObjectId(job.materialId),
                    scope: job.scope,
                },
                { $set: { active: false } },
                { session },
            );
            const restored = await this.versionModel.findOneAndUpdate(
                identity,
                { $set: { active: true } },
                { new: true, runValidators: true, session },
            );
            if (!restored) throw this.notFound();
            if (job.scope === "OFFICIAL_SUBJECT") {
                const projection = await this.officialMaterialModel.updateOne(
                    {
                        _id: new Types.ObjectId(job.materialId),
                        ...(job.teacherId
                            ? { teacherId: new Types.ObjectId(job.teacherId) }
                            : {}),
                    },
                    {
                        $set: {
                            textContent: restored.textSnapshot ?? "",
                            status: "PROCESSED",
                            activeVersionId: restored._id,
                            activeVersionUpdatedAt: new Date(),
                            activeVersionChangeSummary: restored.changeSummary,
                        },
                        $inc: { contentRevision: 1 },
                    },
                    { session },
                );
                if (projection.matchedCount !== 1) throw this.notFound();
                if (context.subject) {
                    await this.notificationsService?.enqueueClassEvent(actor, {
                        classId: context.subject.classId,
                        idempotencyKey: `official-material-version:${String(restored._id)}:restored`,
                        type: "OFFICIAL_MATERIAL_UPDATED",
                        title: "Material oficial atualizado",
                        body: restored.changeSummary?.trim() || "O professor atualizou um material da disciplina.",
                        targetPath: `/app/disciplinas/${context.subject._id}/materiais/${job.materialId}`,
                        preferenceContext: NotificationContext.LEARNING_CONTENT,
                    }, session);
                }
            }
            return this.toView(restored.toObject());
        });
    }

    /**
     * Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param _studyAreaId Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.
     * @param _materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    async createPrivateVersion(
        actor: AuthenticatedUser,
        _studyAreaId: string,
        _materialId: string,
    ): Promise<never> {
        if (actor.role !== "STUDENT") throw this.roleError("STUDENT");
        throw new ForbiddenException({
            code: "MATERIAL_VERSION_REQUIRES_INDEX_JOB",
            message: "Cria versões a partir de um job de indexação concluído.",
        });
    }

    /**
     * Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param _materialId Identificador do material; confirma ownership ou pertença à disciplina antes da operação.
     * @returns Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    async createOfficialVersion(
        actor: AuthenticatedUser,
        _materialId: string,
    ): Promise<never> {
        if (actor.role !== "TEACHER") throw this.roleError("TEACHER");
        throw new ForbiddenException({
            code: "MATERIAL_VERSION_REQUIRES_INDEX_JOB",
            message: "Cria versões a partir de um job de indexação concluído.",
        });
    }

    /**
     * Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param job Valor de job usado pela função para executar create version from job com dados explícitos.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    private async createVersionFromJob(
        actor: AuthenticatedUser,
        context: WritableMaterialIndexJob,
        input: CreateMaterialVersionDto,
        session: ClientSession,
    ): Promise<MaterialVersionView> {
        await this.indexService.reserveWritableJob(actor, context, session);
        const { job } = context;
        const last = await this.versionModel
            .findOne({
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            }, null, { session })
            .sort({ versionNumber: -1 })
            .lean();
        await this.versionModel.updateMany(
            {
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            },
            { $set: { active: false } },
            { session },
        );
        const title =
            input.title?.trim() ||
            job.extractedTextChunks[0]?.sourceLabel ||
            `Versão ${Number(last?.versionNumber ?? 0) + 1}`;
        const [version] = await this.versionModel.create(
            [
                {
                    scope: job.scope,
                    materialId: new Types.ObjectId(job.materialId),
                    jobId: new Types.ObjectId(job._id),
                    studyAreaId: job.studyAreaId
                        ? new Types.ObjectId(job.studyAreaId)
                        : undefined,
                    subjectId: job.subjectId
                        ? new Types.ObjectId(job.subjectId)
                        : undefined,
                    userId: job.userId ? new Types.ObjectId(job.userId) : undefined,
                    teacherId: job.teacherId
                        ? new Types.ObjectId(job.teacherId)
                        : undefined,
                    versionNumber: Number(last?.versionNumber ?? 0) + 1,
                    title,
                    textSnapshot: job.extractedTextChunks
                        .map((chunk) => chunk.text)
                        .join("\n\n")
                        .slice(0, 20000),
                    chunksSnapshot: job.extractedTextChunks,
                    changeSummary: input.changeSummary?.trim(),
                    active: true,
                },
            ],
            { session },
        );
        if (job.scope === "OFFICIAL_SUBJECT") {
            const projection = await this.officialMaterialModel.updateOne(
                {
                    _id: new Types.ObjectId(job.materialId),
                    ...(job.teacherId
                        ? { teacherId: new Types.ObjectId(job.teacherId) }
                        : {}),
                },
                {
                    $set: {
                        textContent: version.textSnapshot ?? "",
                        status: "PROCESSED",
                        activeVersionId: version._id,
                        activeVersionUpdatedAt: new Date(),
                        activeVersionChangeSummary: version.changeSummary,
                    },
                    $inc: { contentRevision: 1 },
                },
                { session },
            );
            if (projection.matchedCount !== 1) throw this.notFound();
            if (context.subject) {
                await this.notificationsService?.enqueueClassEvent(actor, {
                    classId: context.subject.classId,
                    idempotencyKey: `official-material-version:${String(version._id)}:created`,
                    type: "OFFICIAL_MATERIAL_UPDATED",
                    title: "Material oficial atualizado",
                    body: version.changeSummary?.trim() || "O professor atualizou um material da disciplina.",
                    targetPath: `/app/disciplinas/${context.subject._id}/materiais/${job.materialId}`,
                    preferenceContext: NotificationContext.LEARNING_CONTENT,
                }, session);
            }
        }
        return this.toView(version.toObject());
    }

    /**
     * Repete uma vez a criação quando duas transações escolheram o mesmo número
     * antes de o índice único decidir qual delas confirma primeiro.
     *
     * @param job Job concluído que fornece o snapshot rastreável.
     * @param input Metadados opcionais da nova versão.
     * @returns Versão criada com número e estado ativo consistentes.
     */
    private async createWithDuplicateRetry(
        actor: AuthenticatedUser,
        context: WritableMaterialIndexJob,
        input: CreateMaterialVersionDto,
    ): Promise<MaterialVersionView> {
        try {
            return await this.connection.transaction((session) =>
                this.createVersionFromJob(actor, context, input, session),
            );
        } catch (error) {
            if (!this.isDuplicateKeyError(error)) throw error;
            return this.connection.transaction((session) =>
                this.createVersionFromJob(actor, context, input, session),
            );
        }
    }

    /**
     * Deteta a colisão protegida pelos índices únicos sem acoplar o serviço a
     * uma classe concreta do driver MongoDB.
     *
     * @param error Erro devolvido pela operação transacional.
     * @returns `true` para o código MongoDB de chave duplicada.
     */
    private isDuplicateKeyError(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === 11000
        );
    }

    /**
     * Constrói uma exceção de versões de materiais com código previsível para API, UI e testes.
     *
     * @param role Papel funcional que define permissões e comportamento autorizado dentro da aplicação.
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private roleError(role: "STUDENT" | "TEACHER"): ForbiddenException {
        return new ForbiddenException({
            code: `${role}_ROLE_REQUIRED`,
            message:
                role === "STUDENT"
                    ? "Esta funcionalidade é exclusiva de alunos."
                    : "Esta funcionalidade é exclusiva de professores.",
        });
    }

    /**
     * Constrói uma exceção de versões de materiais com código previsível para API, UI e testes.
     * @returns Exceção padronizada com código estável para controllers e testes.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_VERSION_NOT_FOUND",
            message: "Versão de material não encontrada.",
        });
    }

    /**
     * Mapeia o documento interno de versões de materiais para uma forma pública estável e simples de consumir.
     *
     * @param version Valor de version usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(version: {
        _id: unknown;
        scope: MaterialVersionScope;
        materialId: unknown;
        jobId: unknown;
        versionNumber: number;
        title: string;
        textSnapshot?: string;
        chunksSnapshot?: MaterialVersionChunk[];
        changeSummary?: string;
        active?: boolean;
        createdAt?: Date;
    }): MaterialVersionView {
        return {
            _id: String(version._id),
            scope: version.scope,
            materialId: String(version.materialId),
            jobId: String(version.jobId),
            versionNumber: version.versionNumber,
            title: version.title,
            textSnapshot: version.textSnapshot ?? "",
            chunksSnapshot: version.chunksSnapshot ?? [],
            changeSummary: version.changeSummary,
            active: version.active ?? false,
            createdAt: version.createdAt,
        };
    }
}
