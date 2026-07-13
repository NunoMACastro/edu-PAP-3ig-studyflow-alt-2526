/**
 * Define o modelo persistido de sessões de estudo em grupo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de sessões de estudo em grupo, usado apenas dentro da camada de persistência.
 */
export type StudyGroupSessionDocument = HydratedDocument<StudyGroupSession>;

/**
 * Sessão de estudo coletivo agendada para um grupo.
 */
@Schema({ timestamps: true })
export class StudyGroupSession {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    createdByStudentId!: Types.ObjectId;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true, index: true })
    startsAt!: Date;

    @Prop({ required: true })
    durationMinutes!: number;

    @Prop()
    goal?: string;
}

export const StudyGroupSessionSchema =
    SchemaFactory.createForClass(StudyGroupSession);
