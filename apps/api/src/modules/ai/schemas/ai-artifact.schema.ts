/**
 * Define o modelo persistido de ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import {
    AI_ARTIFACT_TARGET_KINDS,
    type AiArtifactGroundingMode,
    type AiArtifactTargetKind,
} from "../ai-artifact-generation.types.js";

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
        index: true,
    })
    studyAreaId?: Types.ObjectId;

    /** `userId` autoriza; este destino serve exclusivamente para organização. */
    @Prop({ enum: AI_ARTIFACT_TARGET_KINDS, index: true })
    targetKind?: AiArtifactTargetKind;

    @Prop({ type: Types.ObjectId, index: true })
    targetId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 160 })
    targetLabelSnapshot?: string;

    @Prop({ enum: ["PRIVATE"], default: "PRIVATE" })
    visibility!: "PRIVATE";

    @Prop({
        required: true,
        enum: ["SUMMARY", "EXPLANATION", "FLASHCARDS", "QUIZ"],
    })
    type!: AiArtifactType;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sourcesJson!: Array<Record<string, unknown>>;

    /** Conversa do Assistente que originou o artefacto, quando aplicável. */
    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    assistantConversationId?: Types.ObjectId;

    @Prop({ enum: ["SUBJECT", "STUDY_AREA", "STUDY_GROUP", "STUDY_ROOM", "GUIDED_ROOM"] })
    sourceContextKind?: string;

    @Prop({ type: Types.ObjectId })
    sourceContextId?: Types.ObjectId;

    @Prop({ type: Date })
    snapshotAt?: Date;

    @Prop({ type: Number, min: 1, max: 6 })
    snapshotTurnCount?: number;

    @Prop({ type: Number, min: 0, max: 6 })
    usedTurnCount?: number;

    @Prop({ type: Number, min: 0 })
    candidateSourceCount?: number;

    @Prop({ type: Number, min: 0 })
    usedSourceCount?: number;

    @Prop({ enum: ["CHAT_AND_SOURCES", "CHAT_ONLY"] })
    groundingMode?: AiArtifactGroundingMode;

    @Prop({ trim: true, minlength: 64, maxlength: 64 })
    snapshotDigest?: string;

    /**
     * Chave interna opcional para tornar persistência de jobs recuperáveis
     * idempotente. Nunca é incluída no DTO público do artefacto.
     */
    @Prop({ trim: true, maxlength: 256 })
    generationKey?: string;
}

export const AiArtifactSchema = SchemaFactory.createForClass(AiArtifact);
AiArtifactSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
AiArtifactSchema.index({ userId: 1, targetKind: 1, targetId: 1, createdAt: -1 });
AiArtifactSchema.index({
    userId: 1,
    assistantConversationId: 1,
    createdAt: -1,
    _id: -1,
});
AiArtifactSchema.index(
    { generationKey: 1 },
    {
        unique: true,
        partialFilterExpression: { generationKey: { $type: "string" } },
    },
);
