/** Subdocumento mínimo para rever citações sem reabrir fontes revogadas. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { StudentAiCitationKind } from "../student-ai-conversation-context.js";

@Schema({ _id: false })
export class StudentAiCitationSnapshotRecord {
    @Prop({ required: true, trim: true, maxlength: 160 })
    label!: string;

    @Prop({
        required: true,
        enum: [
            "OFFICIAL_MATERIAL",
            "PRIVATE_MATERIAL",
            "GROUP_RESOURCE",
            "ROOM_SHARE",
        ],
    })
    kind!: StudentAiCitationKind;
}

export const StudentAiCitationSnapshotSchema =
    SchemaFactory.createForClass(StudentAiCitationSnapshotRecord);
