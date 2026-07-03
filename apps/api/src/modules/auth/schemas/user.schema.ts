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
}

export const UserSchema = SchemaFactory.createForClass(User);
