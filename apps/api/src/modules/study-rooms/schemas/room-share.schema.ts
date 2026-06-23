/**
 * Define o modelo persistido de salas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de salas de estudo, usado apenas dentro da camada de persistência.
 */
export type RoomShareDocument = HydratedDocument<RoomShare>;
/**
 * Tipos permitidos de salas de estudo; direcionam validação e renderização.
 */
export type RoomShareType = "NOTE" | "URL" | "MATERIAL_REF";

/**
 * Partilha persistida dentro de uma sala de estudo.
 */
@Schema({ timestamps: true, collection: "room_shares" })
export class RoomShare {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTE", "URL", "MATERIAL_REF"] })
    type!: RoomShareType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 10000 })
    textContent?: string;

    @Prop({ trim: true })
    url?: string;

    @Prop({ type: Types.ObjectId, ref: "Material" })
    materialId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 160 })
    materialTitle?: string;

    @Prop({ required: true, default: false, index: true })
    usableByAi!: boolean;
}

export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
