/**
 * Implementa as regras de negócio de users e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    User,
    UserAccountStatus,
    UserDocument,
    UserRole,
} from "../auth/schemas/user.schema.js";

/**
 * DTO que define os dados aceites ou devolvidos no fluxo de utilizadores.
 */
export type PublicUserDto = {
    id: string;
    email: string;
    role: UserRole;
};

/**
 * Representação mínima da conta necessária para validar uma sessão no servidor.
 */
export type SessionUserDto = {
    user: PublicUserDto;
    sessionVersion: number;
};

/**
 * Serviço de utilizadores partilhado por auth e módulos protegidos.
 *
 * A responsabilidade deste serviço é pequena: consultar/criar utilizadores e
 * devolver representações públicas sem `passwordHash`.
 */
@Injectable()
export class UsersService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param userModel Modelo Mongoose injetado para ler e persistir utilizadores.
     */
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    /**
     * Procura um utilizador pelo email normalizado.
     *
     * @param email Email recebido no registo ou login.
     * @returns Documento Mongoose ou `null` quando não existe.
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({
            email: email.trim().toLowerCase(),
            accountStatus: { $nin: ["SUSPENDED", "DELETED"] },
        });
    }

    /**
     * Procura um utilizador por identificador MongoDB.
     *
     * @param userId Identificador do utilizador autenticado.
     * @returns Documento Mongoose ou `null` quando não existe.
     */
    async findById(userId: string): Promise<UserDocument | null> {
        if (!Types.ObjectId.isValid(userId)) return null;
        return this.userModel.findById(userId);
    }

    /**
     * Relê a autoridade atual da conta para validar uma sessão. Documentos
     * anteriores à introdução de `accountStatus` e `sessionVersion` são
     * interpretados como ativos na geração zero.
     *
     * @param userId Identificador persistido no payload opaco da sessão.
     * @returns Utilizador atual e geração de sessão, ou `null` se estiver inativo.
     */
    async findSessionUser(userId: string): Promise<SessionUserDto | null> {
        const user = await this.findById(userId);
        if (!user || !this.isActiveStatus(user.accountStatus)) return null;

        return {
            user: this.toPublicUser(user),
            sessionVersion: this.normalizeSessionVersion(user.sessionVersion),
        };
    }

    /**
     * Cria uma conta local de aluno.
     *
     * @param email Email já validado e normalizado pelo `AuthService`.
     * @param passwordHash Hash seguro da password, nunca a password original.
     * @returns Documento criado.
     */
    async createStudent(
        email: string,
        passwordHash: string,
    ): Promise<UserDocument> {
        return this.userModel.create({
            email: email.trim().toLowerCase(),
            passwordHash,
            role: "STUDENT",
            authProvider: "local",
            accountStatus: "ACTIVE",
            sessionVersion: 0,
        });
    }

    /**
     * Converte um documento de utilizador numa resposta pública.
     *
     * @param user Documento Mongoose de utilizador.
     * @returns DTO sem hash de password nem campos internos desnecessários.
     */
    toPublicUser(user: UserDocument): PublicUserDto {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }

    /**
     * Mantém compatibilidade segura com documentos criados antes do campo de
     * estado, sem reativar estados explicitamente suspensos ou eliminados.
     *
     * @param status Estado persistido, possivelmente ausente num documento legado.
     * @returns `true` apenas para contas ativas ou documentos legados.
     */
    private isActiveStatus(status?: UserAccountStatus): boolean {
        return status === undefined || status === "ACTIVE";
    }

    /**
     * Normaliza a geração de sessão legada para zero.
     *
     * @param value Valor persistido no documento de utilizador.
     * @returns Inteiro não negativo usado na comparação da sessão.
     */
    private normalizeSessionVersion(value?: number): number {
        return Number.isSafeInteger(value) && Number(value) >= 0
            ? Number(value)
            : 0;
    }
}
