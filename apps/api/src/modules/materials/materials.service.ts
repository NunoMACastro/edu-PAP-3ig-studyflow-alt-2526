/**
 * Implementa as regras de negócio de materials e concentra validações do domínio.
 */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { HistoryService } from "../study/history.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { PublicMaterialDto } from "./dto/public-material.dto.js";
import { Material, MaterialDocument } from "./schemas/material.schema.js";
import { MaterialStorageService } from "./material-storage.service.js";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "./validators/material-upload.validator.js";

/**
 * Serviço de materiais por área de estudo.
 */
@Injectable()
export class MaterialsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param materialModel Modelo Mongoose injetado para ler e persistir materiais privados.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param storage storage necessário para executar constructor sem depender de estado global.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     * @param auditLogService Service injetado para auditar submissões de materiais sem copiar conteúdo privado.
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
            .select("_id title type status url sizeBytes createdAt")
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
    async listReadyTextSources(userId: string, studyAreaId: string) {
        await this.assertOwnArea(userId, studyAreaId);
        return this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                contentText: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .lean();
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
        await this.materialModel.updateOne(
            {
                _id: new Types.ObjectId(materialId),
                userId: new Types.ObjectId(userId),
            },
            {
                $set: {
                    status: "READY",
                    contentText: contentText.slice(0, 10000),
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
        validateMaterialUpload(file);

        const storageKey = await this.storage.save(file);
        const material = await this.materialModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: materialTypeFromMime(file.mimetype),
            title: title?.trim() || file.originalname,
            status: "PENDING_PROCESSING",
            storageKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        });

        await this.historyService.recordEvent(
            userId,
            "MATERIAL_SUBMITTED",
            "Material submetido",
            material.title,
        );
        await this.auditLogService.record({
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
        });

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
            const contentText = input.topicText?.trim();
            if (!contentText || contentText.length < 10) {
                throw new BadRequestException({
                    code: "TOPIC_TEXT_REQUIRED",
                    message: "Escreve pelo menos 10 caracteres.",
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

        throw new BadRequestException({
            code: "INVALID_MATERIAL_TYPE",
            message: "Tipo de material inválido.",
        });
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
        sizeBytes?: number;
        createdAt?: Date;
    }): PublicMaterialDto {
        return {
            _id: String(material._id),
            title: material.title,
            type: material.type,
            status: material.status,
            ...(material.url ? { url: material.url } : {}),
            ...(material.sizeBytes !== undefined
                ? { sizeBytes: material.sizeBytes }
                : {}),
            ...(material.createdAt ? { createdAt: material.createdAt } : {}),
        };
    }
}
