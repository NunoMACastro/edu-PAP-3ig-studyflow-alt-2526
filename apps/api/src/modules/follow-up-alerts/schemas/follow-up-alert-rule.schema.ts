/**
 * Define regras docentes de acompanhamento.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FollowUpAlertRuleDocument = HydratedDocument<FollowUpAlertRule>;

/**
 * Regra criada por professor para encontrar alunos inativos.
 */
@Schema({ timestamps: true, collection: "follow_up_alert_rules" })
export class FollowUpAlertRule {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 90 })
    inactiveDays!: number;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    message!: string;
}

export const FollowUpAlertRuleSchema = SchemaFactory.createForClass(FollowUpAlertRule);
FollowUpAlertRuleSchema.index({ teacherId: 1, createdAt: -1 });
