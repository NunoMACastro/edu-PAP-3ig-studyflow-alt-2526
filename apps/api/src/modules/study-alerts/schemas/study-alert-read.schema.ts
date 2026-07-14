/**
 * Define o modelo persistido de alertas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de alertas de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyAlertReadDocument = HydratedDocument<StudyAlertRead>;

/**
 * Estado de leitura de um alerta derivado.
 */
@Schema({ timestamps: true })
export class StudyAlertRead {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, index: true })
    alertKey!: string;

    @Prop({ required: true })
    readAt!: Date;
}

export const StudyAlertReadSchema =
    SchemaFactory.createForClass(StudyAlertRead);

StudyAlertReadSchema.index({ userId: 1, alertKey: 1 }, { unique: true });
