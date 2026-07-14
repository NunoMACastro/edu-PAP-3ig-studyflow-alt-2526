/** Estado pessoal de progresso de um aluno num projeto publicado. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudentClassProjectProgress =
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "COMPLETED";
export type StudentClassProjectStateDocument =
    HydratedDocument<StudentClassProjectState>;

@Schema({ timestamps: true, collection: "student_class_project_states" })
export class StudentClassProjectState {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "ClassProject", required: true, index: true })
    projectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
        default: "NOT_STARTED",
    })
    status!: StudentClassProjectProgress;

    @Prop()
    completedAt?: Date;
}

export const StudentClassProjectStateSchema =
    SchemaFactory.createForClass(StudentClassProjectState);
StudentClassProjectStateSchema.index(
    { studentId: 1, projectId: 1 },
    { unique: true },
);
