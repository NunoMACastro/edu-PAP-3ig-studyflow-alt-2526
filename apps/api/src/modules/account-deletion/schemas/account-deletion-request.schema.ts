// apps/api/src/modules/account-deletion/schemas/account-deletion-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDeletionRequestDocument = HydratedDocument<AccountDeletionRequest>;

/**
 * Registo mínimo do pedido de eliminação de conta.
 */
@Schema({ timestamps: true, collection: "account_deletion_requests" })
export class AccountDeletionRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["COMPLETED"], default: "COMPLETED" })
    status!: "COMPLETED";

    @Prop({ trim: true, maxlength: 300 })
    reason?: string;

    @Prop({ required: true, default: Date.now })
    completedAt!: Date;
}

export const AccountDeletionRequestSchema = SchemaFactory.createForClass(AccountDeletionRequest);