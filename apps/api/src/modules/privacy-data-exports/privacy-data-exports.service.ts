// apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { UsersService } from "../users/users.service.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { DataExportRequest, DataExportRequestDocument } from "./schemas/data-export-request.schema.js";

export type DataExportRequestView = { id: string; status: string; requestedAt: Date; expiresAt: Date };
export type PersonalDataBundle = {
    exportedAt: string;
    user: { id: string; email: string; role: string };
    studyAreas: unknown[];
    materialCount: number;
    notificationPreferences: unknown[];
};

/**
 * Gera exportações de dados pessoais do próprio utilizador.
 */
@Injectable()
export class PrivacyDataExportsService {
    constructor(
        @InjectModel(DataExportRequest.name)
        private readonly exportModel: Model<DataExportRequestDocument>,
        private readonly usersService: UsersService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    async requestExport(actor: AuthenticatedUser, input: RequestDataExportDto): Promise<DataExportRequestView> {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const row = await this.exportModel.create({
            userId: new Types.ObjectId(actor.id),
            reason: input.reason?.trim(),
            requestedAt: new Date(),
            expiresAt,
            status: "READY",
        });
        return this.toView(row.toObject());
    }

    async listMine(actor: AuthenticatedUser): Promise<DataExportRequestView[]> {
        const rows = await this.exportModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ requestedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    async download(actor: AuthenticatedUser, exportId: string): Promise<PersonalDataBundle> {
        const request = await this.findOwnedReadyRequest(actor, exportId);
        if (request.expiresAt.getTime() < Date.now()) {
            throw new ForbiddenException({ code: "DATA_EXPORT_EXPIRED", message: "A exportação expirou." });
        }

        const user = await this.usersService.findById(actor.id);
        if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });

        const [studyAreas, materialCount, notificationPreferences] = await Promise.all([
            this.studyAreasService.listMyStudyAreas(actor.id),
            this.materialsService.countMine(actor.id),
            this.preferencesService.listEffective(actor.id),
        ]);

        // Só são devolvidos campos públicos; passwordHash e dados de sessão ficam sempre fora.
        return {
            exportedAt: new Date().toISOString(),
            user: this.usersService.toPublicUser(user),
            studyAreas,
            materialCount,
            notificationPreferences,
        };
    }

    private async findOwnedReadyRequest(actor: AuthenticatedUser, exportId: string) {
        if (!Types.ObjectId.isValid(exportId)) throw this.notFound();
        const request = await this.exportModel
            .findOne({ _id: exportId, userId: new Types.ObjectId(actor.id), status: "READY" })
            .lean();
        if (!request) throw this.notFound();
        return request;
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "DATA_EXPORT_NOT_FOUND", message: "Exportação não encontrada." });
    }

    private toView(row: { _id: unknown; status: string; requestedAt: Date; expiresAt: Date }): DataExportRequestView {
        return { id: String(row._id), status: row.status, requestedAt: row.requestedAt, expiresAt: row.expiresAt };
    }
}