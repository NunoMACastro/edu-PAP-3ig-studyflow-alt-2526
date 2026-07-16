/**
 * Define o modelo persistido de auth usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

/**
 * Documento Mongoose de autenticação, usado apenas dentro da camada de persistência.
 */
export type UserDocument = HydratedDocument<User>;
/**
 * Contrato de autenticação que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
/**
 * Estado operacional da conta. Contas inativas nunca podem autenticar-se nem
 * manter sessões previamente emitidas.
 */
export type UserAccountStatus =
    | "ACTIVE"
    | "SUSPENDED"
    | "DELETION_PENDING"
    | "DELETED";
/**
 * Contrato de autenticação que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type AuthProvider = "local" | "school_sso";

/**
 * Documento de utilizador usado pela autenticação.
 *
 * Este schema cumpre BK-MF0-01: registo local de aluno, email único e password
 * guardada apenas como hash. O contrato `school_sso` fica preparado sem
 * ativar uma integração institucional que ainda não foi definida.
 */
@Schema({ timestamps: true, collection: "users" })
export class User {
    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    })
    email!: string;

    /** Nome público opcional para identidades institucionais, como professores. */
    @Prop({ trim: true, maxlength: 120 })
    displayName?: string;

    @Prop({ required: true })
    passwordHash!: string;

    @Prop({
        required: true,
        enum: ["STUDENT", "TEACHER", "ADMIN"],
        default: "STUDENT",
    })
    role!: UserRole;

    @Prop({ required: true, enum: ["local", "school_sso"], default: "local" })
    authProvider!: AuthProvider;

    @Prop({
        required: true,
        enum: ["ACTIVE", "SUSPENDED", "DELETION_PENDING", "DELETED"],
        default: "ACTIVE",
        index: true,
    })
    accountStatus!: UserAccountStatus;

    /**
     * Geração de segurança da conta. Qualquer alteração de autoridade ou
     * desativação incrementa este valor e invalida todas as sessões anteriores.
     */
    @Prop({ required: true, default: 0, min: 0 })
    sessionVersion!: number;

    /**
     * Versão interna usada apenas para serializar operações concorrentes que
     * poderiam remover o último administrador.
     */
    @Prop({ required: true, default: 0, min: 0, select: false })
    roleInvariantVersion!: number;

    @Prop()
    deletedAt?: Date;

    /**
     * Marca o início visível da eliminação. Enquanto este estado existe, a
     * releitura da sessão considera a conta inativa e impede novas escritas
     * autenticadas antes de se preparar o apagamento físico.
     */
    @Prop()
    deletionStartedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1, accountStatus: 1 });
