// apps/api/src/modules/admin-users/admin-users.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";

// Interface interna fictícia para o documento de User (ajusta conforme o teu projeto)
interface UserDocument {
    _id: string;
    role: string;
    save(): Promise<this>;
}

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectModel("User") private readonly userModel: Model<UserDocument>,
        private readonly auditLogService: AuditLogService, // <-- Injeção do serviço de auditoria
    ) {}

    /**
     * Altera o papel (role) de um utilizador e regista a ação na auditoria.
     */
    async changeRole(actorId: string, targetUserId: string, nextRole: string): Promise<{ success: boolean }> {
        // 1. Procura o utilizador alvo
        const user = await this.userModel.findById(targetUserId);
        if (!user) {
            throw new NotFoundException(`Utilizador com ID ${targetUserId} não encontrado.`);
        }

        // 2. Guarda o estado anterior para os metadados da auditoria
        const previousRole = user.role;

        // 3. Aplica e persiste a alteração
        user.role = nextRole;
        await user.save();

        // 4. Executa a chamada de auditoria após o sucesso da operação
        await this.auditRoleChange(actorId, targetUserId, previousRole, nextRole);

        return { success: true };
    }

    /**
     * Regista uma alteração de papel sem copiar email, password ou sessão.
     */
    private async auditRoleChange(
        actorId: string,
        targetUserId: string,
        previousRole: string,
        nextRole: string,
    ): Promise<void> {
        await this.auditLogService.record({
            actorId,
            domain: AuditDomain.ROLE,
            action: "USER_ROLE_CHANGED",
            resourceType: "User",
            resourceId: targetUserId,
            result: AuditResult.SUCCESS,
            metadata: { previousRole, nextRole },
        });
    }
}