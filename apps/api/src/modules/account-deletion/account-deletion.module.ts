/**
 * Regista eliminação de conta própria.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import { StudyArea, StudyAreaSchema } from "../study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventSchema } from "../study/schemas/study-event.schema.js";
import { AccountDeletionController } from "./account-deletion.controller.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { AccountDeletionRequest, AccountDeletionRequestSchema } from "./schemas/account-deletion-request.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        MongooseModule.forFeature([
            { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
            { name: User.name, schema: UserSchema },
            { name: StudyArea.name, schema: StudyAreaSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: StudyEvent.name, schema: StudyEventSchema },
        ]),
    ],
    controllers: [AccountDeletionController],
    providers: [AccountDeletionService],
})
export class AccountDeletionModule {}
