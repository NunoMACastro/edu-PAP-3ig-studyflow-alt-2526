/**
 * Implementa gestão administrativa de utilizadores e papéis.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { User, UserDocument, UserRole } from "../auth/schemas/user.schema.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";
import { UserRoleChange, UserRoleChangeDocument } from "./schemas/user-role-change.schema.js";

/**
 * Serviço administrativo de utilizadores.
 */
@Injectable()
export class AdminUsersService {
    /**
     * @param userModel Modelo de utilizadores.
     * @param roleChangeModel Modelo de histórico de roles.
     * @param auditLogService Serviço de auditoria.
     */
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(UserRoleChange.name)
        private readonly roleChangeModel: Model<UserRoleChangeDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Lista utilizadores sem expor passwordHash.
     *
     * @param actor Administrador autenticado.
     * @returns Utilizadores públicos.
     */
    async listUsers(actor: AuthenticatedUser) {
        this.assertAdmin(actor);
        const users = await this.userModel
            .find({})
            .select("_id email role authProvider createdAt")
            .sort({ createdAt: -1 })
            .lean();
        return users.map((user) => ({
            id: String(user._id),
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
        }));
    }

    /**
     * Altera role real do utilizador e preserva histórico.
     *
     * @param actor Administrador autenticado.
     * @param targetUserId Utilizador alvo.
     * @param input Novo papel e motivo.
     * @returns Utilizador atualizado e histórico criado.
     */
    async changeRole(actor: AuthenticatedUser, targetUserId: string, input: ChangeUserRoleDto) {
        this.assertAdmin(actor);
        if (!Types.ObjectId.isValid(targetUserId)) throw this.notFound();
        const target = await this.userModel.findById(targetUserId);
        if (!target) throw this.notFound();
        if (target.role === "ADMIN" && input.role !== "ADMIN") {
            await this.assertNotLastAdmin(target.id);
        }

        const previousRole = target.role;
        target.role = input.role;
        await target.save();

        const roleChange = await this.roleChangeModel.create({
            actorId: new Types.ObjectId(actor.id),
            targetUserId: new Types.ObjectId(target.id),
            previousRole,
            nextRole: input.role,
            reason: input.reason.trim(),
        });

        await this.auditLogService.record({
            actorId: actor.id,
            domain: "ROLES",
            action: "USER_ROLE_CHANGED",
            resourceType: "User",
            resourceId: target.id,
            result: "SUCCESS",
            metadata: { previousRole, nextRole: input.role, reason: input.reason },
        });

        return {
            user: {
                id: target.id,
                email: target.email,
                role: target.role as UserRole,
                authProvider: target.authProvider,
            },
            roleChangeId: String(roleChange._id),
        };
    }

    /**
     * @param actor Utilizador autenticado.
     */
    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    /**
     * Garante que a plataforma não fica sem administradores.
     *
     * @param adminId Administrador que perderia role admin.
     */
    private async assertNotLastAdmin(adminId: string): Promise<void> {
        const adminCount = await this.userModel.countDocuments({ role: "ADMIN" });
        if (adminCount <= 1) {
            throw new ConflictException({
                code: "LAST_ADMIN_REQUIRED",
                message: "Não podes remover o último administrador.",
            });
        }
        const stillExists = await this.userModel.exists({ _id: adminId, role: "ADMIN" });
        if (!stillExists) throw this.notFound();
    }

    /**
     * @returns Erro de alvo inexistente.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "USER_NOT_FOUND",
            message: "Utilizador não encontrado.",
        });
    }
}
