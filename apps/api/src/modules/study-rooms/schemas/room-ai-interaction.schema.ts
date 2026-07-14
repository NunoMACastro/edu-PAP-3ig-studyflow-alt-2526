/**
 * Define o modelo persistido de salas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    StudentAiCitationSnapshotRecord,
    StudentAiCitationSnapshotSchema,
} from "../../ai/schemas/student-ai-citation-snapshot.schema.js";

export type RoomAiVisibility = "PRIVATE" | "SHARED";

/**
 * Documento Mongoose de salas de estudo, usado apenas dentro da camada de persistência.
 */
export type RoomAiInteractionDocument = HydratedDocument<RoomAiInteraction>;

/**
 * Interação IA da sala, guardada com as fontes usadas.
 */
@Schema({ timestamps: true, collection: "room_ai_interactions" })
export class RoomAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "RoomShare" }], default: [] })
    sourceShareIds!: Types.ObjectId[];

    @Prop({
        required: true,
        enum: ["PRIVATE", "SHARED"],
        default: "PRIVATE",
        index: true,
    })
    visibility!: RoomAiVisibility;

    @Prop({ type: Date })
    sharedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: "RoomAiInteraction" })
    forkedFromInteractionId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    conversationId?: Types.ObjectId;

    @Prop({ type: [StudentAiCitationSnapshotSchema], default: [] })
    citationSnapshots!: StudentAiCitationSnapshotRecord[];

    @Prop({ required: true, default: false })
    inheritedFromFork!: boolean;

    @Prop({ type: String, index: true })
    migrationRunId?: string;
}

export const RoomAiInteractionSchema =
    SchemaFactory.createForClass(RoomAiInteraction);
RoomAiInteractionSchema.index({ roomId: 1, createdAt: -1 });
RoomAiInteractionSchema.index({ roomId: 1, studentId: 1, createdAt: -1 });
RoomAiInteractionSchema.index({ roomId: 1, visibility: 1, createdAt: -1 });
RoomAiInteractionSchema.index({ conversationId: 1, studentId: 1, createdAt: -1 });
