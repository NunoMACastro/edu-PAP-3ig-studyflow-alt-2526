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
export type OfficialTestStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
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

    @Prop({
        required: true,
        enum: ["DRAFT", "PUBLISHED", "CLOSED"],
        default: "DRAFT",
    })
    status!: OfficialTestStatus;

    @Prop({ type: [Object], required: true })
    questions!: OfficialTestQuestion[];

    /**
     * Fence monotónico escrito por cada submissão dentro da sua transação.
     * O fecho escreve o mesmo documento, tornando as duas operações
     * serializáveis sem depender de locks em memória ou de uma única instância.
     */
    @Prop({ required: true, default: 0, min: 0 })
    submissionFenceVersion!: number;

    @Prop()
    closedAt?: Date;

    @Prop({ enum: ["TEACHER", "CLASS_ARCHIVED", "SUBJECT_ARCHIVED"] })
    closedReason?: "TEACHER" | "CLASS_ARCHIVED" | "SUBJECT_ARCHIVED";
}

export const OfficialTestSchema = SchemaFactory.createForClass(OfficialTest);
OfficialTestSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
