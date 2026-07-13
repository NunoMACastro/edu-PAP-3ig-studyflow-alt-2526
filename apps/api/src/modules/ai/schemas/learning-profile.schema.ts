/**
 * Define o modelo persistido de ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de artefactos de IA, usado apenas dentro da camada de persistência.
 */
export type LearningProfileDocument = HydratedDocument<LearningProfile>;
/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type LearningPace = "SLOW" | "BALANCED" | "FAST";
/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Perfil de aprendizagem por área de estudo.
 *
 * Este contrato pertence ao BK-MF1-01 e guarda apenas preferências pedagógicas.
 * O ownership continua a ser aplicado nos services através da sessão.
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
            /**
             * Executa validator para ai, mantendo o contrato de dados explícito para validação e documentação.
             *
             * @param values Valor de values usado pela função para executar validator com dados explícitos.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
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
