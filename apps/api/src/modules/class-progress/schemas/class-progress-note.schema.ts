/**
 * Define o modelo persistido de turma progress usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de progresso da turma, usado apenas dentro da camada de persistência.
 */
export type ClassProgressNoteDocument = HydratedDocument<ClassProgressNote>;

/**
 * Nota docente de progresso e dificuldades de uma turma.
 */
@Schema({ timestamps: true, collection: "class_progress_notes" })
export class ClassProgressNote {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 4000 })
    note!: string;

    @Prop({ type: [String], default: [] })
    difficultyTags!: string[];
}

export const ClassProgressNoteSchema =
    SchemaFactory.createForClass(ClassProgressNote);
ClassProgressNoteSchema.index({ classId: 1, createdAt: -1 });
