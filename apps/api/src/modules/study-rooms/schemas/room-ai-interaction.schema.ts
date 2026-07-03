/**
 * Define o modelo persistido de salas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

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
}

export const RoomAiInteractionSchema =
    SchemaFactory.createForClass(RoomAiInteraction);
RoomAiInteractionSchema.index({ roomId: 1, createdAt: -1 });
