// apps/api/src/modules/audit-log/schemas/audit-event.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AuditDomain, AuditResult } from "../dto/audit-query.dto.js";

export type AuditEventDocument = HydratedDocument<AuditEvent>;

/**
 * Evento auditável minimizado.
 */
@Schema({ timestamps: true, collection: "audit_events" })
export class AuditEvent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AuditDomain), index: true })
    domain!: AuditDomain;

    @Prop({ required: true, trim: true, maxlength: 80, index: true })
    action!: string;

    @Prop({ required: true, trim: true, maxlength: 80 })
    resourceType!: string;

    @Prop({ trim: true, maxlength: 80 })
    resourceId?: string;

    @Prop({ required: true, enum: Object.values(AuditResult), index: true })
    result!: AuditResult;

    @Prop({ type: Object, default: {} })
    metadata!: Record<string, string | number | boolean>;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
AuditEventSchema.index({ domain: 1, action: 1, createdAt: -1 });