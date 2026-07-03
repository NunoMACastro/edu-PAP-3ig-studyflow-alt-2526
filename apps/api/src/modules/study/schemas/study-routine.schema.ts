/**
 * Define o modelo persistido de study usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de rotinas e objetivos de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyRoutineDocument = HydratedDocument<StudyRoutine>;

/**
 * Rotina recorrente criada pelo aluno para organizar estudo autónomo.
 */
@Schema({ timestamps: true, collection: "study_routines" })
export class StudyRoutine {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, type: [String] })
    weekdays!: string[];

    @Prop({ required: true, trim: true })
    startTime!: string;

    @Prop({ required: true, min: 5, max: 480 })
    durationMinutes!: number;

    @Prop({ required: true, default: false })
    archived!: boolean;
}

export const StudyRoutineSchema =
    SchemaFactory.createForClass(StudyRoutine);
StudyRoutineSchema.index({ userId: 1, createdAt: -1 });
