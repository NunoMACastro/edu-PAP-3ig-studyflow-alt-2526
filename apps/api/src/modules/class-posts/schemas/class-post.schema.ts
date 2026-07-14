/**
 * Define o modelo persistido de turma posts usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de publicações da turma, usado apenas dentro da camada de persistência.
 */
export type ClassPostDocument = HydratedDocument<ClassPost>;
/**
 * Tipos permitidos de publicações da turma; direcionam validação e renderização.
 */
export type ClassPostType = "NOTICE" | "POST";

/**
 * Aviso ou publicação oficial de uma turma.
 */
@Schema({ timestamps: true, collection: "class_posts" })
export class ClassPost {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTICE", "POST"] })
    type!: ClassPostType;

    @Prop({ trim: true, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, minlength: 5, maxlength: 4000 })
    body!: string;

    @Prop()
    tombstonedAt?: Date;
}

export const ClassPostSchema = SchemaFactory.createForClass(ClassPost);
ClassPostSchema.index({ classId: 1, createdAt: -1 });
