/**
 * Define a projeção de leitura rápida da última atividade pedagógica por
 * aluno e turma. A coleção de eventos continua a ser a fonte auditável.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    CLASS_LEARNING_ACTIVITY_TYPES,
    ClassLearningActivityType,
} from "./class-learning-activity.schema.js";

export type StudentClassActivityStateDocument =
    HydratedDocument<StudentClassActivityState>;

/** Projeção agregada usada pelo centro de acompanhamento. */
@Schema({ timestamps: true, collection: "student_class_activity_states" })
export class StudentClassActivityState {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Date, required: true })
    firstActivityAt!: Date;

    @Prop({ type: Date, required: true, index: true })
    lastActivityAt!: Date;

    @Prop({
        type: String,
        enum: CLASS_LEARNING_ACTIVITY_TYPES,
        required: true,
    })
    lastActivityType!: ClassLearningActivityType;

    @Prop({ type: Number, required: true, min: 1, default: 1 })
    activityCount!: number;
}

export const StudentClassActivityStateSchema =
    SchemaFactory.createForClass(StudentClassActivityState);

StudentClassActivityStateSchema.index(
    { classId: 1, studentId: 1 },
    { unique: true },
);
StudentClassActivityStateSchema.index(
    { classId: 1, lastActivityAt: 1, studentId: 1 },
);
