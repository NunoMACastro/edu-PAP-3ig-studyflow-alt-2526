/**
 * Define o modelo persistido de study áreas usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de áreas de estudo, usado apenas dentro da camada de persistência.
 */
export type StudyAreaDocument = HydratedDocument<StudyArea>;
/**
 * Contrato de áreas de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyAreaVoiceTone =
    | "simple"
    | "rigorous"
    | "step_by_step"
    | "examples_first";
/**
 * Contrato de áreas de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyAreaVoiceDetailLevel = "short" | "normal" | "detailed";

/**
 * Área de estudo pessoal do aluno.
 *
 * Cada área é uma auto-disciplina independente, sem turma obrigatória. Os
 * campos de voz pertencem ao BK-MF0-09 e ficam no mesmo documento para que a
 * IA consiga ler o estilo da área sem procurar noutro domínio.
 */
@Schema({ timestamps: true, collection: "study_areas" })
export class StudyArea {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ trim: true, maxlength: 24 })
    color?: string;

    @Prop({ default: false })
    archived!: boolean;

    @Prop({ enum: ["simple", "rigorous", "step_by_step", "examples_first"] })
    voiceTone?: StudyAreaVoiceTone;

    @Prop({ enum: ["short", "normal", "detailed"], default: "normal" })
    voiceDetailLevel?: StudyAreaVoiceDetailLevel;

    @Prop({ trim: true, maxlength: 500 })
    voiceNotes?: string;
}

export const StudyAreaSchema = SchemaFactory.createForClass(StudyArea);
StudyAreaSchema.index({ userId: 1, name: 1 }, { unique: true });
