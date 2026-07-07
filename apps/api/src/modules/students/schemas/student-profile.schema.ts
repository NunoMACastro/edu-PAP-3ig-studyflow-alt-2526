/**
 * Define o modelo persistido de students usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de perfil do aluno, usado apenas dentro da camada de persistência.
 */
export type StudentProfileDocument = HydratedDocument<StudentProfile>;

/**
 * Perfil editável do aluno.
 *
 * O perfil fica separado da conta de autenticação. Assim, o aluno pode alterar
 * dados escolares simples sem tocar em email, password, role ou sessão.
 */
@Schema({ timestamps: true, collection: "student_profiles" })
export class StudentProfile {
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 30 })
    year?: string;

    @Prop({ trim: true, maxlength: 120 })
    course?: string;

    @Prop({ type: String, trim: true, maxlength: 80, default: null })
    className?: string | null;
}

export const StudentProfileSchema =
    SchemaFactory.createForClass(StudentProfile);
