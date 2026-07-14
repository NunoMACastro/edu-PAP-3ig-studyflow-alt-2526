/**
 * Define o modelo persistido de ai guardrails usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiGuardrailContextType } from "../dto/check-ai-guardrails.dto.js";

/**
 * Documento Mongoose de guardrails de IA, usado apenas dentro da camada de persistência.
 */
export type AiGuardrailCheckDocument = HydratedDocument<AiGuardrailCheck>;

/**
 * Registo mínimo de uma decisão de guardrails.
 *
 * O documento guarda apenas metadados necessários para auditoria técnica,
 * sem persistir respostas de IA nem material privado.
 */
@Schema({ timestamps: true })
export class AiGuardrailCheck {
    _id!: { toString(): string };

    @Prop({ required: true, index: true })
    actorId!: string;

    @Prop({ required: true, enum: Object.values(AiGuardrailContextType), index: true })
    contextType!: AiGuardrailContextType;

    @Prop({ required: true, index: true })
    resourceId!: string;

    @Prop({ required: true })
    allowed!: boolean;

    @Prop({ required: true })
    reasonCode!: string;

    @Prop({ required: true })
    reason!: string;

    @Prop()
    anonymizedAt?: Date;

    @Prop()
    expiresAt?: Date;
}

export const AiGuardrailCheckSchema =
    SchemaFactory.createForClass(AiGuardrailCheck);
AiGuardrailCheckSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
