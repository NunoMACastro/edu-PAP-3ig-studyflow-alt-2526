/**
 * Define o histórico persistido de alterações de papel.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { UserRole } from "../../auth/schemas/user.schema.js";

export type UserRoleChangeDocument = HydratedDocument<UserRoleChange>;

/**
 * Registo auditável de mudança de role.
 */
@Schema({ timestamps: true, collection: "user_role_changes" })
export class UserRoleChange {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    targetUserId!: Types.ObjectId;

    @Prop({ required: true, enum: ["STUDENT", "TEACHER", "ADMIN"] })
    previousRole!: UserRole;

    @Prop({ required: true, enum: ["STUDENT", "TEACHER", "ADMIN"] })
    nextRole!: UserRole;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 300 })
    reason!: string;

    @Prop()
    anonymizedAt?: Date;

    @Prop()
    expiresAt?: Date;
}

export const UserRoleChangeSchema = SchemaFactory.createForClass(UserRoleChange);
UserRoleChangeSchema.index({ targetUserId: 1, createdAt: -1 });
UserRoleChangeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
