// apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts
/**
 * Define os documentos persistidos de IA com conhecimento externo limitado.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose usado apenas pela camada de persistência.
 */
export type ExternalKnowledgeAiAnswerDocument =
    HydratedDocument<ExternalKnowledgeAiAnswer>;

/**
 * Excerto interno autorizado que sustenta a resposta.
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
 * Resposta persistida com separação entre fonte interna e nota externa.
 */
@Schema({ timestamps: true })
export class ExternalKnowledgeAiAnswer {
    _id!: { toString(): string };

    // Índices por aluno e área ajudam a listar histórico sem varrer respostas de outros alunos.
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

    // Citações internas e notas externas ficam em campos diferentes para a UI não misturar origens.
    @Prop({ required: true, type: [ExternalKnowledgeInternalCitationSchema] })
    internalCitations!: ExternalKnowledgeInternalCitation[];

    @Prop({ type: [String], default: [] })
    externalNotes!: string[];
}

export const ExternalKnowledgeAiAnswerSchema = SchemaFactory.createForClass(
    ExternalKnowledgeAiAnswer,
);