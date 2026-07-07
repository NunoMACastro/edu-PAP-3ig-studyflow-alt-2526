/**
 * Define pedidos de exportação de dados pessoais.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DataExportRequestDocument = HydratedDocument<DataExportRequest>;

/**
 * Pedido RGPD de exportação pertencente ao próprio utilizador.
 */
@Schema({ timestamps: true, collection: "data_export_requests" })
export class DataExportRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["READY", "EXPIRED"], default: "READY" })
    status!: "READY" | "EXPIRED";

    @Prop({ required: true, index: true })
    expiresAt!: Date;
}

export const DataExportRequestSchema = SchemaFactory.createForClass(DataExportRequest);
DataExportRequestSchema.index({ userId: 1, createdAt: -1 });
