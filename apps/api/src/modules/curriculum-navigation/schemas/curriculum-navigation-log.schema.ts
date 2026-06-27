/**
 * Define o modelo persistido de navegação curricular usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de navegação curricular, usado apenas dentro da camada de persistência.
 */
export type CurriculumNavigationLogDocument =
    HydratedDocument<CurriculumNavigationLog>;

/**
 * Log mínimo de navegação curricular gerada.
 */
@Schema({ timestamps: true })
export class CurriculumNavigationLog {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, type: [Types.ObjectId] })
    jobIds!: Types.ObjectId[];

    @Prop({ required: true })
    topicCount!: number;
}

export const CurriculumNavigationLogSchema = SchemaFactory.createForClass(
    CurriculumNavigationLog,
);
