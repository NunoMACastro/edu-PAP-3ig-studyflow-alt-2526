/**
 * Implementa as regras de negócio de users e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    User,
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
        return this.userModel.findOne({ email: email.trim().toLowerCase() });
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
}
