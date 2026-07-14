/**
 * Implementa as regras de negócio de materials e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { normalizePortugueseStudyText } from "../../common/text/pt-text-normalization.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { HistoryService } from "../study/history.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { PrivateMaterialDetailDto, PublicMaterialDto } from "./dto/public-material.dto.js";
import { UpdateMarkdownMaterialDto } from "./dto/update-markdown-material.dto.js";
import { Material, MaterialDocument } from "./schemas/material.schema.js";
import { MaterialStorageService } from "./material-storage.service.js";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "./validators/material-upload.validator.js";
import {
    MARKDOWN_MIME_TYPE,
    validateMarkdownSource,
    validateMarkdownUpload,
} from "../../common/validators/markdown-material.validator.js";

/**
 * Material privado validado para referência noutros domínios.
 */
export type OwnedMaterialReference = {
    _id: unknown;
    title: string;
    status: string;
    type: string;
    contentText?: string;
    contentRevision: number;
};

/** Fonte textual privada já autorizada e pronta para consumidores de IA. */
export type ReadyMaterialTextSource = {
    _id: unknown;
    title: string;
    type: string;
    status: string;
    contentText: string;
};

/**
 * Serviço de materiais por área de estudo.
 */
@Injectable()
export class MaterialsService {
    private readonly logger = new Logger(MaterialsService.name);

    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param studyAreasService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param storage Valor de storage usado pela função para executar constructor com dados explícitos.
     * @param historyService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly storage: MaterialStorageService,
        private readonly historyService: HistoryService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Lista materiais de uma área pertencente ao aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Materiais da área.
     */
    async listByArea(
        userId: string,
        studyAreaId: string,
    ): Promise<PublicMaterialDto[]> {
        await this.assertOwnArea(userId, studyAreaId);
        const materials = await this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .select("_id title type status url originalName sizeBytes contentRevision createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        return materials.map((material) => this.toPublicMaterial(material));
    }

    /**
     * Conta materiais do aluno para painéis agregados.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Número de materiais submetidos pelo aluno.
     */
    async countMine(userId: string): Promise<number> {
        return this.materialModel.countDocuments({
            userId: new Types.ObjectId(userId),
        });
    }

    /**
     * Lista materiais prontos e processáveis para IA.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Materiais `READY` com `contentText`.
     */
    async listReadyTextSources(
        userId: string,
        studyAreaId: string,
    ): Promise<ReadyMaterialTextSource[]> {
        await this.assertOwnArea(userId, studyAreaId);
        const materials = await this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                $or: [
                    { contentText: { $exists: true, $ne: "" } },
                    { type: "MARKDOWN", markdownSource: { $exists: true, $ne: "" } },
                ],
            })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) => ({
            ...material,
            contentText:
                material.type === "MARKDOWN"
                    ? material.markdownSource
                    : material.contentText,
        })) as ReadyMaterialTextSource[];
    }

    /**
     * Obtém um material textual do aluno dentro de uma área sua.
     *
     * @param userId Aluno autenticado.
     * @param studyAreaId Área de estudo.
     * @param materialId Material a validar.
     * @returns Material interno com texto quando existir.
     */
    async findOwnedTextMaterial(
        userId: string,
        studyAreaId: string,
        materialId: string,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        if (!Types.ObjectId.isValid(materialId)) {
            throw new BadRequestException({
                code: "INVALID_MATERIAL_ID",
                message: "Material inválido.",
            });
        }
        const material = await this.materialModel
            .findOne({
                _id: materialId,
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .lean();
        if (!material) {
            throw new NotFoundException({
                code: "MATERIAL_NOT_FOUND",
                message: "Material não encontrado.",
            });
        }
        return material;
    }

    /**
     * Obtém um material privado do aluno para fluxos que precisam apenas de referência controlada.
     *
     * @param userId Identificador do aluno autenticado.
     * @param materialId Material privado a validar.
     * @returns Contrato público mínimo para outros domínios, sem expor detalhes Mongoose.
     */
    async findOwnedMaterialReference(
        userId: string,
        materialId: string,
    ): Promise<OwnedMaterialReference> {
        if (!Types.ObjectId.isValid(materialId)) {
            throw new NotFoundException({
                code: "MATERIAL_NOT_FOUND",
                message: "Material não encontrado.",
            });
        }

        const material = await this.materialModel
            .findOne({
                _id: materialId,
                userId: new Types.ObjectId(userId),
            })
            .select("_id title type status contentText markdownSource contentRevision")
            .lean();

        // Outros domínios recebem apenas uma referência já filtrada por ownership.
        if (!material) {
            throw new NotFoundException({
                code: "MATERIAL_NOT_FOUND",
                message: "Material não encontrado.",
            });
        }

        return {
            _id: material._id,
            title: material.title,
            status: material.status,
            type: material.type,
            contentText:
                material.type === "MARKDOWN"
                    ? material.markdownSource
                    : material.contentText,
            contentRevision: material.contentRevision ?? 0,
        };
    }

    /**
     * Lê o ficheiro binário associado a um material já validado.
     *
     * @param storageKey Chave guardada no material.
     * @returns Conteúdo binário do ficheiro.
     */
    async readStoredFile(storageKey: string): Promise<Buffer> {
        return this.storage.read(storageKey);
    }

    /**
     * Marca um material como processado depois de indexação textual.
     *
     * @param userId Aluno autenticado.
     * @param materialId Material privado.
     * @param contentText Texto extraído.
     * @returns Nada.
     */
    async markIndexedText(
        userId: string,
        materialId: string,
        contentText: string,
    ): Promise<void> {
        const normalized = this.normalizeMaterialText(contentText);

        await this.materialModel.updateOne(
            {
                _id: new Types.ObjectId(materialId),
                userId: new Types.ObjectId(userId),
            },
            {
                $set: {
                    status: "READY",
                    // Guardamos apenas texto normalizado e limitado para reduzir exposição de material privado.
                    contentText: normalized.slice(0, 10000),
                },
            },
        );
    }

    /**
     * Submete um PDF ou DOCX.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param file Ficheiro multipart.
     * @param title Título opcional definido pelo aluno.
     * @returns Material criado em estado pendente.
     */
    async submitFile(
        userId: string,
        studyAreaId: string,
        file: Express.Multer.File,
        title?: string,
    ): Promise<PublicMaterialDto> {
        await this.assertOwnArea(userId, studyAreaId);
        const validated = validateMaterialUpload(file);
        const { originalName } = validated;
        const safeFile = { ...file, originalname: originalName };
        const safeTitle = title?.trim() || originalName;
        if (!safeTitle || safeTitle.length > 160) {
            throw new BadRequestException({
                code: "MATERIAL_TITLE_INVALID",
                message: "O título do material deve ter entre 1 e 160 caracteres.",
            });
        }

        if (validated.type === "MARKDOWN") {
            const markdown = await validateMarkdownUpload(file);
            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "MARKDOWN",
                title: safeTitle,
                status: "READY",
                markdownSource: markdown.markdownSource,
                contentRevision: 1,
                originalName,
                mimeType: MARKDOWN_MIME_TYPE,
                sizeBytes: markdown.sizeBytes,
            });
            await this.recordPrivateMarkdownCreated(
                userId,
                studyAreaId,
                material,
                "PRIVATE_MARKDOWN_FILE_SUBMITTED",
            );
            return this.toPublicMaterial(material.toObject());
        }

        const staged = await this.storage.stage(userId, safeFile);
        await this.storage.prepareCommit(staged);
        let material: MaterialDocument;
        try {
            material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: materialTypeFromMime(file.mimetype),
                title: safeTitle,
                status: "PENDING_PROCESSING",
                storageKey: staged.storageKey,
                storageSha256: staged.sha256,
                originalName,
                mimeType: file.mimetype,
                sizeBytes: staged.sizeBytes,
            });
        } catch (error) {
            await this.storage.abort(staged);
            throw error;
        }

        try {
            await this.storage.commit(staged);
        } catch {
            await this.materialModel.deleteOne({ _id: material._id });
            await this.storage.abort(staged);
            throw new ServiceUnavailableException({
                code: "MATERIAL_STORAGE_COMMIT_FAILED",
                message: "Não foi possível concluir o upload do material.",
            });
        }

        const secondaryEvents = await Promise.allSettled([
            this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "Material submetido",
                material.title,
            ),
            this.auditLogService.record({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MATERIAL_FILE_SUBMITTED",
                resourceType: "Material",
                resourceId: String(material._id),
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: material.type,
                    status: material.status,
                    sizeBytes: file.size,
                },
            }),
        ]);
        if (secondaryEvents.some((result) => result.status === "rejected")) {
            // O upload e o documento já estão comprometidos. Devolver erro aqui
            // levaria o cliente a repetir e duplicar o material; o aviso não
            // inclui IDs, nomes ou detalhes da exceção.
            this.logger.warn(
                "Upload concluído com falha num evento secundário de history/audit.",
            );
        }

        return this.toPublicMaterial(material.toObject());
    }

    /**
     * Submete URL ou tópico textual.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param input Dados JSON do material.
     * @returns Material criado.
     */
    async submitTextMaterial(
        userId: string,
        studyAreaId: string,
        input: CreateMaterialDto,
    ): Promise<PublicMaterialDto> {
        await this.assertOwnArea(userId, studyAreaId);
        const title = input.title?.trim();
        if (!title) {
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });
        }

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "URL",
                title,
                url,
                status: "PENDING_PROCESSING",
            });
            await this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "URL submetido",
                title,
            );
            await this.auditLogService.record({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MATERIAL_URL_SUBMITTED",
                resourceType: "Material",
                resourceId: String(material._id),
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: material.type,
                    status: material.status,
                },
            });
            return this.toPublicMaterial(material.toObject());
        }

        if (input.type === "TOPIC") {
            const contentText = this.normalizeMaterialText(input.topicText ?? "");
            if (contentText.length < 10) {
                throw new BadRequestException({
                    code: "TOPIC_TEXT_REQUIRED",
                    message: "Escreve pelo menos 10 caracteres legíveis em português.",
                });
            }

            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "TOPIC",
                title,
                contentText,
                status: "READY",
            });
            await this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "Tópico submetido",
                title,
            );
            await this.auditLogService.record({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MATERIAL_TOPIC_SUBMITTED",
                resourceType: "Material",
                resourceId: String(material._id),
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: material.type,
                    status: material.status,
                },
            });
            return this.toPublicMaterial(material.toObject());
        }

        if (input.type === "MARKDOWN") {
            const markdown = await validateMarkdownSource(input.markdownSource);
            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "MARKDOWN",
                title,
                status: "READY",
                markdownSource: markdown.markdownSource,
                contentRevision: 1,
                mimeType: MARKDOWN_MIME_TYPE,
                sizeBytes: markdown.sizeBytes,
            });
            await this.recordPrivateMarkdownCreated(
                userId,
                studyAreaId,
                material,
                "PRIVATE_MARKDOWN_CREATED",
            );
            return this.toPublicMaterial(material.toObject());
        }

        throw new BadRequestException({
            code: "INVALID_MATERIAL_TYPE",
            message: "Tipo de material inválido.",
        });
    }

    /** Obtém o detalhe de um material privado sem expor campos de storage. */
    async getPrivateMaterial(
        userId: string,
        studyAreaId: string,
        materialId: string,
    ): Promise<PrivateMaterialDetailDto> {
        const material = await this.findOwnedMaterialDocument(
            userId,
            studyAreaId,
            materialId,
        );
        return {
            ...this.toPublicMaterial(material),
            ...(material.type === "MARKDOWN"
                ? { markdownSource: material.markdownSource }
                : {}),
        };
    }

    /** Guarda Markdown privado com comparação de revisão para evitar lost updates. */
    async updatePrivateMarkdown(
        userId: string,
        studyAreaId: string,
        materialId: string,
        input: UpdateMarkdownMaterialDto,
    ): Promise<PrivateMaterialDetailDto> {
        await this.assertOwnArea(userId, studyAreaId);
        if (!Types.ObjectId.isValid(materialId)) throw this.materialNotFound();
        const markdown = await validateMarkdownSource(input.markdownSource);
        const title = input.title?.trim();
        if (input.title !== undefined && (!title || title.length > 160)) {
            throw new BadRequestException({
                code: "MATERIAL_TITLE_INVALID",
                message: "O título do material deve ter entre 1 e 160 caracteres.",
            });
        }

        const updated = await this.materialModel
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(materialId),
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                    type: "MARKDOWN",
                    contentRevision: input.expectedRevision,
                },
                {
                    $set: {
                        ...(title ? { title } : {}),
                        markdownSource: markdown.markdownSource,
                        mimeType: MARKDOWN_MIME_TYPE,
                        sizeBytes: markdown.sizeBytes,
                        status: "READY",
                    },
                    $inc: { contentRevision: 1 },
                },
                { new: true },
            )
            .lean();

        if (!updated) {
            const current = await this.materialModel
                .findOne({
                    _id: new Types.ObjectId(materialId),
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                })
                .select("type contentRevision")
                .lean();
            if (!current) throw this.materialNotFound();
            if (current.type !== "MARKDOWN") {
                throw new BadRequestException({
                    code: "MATERIAL_NOT_EDITABLE",
                    message: "Este material não é um documento Markdown editável.",
                });
            }
            throw new ConflictException({
                code: "MATERIAL_REVISION_CONFLICT",
                message: "O documento foi alterado noutro separador. Recarrega a versão atual.",
                currentRevision: current.contentRevision ?? 0,
            });
        }

        await this.auditLogService
            .record({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MARKDOWN_UPDATED",
                resourceType: "Material",
                resourceId: materialId,
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: "MARKDOWN",
                    revision: updated.contentRevision,
                    sizeBytes: updated.sizeBytes,
                },
            })
            .catch(() => this.logger.warn("Markdown privado atualizado com falha controlada no audit."));

        return {
            ...this.toPublicMaterial(updated),
            markdownSource: updated.markdownSource,
        };
    }

    /** Lê Markdown privado autorizado e regista apenas metadados do download. */
    async readPrivateMarkdown(
        userId: string,
        studyAreaId: string,
        materialId: string,
    ): Promise<{ originalName: string; mimeType: string; buffer: Buffer }> {
        const material = await this.findOwnedMaterialDocument(
            userId,
            studyAreaId,
            materialId,
        );
        if (material.type !== "MARKDOWN" || !material.markdownSource) {
            throw this.materialNotFound();
        }
        const buffer = Buffer.from(material.markdownSource, "utf8");
        await this.auditLogService
            .record({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MARKDOWN_DOWNLOADED",
                resourceType: "Material",
                resourceId: materialId,
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: "MARKDOWN",
                    revision: material.contentRevision ?? 0,
                    sizeBytes: buffer.byteLength,
                },
            })
            .catch(() => this.logger.warn("Download Markdown concluído com falha controlada no audit."));
        return {
            originalName: material.originalName ?? this.markdownFileName(material.title),
            mimeType: `${MARKDOWN_MIME_TYPE}; charset=utf-8`,
            buffer,
        };
    }

    /** Carrega um documento privado após validar área, ownership e identificador. */
    private async findOwnedMaterialDocument(
        userId: string,
        studyAreaId: string,
        materialId: string,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        if (!Types.ObjectId.isValid(materialId)) throw this.materialNotFound();
        const material = await this.materialModel
            .findOne({
                _id: new Types.ObjectId(materialId),
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .lean();
        if (!material) throw this.materialNotFound();
        return material;
    }

    /** Regista a criação sem refletir a fonte Markdown em history ou audit. */
    private async recordPrivateMarkdownCreated(
        userId: string,
        studyAreaId: string,
        material: MaterialDocument,
        action: string,
    ): Promise<void> {
        const results = await Promise.allSettled([
            this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "Markdown submetido",
                material.title,
            ),
            this.auditLogService.record({
                actorId: userId,
                domain: "MATERIALS",
                action,
                resourceType: "Material",
                resourceId: String(material._id),
                result: "SUCCESS",
                metadata: {
                    studyAreaId,
                    type: "MARKDOWN",
                    status: "READY",
                    revision: material.contentRevision,
                    sizeBytes: material.sizeBytes,
                },
            }),
        ]);
        if (results.some((result) => result.status === "rejected")) {
            this.logger.warn("Markdown privado criado com falha controlada num evento secundário.");
        }
    }

    /** Gera um filename previsível sem depender do título como path. */
    private markdownFileName(title: string): string {
        const slug = title
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/gu, "-")
            .replace(/^-+|-+$/gu, "")
            .slice(0, 100);
        return `${slug || "material"}.md`;
    }

    /** Produz a mesma resposta opaca para IDs inválidos e materiais alheios. */
    private materialNotFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_NOT_FOUND",
            message: "Material não encontrado.",
        });
    }

    /**
     * Normaliza texto privado antes de o guardar como fonte processável.
     *
     * @param value Texto bruto recebido de formulário ou indexação.
     * @returns Texto normalizado e legível.
     */
    private normalizeMaterialText(value: string): string {
        const normalized = normalizePortugueseStudyText(value);
        if (!normalized.hasReadableContent) {
            // A mensagem é pública e não inclui excertos do material privado.
            throw new BadRequestException({
                code: "MATERIAL_TEXT_NOT_READABLE",
                message: "O material não tem texto legível para estudar.",
            });
        }

        return normalized.text;
    }

    /**
     * Garante que a área pertence ao aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Nada quando a área é válida.
     */
    private async assertOwnArea(
        userId: string,
        studyAreaId: string,
    ): Promise<void> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area) {
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        }
    }

    /**
     * Valida URLs aceitando apenas HTTP e HTTPS.
     *
     * @param value Valor recebido do DTO.
     * @returns URL normalizado.
     */
    private parseSafeUrl(value: string | undefined): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("invalid protocol");
            }
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }

    /**
     * Converte material interno no contrato público do BK-MF0-08.
     *
     * @param material Documento ou objeto lean vindo do Mongo.
     * @returns Material sem campos internos/sensíveis.
     */
    private toPublicMaterial(material: {
        _id: unknown;
        title: string;
        type: PublicMaterialDto["type"];
        status: PublicMaterialDto["status"];
        url?: string;
        originalName?: string;
        sizeBytes?: number;
        contentRevision?: number;
        createdAt?: Date;
        updatedAt?: Date;
    }): PublicMaterialDto {
        return {
            _id: String(material._id),
            title: material.title,
            type: material.type,
            status: material.status,
            ...(material.url ? { url: material.url } : {}),
            ...(material.originalName ? { originalName: material.originalName } : {}),
            ...(material.sizeBytes !== undefined
                ? { sizeBytes: material.sizeBytes }
                : {}),
            contentRevision: material.contentRevision ?? 0,
            ...(material.createdAt ? { createdAt: material.createdAt } : {}),
            ...(material.updatedAt ? { updatedAt: material.updatedAt } : {}),
        };
    }
}
