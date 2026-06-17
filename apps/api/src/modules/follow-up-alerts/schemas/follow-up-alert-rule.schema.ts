// apps/api/src/modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FollowUpAlertRuleDocument = HydratedDocument<FollowUpAlertRule>;

/**
 * Regra docente para acompanhar alunos com pouca actividade recente.
 */
@Schema({ timestamps: true, collection: "follow_up_alert_rules" })
export class FollowUpAlertRule {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 60 })
    inactivityDays!: number;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 500 })
    message!: string;

    @Prop({ required: true, default: true })
    enabled!: boolean;
}

export const FollowUpAlertRuleSchema = SchemaFactory.createForClass(FollowUpAlertRule);
FollowUpAlertRuleSchema.index({ teacherId: 1, classId: 1, createdAt: -1 });