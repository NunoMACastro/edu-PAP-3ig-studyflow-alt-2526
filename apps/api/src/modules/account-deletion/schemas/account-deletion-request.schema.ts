/**
 * Define pedidos persistidos de eliminação de conta.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDeletionRequestDocument = HydratedDocument<AccountDeletionRequest>;

/**
 * Registo de eliminação para defesa técnica e auditoria.
 */
@Schema({ timestamps: true, collection: "account_deletion_requests" })
export class AccountDeletionRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Object, required: true })
    deletedCounts!: Record<string, number>;
}

export const AccountDeletionRequestSchema = SchemaFactory.createForClass(AccountDeletionRequest);
