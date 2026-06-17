// apps/api/src/modules/privacy-data-exports/schemas/data-export-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DataExportRequestDocument = HydratedDocument<DataExportRequest>;
export type DataExportStatus = "READY" | "EXPIRED";

/**
 * Pedido de exportação de dados pessoais do próprio utilizador.
 */
@Schema({ timestamps: true, collection: "data_export_requests" })
export class DataExportRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["READY", "EXPIRED"], default: "READY" })
    status!: DataExportStatus;

    @Prop({ trim: true, maxlength: 300 })
    reason?: string;

    @Prop({ required: true, default: Date.now })
    requestedAt!: Date;

    @Prop({ required: true, index: true })
    expiresAt!: Date;
}

export const DataExportRequestSchema = SchemaFactory.createForClass(DataExportRequest);
DataExportRequestSchema.index({ userId: 1, requestedAt: -1 });