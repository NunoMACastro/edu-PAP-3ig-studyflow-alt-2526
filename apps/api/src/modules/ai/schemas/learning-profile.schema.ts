// apps/api/src/modules/ai/schemas/learning-profile.schema.ts
/**
 * Define o modelo persistido do perfil pedagógico usado pela IA adaptativa.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose do perfil de aprendizagem.
 */
export type LearningProfileDocument = HydratedDocument<LearningProfile>;

/**
 * Ritmo autorizado para ajustar a explicação sem aceitar texto livre vindo do frontend.
 */
export type LearningPace = "SLOW" | "BALANCED" | "FAST";

/**
 * Nível pedagógico autorizado para ajustar a profundidade da explicação.
 */
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Perfil de aprendizagem por área de estudo.
 *
 * Este contrato guarda preferências pedagógicas privadas do aluno. O par
 * userId + studyAreaId impede que uma área de outro aluno seja usada por engano.
 */
@Schema({ timestamps: true, collection: "learning_profiles" })
export class LearningProfile {
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
        enum: ["SLOW", "BALANCED", "FAST"],
        default: "BALANCED",
    })
    pace!: LearningPace;

    @Prop({
        required: true,
        enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
        default: "INTERMEDIATE",
    })
    level!: LearningLevel;

    @Prop({
        type: [String],
        default: [],
        validate: {
            validator: (values: string[]) =>
                values.every((value) => value.trim().length <= 120),
            message: "Cada dificuldade deve ter no máximo 120 caracteres.",
        },
    })
    difficulties!: string[];

    @Prop({ trim: true, maxlength: 200, default: "" })
    preferredExplanationStyle!: string;
}

export const LearningProfileSchema = SchemaFactory.createForClass(LearningProfile);
LearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });