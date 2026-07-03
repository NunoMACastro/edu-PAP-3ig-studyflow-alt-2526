/**
 * Define o modelo persistido de subjects usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de disciplinas, usado apenas dentro da camada de persistência.
 */
export type SubjectDocument = HydratedDocument<Subject>;

/**
 * Disciplina oficial associada a uma turma.
 */
@Schema({ timestamps: true, collection: "subjects" })
export class Subject {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, trim: true, uppercase: true, maxlength: 40 })
    code!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true });
SubjectSchema.index({ teacherId: 1, createdAt: -1 });
