/**
 * Define consentimentos versionados para uso de IA.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiConsentDocument = HydratedDocument<AiConsent>;

export type AiConsentPurpose =
    | "PRIVATE_AREA_AI"
    | "GROUP_AI"
    | "CLASS_AI"
    | "PROJECT_AI"
    | "SOURCE_GROUNDED_AI"
    | "EXTERNAL_KNOWLEDGE_AI"
    | "ADAPTIVE_EXPLANATION"
    | "SUMMARY"
    | "STUDY_TOOL"
    | "ROOM_AI";

/**
 * Consentimento por finalidade e versão de política.
 */
@Schema({ timestamps: true, collection: "ai_consents" })
export class AiConsent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["PRIVATE_AREA_AI", "GROUP_AI", "CLASS_AI", "PROJECT_AI", "SOURCE_GROUNDED_AI", "EXTERNAL_KNOWLEDGE_AI", "ADAPTIVE_EXPLANATION", "SUMMARY", "STUDY_TOOL", "ROOM_AI"], index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, enum: ["GRANTED", "REVOKED"], index: true })
    status!: "GRANTED" | "REVOKED";

    @Prop({ required: true, trim: true, maxlength: 40 })
    policyVersion!: string;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    actorId!: Types.ObjectId;
}

export const AiConsentSchema = SchemaFactory.createForClass(AiConsent);
AiConsentSchema.index({ userId: 1, purpose: 1, createdAt: -1 });
