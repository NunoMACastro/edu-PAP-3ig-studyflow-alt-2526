// apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de IA com fontes obrigatórias usado dentro da persistência.
 */
export type SourceGroundedAiAnswerDocument =
    HydratedDocument<SourceGroundedAiAnswer>;

/**
 * Citação pública associada a uma resposta factual.
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

    // O actorId permite rastrear a resposta sem depender de dados enviados pelo frontend.
    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, type: [Types.ObjectId], index: true })
    sourceJobIds!: Types.ObjectId[];

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    // As citações ficam persistidas para auditoria pedagógica e defesa do resultado.
    @Prop({ required: true, type: [SourceGroundedCitationSchema] })
    citations!: SourceGroundedCitation[];
}

export const SourceGroundedAiAnswerSchema = SchemaFactory.createForClass(
    SourceGroundedAiAnswer,
);