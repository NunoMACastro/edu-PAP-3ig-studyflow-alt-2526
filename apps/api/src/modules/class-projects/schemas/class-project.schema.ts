/**
 * Define o modelo persistido de turma projects usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de projetos da turma, usado apenas dentro da camada de persistência.
 */
export type ClassProjectDocument = HydratedDocument<ClassProject>;
/**
 * Estados permitidos de projetos da turma; evitam strings soltas no código.
 */
export type ClassProjectStatus = "DRAFT" | "PUBLISHED";

/**
 * Projecto oficial criado por professor para uma turma.
 */
@Schema({ timestamps: true, collection: "class_projects" })
export class ClassProject {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 20, maxlength: 12000 })
    brief!: string;

    @Prop({ trim: true, maxlength: 120 })
    subject?: string;

    @Prop()
    dueDate?: Date;

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" })
    status!: ClassProjectStatus;
}

export const ClassProjectSchema = SchemaFactory.createForClass(ClassProject);
ClassProjectSchema.index({ classId: 1, status: 1, createdAt: -1 });
