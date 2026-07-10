/**
 * Define o modelo persistido de material contexts usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de contextos pedagógicos de materiais, usado apenas dentro da camada de persistência.
 */
export type MaterialContextDocument = HydratedDocument<MaterialContext>;

/**
 * Contrato de contextos pedagógicos de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type MaterialContextScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";

/**
 * Registo persistido que separa o contexto em que um material pode ser usado
 * pela IA, sem misturar materiais pessoais, de turma e de professor.
 */
@Schema({ timestamps: true })
export class MaterialContext {
    @Prop({ required: true, enum: ["PRIVATE_AREA", "OFFICIAL_SUBJECT"], index: true })
    scope!: MaterialContextScope;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ required: true, enum: ["student", "teacher", "class"] })
    source!: "student" | "teacher" | "class";

    @Prop({ type: Types.ObjectId })
    studentId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    teacherId?: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export const MaterialContextSchema =
    SchemaFactory.createForClass(MaterialContext);
MaterialContextSchema.index(
    { scope: 1, contextId: 1, materialId: 1 },
    { unique: true },
);
