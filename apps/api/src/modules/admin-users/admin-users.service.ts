// apps/api/src/modules/admin-users/admin-users.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PublicUserDto } from "../users/users.service.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";
import { UserRoleChange, UserRoleChangeDocument } from "./schemas/user-role-change.schema.js";

/**
 * Administração de utilizadores sobre o schema real de autenticação.
 */
@Injectable()
export class AdminUsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(UserRoleChange.name) private readonly changeModel: Model<UserRoleChangeDocument>,
    ) {}

    async listUsers(actor: AuthenticatedUser): Promise<PublicUserDto[]> {
        this.assertAdmin(actor);
        const users = await this.userModel.find().select("_id email role").sort({ email: 1 }).lean();
        return users.map((user) => ({ id: String(user._id), email: user.email, role: user.role }));
    }

    async changeRole(actor: AuthenticatedUser, targetUserId: string, input: ChangeUserRoleDto): Promise<PublicUserDto> {
        this.assertAdmin(actor);
        if (!Types.ObjectId.isValid(targetUserId)) throw this.notFound();
        const target = await this.userModel.findById(targetUserId).lean();
        if (!target) throw this.notFound();
        if (target.role === "ADMIN" && input.nextRole !== "ADMIN") await this.assertAnotherAdminExists(targetUserId);

        const updated = await this.userModel
            .findByIdAndUpdate(targetUserId, { $set: { role: input.nextRole } }, { new: true, runValidators: true })
            .lean();
        if (!updated) throw this.notFound();

        // O histórico é escrito depois da mutação para reflectir o estado aplicado.
        await this.changeModel.create({
            actorId: new Types.ObjectId(actor.id),
            targetUserId: new Types.ObjectId(targetUserId),
            previousRole: target.role,
            nextRole: input.nextRole,
            reason: input.reason.trim(),
        });
        return { id: String(updated._id), email: updated.email, role: updated.role };
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem gerir utilizadores." });
        }
    }

    private async assertAnotherAdminExists(targetUserId: string): Promise<void> {
        const count = await this.userModel.countDocuments({ role: "ADMIN", _id: { $ne: new Types.ObjectId(targetUserId) } });
        if (count < 1) {
            throw new ForbiddenException({ code: "LAST_ADMIN_REQUIRED", message: "Tem de existir pelo menos um administrador." });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });
    }
}