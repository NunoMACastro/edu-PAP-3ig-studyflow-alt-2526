/**
 * Define o modelo persistido de classes usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de turmas, usado apenas dentro da camada de persistência.
 */
export type SchoolClassDocument = HydratedDocument<SchoolClass>;

/** Estados persistidos do ciclo de vida de uma turma oficial. */
export const SCHOOL_CLASS_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
export type SchoolClassStatus = (typeof SCHOOL_CLASS_STATUSES)[number];

/**
 * Turma oficial criada por um professor.
 */
@Schema({ timestamps: true, collection: "school_classes" })
export class SchoolClass {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, trim: true, uppercase: true, maxlength: 40 })
    code!: string;

    @Prop({ required: true, trim: true, maxlength: 20 })
    schoolYear!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    studentIds!: Types.ObjectId[];

    @Prop({
        type: String,
        enum: SCHOOL_CLASS_STATUSES,
        default: "ACTIVE",
        required: true,
        index: true,
    })
    status!: SchoolClassStatus;

    @Prop({ type: Date, default: null })
    archivedAt?: Date | null;

    @Prop({ type: Types.ObjectId, ref: "User", default: null })
    archivedBy?: Types.ObjectId | null;

    @Prop({ type: Date })
    statusChangedAt?: Date;

    /**
     * Contador monotónico escrito por mutações descendentes dentro da mesma
     * transação. A escrita força conflito com archive/restore concorrentes e
     * impede confirmar novos recursos depois de a turma ficar arquivada.
     */
    @Prop({ type: Number, default: 0, min: 0, required: true })
    lifecycleFenceVersion!: number;
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
SchoolClassSchema.index({ teacherId: 1, code: 1 }, { unique: true });
SchoolClassSchema.index({ studentIds: 1, createdAt: -1 });
SchoolClassSchema.index({ teacherId: 1, status: 1, createdAt: -1 });
