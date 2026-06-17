/**
 * Define o modelo persistido de material structure usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de estrutura de materiais, usado apenas dentro da camada de persistência.
 */
export type MaterialStructureDocument = HydratedDocument<MaterialStructure>;
/**
 * Contrato de estrutura de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type MaterialReference = {
    chunkOrder: number;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};
/**
 * Contrato de estrutura de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type MaterialSection = {
    order: number;
    title: string;
    summary: string;
    references: MaterialReference[];
};

/**
 * Estrutura pedagógica derivada de chunks indexados.
 */
@Schema({ timestamps: true, collection: "material_structures" })
export class MaterialStructure {
    @Prop({ type: Types.ObjectId, ref: "MaterialIndexJob", required: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    topics!: string[];

    @Prop({ type: [Object], default: [] })
    sections!: MaterialSection[];
}

export const MaterialStructureSchema =
    SchemaFactory.createForClass(MaterialStructure);
MaterialStructureSchema.index({ jobId: 1 }, { unique: true });
