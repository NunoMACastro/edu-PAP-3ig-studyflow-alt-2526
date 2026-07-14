/**
 * Define o modelo persistido de salas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de salas de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyRoomDocument = HydratedDocument<StudyRoom>;
/**
 * Tipos permitidos de salas de estudo; direcionam validação e renderização.
 */
export type StudyRoomType = "FREE" | "SUBJECT";
export type CollaborationKind = "STUDY_GROUP" | "STUDY_ROOM";
export type CollaborationKindSource = "NATIVE" | "LEGACY_INFERRED";

/**
 * Sala colaborativa entre alunos.
 */
@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    @Prop({ trim: true, maxlength: 120 })
    disciplineName?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];

    @Prop({ enum: ["STUDY_GROUP", "STUDY_ROOM"], index: true })
    collaborationKind?: CollaborationKind;

    @Prop({ enum: ["NATIVE", "LEGACY_INFERRED"] })
    collaborationKindSource?: CollaborationKindSource;

    @Prop({ trim: true, maxlength: 80, index: true })
    collaborationMigrationRunId?: string;
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
StudyRoomSchema.index({ memberIds: 1, collaborationKind: 1, createdAt: -1 });
