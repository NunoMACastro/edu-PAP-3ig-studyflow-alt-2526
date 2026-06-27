/**
 * Define o modelo persistido de study usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { StudyEventType } from "../dto/study-event.dto.js";

/**
 * Documento Mongoose de rotinas e objetivos de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyEventDocument = HydratedDocument<StudyEvent>;

/**
 * Evento histórico registado em ações relevantes de estudo.
 */
@Schema({ timestamps: true, collection: "study_events" })
export class StudyEvent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: [
            "ROUTINE_CREATED",
            "ROUTINE_ARCHIVED",
            "GOAL_CREATED",
            "GOAL_UPDATED",
            "GOAL_ARCHIVED",
            "STUDY_AREA_CREATED",
            "MATERIAL_SUBMITTED",
            "AI_PROFILE_CREATED",
            "SUMMARY_GENERATED",
            "STUDY_TOOL_GENERATED",
            "ADAPTIVE_EXPLANATION_GENERATED",
            "QUIZ_ATTEMPT_RECORDED",
        ],
    })
    type!: StudyEventType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ required: true, default: Date.now, index: true })
    occurredAt!: Date;
}

export const StudyEventSchema = SchemaFactory.createForClass(StudyEvent);
StudyEventSchema.index({ userId: 1, occurredAt: -1 });
