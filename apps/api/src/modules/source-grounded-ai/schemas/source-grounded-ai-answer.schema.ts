/**
 * Define o modelo persistido de IA com fontes obrigatórias usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de IA com fontes obrigatórias, usado apenas dentro da camada de persistência.
 */
export type SourceGroundedAiAnswerDocument =
    HydratedDocument<SourceGroundedAiAnswer>;

/**
 * Classe SourceGroundedCitation usada no domínio de IA com fontes obrigatórias.
 */
@Schema({ _id: false })
export class SourceGroundedCitation {
    @Prop({ required: true })
    sourceJobId!: string;

    @Prop({ required: true })
    materialId!: string;

    @Prop({ required: true })
    sourceLabel!: string;

    @Prop({ required: true })
    locator!: string;

    @Prop({ required: true })
    excerpt!: string;
}

export const SourceGroundedCitationSchema =
    SchemaFactory.createForClass(SourceGroundedCitation);

/**
 * Resposta fundamentada em fontes internas processadas.
 */
@Schema({ timestamps: true })
export class SourceGroundedAiAnswer {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, type: [Types.ObjectId], index: true })
    sourceJobIds!: Types.ObjectId[];

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    @Prop({ required: true, type: [SourceGroundedCitationSchema] })
    citations!: SourceGroundedCitation[];
}

export const SourceGroundedAiAnswerSchema = SchemaFactory.createForClass(
    SourceGroundedAiAnswer,
);
