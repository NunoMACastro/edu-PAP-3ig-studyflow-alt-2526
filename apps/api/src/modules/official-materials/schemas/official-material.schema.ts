/**
 * Define o modelo persistido de materiais oficiais usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de materiais oficiais, usado apenas dentro da camada de persistência.
 */
export type OfficialMaterialDocument = HydratedDocument<OfficialMaterial>;
/**
 * Tipos permitidos de materiais oficiais; direcionam validação e renderização.
 */
export type OfficialMaterialType = "TEXT" | "URL";
/**
 * Estados permitidos de materiais oficiais; evitam strings soltas no código.
 */
export type OfficialMaterialStatus = "PROCESSED" | "REFERENCE_ONLY";

/**
 * Material oficial submetido por professor para uma disciplina.
 */
@Schema({ timestamps: true, collection: "official_materials" })
export class OfficialMaterial {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["TEXT", "URL"] })
    type!: OfficialMaterialType;

    @Prop({ required: true, enum: ["PROCESSED", "REFERENCE_ONLY"] })
    status!: OfficialMaterialStatus;

    @Prop({ trim: true, maxlength: 20000 })
    textContent?: string;

    @Prop({ trim: true })
    sourceUrl?: string;
}

export const OfficialMaterialSchema =
    SchemaFactory.createForClass(OfficialMaterial);
OfficialMaterialSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
