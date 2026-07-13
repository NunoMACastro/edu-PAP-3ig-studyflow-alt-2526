/**
 * Define o modelo persistido de pesquisa unificada usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de pesquisa unificada, usado apenas dentro da camada de persistência.
 */
export type UnifiedSearchLogDocument = HydratedDocument<UnifiedSearchLog>;

/**
 * Log mínimo de pesquisa para auditoria técnica.
 */
@Schema({ timestamps: true })
export class UnifiedSearchLog {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true })
    query!: string;

    @Prop({ required: true, type: [Types.ObjectId] })
    jobIds!: Types.ObjectId[];

    @Prop({ required: true })
    resultCount!: number;
}

export const UnifiedSearchLogSchema =
    SchemaFactory.createForClass(UnifiedSearchLog);
