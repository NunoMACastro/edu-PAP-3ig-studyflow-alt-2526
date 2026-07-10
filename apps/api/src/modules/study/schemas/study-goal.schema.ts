/**
 * Define o modelo persistido de study usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de rotinas e objetivos de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyGoalDocument = HydratedDocument<StudyGoal>;

/**
 * Objetivo de estudo pessoal do aluno.
 */
@Schema({ timestamps: true, collection: "study_goals" })
export class StudyGoal {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop()
    targetDate?: Date;

    @Prop({ required: true, default: false })
    completed!: boolean;

    @Prop({ required: true, default: false })
    archived!: boolean;
}

export const StudyGoalSchema = SchemaFactory.createForClass(StudyGoal);
StudyGoalSchema.index({ userId: 1, createdAt: -1 });
