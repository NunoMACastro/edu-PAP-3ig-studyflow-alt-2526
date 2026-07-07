/**
 * Define o modelo persistido de salas de estudo guiado usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de salas de estudo guiado, usado apenas dentro da camada de persistência.
 */
export type GuidedStudyRoomDocument = HydratedDocument<GuidedStudyRoom>;
/**
 * Estados permitidos de salas de estudo guiado; evitam strings soltas no código.
 */
export type GuidedStudyRoomStatus = "OPEN" | "CLOSED";

/**
 * Sala de estudo guiado criada por um professor para uma turma.
 */
@Schema({ timestamps: true, collection: "guided_study_rooms" })
export class GuidedStudyRoom {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 8000 })
    description!: string;

    @Prop({ type: [String], default: [] })
    materialIds!: string[];

    @Prop({ required: true, enum: ["OPEN", "CLOSED"], default: "OPEN" })
    status!: GuidedStudyRoomStatus;
}

export const GuidedStudyRoomSchema =
    SchemaFactory.createForClass(GuidedStudyRoom);
GuidedStudyRoomSchema.index({ classId: 1, createdAt: -1 });
