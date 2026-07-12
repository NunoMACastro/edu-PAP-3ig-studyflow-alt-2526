/**
 * Define o modelo persistido de IA com conhecimento externo limitado usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de IA com conhecimento externo limitado, usado apenas dentro da camada de persistência.
 */
export type ExternalKnowledgeAiAnswerDocument =
    HydratedDocument<ExternalKnowledgeAiAnswer>;

/**
 * Classe ExternalKnowledgeInternalCitation usada no domínio de IA com conhecimento externo limitado.
 */
@Schema({ _id: false })
export class ExternalKnowledgeInternalCitation {
    @Prop({ required: true })
    materialId!: string;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    excerpt!: string;
}

export const ExternalKnowledgeInternalCitationSchema =
    SchemaFactory.createForClass(ExternalKnowledgeInternalCitation);

/**
 * Resposta de IA que distingue fontes internas de nota externa.
 */
@Schema({ timestamps: true })
export class ExternalKnowledgeAiAnswer {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    @Prop({ required: true })
    externalUsed!: boolean;

    @Prop({ required: true, type: [ExternalKnowledgeInternalCitationSchema] })
    internalCitations!: ExternalKnowledgeInternalCitation[];

    @Prop({ type: [String], default: [] })
    externalNotes!: string[];
}

export const ExternalKnowledgeAiAnswerSchema = SchemaFactory.createForClass(
    ExternalKnowledgeAiAnswer,
);
