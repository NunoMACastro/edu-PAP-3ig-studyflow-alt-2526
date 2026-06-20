/**
 * Implementa exportação RGPD de dados pessoais próprios.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { Material, MaterialDocument } from "../materials/schemas/material.schema.js";
import {
    NotificationPreference,
    NotificationPreferenceDocument,
} from "../notification-preferences/schemas/notification-preference.schema.js";
import { StudyArea, StudyAreaDocument } from "../study-areas/schemas/study-area.schema.js";
import { DataExportRequest, DataExportRequestDocument } from "./schemas/data-export-request.schema.js";

/**
 * Serviço de pedidos e downloads de exportação.
 */
@Injectable()
export class PrivacyDataExportsService {
    constructor(
        @InjectModel(DataExportRequest.name)
        private readonly exportModel: Model<DataExportRequestDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(StudyArea.name)
        private readonly studyAreaModel: Model<StudyAreaDocument>,
        @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
        @InjectModel(NotificationPreference.name)
        private readonly preferenceModel: Model<NotificationPreferenceDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Cria um pedido de exportação para o próprio utilizador.
     *
     * @param actor Utilizador autenticado.
     * @returns Pedido criado.
     */
    async requestExport(actor: AuthenticatedUser) {
        const request = await this.exportModel.create({
            userId: new Types.ObjectId(actor.id),
            status: "READY",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "PRIVACY",
            action: "DATA_EXPORT_REQUESTED",
            resourceType: "DataExportRequest",
            resourceId: String(request._id),
            result: "SUCCESS",
        });
        return this.toRequestView(request.toObject());
    }

    /**
     * Lista pedidos próprios.
     *
     * @param actor Utilizador autenticado.
     * @returns Pedidos recentes.
     */
    async listMine(actor: AuthenticatedUser) {
        const requests = await this.exportModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return requests.map((request) => this.toRequestView(request));
    }

    /**
     * Gera bundle JSON sem persistir cópia adicional de dados pessoais.
     *
     * @param actor Utilizador autenticado.
     * @param requestId Pedido de exportação próprio.
     * @returns Bundle minimizado.
     */
    async download(
        actor: AuthenticatedUser,
        requestId: string,
    ): Promise<Record<string, unknown>> {
        if (!Types.ObjectId.isValid(requestId)) throw this.notFound();
        const request = await this.exportModel
            .findOne({ _id: requestId, userId: new Types.ObjectId(actor.id) })
            .lean();
        if (!request) throw this.notFound();
        if (request.expiresAt.getTime() < Date.now()) {
            throw new ForbiddenException({
                code: "DATA_EXPORT_EXPIRED",
                message: "O pedido de exportação expirou.",
            });
        }

        const [user, studyAreas, materials, preferences] = await Promise.all([
            this.userModel.findById(actor.id).select("_id email role authProvider createdAt updatedAt").lean(),
            this.studyAreaModel
                .find({ userId: new Types.ObjectId(actor.id) })
                .select("_id name description color archived voiceTone voiceDetailLevel createdAt updatedAt")
                .lean(),
            this.materialModel
                .find({ userId: new Types.ObjectId(actor.id) })
                .select("_id studyAreaId type title status url sizeBytes createdAt updatedAt")
                .lean(),
            this.preferenceModel
                .find({ userId: new Types.ObjectId(actor.id) })
                .select("_id context email push inApp updatedAt")
                .lean(),
        ]);

        await this.auditLogService.record({
            actorId: actor.id,
            domain: "PRIVACY",
            action: "DATA_EXPORT_DOWNLOADED",
            resourceType: "DataExportRequest",
            resourceId: requestId,
            result: "SUCCESS",
            metadata: { studyAreaCount: studyAreas.length, materialCount: materials.length },
        });

        return {
            exportedAt: new Date().toISOString(),
            user,
            studyAreas,
            materials,
            notificationPreferences: preferences,
        };
    }

    /**
     * @returns Erro de pedido inexistente.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "DATA_EXPORT_NOT_FOUND",
            message: "Pedido de exportação não encontrado.",
        });
    }

    /**
     * @param request Documento interno.
     * @returns Pedido público.
     */
    private toRequestView(request: {
        _id?: unknown;
        status: "READY" | "EXPIRED";
        expiresAt: Date;
        createdAt?: Date;
    }) {
        return {
            id: String(request._id),
            status: request.status,
            expiresAt: request.expiresAt,
            createdAt: request.createdAt,
        };
    }
}
