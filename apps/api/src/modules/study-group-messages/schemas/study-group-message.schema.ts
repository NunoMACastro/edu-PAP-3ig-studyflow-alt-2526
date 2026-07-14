/**
 * Define o modelo persistido de mensagens de grupos de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { StudyGroupMessageKind } from "../dto/create-study-group-message.dto.js";
import type { CollaborationKind } from "../../study-rooms/schemas/study-room.schema.js";

/**
 * Documento Mongoose de mensagens do grupo de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyGroupMessageDocument = HydratedDocument<StudyGroupMessage>;

/**
 * Mensagem ou nota persistida dentro de um grupo de estudo.
 */
@Schema({ timestamps: true })
export class StudyGroupMessage {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, enum: ["STUDY_GROUP", "STUDY_ROOM"], index: true })
    collaborationKind!: CollaborationKind;

    @Prop({ type: Types.ObjectId, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["MESSAGE", "NOTE"], index: true })
    kind!: StudyGroupMessageKind;

    @Prop()
    text!: string;

    @Prop({ trim: true })
    clientMessageId?: string;

    @Prop()
    tombstonedAt?: Date;
}

export const StudyGroupMessageSchema =
    SchemaFactory.createForClass(StudyGroupMessage);
StudyGroupMessageSchema.index(
    { groupId: 1, collaborationKind: 1, authorStudentId: 1, clientMessageId: 1 },
    {
        unique: true,
        partialFilterExpression: { clientMessageId: { $type: "string" } },
    },
);
