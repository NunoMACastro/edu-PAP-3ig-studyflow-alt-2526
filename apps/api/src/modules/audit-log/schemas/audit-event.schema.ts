/**
 * Define o modelo persistido de auditoria aplicacional da MF4.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AuditEventDocument = HydratedDocument<AuditEvent>;

export type AuditDomain =
    | "MATERIALS"
    | "AI"
    | "ROLES"
    | "PRIVACY"
    | "NOTIFICATIONS"
    | "ADMIN";

export type AuditResult = "SUCCESS" | "DENIED" | "FAILED";

/**
 * Evento imutável de auditoria com metadata minimizada.
 */
@Schema({ timestamps: true, collection: "audit_events" })
export class AuditEvent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: ["MATERIALS", "AI", "ROLES", "PRIVACY", "NOTIFICATIONS", "ADMIN"], index: true })
    domain!: AuditDomain;

    @Prop({ required: true, trim: true, maxlength: 80, index: true })
    action!: string;

    @Prop({ required: true, trim: true, maxlength: 80 })
    resourceType!: string;

    @Prop({ trim: true, maxlength: 120 })
    resourceId?: string;

    @Prop({ required: true, enum: ["SUCCESS", "DENIED", "FAILED"], index: true })
    result!: AuditResult;

    @Prop({ type: Object, default: {} })
    metadata!: Record<string, unknown>;

    @Prop()
    anonymizedAt?: Date;

    /** Data absoluta usada pelo índice TTL apenas para eventos anonimizados. */
    @Prop()
    expiresAt?: Date;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
AuditEventSchema.index({ createdAt: -1 });
AuditEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
