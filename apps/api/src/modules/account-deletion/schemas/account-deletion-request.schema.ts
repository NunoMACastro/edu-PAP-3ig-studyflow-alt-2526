/**
 * Define pedidos persistidos de eliminação de conta.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AccountDeletionRequestDocument = HydratedDocument<AccountDeletionRequest>;

/**
 * Registo de eliminação para defesa técnica e auditoria.
 */
@Schema({ timestamps: true, collection: "account_deletion_requests" })
export class AccountDeletionRequest {
    /** Referência pública aleatória sem qualquer derivação do utilizador. */
    @Prop({ required: true, unique: true, index: true })
    reference!: string;

    @Prop({ type: Object, required: true })
    deletedCounts!: Record<string, number>;

    /**
     * Prazo da prova técnica anonimizada; o MongoDB remove-a automaticamente.
     */
    @Prop({ required: true })
    expiresAt!: Date;
}

export const AccountDeletionRequestSchema = SchemaFactory.createForClass(AccountDeletionRequest);
AccountDeletionRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
