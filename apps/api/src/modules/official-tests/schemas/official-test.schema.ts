/**
 * Define o modelo persistido de testes oficiais usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de testes oficiais, usado apenas dentro da camada de persistência.
 */
export type OfficialTestDocument = HydratedDocument<OfficialTest>;
/**
 * Estados permitidos de testes oficiais; evitam strings soltas no código.
 */
export type OfficialTestStatus = "DRAFT" | "PUBLISHED";
/**
 * Contrato de testes oficiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type OfficialTestQuestion = {
    statement: string;
    topic?: string;
    options: string[];
    correctOptionIndex: number;
};

/**
 * Teste ou mini-teste oficial criado por professor.
 */
@Schema({ timestamps: true, collection: "official_tests" })
export class OfficialTest {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 4000 })
    description?: string;

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" })
    status!: OfficialTestStatus;

    @Prop({ type: [Object], required: true })
    questions!: OfficialTestQuestion[];
}

export const OfficialTestSchema = SchemaFactory.createForClass(OfficialTest);
OfficialTestSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
