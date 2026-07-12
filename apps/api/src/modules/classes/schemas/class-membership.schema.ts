/**
 * Define a inscrição oficial de um aluno numa turma sem depender de arrays
 * embebidos. O array legacy em `SchoolClass` mantém-se apenas durante o
 * período de dual-write.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export const CLASS_MEMBERSHIP_STATUSES = ["ACTIVE", "REMOVED"] as const;
export type ClassMembershipStatus =
    (typeof CLASS_MEMBERSHIP_STATUSES)[number];
export type ClassMembershipDocument = HydratedDocument<ClassMembership>;

/** Relação durável e auditável entre uma turma e um aluno. */
@Schema({ timestamps: true, collection: "class_memberships" })
export class ClassMembership {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({
        type: String,
        enum: CLASS_MEMBERSHIP_STATUSES,
        default: "ACTIVE",
        required: true,
        index: true,
    })
    status!: ClassMembershipStatus;

    @Prop({ type: Date, required: true })
    joinedAt!: Date;

    @Prop({ type: Date, default: null })
    removedAt?: Date | null;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    joinedBy!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", default: null })
    removedBy?: Types.ObjectId | null;

    @Prop({ type: Boolean, default: false })
    joinedAtEstimated!: boolean;
}

export const ClassMembershipSchema =
    SchemaFactory.createForClass(ClassMembership);
ClassMembershipSchema.index({ classId: 1, studentId: 1 }, { unique: true });
ClassMembershipSchema.index({ studentId: 1, status: 1, classId: 1 });
ClassMembershipSchema.index({ classId: 1, status: 1, studentId: 1 });
