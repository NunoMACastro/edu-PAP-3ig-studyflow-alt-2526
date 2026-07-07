/**
 * Implementa eliminação/anonymização de conta própria.
 */
import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { SessionService } from "../auth/session.service.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { Material, MaterialDocument } from "../materials/schemas/material.schema.js";
import { StudyArea, StudyAreaDocument } from "../study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { AccountDeletionRequest, AccountDeletionRequestDocument } from "./schemas/account-deletion-request.schema.js";

/**
 * Serviço da operação destrutiva de conta.
 */
@Injectable()
export class AccountDeletionService {
    /**
     * Recebe as dependências injetadas de AccountDeletionService para manter eliminação de conta testável e separado de detalhes externos.
     *
     * @param deletionModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param userModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param studyAreaModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param materialModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param studyEventModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param sessionService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(AccountDeletionRequest.name)
        private readonly deletionModel: Model<AccountDeletionRequestDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(StudyArea.name)
        private readonly studyAreaModel: Model<StudyAreaDocument>,
        @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
        @InjectModel(StudyEvent.name)
        private readonly studyEventModel: Model<StudyEventDocument>,
        private readonly sessionService: SessionService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Elimina dados pessoais próprios, anonimiza a conta e revoga a sessão.
     *
     * @param actor Utilizador autenticado.
     * @param sessionId Sessão atual a destruir.
     * @returns Contadores removidos.
     */
    async deleteMine(actor: AuthenticatedUser, sessionId?: string) {
        if (!sessionId) {
            throw new ForbiddenException({
                code: "SESSION_REQUIRED",
                message: "Sessão inválida para eliminar conta.",
            });
        }
        if (actor.role === "ADMIN") {
            const adminCount = await this.userModel.countDocuments({ role: "ADMIN" });
            if (adminCount <= 1) {
                throw new ConflictException({
                    code: "LAST_ADMIN_REQUIRED",
                    message: "Não podes eliminar o último administrador.",
                });
            }
        }

        const userObjectId = new Types.ObjectId(actor.id);
        const [materials, studyAreas, events] = await Promise.all([
            this.materialModel.deleteMany({ userId: userObjectId }),
            this.studyAreaModel.deleteMany({ userId: userObjectId }),
            this.studyEventModel.deleteMany({ userId: userObjectId }),
        ]);

        const deletedCounts = {
            materials: materials.deletedCount ?? 0,
            studyAreas: studyAreas.deletedCount ?? 0,
            studyEvents: events.deletedCount ?? 0,
        };

        await this.userModel.updateOne(
            { _id: userObjectId },
            {
                $set: {
                    email: `deleted-${actor.id}@studyflow.local`,
                    passwordHash: "deleted-account",
                    authProvider: "local",
                    role: "STUDENT",
                },
            },
        );
        const deletion = await this.deletionModel.create({
            userId: userObjectId,
            deletedCounts,
        });
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "PRIVACY",
            action: "ACCOUNT_DELETED",
            resourceType: "User",
            resourceId: actor.id,
            result: "SUCCESS",
            metadata: deletedCounts,
        });
        await this.sessionService.destroySession(sessionId);

        return {
            deletionRequestId: String(deletion._id),
            deletedCounts,
            sessionRevoked: true,
        };
    }
}
