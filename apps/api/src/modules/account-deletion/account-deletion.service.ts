// apps/api/src/modules/account-deletion/account-deletion.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { Material, MaterialDocument } from "../materials/schemas/material.schema.js";
import { StudyArea, StudyAreaDocument } from "../study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { RequestAccountDeletionDto } from "./dto/request-account-deletion.dto.js";
import { AccountDeletionRequest, AccountDeletionRequestDocument } from "./schemas/account-deletion-request.schema.js";

export type AccountDeletionResult = { status: "COMPLETED"; deletedStudyAreas: number; deletedMaterials: number; deletedEvents: number };

/**
 * Executa eliminação da própria conta com limites explícitos.
 */
@Injectable()
export class AccountDeletionService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(StudyArea.name) private readonly areaModel: Model<StudyAreaDocument>,
        @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
        @InjectModel(StudyEvent.name) private readonly eventModel: Model<StudyEventDocument>,
        @InjectModel(AccountDeletionRequest.name) private readonly deletionModel: Model<AccountDeletionRequestDocument>,
    ) {}

    async deleteOwnAccount(actor: AuthenticatedUser, input: RequestAccountDeletionDto): Promise<AccountDeletionResult> {
        const user = await this.userModel.findById(actor.id).lean();
        if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });
        if (user.role === "ADMIN") await this.assertAnotherAdminExists(actor.id);

        const userId = new Types.ObjectId(actor.id);
        const [materials, areas, events] = await Promise.all([
            this.materialModel.deleteMany({ userId }),
            this.areaModel.deleteMany({ userId }),
            this.eventModel.deleteMany({ userId }),
        ]);

        await this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    email: `deleted-${actor.id}@studyflow.local`,
                    passwordHash: "account-deleted",
                    role: "STUDENT",
                },
            },
        );

        // O registo fica depois das remoções para reflectir uma execução concluída.
        await this.deletionModel.create({ userId, reason: input.reason?.trim(), completedAt: new Date(), status: "COMPLETED" });
        return {
            status: "COMPLETED",
            deletedStudyAreas: areas.deletedCount ?? 0,
            deletedMaterials: materials.deletedCount ?? 0,
            deletedEvents: events.deletedCount ?? 0,
        };
    }

    private async assertAnotherAdminExists(userId: string): Promise<void> {
        const adminCount = await this.userModel.countDocuments({ role: "ADMIN", _id: { $ne: new Types.ObjectId(userId) } });
        if (adminCount < 1) {
            throw new ForbiddenException({ code: "LAST_ADMIN_REQUIRED", message: "Não podes eliminar o último administrador." });
        }
    }
}