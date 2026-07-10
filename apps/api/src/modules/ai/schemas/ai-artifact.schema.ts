/**
 * Define o modelo persistido de ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

/**
 * Documento Mongoose de artefactos de IA, usado apenas dentro da camada de persistência.
 */
export type AiArtifactDocument = HydratedDocument<AiArtifact>;
/**
 * Tipos permitidos de artefactos de IA; direcionam validação e renderização.
 */
export type AiArtifactType = "SUMMARY" | "EXPLANATION" | "FLASHCARDS" | "QUIZ";

/**
 * Artefacto criado pela IA com fontes associadas.
 *
 * Guardar o conteúdo e as fontes ajuda a defender a rastreabilidade dos BKs e
 * impede que a UI dependa apenas da resposta transitória do provider.
 */
@Schema({ timestamps: true, collection: "ai_artifacts" })
export class AiArtifact {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: ["SUMMARY", "EXPLANATION", "FLASHCARDS", "QUIZ"],
    })
    type!: AiArtifactType;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sourcesJson!: Array<Record<string, unknown>>;

    /**
     * Chave interna opcional para tornar persistência de jobs recuperáveis
     * idempotente. Nunca é incluída no DTO público do artefacto.
     */
    @Prop({ trim: true, maxlength: 256 })
    generationKey?: string;
}

export const AiArtifactSchema = SchemaFactory.createForClass(AiArtifact);
AiArtifactSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
AiArtifactSchema.index(
    { generationKey: 1 },
    {
        unique: true,
        partialFilterExpression: { generationKey: { $type: "string" } },
    },
);
