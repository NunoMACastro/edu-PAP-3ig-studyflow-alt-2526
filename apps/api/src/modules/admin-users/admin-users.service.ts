/**
 * Implementa gestão administrativa de utilizadores e papéis.
 */
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import type { ClientSession, Connection, Model } from "mongoose";
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
     * Recebe as dependências injetadas de AdminUsersService para manter administração de utilizadores testável e separado de detalhes externos.
     *
     * @param userModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param roleChangeModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param connection Ligação Mongoose usada para garantir atomicidade entre role, histórico e auditoria.
     */
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(UserRoleChange.name)
        private readonly roleChangeModel: Model<UserRoleChangeDocument>,
        private readonly auditLogService: AuditLogService,
        @InjectConnection() private readonly connection: Connection,
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
        return this.connection.transaction(async (session) => {
            const target = await this.userModel.findById(
                targetUserId,
                null,
                { session },
            );
            if (!target || !this.isActiveAccount(target.accountStatus)) {
                throw this.notFound();
            }
            if (target.role === "ADMIN" && input.role !== "ADMIN") {
                await this.assertNotLastAdmin(session);
            }

            const previousRole = target.role;
            const updated = await this.userModel.findOneAndUpdate(
                {
                    _id: target._id,
                    $or: [
                        { accountStatus: "ACTIVE" },
                        { accountStatus: { $exists: false } },
                    ],
                },
                {
                    $set: { role: input.role },
                    $inc: { sessionVersion: 1 },
                },
                { new: true, runValidators: true, session },
            );
            if (!updated) throw this.notFound();

            const [roleChange] = await this.roleChangeModel.create(
                [
                    {
                        actorId: new Types.ObjectId(actor.id),
                        targetUserId: new Types.ObjectId(updated.id),
                        previousRole,
                        nextRole: input.role,
                        reason: input.reason.trim(),
                    },
                ],
                { session },
            );

            await this.auditLogService.record(
                {
                    actorId: actor.id,
                    domain: "ROLES",
                    action: "USER_ROLE_CHANGED",
                    resourceType: "User",
                    resourceId: updated.id,
                    result: "SUCCESS",
                    metadata: {
                        previousRole,
                        nextRole: input.role,
                        reason: input.reason,
                    },
                },
                session,
            );

            return {
                user: {
                    id: updated.id,
                    email: updated.email,
                    role: updated.role as UserRole,
                    authProvider: updated.authProvider,
                },
                roleChangeId: String(roleChange._id),
            };
        });
    }

    /**
     * Valida a regra de administração de utilizadores e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
     * @param session Transação MongoDB que contém a mudança de papel.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private async assertNotLastAdmin(session: ClientSession): Promise<void> {
        const activeAdmins = {
            role: "ADMIN" as const,
            $or: [
                { accountStatus: "ACTIVE" as const },
                { accountStatus: { $exists: false } },
            ],
        };

        // Todos os fluxos que podem reduzir administradores escrevem no mesmo
        // sentinel. Transações concorrentes entram em write conflict e repetem
        // a contagem sobre estado fresco antes de poderem confirmar o commit.
        await this.connection.collection("studyflow_invariants").updateOne(
            { _id: "active-admin-sentinel" as never },
            { $inc: { version: 1 }, $set: { kind: "ACTIVE_ADMIN" } },
            { upsert: true, session },
        );
        await this.userModel.updateMany(
            activeAdmins,
            { $inc: { roleInvariantVersion: 1 } },
            { session },
        );
        const adminCount = await this.userModel.countDocuments(activeAdmins, {
            session,
        });
        if (adminCount <= 1) {
            throw new ConflictException({
                code: "LAST_ADMIN_REQUIRED",
                message: "Não podes remover o último administrador.",
            });
        }
    }

    /**
     * Considera documentos legados sem estado explícito como ativos.
     *
     * @param status Estado persistido da conta.
     * @returns `true` quando a conta pode ser administrada.
     */
    private isActiveAccount(status?: string): boolean {
        return status === undefined || status === "ACTIVE";
    }

    /**
     * Executa not found no domínio de administração de utilizadores, aplicando validações, autorização e persistência de forma coesa.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "USER_NOT_FOUND",
            message: "Utilizador não encontrado.",
        });
    }
}
